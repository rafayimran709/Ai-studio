import { z } from 'zod';

// ==========================================
// INPUT TYPES
// ==========================================

/** Character data injected into the prompt */
export interface PromptCharacter {
  name: string;
  appearance: string;
  personality: string | null;
}

/** Story Bible data injected into the prompt */
export interface PromptStoryBible {
  worldSetting: string | null;
  visualStyle: string | null;
  narrativeTone: string | null;
  writingRules: string | null;
  lore: string | null;
}

/** Full request input from the UI to the AI service */
export interface GenerateRequest {
  prompt: string;
  duration: string;
  style: string;
  template: string | null;
  storyMode: 'one-time' | 'storyline';
  episodeNumber?: number;
  characters: PromptCharacter[];
  storyBible: PromptStoryBible | null;
}

// ==========================================
// OUTPUT TYPES
// ==========================================

/** Zod schema for a single Veo 3 script variant */
export const scriptVariantSchema = z.object({
  title: z.string().min(1, 'Script title is required'),
  summary: z.string().min(1, 'Script summary is required'),
  fullScript: z.string().min(1, 'Full script content is required'),
  estimatedDuration: z.string().min(1, 'Estimated duration is required'),
});

/** TypeScript type inferred from the Zod schema */
export type ScriptVariant = z.infer<typeof scriptVariantSchema>;

/** Zod schema for the complete AI response containing two variants */
export const generateResponseSchema = z.object({
  variantA: scriptVariantSchema,
  variantB: scriptVariantSchema,
});

/** TypeScript type for the parsed AI response */
export type GenerateResponsePayload = z.infer<typeof generateResponseSchema>;

/** Final result returned from the AI service, with metadata */
export interface GenerateResult {
  variantA: ScriptVariant;
  variantB: ScriptVariant;
  model: string;
  provider: string;
  rawResponse: string;
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
}

// ==========================================
// PROVIDER RESPONSE TYPE
// ==========================================

/** Raw response from a provider call, before parsing */
export interface ProviderResponse {
  content: string;
  model: string;
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
}

// ==========================================
// ERROR TYPES
// ==========================================

export type AIErrorCode =
  | 'missing_api_key'
  | 'invalid_response'
  | 'network_error'
  | 'timeout'
  | 'provider_error';

const ERROR_MESSAGES: Record<AIErrorCode, string> = {
  missing_api_key:
    'NVIDIA API key is not configured. Please set NVIDIA_API_KEY in your environment variables.',
  invalid_response:
    'The AI returned an unexpected response format. Please try again.',
  network_error:
    'Failed to connect to the AI service. Please check your network and try again.',
  timeout:
    'The AI request timed out. Please try a shorter prompt or try again later.',
  provider_error: 'The AI provider returned an error. Please try again later.',
};

export class AIError extends Error {
  public readonly code: AIErrorCode;
  public readonly userMessage: string;
  public readonly statusCode?: number;

  constructor(code: AIErrorCode, details?: string, statusCode?: number) {
    const userMessage = ERROR_MESSAGES[code];
    const fullMessage = details
      ? `${userMessage} Details: ${details}`
      : userMessage;
    super(fullMessage);
    this.name = 'AIError';
    this.code = code;
    this.userMessage = userMessage;
    this.statusCode = statusCode;
  }
}
