import { SupabaseClient } from '@supabase/supabase-js';
import {
  DbProject,
  DbStoryline,
  DbEpisode,
  DbCharacter,
  DbStoryBible,
  DbPromptTemplate,
  DbGenerationHistory,
  DbCharacterState,
  DbCharacterMemory,
  DbLocation,
  DbLoreMemory,
  DbPlotThread,
  DbStoryArc,
  DbSeason,
} from './types';

export type Client = SupabaseClient;

// ==========================================
// Projects Repository
// ==========================================
export async function getProjects(supabase: Client): Promise<DbProject[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as DbProject[];
}

export async function getProjectById(
  supabase: Client,
  id: string
): Promise<DbProject> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as DbProject;
}

export async function createProject(
  supabase: Client,
  name: string,
  description?: string | null
): Promise<DbProject> {
  const { data, error } = await supabase
    .from('projects')
    .insert({ name, description: description || null })
    .select()
    .single();
  if (error) throw error;
  return data as DbProject;
}

export async function updateProject(
  supabase: Client,
  id: string,
  name: string,
  description?: string | null
): Promise<DbProject> {
  const { data, error } = await supabase
    .from('projects')
    .update({
      name,
      description: description || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as DbProject;
}

export async function deleteProject(
  supabase: Client,
  id: string
): Promise<boolean> {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// ==========================================
// Storylines Repository
// ==========================================
export async function getStorylines(
  supabase: Client,
  projectId: string
): Promise<DbStoryline[]> {
  const { data, error } = await supabase
    .from('storylines')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as DbStoryline[];
}

export async function createStoryline(
  supabase: Client,
  projectId: string,
  title: string,
  synopsis?: string | null,
  status: string = 'active'
): Promise<DbStoryline> {
  const { data, error } = await supabase
    .from('storylines')
    .insert({
      project_id: projectId,
      title,
      synopsis: synopsis || null,
      status,
    })
    .select()
    .single();
  if (error) throw error;
  return data as DbStoryline;
}

export async function updateStoryline(
  supabase: Client,
  id: string,
  title: string,
  synopsis?: string | null,
  status?: string
): Promise<DbStoryline> {
  const updateData: {
    title: string;
    synopsis: string | null;
    updated_at: string;
    status?: string;
  } = {
    title,
    synopsis: synopsis || null,
    updated_at: new Date().toISOString(),
  };
  if (status) updateData.status = status;

  const { data, error } = await supabase
    .from('storylines')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as DbStoryline;
}

export async function deleteStoryline(
  supabase: Client,
  id: string
): Promise<boolean> {
  const { error } = await supabase.from('storylines').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// ==========================================
// Episodes Repository
// ==========================================
export async function getEpisodes(
  supabase: Client,
  storylineId: string
): Promise<DbEpisode[]> {
  const { data, error } = await supabase
    .from('episodes')
    .select('*')
    .eq('storyline_id', storylineId)
    .order('episode_number', { ascending: true });
  if (error) throw error;
  return data as DbEpisode[];
}

export async function createEpisode(
  supabase: Client,
  storylineId: string,
  episodeNumber: number,
  title: string,
  prompt: string | null,
  duration: string,
  style: string,
  template?: string | null,
  status: string = 'draft'
): Promise<DbEpisode> {
  const { data, error } = await supabase
    .from('episodes')
    .insert({
      storyline_id: storylineId,
      episode_number: episodeNumber,
      title,
      prompt,
      duration,
      style,
      template: template || null,
      status,
    })
    .select()
    .single();
  if (error) throw error;
  return data as DbEpisode;
}

export async function updateEpisode(
  supabase: Client,
  id: string,
  title: string,
  prompt: string | null,
  duration: string,
  style: string,
  template?: string | null,
  status?: string
): Promise<DbEpisode> {
  const updateData: {
    title: string;
    prompt: string | null;
    duration: string;
    style: string;
    template: string | null;
    status?: string;
  } = { title, prompt, duration, style, template: template || null };
  if (status) updateData.status = status;

  const { data, error } = await supabase
    .from('episodes')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as DbEpisode;
}

export async function updateEpisodeSummary(
  supabase: Client,
  id: string,
  summary: string,
  metadata?: Record<string, unknown>
): Promise<DbEpisode> {
  const updateData: { summary: string; metadata?: Record<string, unknown> } = {
    summary,
  };
  if (metadata) updateData.metadata = metadata;

  const { data, error } = await supabase
    .from('episodes')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as DbEpisode;
}

export async function deleteEpisode(
  supabase: Client,
  id: string
): Promise<boolean> {
  const { error } = await supabase.from('episodes').delete().eq('id', id);
  if (error) throw error;
  return true;
}

/**
 * Fetch the N most recent episode summaries for a storyline,
 * ordered by episode_number descending (most recent first).
 */
export async function getRecentEpisodeSummaries(
  supabase: Client,
  storylineId: string,
  limit: number = 2
): Promise<DbEpisode[]> {
  const { data, error } = await supabase
    .from('episodes')
    .select('*')
    .eq('storyline_id', storylineId)
    .not('summary', 'is', null)
    .order('episode_number', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as DbEpisode[];
}

// ==========================================
// Characters Repository
// ==========================================
export async function getCharacters(
  supabase: Client,
  projectId: string
): Promise<DbCharacter[]> {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as DbCharacter[];
}

export async function createCharacter(
  supabase: Client,
  projectId: string,
  name: string,
  appearance: string,
  personality?: string | null,
  age?: number | null,
  notes?: string | null
): Promise<DbCharacter> {
  const { data, error } = await supabase
    .from('characters')
    .insert({
      project_id: projectId,
      name,
      appearance,
      personality: personality || null,
      age: age || null,
      notes: notes || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as DbCharacter;
}

export async function updateCharacter(
  supabase: Client,
  id: string,
  name: string,
  appearance: string,
  personality?: string | null,
  age?: number | null,
  notes?: string | null
): Promise<DbCharacter> {
  const { data, error } = await supabase
    .from('characters')
    .update({
      name,
      appearance,
      personality: personality || null,
      age: age || null,
      notes: notes || null,
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as DbCharacter;
}

export async function deleteCharacter(
  supabase: Client,
  id: string
): Promise<boolean> {
  const { error } = await supabase.from('characters').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// ==========================================
// Character States Repository
// ==========================================

export async function getCharacterStates(
  supabase: Client,
  projectId: string
): Promise<(DbCharacterState & { character_name: string })[]> {
  // Join character_states with characters to get names
  const { data: characters } = await supabase
    .from('characters')
    .select('id, name')
    .eq('project_id', projectId);

  if (!characters || characters.length === 0) return [];

  const charIds = characters.map((c) => c.id);
  const { data, error } = await supabase
    .from('character_states')
    .select('*')
    .in('character_id', charIds);
  if (error) throw error;

  const nameMap = new Map(characters.map((c) => [c.id, c.name]));
  return (data as DbCharacterState[]).map((state) => ({
    ...state,
    character_name: nameMap.get(state.character_id) || 'Unknown',
  }));
}

export async function getCharacterState(
  supabase: Client,
  characterId: string
): Promise<DbCharacterState | null> {
  const { data, error } = await supabase
    .from('character_states')
    .select('*')
    .eq('character_id', characterId)
    .maybeSingle();
  if (error) throw error;
  return data as DbCharacterState | null;
}

export async function upsertCharacterState(
  supabase: Client,
  characterId: string,
  state: {
    appearance?: string | null;
    clothing?: string | null;
    emotional_state?: string | null;
    location?: string | null;
    inventory?: string[];
    is_alive?: boolean;
    last_episode_id?: string | null;
  }
): Promise<DbCharacterState> {
  const { data, error } = await supabase
    .from('character_states')
    .upsert(
      {
        character_id: characterId,
        appearance: state.appearance ?? null,
        clothing: state.clothing ?? null,
        emotional_state: state.emotional_state ?? null,
        location: state.location ?? null,
        inventory: state.inventory ?? [],
        is_alive: state.is_alive ?? true,
        last_episode_id: state.last_episode_id ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'character_id' }
    )
    .select()
    .single();
  if (error) throw error;
  return data as DbCharacterState;
}

// ==========================================
// Character Memories Repository
// ==========================================

export async function getCharacterMemories(
  supabase: Client,
  characterId: string
): Promise<DbCharacterMemory[]> {
  const { data, error } = await supabase
    .from('character_memories')
    .select('*')
    .eq('character_id', characterId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as DbCharacterMemory[];
}

export async function createCharacterMemory(
  supabase: Client,
  characterId: string,
  episodeId: string,
  changes: Record<string, unknown>,
  notes?: string | null
): Promise<DbCharacterMemory> {
  const { data, error } = await supabase
    .from('character_memories')
    .upsert(
      {
        character_id: characterId,
        episode_id: episodeId,
        changes,
        notes: notes || null,
      },
      { onConflict: 'character_id,episode_id' }
    )
    .select()
    .single();
  if (error) throw error;
  return data as DbCharacterMemory;
}

// ==========================================
// Locations Repository
// ==========================================

export async function getLocations(
  supabase: Client,
  projectId: string
): Promise<DbLocation[]> {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('project_id', projectId)
    .order('name', { ascending: true });
  if (error) throw error;
  return data as DbLocation[];
}

export async function getLocationsByNames(
  supabase: Client,
  projectId: string,
  names: string[]
): Promise<DbLocation[]> {
  if (names.length === 0) return [];

  // Use case-insensitive matching with ilike for each name
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('project_id', projectId)
    .in('name', names);
  if (error) throw error;
  return data as DbLocation[];
}

export async function upsertLocation(
  supabase: Client,
  projectId: string,
  name: string,
  location: {
    appearance?: string | null;
    atmosphere?: string | null;
    weather?: string | null;
    important_objects?: string[];
    inhabitants?: string[];
    lore?: string | null;
    visual_style?: string | null;
    first_episode_id?: string | null;
  }
): Promise<DbLocation> {
  // Check if location already exists by name
  const { data: existing } = await supabase
    .from('locations')
    .select('id')
    .eq('project_id', projectId)
    .eq('name', name)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from('locations')
      .update({
        appearance: location.appearance ?? null,
        atmosphere: location.atmosphere ?? null,
        weather: location.weather ?? null,
        important_objects: location.important_objects ?? [],
        inhabitants: location.inhabitants ?? [],
        lore: location.lore ?? null,
        visual_style: location.visual_style ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    return data as DbLocation;
  } else {
    const { data, error } = await supabase
      .from('locations')
      .insert({
        project_id: projectId,
        name,
        appearance: location.appearance ?? null,
        atmosphere: location.atmosphere ?? null,
        weather: location.weather ?? null,
        important_objects: location.important_objects ?? [],
        inhabitants: location.inhabitants ?? [],
        lore: location.lore ?? null,
        visual_style: location.visual_style ?? null,
        first_episode_id: location.first_episode_id ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return data as DbLocation;
  }
}

// ==========================================
// Lore Memories Repository
// ==========================================

export async function getLoreMemories(
  supabase: Client,
  projectId: string,
  activeOnly: boolean = true
): Promise<DbLoreMemory[]> {
  let query = supabase
    .from('lore_memories')
    .select('*')
    .eq('project_id', projectId);
  if (activeOnly) {
    query = query.eq('is_active', true);
  }
  const { data, error } = await query.order('created_at', { ascending: true });
  if (error) throw error;
  return data as DbLoreMemory[];
}

export async function getActiveLoreByTopics(
  supabase: Client,
  projectId: string,
  topics: string[]
): Promise<DbLoreMemory[]> {
  if (topics.length === 0) return [];
  const { data, error } = await supabase
    .from('lore_memories')
    .select('*')
    .eq('project_id', projectId)
    .eq('is_active', true)
    .in('topic', topics);
  if (error) throw error;
  return data as DbLoreMemory[];
}

export async function createLoreMemory(
  supabase: Client,
  projectId: string,
  episodeId: string | null,
  topic: string,
  fact: string
): Promise<DbLoreMemory> {
  const { data, error } = await supabase
    .from('lore_memories')
    .insert({
      project_id: projectId,
      episode_id: episodeId,
      topic,
      fact,
      is_active: true,
    })
    .select()
    .single();
  if (error) throw error;
  return data as DbLoreMemory;
}

// ==========================================
// Plot Threads Repository
// ==========================================

export async function getPlotThreads(
  supabase: Client,
  storylineId: string
): Promise<DbPlotThread[]> {
  const { data, error } = await supabase
    .from('plot_threads')
    .select('*')
    .eq('storyline_id', storylineId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as DbPlotThread[];
}

export async function getActivePlotThreads(
  supabase: Client,
  storylineId: string
): Promise<DbPlotThread[]> {
  const { data, error } = await supabase
    .from('plot_threads')
    .select('*')
    .eq('storyline_id', storylineId)
    .eq('status', 'active')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as DbPlotThread[];
}

export async function createPlotThread(
  supabase: Client,
  storylineId: string,
  description: string,
  introducedEpisodeId?: string | null
): Promise<DbPlotThread> {
  const { data, error } = await supabase
    .from('plot_threads')
    .insert({
      storyline_id: storylineId,
      description,
      introduced_episode_id: introducedEpisodeId || null,
      status: 'active',
    })
    .select()
    .single();
  if (error) throw error;
  return data as DbPlotThread;
}

export async function resolvePlotThread(
  supabase: Client,
  id: string,
  resolvedEpisodeId: string
): Promise<DbPlotThread> {
  const { data, error } = await supabase
    .from('plot_threads')
    .update({
      status: 'resolved',
      resolved_episode_id: resolvedEpisodeId,
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as DbPlotThread;
}

// ==========================================
// Story Arcs Repository
// ==========================================

export async function getStoryArcs(
  supabase: Client,
  storylineId: string
): Promise<DbStoryArc[]> {
  const { data, error } = await supabase
    .from('story_arcs')
    .select('*')
    .eq('storyline_id', storylineId)
    .order('arc_number', { ascending: true });
  if (error) throw error;
  return data as DbStoryArc[];
}

export async function getLatestStoryArc(
  supabase: Client,
  storylineId: string
): Promise<DbStoryArc | null> {
  const { data, error } = await supabase
    .from('story_arcs')
    .select('*')
    .eq('storyline_id', storylineId)
    .order('arc_number', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as DbStoryArc | null;
}

export async function createStoryArc(
  supabase: Client,
  storylineId: string,
  arcNumber: number,
  title: string,
  summary: string,
  startEpisode: number,
  endEpisode: number,
  seasonId?: string | null
): Promise<DbStoryArc> {
  const { data, error } = await supabase
    .from('story_arcs')
    .insert({
      storyline_id: storylineId,
      arc_number: arcNumber,
      title,
      summary,
      start_episode: startEpisode,
      end_episode: endEpisode,
      season_id: seasonId || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as DbStoryArc;
}

// ==========================================
// Seasons Repository
// ==========================================

export async function getSeasons(
  supabase: Client,
  storylineId: string
): Promise<DbSeason[]> {
  const { data, error } = await supabase
    .from('seasons')
    .select('*')
    .eq('storyline_id', storylineId)
    .order('season_number', { ascending: true });
  if (error) throw error;
  return data as DbSeason[];
}

export async function createSeason(
  supabase: Client,
  storylineId: string,
  seasonNumber: number,
  title: string,
  summary: string
): Promise<DbSeason> {
  const { data, error } = await supabase
    .from('seasons')
    .insert({
      storyline_id: storylineId,
      season_number: seasonNumber,
      title,
      summary,
    })
    .select()
    .single();
  if (error) throw error;
  return data as DbSeason;
}

// ==========================================
// Story Bible Repository
// ==========================================
export async function getStoryBible(
  supabase: Client,
  projectId: string
): Promise<DbStoryBible | null> {
  const { data, error } = await supabase
    .from('story_bibles')
    .select('*')
    .eq('project_id', projectId)
    .maybeSingle();
  if (error) throw error;
  return data as DbStoryBible | null;
}

export async function saveStoryBible(
  supabase: Client,
  projectId: string,
  worldSetting?: string | null,
  visualStyle?: string | null,
  narrativeTone?: string | null,
  writingRules?: string | null,
  lore?: string | null
): Promise<DbStoryBible> {
  const existing = await getStoryBible(supabase, projectId);

  if (existing) {
    const { data, error } = await supabase
      .from('story_bibles')
      .update({
        world_setting: worldSetting || null,
        visual_style: visualStyle || null,
        narrative_tone: narrativeTone || null,
        writing_rules: writingRules || null,
        lore: lore || null,
        updated_at: new Date().toISOString(),
      })
      .eq('project_id', projectId)
      .select()
      .single();
    if (error) throw error;
    return data as DbStoryBible;
  } else {
    const { data, error } = await supabase
      .from('story_bibles')
      .insert({
        project_id: projectId,
        world_setting: worldSetting || null,
        visual_style: visualStyle || null,
        narrative_tone: narrativeTone || null,
        writing_rules: writingRules || null,
        lore: lore || null,
      })
      .select()
      .single();
    if (error) throw error;
    return data as DbStoryBible;
  }
}

// ==========================================
// Prompt Templates Repository
// ==========================================
export async function getPromptTemplates(
  supabase: Client
): Promise<DbPromptTemplate[]> {
  const { data, error } = await supabase
    .from('prompt_templates')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw error;
  return data as DbPromptTemplate[];
}

// ==========================================
// Generation History Repository
// ==========================================
export async function getGenerationHistory(
  supabase: Client,
  projectId: string
): Promise<DbGenerationHistory[]> {
  const { data, error } = await supabase
    .from('generation_history')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as DbGenerationHistory[];
}

export async function createGenerationHistory(
  supabase: Client,
  projectId: string,
  storylineId: string | null,
  episodeId: string | null,
  prompt: string,
  status: string = 'completed',
  finalPrompt: string | null = null,
  rawResponse: string | null = null,
  variantA: Record<string, unknown> | null = null,
  variantB: Record<string, unknown> | null = null,
  model: string | null = null,
  provider: string | null = null,
  promptTokens: number | null = null,
  completionTokens: number | null = null,
  totalTokens: number | null = null
): Promise<DbGenerationHistory> {
  const { data, error } = await supabase
    .from('generation_history')
    .insert({
      project_id: projectId,
      storyline_id: storylineId || null,
      episode_id: episodeId || null,
      prompt,
      status,
      final_prompt: finalPrompt,
      raw_response: rawResponse,
      variant_a: variantA,
      variant_b: variantB,
      model,
      provider,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: totalTokens,
    })
    .select()
    .single();
  if (error) throw error;
  return data as DbGenerationHistory;
}
