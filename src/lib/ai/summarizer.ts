import type { Client } from '@/lib/database/repositories';
import {
  updateEpisodeSummary,
  upsertCharacterState,
  createCharacterMemory,
  upsertLocation,
  createLoreMemory,
  createPlotThread,
  resolvePlotThread,
  getActivePlotThreads,
  getCharacters,
} from '@/lib/database/repositories';
import { getAIConfig } from './config';
import type { AIProvider } from './provider';
import { nvidiaProvider } from './providers/nvidia';

/**
 * Episode Summarization Pipeline
 *
 * Runs asynchronously after a script is finalized.
 * Calls the LLM to analyze the script and extract structured intelligence:
 *   - Plot summary
 *   - Character state changes
 *   - New locations discovered
 *   - Lore facts established
 *   - Unresolved and resolved plot threads
 *
 * All extracted data is persisted to the intelligence tables.
 */

/** Shape of the structured extraction result from the LLM */
export interface SummarizationResult {
  plotSummary: string;
  characterChanges: Array<{
    name: string;
    appearance?: string;
    clothing?: string;
    emotional_state?: string;
    location?: string;
    inventory?: string[];
    is_alive?: boolean;
  }>;
  newLocations: Array<{
    name: string;
    appearance?: string;
    atmosphere?: string;
    weather?: string;
    important_objects?: string[];
    inhabitants?: string[];
    lore?: string;
    visual_style?: string;
  }>;
  loreFacts: Array<{
    topic: string;
    fact: string;
  }>;
  unresolvedHooks: string[];
  resolvedHooks: string[];
}

const activeProvider: AIProvider = nvidiaProvider;

/**
 * Build the system prompt for the summarization extraction call.
 */
function buildSummarizerSystemPrompt(): string {
  return `You are an expert story analyst. Your task is to analyze a completed video script and extract structured intelligence for a long-term story memory system.

You MUST respond with valid JSON only — no markdown, no commentary.

RESPONSE FORMAT:
{
  "plotSummary": "A concise 2-3 sentence summary of the episode's narrative progression, key events, and emotional arc.",
  "characterChanges": [
    {
      "name": "Character Name",
      "appearance": "Updated appearance description if changed (null if unchanged)",
      "clothing": "Updated clothing if changed (null if unchanged)",
      "emotional_state": "Current emotional state at the end of the episode",
      "location": "Where the character is at the end of the episode",
      "inventory": ["list", "of", "items", "the", "character", "has"],
      "is_alive": true
    }
  ],
  "newLocations": [
    {
      "name": "Location Name",
      "appearance": "Visual description of the location",
      "atmosphere": "Mood and feel of the location",
      "weather": "Weather conditions if mentioned",
      "important_objects": ["notable", "objects"],
      "inhabitants": ["characters", "or", "groups", "present"],
      "lore": "Any world-building facts about this location",
      "visual_style": "Cinematographic style of the location"
    }
  ],
  "loreFacts": [
    {
      "topic": "Topic Name (e.g., 'The Grid', 'Hovercycles')",
      "fact": "A specific world-building fact established in this episode"
    }
  ],
  "unresolvedHooks": [
    "Description of a plot thread or cliffhanger left unresolved"
  ],
  "resolvedHooks": [
    "Description of a previously unresolved plot thread that was resolved in this episode"
  ]
}

RULES:
1. Only include characters that ACTUALLY APPEAR in the script.
2. Only include locations that are EXPLICITLY described in the script.
3. For character changes, only include fields that changed. Use null for unchanged fields.
4. Be precise and factual — do not invent or extrapolate beyond what the script states.
5. Keep plotSummary under 100 words.
6. Keep loreFacts to genuinely NEW world-building information.`;
}

/**
 * Build the user prompt for the summarization extraction call.
 */
function buildSummarizerUserPrompt(
  scriptText: string,
  episodeNumber: number,
  episodeTitle: string
): string {
  return `Analyze the following Episode ${episodeNumber} script titled "${episodeTitle}" and extract structured intelligence.

SCRIPT:
${scriptText}

Respond with the JSON extraction object. No other text.`;
}

/**
 * Parse the LLM summarization response.
 */
function parseSummarizationResponse(raw: string): SummarizationResult {
  // Strip markdown code fences if present
  let cleaned = raw.trim();
  const fenceMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  // Extract JSON object
  const startIdx = cleaned.indexOf('{');
  const endIdx = cleaned.lastIndexOf('}');
  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    throw new Error('No valid JSON object found in summarization response.');
  }

  const jsonStr = cleaned.slice(startIdx, endIdx + 1);
  const parsed = JSON.parse(jsonStr) as SummarizationResult;

  // Validate minimum structure
  if (!parsed.plotSummary || typeof parsed.plotSummary !== 'string') {
    throw new Error('Summarization response missing plotSummary.');
  }

  return {
    plotSummary: parsed.plotSummary,
    characterChanges: Array.isArray(parsed.characterChanges)
      ? parsed.characterChanges
      : [],
    newLocations: Array.isArray(parsed.newLocations) ? parsed.newLocations : [],
    loreFacts: Array.isArray(parsed.loreFacts) ? parsed.loreFacts : [],
    unresolvedHooks: Array.isArray(parsed.unresolvedHooks)
      ? parsed.unresolvedHooks
      : [],
    resolvedHooks: Array.isArray(parsed.resolvedHooks)
      ? parsed.resolvedHooks
      : [],
  };
}

