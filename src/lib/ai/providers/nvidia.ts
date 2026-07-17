import type { AIProvider } from '../provider';
import type { AIConfig } from '../config';
import type { ProviderResponse } from '../types';
import { AIError } from '../types';
import { fetchWithRetry } from '../http-client';

const TIMEOUT_MS = 60_000;

/**
 * NVIDIA AI Provider — communicates with NVIDIA's OpenAI-compatible
 * chat completions endpoint via native fetch.
 */
export const nvidiaProvider: AIProvider = {
  name: 'nvidia',

  async generate(
    config: AIConfig,
    systemPrompt: string,
    userPrompt: string
  ): Promise<ProviderResponse> {
    const url = `${config.baseUrl}/chat/completions`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetchWithRetry(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.85,
          max_tokens: 4096,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'Unknown error');
        throw new AIError(
          'provider_error',
          `NVIDIA API returned HTTP ${response.status}: ${errorBody}`,
          response.status
        );
      }

      const data = await response.json();

      // Validate expected OpenAI-compatible response structure
      const content = data?.choices?.[0]?.message?.content;
      if (typeof content !== 'string' || content.trim() === '') {
        throw new AIError(
          'invalid_response',
          'NVIDIA API response did not contain valid message content.'
        );
      }

      return {
        content,
        model: data.model || config.model,
        promptTokens: data.usage?.prompt_tokens ?? null,
        completionTokens: data.usage?.completion_tokens ?? null,
        totalTokens: data.usage?.total_tokens ?? null,
      };
    } catch (error: unknown) {
      // Re-throw our own errors
      if (error instanceof AIError) {
        throw error;
      }

      // Handle AbortController timeout
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new AIError(
          'timeout',
          `Request to NVIDIA API timed out after ${TIMEOUT_MS / 1000}s.`
        );
      }

      // Handle generic network errors
      const message =
        error instanceof Error ? error.message : 'Unknown network error';
      throw new AIError('network_error', message);
    } finally {
      clearTimeout(timeoutId);
    }
  },

  async generateStream(
    config: AIConfig,
    systemPrompt: string,
    userPrompt: string,
    signal?: AbortSignal
  ): Promise<ReadableStream<string>> {
    const url = `${config.baseUrl}/chat/completions`;

    try {
      const response = await fetchWithRetry(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.85,
          max_tokens: 4096,
          stream: true,
        }),
        signal,
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'Unknown error');
        throw new AIError(
          'provider_error',
          `NVIDIA API returned HTTP ${response.status}: ${errorBody}`,
          response.status
        );
      }

      if (!response.body) {
        throw new AIError(
          'invalid_response',
          'NVIDIA API returned an empty response body.'
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      return new ReadableStream({
        async start(controller) {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;
                if (trimmed === 'data: [DONE]') {
                  continue;
                }
                if (trimmed.startsWith('data: ')) {
                  const dataStr = trimmed.slice(6);
                  try {
                    const parsed = JSON.parse(dataStr);
                    const text = parsed.choices?.[0]?.delta?.content || '';
                    if (text) {
                      controller.enqueue(text);
                    }
                  } catch {
                    // Ignore parse errors on incomplete chunks
                  }
                }
              }
            }

            if (buffer.startsWith('data: ')) {
              const dataStr = buffer.slice(6);
              try {
                const parsed = JSON.parse(dataStr);
                const text = parsed.choices?.[0]?.delta?.content || '';
                if (text) {
                  controller.enqueue(text);
                }
              } catch {
                // Ignore
              }
            }
          } catch (error) {
            controller.error(error);
          } finally {
            controller.close();
          }
        },
        cancel() {
          reader.cancel();
        },
      });
    } catch (error: unknown) {
      if (error instanceof AIError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new AIError('timeout', 'Request to NVIDIA API was cancelled.');
      }

      const message =
        error instanceof Error ? error.message : 'Unknown network error';
      throw new AIError('network_error', message);
    }
  },
};
