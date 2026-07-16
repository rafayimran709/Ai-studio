'use server';

import { createClient } from '@/lib/supabase/server';
import * as repo from '@/lib/database/repositories';
import * as schemas from '@/lib/database/validation';
import { z } from 'zod';

// Helper for validating with Zod and returning descriptive errors
function validateSchema<T>(schema: z.Schema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errorMessages = result.error.issues.map((e) => e.message).join(', ');
    throw new Error(`Validation failed: ${errorMessages}`);
  }
  return result.data as T;
}

// ==========================================
// PROJECTS ACTIONS
// ==========================================
export async function listProjectsAction() {
  const supabase = await createClient();
  return repo.getProjects(supabase);
}

export async function getProjectByIdAction(id: string) {
  const supabase = await createClient();
  return repo.getProjectById(supabase, id);
}

export async function createProjectAction(data: {
  name: string;
  description?: string | null;
}) {
  const validated = validateSchema<{
    name: string;
    description?: string | null;
  }>(schemas.projectSchema, data);
  const supabase = await createClient();
  return repo.createProject(supabase, validated.name, validated.description);
}

export async function updateProjectAction(
  id: string,
  data: { name: string; description?: string | null }
) {
  const validated = validateSchema<{
    name: string;
    description?: string | null;
  }>(schemas.projectSchema, data);
  const supabase = await createClient();
  return repo.updateProject(
    supabase,
    id,
    validated.name,
    validated.description
  );
}

export async function deleteProjectAction(id: string) {
  const supabase = await createClient();
  return repo.deleteProject(supabase, id);
}

// ==========================================
// STORYLINES ACTIONS
// ==========================================
export async function listStorylinesAction(projectId: string) {
  const supabase = await createClient();
  return repo.getStorylines(supabase, projectId);
}

export async function createStorylineAction(data: {
  project_id: string;
  title: string;
  synopsis?: string | null;
  status?: string;
}) {
  const validated = validateSchema<{
    project_id: string;
    title: string;
    synopsis?: string | null;
    status: string;
  }>(schemas.storylineSchema, data);

  const supabase = await createClient();
  return repo.createStoryline(
    supabase,
    validated.project_id,
    validated.title,
    validated.synopsis,
    validated.status
  );
}

export async function updateStorylineAction(
  id: string,
  data: {
    title: string;
    synopsis?: string | null;
    status?: string;
  }
) {
  const supabase = await createClient();
  return repo.updateStoryline(
    supabase,
    id,
    data.title,
    data.synopsis,
    data.status
  );
}

export async function deleteStorylineAction(id: string) {
  const supabase = await createClient();
  return repo.deleteStoryline(supabase, id);
}

// ==========================================
// EPISODES ACTIONS
// ==========================================
export async function listEpisodesAction(storylineId: string) {
  const supabase = await createClient();
  return repo.getEpisodes(supabase, storylineId);
}

export async function createEpisodeAction(data: {
  storyline_id: string;
  episode_number: number;
  title: string;
  prompt?: string | null;
  duration: string;
  style: string;
  template?: string | null;
  status?: string;
}) {
  const validated = validateSchema<{
    storyline_id: string;
    episode_number: number;
    title: string;
    prompt?: string | null;
    duration: string;
    style: string;
    template?: string | null;
    status: string;
  }>(schemas.episodeSchema, data);

  const supabase = await createClient();
  return repo.createEpisode(
    supabase,
    validated.storyline_id,
    validated.episode_number,
    validated.title,
    validated.prompt || null,
    validated.duration,
    validated.style,
    validated.template,
    validated.status
  );
}

export async function updateEpisodeAction(
  id: string,
  data: {
    title: string;
    prompt: string | null;
    duration: string;
    style: string;
    template?: string | null;
    status?: string;
  }
) {
  const supabase = await createClient();
  return repo.updateEpisode(
    supabase,
    id,
    data.title,
    data.prompt,
    data.duration,
    data.style,
    data.template,
    data.status
  );
}

export async function deleteEpisodeAction(id: string) {
  const supabase = await createClient();
  return repo.deleteEpisode(supabase, id);
}

// ==========================================
// CHARACTERS ACTIONS
// ==========================================
export async function listCharactersAction(projectId: string) {
  const supabase = await createClient();
  return repo.getCharacters(supabase, projectId);
}

export async function createCharacterAction(data: {
  project_id: string;
  name: string;
  appearance: string;
  personality?: string | null;
  age?: number | null;
  notes?: string | null;
}) {
  const validated = validateSchema<{
    project_id: string;
    name: string;
    appearance: string;
    personality?: string | null;
    age?: number | null;
    notes?: string | null;
  }>(schemas.characterSchema, data);

  const supabase = await createClient();
  return repo.createCharacter(
    supabase,
    validated.project_id,
    validated.name,
    validated.appearance,
    validated.personality,
    validated.age,
    validated.notes
  );
}

export async function updateCharacterAction(
  id: string,
  data: {
    name: string;
    appearance: string;
    personality?: string | null;
    age?: number | null;
    notes?: string | null;
  }
) {
  const supabase = await createClient();
  return repo.updateCharacter(
    supabase,
    id,
    data.name,
    data.appearance,
    data.personality,
    data.age,
    data.notes
  );
}

export async function deleteCharacterAction(id: string) {
  const supabase = await createClient();
  return repo.deleteCharacter(supabase, id);
}

// ==========================================
// STORY BIBLE ACTIONS
// ==========================================
export async function loadStoryBibleAction(projectId: string) {
  const supabase = await createClient();
  return repo.getStoryBible(supabase, projectId);
}

export async function saveStoryBibleAction(data: {
  project_id: string;
  world_setting?: string | null;
  visual_style?: string | null;
  narrative_tone?: string | null;
  writing_rules?: string | null;
  lore?: string | null;
}) {
  const validated = validateSchema<{
    project_id: string;
    world_setting?: string | null;
    visual_style?: string | null;
    narrative_tone?: string | null;
    writing_rules?: string | null;
    lore?: string | null;
  }>(schemas.storyBibleSchema, data);

  const supabase = await createClient();
  return repo.saveStoryBible(
    supabase,
    validated.project_id,
    validated.world_setting,
    validated.visual_style,
    validated.narrative_tone,
    validated.writing_rules,
    validated.lore
  );
}

// ==========================================
// TEMPLATES ACTIONS
// ==========================================
export async function listTemplatesAction() {
  const supabase = await createClient();
  return repo.getPromptTemplates(supabase);
}

// ==========================================
// GENERATION HISTORY ACTIONS
// ==========================================
export async function listGenerationHistoryAction(projectId: string) {
  const supabase = await createClient();
  return repo.getGenerationHistory(supabase, projectId);
}

export async function createGenerationHistoryAction(data: {
  project_id: string;
  storyline_id?: string | null;
  episode_id?: string | null;
  prompt: string;
  status?: string;
}) {
  const validated = validateSchema<{
    project_id: string;
    storyline_id?: string | null;
    episode_id?: string | null;
    prompt: string;
    status?: string;
  }>(schemas.generationHistorySchema, data);

  const supabase = await createClient();
  return repo.createGenerationHistory(
    supabase,
    validated.project_id,
    validated.storyline_id || null,
    validated.episode_id || null,
    validated.prompt,
    validated.status
  );
}
