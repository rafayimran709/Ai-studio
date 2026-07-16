import { SupabaseClient } from '@supabase/supabase-js';
import {
  DbProject,
  DbStoryline,
  DbEpisode,
  DbCharacter,
  DbStoryBible,
  DbPromptTemplate,
  DbGenerationHistory,
} from './types';

export type Client = SupabaseClient;

// Projects Repository
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

// Storylines Repository
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

// Episodes Repository
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

export async function deleteEpisode(
  supabase: Client,
  id: string
): Promise<boolean> {
  const { error } = await supabase.from('episodes').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// Characters Repository
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

// Story Bible Repository
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

// Prompt Templates Repository
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

// Generation History Repository
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
