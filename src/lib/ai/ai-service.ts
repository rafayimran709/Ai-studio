import type { GenerateRequest, GenerateResult } from './types';
import { AIError } from './types';
import { getAIConfig } from './config';
import { buildPrompts } from './prompt-builder';
import { parseAIResponse } from './parser';
import type { AIProvider } from './provider';
import { nvidiaProvider } from './providers/nvidia';

/**
 * Main AI service — orchestrates the full generation pipeline.
 *
 * 1. Validates environment configuration
 * 2. Builds modular system + user prompts
 * 3. Calls the provider through the provider interface
 * 4. Parses and validates the response
 * 5. Returns structured, typed result
 *
 * The service communicates only through the AIProvider interface.
 * Provider-specific logic is fully isolated.
 */

/** The active provider instance. Only NVIDIA is implemented. */
const activeProvider: AIProvider = nvidiaProvider;

export async function generateScripts(
  req: GenerateRequest
): Promise<GenerateResult> {
  // 1. Validate configuration
  const config = getAIConfig();

  // 2. Build prompts from modular sections
  const { system, user } = buildPrompts(req);

  // 3. Call the provider through the interface
  let providerResponse;
  try {
    providerResponse = await activeProvider.generate(config, system, user);
  } catch (error: unknown) {
    if (error instanceof AIError) throw error;
    const message =
      error instanceof Error ? error.message : 'Unknown provider error';
    throw new AIError('provider_error', message);
  }

  // 4. Parse and validate the response
  const parsed = parseAIResponse(providerResponse.content);

  // 5. Return structured result
  return {
    variantA: parsed.variantA,
    variantB: parsed.variantB,
    model: providerResponse.model,
    provider: activeProvider.name,
    rawResponse: providerResponse.content,
    promptTokens: providerResponse.promptTokens,
    completionTokens: providerResponse.completionTokens,
    totalTokens: providerResponse.totalTokens,
  };
}
