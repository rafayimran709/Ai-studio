import type { Client } from '@/lib/database/repositories';
import {
  getEpisodes,
  getStoryArcs,
  getLatestStoryArc,
  createStoryArc,
  getSeasons,
  createSeason,
} from '@/lib/database/repositories';
import { getAIConfig } from './config';
import type { AIProvider } from './provider';
import { nvidiaProvider } from './providers/nvidia';

/**
 * Story Arc & Season Rollup Generator
 *
 * Automatically generates higher-level summaries when episode thresholds
 * are reached:
 *   - Story Arc: Every EPISODES_PER_ARC episodes (default: 5)
 *   - Season: Every ARCS_PER_SEASON arcs (default: 3)
 *
 * These summaries allow the continuity builder to reference consolidated
 * narrative context instead of loading every individual episode, enabling
 * scaling to hundreds of episodes with near-constant token cost.
 */

const EPISODES_PER_ARC = 5;
const ARCS_PER_SEASON = 3;

const activeProvider: AIProvider = nvidiaProvider;

/**
 * Check if a new story arc should be generated, and if so, generate it.
 *
 * Logic:
 * 1. Find the latest arc's end_episode (or 0 if no arcs exist).
 * 2. Count episodes since that point that have summaries.
 * 3. If count >= EPISODES_PER_ARC, generate a new arc.
 *
 * @returns The new arc, or null if threshold not reached.
 */
export async function maybeGenerateArc(
  supabase: Client,
  storylineId: string
): Promise<{ title: string; summary: string } | null> {
  try {
    const latestArc = await getLatestStoryArc(supabase, storylineId);
    const startAfterEpisode = latestArc ? latestArc.end_episode : 0;

    // Get all episodes for this storyline
    const allEpisodes = await getEpisodes(supabase, storylineId);
    const summarizedEpisodes = allEpisodes.filter(
      (ep) => ep.summary && ep.episode_number > startAfterEpisode
    );

    if (summarizedEpisodes.length < EPISODES_PER_ARC) {
      return null; // Threshold not reached
    }

    // Take the batch of episodes for this arc
    const arcEpisodes = summarizedEpisodes
      .sort((a, b) => a.episode_number - b.episode_number)
      .slice(0, EPISODES_PER_ARC);

    const startEpisode = arcEpisodes[0].episode_number;
    const endEpisode = arcEpisodes[arcEpisodes.length - 1].episode_number;

    // Build the consolidation prompt
    const episodeSummaries = arcEpisodes
      .map((ep) => `Episode ${ep.episode_number} "${ep.title}": ${ep.summary}`)
      .join('\n\n');

    const config = getAIConfig();
    const systemPrompt = `You are a story analyst. Your task is to consolidate multiple episode summaries into a single story arc summary.

Respond with valid JSON only:
{
  "title": "A compelling title for this story arc",
  "summary": "A 100-150 word consolidated summary of the narrative arc across these episodes. Focus on the overall story progression, key turning points, and character development."
}`;

    const userPrompt = `Consolidate the following ${arcEpisodes.length} episode summaries into a single story arc summary:

${episodeSummaries}

Respond with the JSON object. No other text.`;

    const response = await activeProvider.generate(
      config,
      systemPrompt,
      userPrompt
    );

    // Parse the response
    const cleaned = response.content.trim();
    const startIdx = cleaned.indexOf('{');
    const endIdx = cleaned.lastIndexOf('}');
    if (startIdx === -1 || endIdx <= startIdx) {
      throw new Error('No JSON found in arc generation response.');
    }
    const parsed = JSON.parse(cleaned.slice(startIdx, endIdx + 1)) as {
      title: string;
      summary: string;
    };

    // Determine arc number
    const existingArcs = await getStoryArcs(supabase, storylineId);
    const arcNumber = existingArcs.length + 1;

    // Persist the arc
    await createStoryArc(
      supabase,
      storylineId,
      arcNumber,
      parsed.title,
      parsed.summary,
      startEpisode,
      endEpisode
    );

    console.log(
      `[ArcGenerator] Created Story Arc ${arcNumber}: "${parsed.title}" (Ep ${startEpisode}–${endEpisode})`
    );

    // Check if a season rollup should happen
    await maybeGenerateSeason(supabase, storylineId);

    return parsed;
  } catch (error) {
    console.error('[ArcGenerator] Failed to generate story arc:', error);
    return null;
  }
}

/**
 * Check if a new season should be generated, and if so, generate it.
 *
 * Logic:
 * 1. Count arcs without a season assignment.
 * 2. If count >= ARCS_PER_SEASON, generate a new season.
 */
async function maybeGenerateSeason(
  supabase: Client,
  storylineId: string
): Promise<void> {
  try {
    const allArcs = await getStoryArcs(supabase, storylineId);
    const unassignedArcs = allArcs.filter((arc) => !arc.season_id);

    if (unassignedArcs.length < ARCS_PER_SEASON) {
      return; // Threshold not reached
    }

    const seasonArcs = unassignedArcs.slice(0, ARCS_PER_SEASON);

    const arcSummaries = seasonArcs
      .map(
        (arc) =>
          `Arc ${arc.arc_number} "${arc.title}" (Ep ${arc.start_episode}–${arc.end_episode}): ${arc.summary}`
      )
      .join('\n\n');

    const config = getAIConfig();
    const systemPrompt = `You are a story analyst. Consolidate multiple story arcs into a single season summary.

Respond with valid JSON only:
{
  "title": "A compelling title for this season",
  "summary": "A 150-200 word consolidated summary of the season's overall narrative, major character arcs, and thematic development."
}`;

    const userPrompt = `Consolidate the following ${seasonArcs.length} story arcs into a single season summary:

${arcSummaries}

Respond with the JSON object. No other text.`;

    const response = await activeProvider.generate(
      config,
      systemPrompt,
      userPrompt
    );

    const cleaned = response.content.trim();
    const startIdx = cleaned.indexOf('{');
    const endIdx = cleaned.lastIndexOf('}');
    if (startIdx === -1 || endIdx <= startIdx) {
      throw new Error('No JSON found in season generation response.');
    }
    const parsed = JSON.parse(cleaned.slice(startIdx, endIdx + 1)) as {
      title: string;
      summary: string;
    };

    const existingSeasons = await getSeasons(supabase, storylineId);
    const seasonNumber = existingSeasons.length + 1;

    const season = await createSeason(
      supabase,
      storylineId,
      seasonNumber,
      parsed.title,
      parsed.summary
    );

    // Assign arcs to this season (update season_id)
    for (const arc of seasonArcs) {
      await supabase
        .from('story_arcs')
        .update({ season_id: season.id })
        .eq('id', arc.id);
    }

    console.log(
      `[ArcGenerator] Created Season ${seasonNumber}: "${parsed.title}" (${seasonArcs.length} arcs)`
    );
  } catch (error) {
    console.error('[ArcGenerator] Failed to generate season:', error);
  }
}
