import { z } from 'zod';

export const projectSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be under 100 characters'),
  description: z.string().optional().nullable(),
});

export const storylineSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be under 200 characters'),
  synopsis: z.string().optional().nullable(),
  status: z.string().default('active'),
});

export const episodeSchema = z.object({
  storyline_id: z.string().uuid('Invalid storyline ID'),
  episode_number: z.number().int().min(1, 'Episode number must be at least 1'),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be under 200 characters'),
  prompt: z.string().optional().nullable(),
  duration: z.string().min(1, 'Duration is required'),
  style: z.string().min(1, 'Style is required'),
  template: z.string().optional().nullable(),
  status: z.string().default('draft'),
});

export const characterSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be under 100 characters'),
  appearance: z.string().min(1, 'Appearance traits are required'),
  personality: z.string().optional().nullable(),
  age: z
    .number()
    .int()
    .min(0, 'Age must be non-negative')
    .optional()
    .nullable(),
  notes: z.string().optional().nullable(),
});

export const storyBibleSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  world_setting: z.string().optional().nullable(),
  visual_style: z.string().optional().nullable(),
  narrative_tone: z.string().optional().nullable(),
  writing_rules: z.string().optional().nullable(),
  lore: z.string().optional().nullable(),
});

export const promptTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
  system_prompt: z.string().min(1, 'System prompt is required'),
});

export const generationHistorySchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  storyline_id: z.string().uuid('Invalid storyline ID').optional().nullable(),
  episode_id: z.string().uuid('Invalid episode ID').optional().nullable(),
  prompt: z.string().min(1, 'Prompt is required'),
  status: z.string().default('completed'),
});
