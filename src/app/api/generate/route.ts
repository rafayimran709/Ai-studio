import { NextResponse } from 'next/server';
import { generateScriptsStream } from '@/lib/ai/ai-service';
import { parseAIResponse } from '@/lib/ai/parser';
import { getAIConfig } from '@/lib/ai/config';
import { JSONStreamToSSE } from '@/lib/ai/json-stream-parser';
import { buildContinuityContext } from '@/lib/ai/continuity-builder';
import { summarizeEpisode } from '@/lib/ai/summarizer';
import { maybeGenerateArc } from '@/lib/ai/arc-generator';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Retrieve active request signal for client aborting
    const signal = req.signal;

    // Build continuity context if this is a storyline episode
    let continuityContext: string | null = null;
    if (
      body.storyMode === 'storyline' &&
      body.storylineId &&
      body.projectId &&
      body.episodeNumber
    ) {
      try {
        const supabase = await createClient();
        const context = await buildContinuityContext(
          supabase,
          body.projectId,
          body.storylineId,
          body.episodeNumber,
          body.prompt || ''
        );
        if (context.text) {
          continuityContext = context.text;
        }
      } catch (err: unknown) {
        console.error('Failed to build continuity context:', err);
        // Continue without continuity — non-blocking
      }
    }

    // Inject continuity context into the request
    const requestWithContext = {
      ...body,
      continuityContext,
    };

    // Call streaming AI service
    const stream = await generateScriptsStream(requestWithContext, signal);

    const encoder = new TextEncoder();
    const reader = stream.getReader();
    const config = getAIConfig();

    let fullResponseText = '';

    const sseStream = new ReadableStream({
      async start(controller) {
        // SSE helper
        function sendSSE(event: string, data: string) {
          const message = `event: ${event}\ndata: ${data}\n\n`;
          controller.enqueue(encoder.encode(message));
        }

        const parser = new JSONStreamToSSE(sendSSE);

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            fullResponseText += value;
            parser.write(value);
          }

          // Flush parser to ensure all completes have been emitted
          parser.flush();

          // Validate and parse the final text output
          try {
            const parsed = parseAIResponse(fullResponseText);
            const result = {
              variantA: parsed.variantA,
              variantB: parsed.variantB,
              model: config.model,
              provider: 'nvidia',
              rawResponse: fullResponseText,
              continuityContext, // Return continuity context so client can run validations on it
              episodeId: body.episodeId,
            };

            sendSSE('complete', JSON.stringify(result));
            sendSSE('stage', 'completed');

            // Fire-and-forget: Trigger background summarization pipeline
            if (
              body.storyMode === 'storyline' &&
              body.storylineId &&
              body.projectId &&
              body.episodeId &&
              body.episodeNumber
            ) {
              const episodeTitle =
                parsed.variantA.title || `Episode ${body.episodeNumber}`;
              const scriptText = parsed.variantA.fullScript;

              // Run summarization and arc generation asynchronously
              (async () => {
                try {
                  const supabase = await createClient();
                  await summarizeEpisode(
                    supabase,
                    body.episodeId,
                    body.episodeNumber,
                    episodeTitle,
                    scriptText,
                    body.storylineId,
                    body.projectId
                  );

                  // Check if arc rollup is needed
                  await maybeGenerateArc(supabase, body.storylineId);
                } catch (bgErr: unknown) {
                  console.error(
                    'Background summarization/arc generation error:',
                    bgErr
                  );
                }
              })();
            }
          } catch (parseErr: unknown) {
            const errObj = parseErr as Error;
            console.error('SSE completion parse error:', errObj);
            sendSSE(
              'error',
              JSON.stringify({
                message:
                  errObj.message ||
                  'AI response completed, but it did not contain a valid scripts JSON.',
              })
            );
            sendSSE('stage', 'error');
          }
        } catch (err: unknown) {
          const errObj = err as Error;
          if (signal.aborted) {
            sendSSE('stage', 'cancelled');
          } else {
            console.error('SSE stream reading error:', errObj);
            sendSSE(
              'error',
              JSON.stringify({
                message: errObj.message || 'Error occurred during streaming.',
              })
            );
            sendSSE('stage', 'error');
          }
        } finally {
          controller.close();
          reader.releaseLock();
        }
      },
    });

    return new Response(sseStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: unknown) {
    const errorObj = error as Error;
    console.error('API Generate route handler error:', errorObj);
    return NextResponse.json(
      { error: errorObj.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
