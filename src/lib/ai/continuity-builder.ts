import type { Client } from '@/lib/database/repositories';
import {
  getRecentEpisodeSummaries,
  getCharacterStates,
  getLocationsByNames,
  getActivePlotThreads,
  getLatestStoryArc,
  getStoryBible,
  getLocations,
} from '@/lib/database/repositories';

/**
 * Continuity Context Builder
 *
 * Assembles a structured memory context block for injection into AI prompts.
 * Uses the sliding window strategy:
 *   - Full detail for the last 2 episodes
 *   - Current character states (snapshots, not full history)
 *   - Relevant locations (extracted from prompt text + recent episodes)
 *   - Active plot threads
 *   - Current story arc summary (if available)
 *   - Story Bible core rules
 *
 * The result is a plain text block that gets injected as a section in the
 * user prompt via prompt-builder.ts.
 */

export interface ContinuityContext {
  /** The assembled context text block for prompt injection */
  text: string;
  /** Approximate token count estimate (1 token ≈ 4 chars) */
  estimatedTokens: number;
}

/**
 * Build the continuity context for Episode N of a storyline.
 *
 * @param supabase   - Supabase client
 * @param projectId  - The project ID (for characters, locations, bible)
 * @param storylineId - The storyline ID (for episodes, arcs, threads)
 * @param episodeNumber - The episode number being generated (N)
 * @param promptText - The user's prompt text (for extracting relevant location names)
 */
export async function buildContinuityContext(
  supabase: Client,
  projectId: string,
  storylineId: string,
  episodeNumber: number,
  promptText: string
): Promise<ContinuityContext> {
  // Fetch all data sources in parallel
  const [
    recentEpisodes,
    characterStates,
    allLocations,
    activeThreads,
    latestArc,
    storyBible,
  ] = await Promise.all([
    getRecentEpisodeSummaries(supabase, storylineId, 2),
    getCharacterStates(supabase, projectId),
    getLocations(supabase, projectId),
    getActivePlotThreads(supabase, storylineId),
    getLatestStoryArc(supabase, storylineId),
    getStoryBible(supabase, projectId),
  ]);

  const sections: string[] = [];

  // ── Section 1: Story Arc Summary ──────────────────────────
  if (latestArc) {
    sections.push(
      `## STORY ARC: "${latestArc.title}" (Episodes ${latestArc.start_episode}–${latestArc.end_episode})\n${latestArc.summary}`
    );
  }

  // ── Section 2: Recent Episode Summaries ───────────────────
  if (recentEpisodes.length > 0) {
    // Reverse so they appear in chronological order
    const chronological = [...recentEpisodes].reverse();
    const episodeSummaries = chronological
      .map(
        (ep) =>
          `### Episode ${ep.episode_number}: "${ep.title}"\n${ep.summary || 'No summary available.'}`
      )
      .join('\n\n');
    sections.push(`## STORY SO FAR\n${episodeSummaries}`);
  }

  // ── Section 3: Character Current States ───────────────────
  if (characterStates.length > 0) {
    const charLines = characterStates
      .map((cs) => {
        const parts: string[] = [`- **${cs.character_name}**`];
        if (!cs.is_alive) {
          parts.push('  ⚠ DECEASED — Do NOT include this character.');
          return parts.join('\n');
        }
        if (cs.appearance) parts.push(`  Appearance: ${cs.appearance}`);
        if (cs.clothing) parts.push(`  Clothing: ${cs.clothing}`);
        if (cs.emotional_state)
          parts.push(`  Emotional State: ${cs.emotional_state}`);
        if (cs.location) parts.push(`  Last Known Location: ${cs.location}`);
        if (cs.inventory && cs.inventory.length > 0)
          parts.push(`  Inventory: ${cs.inventory.join(', ')}`);
        return parts.join('\n');
      })
      .join('\n\n');
    sections.push(
      `## CHARACTER STATES (current as of Episode ${episodeNumber - 1})\nYou MUST maintain visual consistency with these descriptions.\n\n${charLines}`
    );
  }

  // ── Section 4: Relevant Locations ─────────────────────────
  // Extract location names from prompt text by matching against known locations
  const relevantLocations = findRelevantLocations(
    allLocations.map((l) => l.name),
    promptText,
    recentEpisodes.map((ep) => ep.summary || '').join(' ')
  );

  const matchedLocations =
    relevantLocations.length > 0
      ? await getLocationsByNames(supabase, projectId, relevantLocations)
      : [];

  if (matchedLocations.length > 0) {
    const locLines = matchedLocations
      .map((loc) => {
        const parts: string[] = [`- **${loc.name}**`];
        if (loc.appearance) parts.push(`  Appearance: ${loc.appearance}`);
        if (loc.atmosphere) parts.push(`  Atmosphere: ${loc.atmosphere}`);
        if (loc.weather) parts.push(`  Weather: ${loc.weather}`);
        if (loc.visual_style) parts.push(`  Visual Style: ${loc.visual_style}`);
        if (loc.important_objects && loc.important_objects.length > 0)
          parts.push(
            `  Important Objects: ${loc.important_objects.join(', ')}`
          );
        if (loc.lore) parts.push(`  Lore: ${loc.lore}`);
        return parts.join('\n');
      })
      .join('\n\n');
    sections.push(`## ACTIVE LOCATIONS\n${locLines}`);
  }

  // ── Section 5: Active Plot Threads ────────────────────────
  if (activeThreads.length > 0) {
    const threadLines = activeThreads
      .map((t) => `- ${t.description}`)
      .join('\n');
    sections.push(
      `## UNRESOLVED PLOT THREADS\nThese story hooks are still active. Continue, reference, or resolve them as narratively appropriate.\n\n${threadLines}`
    );
  }

  // ── Section 6: Story Bible Core Rules ─────────────────────
  if (storyBible) {
    const bibleParts: string[] = [];
    if (storyBible.writing_rules)
      bibleParts.push(`Writing Rules: ${storyBible.writing_rules}`);
    if (storyBible.narrative_tone)
      bibleParts.push(`Narrative Tone: ${storyBible.narrative_tone}`);
    if (storyBible.visual_style)
      bibleParts.push(`Visual Style: ${storyBible.visual_style}`);
    if (bibleParts.length > 0) {
      sections.push(`## STORY BIBLE RULES\n${bibleParts.join('\n')}`);
    }
  }

  // ── Compose ───────────────────────────────────────────────
  if (sections.length === 0) {
    return { text: '', estimatedTokens: 0 };
  }

  const text = `CONTINUITY CONTEXT FOR EPISODE ${episodeNumber}
You are generating Episode ${episodeNumber} of an ongoing serialized storyline.
You MUST respect the following continuity context. Do NOT contradict character states, locations, or plot threads.

${sections.join('\n\n---\n\n')}`;

  const estimatedTokens = Math.ceil(text.length / 4);

  return { text, estimatedTokens };
}

/**
 * Find location names from the known locations list that appear
 * in the prompt text or recent episode summaries.
 */
function findRelevantLocations(
  knownNames: string[],
  promptText: string,
  recentSummaryText: string
): string[] {
  const combined = `${promptText} ${recentSummaryText}`.toLowerCase();
  return knownNames.filter((name) => combined.includes(name.toLowerCase()));
}