/**
 * Run the full summarization pipeline for a finalized episode.
 *
 * This is designed to be called as a fire-and-forget background task.
 * Errors are caught and logged rather than thrown.
 *
 * @param supabase - Supabase client
 * @param episodeId - The episode row ID
 * @param episodeNumber - The episode number
 * @param episodeTitle - The episode title
 * @param scriptText - The full script text (fullScript from the variant)
 * @param storylineId - The storyline ID (for plot threads)
 * @param projectId - The project ID (for characters, locations, lore)
 */
export async function summarizeEpisode(
  supabase: Client,
  episodeId: string,
  episodeNumber: number,
  episodeTitle: string,
  scriptText: string,
  storylineId: string,
  projectId: string
): Promise<SummarizationResult | null> {
  try {
    const config = getAIConfig();

    // 1. Call the LLM for structured extraction
    const systemPrompt = buildSummarizerSystemPrompt();
    const userPrompt = buildSummarizerUserPrompt(
      scriptText,
      episodeNumber,
      episodeTitle
    );

    const response = await activeProvider.generate(
      config,
      systemPrompt,
      userPrompt
    );

    // 2. Parse the response
    const result = parseSummarizationResponse(response.content);

    // 3. Persist: Episode summary
    await updateEpisodeSummary(supabase, episodeId, result.plotSummary, {
      characterChanges: result.characterChanges.length,
      newLocations: result.newLocations.length,
      loreFacts: result.loreFacts.length,
      unresolvedHooks: result.unresolvedHooks.length,
      resolvedHooks: result.resolvedHooks.length,
    });

    // 4. Persist: Character states and memories
    if (result.characterChanges.length > 0) {
      // Get all project characters to match by name
      const characters = await getCharacters(supabase, projectId);
      const charNameMap = new Map(
        characters.map((c) => [c.name.toLowerCase(), c.id])
      );

      for (const change of result.characterChanges) {
        const charId = charNameMap.get(change.name.toLowerCase());
        if (!charId) continue; // Skip unknown characters

        // Upsert current state
        await upsertCharacterState(supabase, charId, {
          appearance: change.appearance,
          clothing: change.clothing,
          emotional_state: change.emotional_state,
          location: change.location,
          inventory: change.inventory,
          is_alive: change.is_alive,
          last_episode_id: episodeId,
        });

        // Create historical memory delta
        await createCharacterMemory(
          supabase,
          charId,
          episodeId,
          change as unknown as Record<string, unknown>,
          `Episode ${episodeNumber} changes`
        );
      }
    }

    // 5. Persist: Locations
    for (const loc of result.newLocations) {
      await upsertLocation(supabase, projectId, loc.name, {
        appearance: loc.appearance,
        atmosphere: loc.atmosphere,
        weather: loc.weather,
        important_objects: loc.important_objects,
        inhabitants: loc.inhabitants,
        lore: loc.lore,
        visual_style: loc.visual_style,
        first_episode_id: episodeId,
      });
    }

    // 6. Persist: Lore facts
    for (const lore of result.loreFacts) {
      await createLoreMemory(
        supabase,
        projectId,
        episodeId,
        lore.topic,
        lore.fact
      );
    }

    // 7. Persist: Plot threads
    for (const hook of result.unresolvedHooks) {
      await createPlotThread(supabase, storylineId, hook, episodeId);
    }

    // 8. Resolve plot threads
    if (result.resolvedHooks.length > 0) {
      const activeThreads = await getActivePlotThreads(supabase, storylineId);
      for (const resolved of result.resolvedHooks) {
        // Find matching thread by fuzzy description match
        const match = activeThreads.find(
          (t) =>
            t.description
              .toLowerCase()
              .includes(resolved.toLowerCase().slice(0, 30)) ||
            resolved
              .toLowerCase()
              .includes(t.description.toLowerCase().slice(0, 30))
        );
        if (match) {
          await resolvePlotThread(supabase, match.id, episodeId);
        }
      }
    }

    console.log(
      `[Summarizer] Episode ${episodeNumber} summarized: ${result.characterChanges.length} char changes, ${result.newLocations.length} locations, ${result.loreFacts.length} lore facts, ${result.unresolvedHooks.length} hooks`
    );

    return result;
  } catch (error) {
    console.error(
      `[Summarizer] Failed to summarize Episode ${episodeNumber}:`,
      error
    );
    return null;
  }
}
