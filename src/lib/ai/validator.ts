import { getAIConfig } from './config';
import type { AIProvider } from './provider';
import { nvidiaProvider } from './providers/nvidia';

/**
 * Continuity Validation Engine
 *
 * Compares generated script variants against the active continuity context
 * to identify any logical errors, contradictions, dead characters,
 * or visual consistency breaches.
 */

export interface ContinuityWarning {
  severity: 'warning' | 'info';
  category: 'character' | 'location' | 'lore' | 'plot';
  message: string;
  suggestion?: string;
}

const activeProvider: AIProvider = nvidiaProvider;

/**
 * Perform continuity validation on a generated script variant.
 *
 * @param scriptText - The full generated script text.
 * @param continuityContext - The continuity context block built for this generation.
 */
export async function validateContinuity(
  scriptText: string,
  continuityContext: string | null | undefined
): Promise<ContinuityWarning[]> {
  if (!continuityContext || !scriptText || scriptText.trim() === '') {
    return [];
  }

  try {
    const config = getAIConfig();

    const systemPrompt = `You are a continuity editor for an episodic video series. Your job is to compare a newly generated script against the established Story Continuity Context and identify any logical contradictions or consistency errors.

You MUST respond with valid JSON containing a "warnings" array. No other text.

RESPONSE SCHEMA:
{
  "warnings": [
    {
      "severity": "warning", // warning (for direct contradictions) or info (for minor inconsistencies/suggestions)
      "category": "character", // character, location, lore, or plot
      "message": "Clear explanation of the continuity error (e.g., 'Character Jax was killed in Episode 3, but is appearing in this scene.')",
      "suggestion": "How to resolve the contradiction (e.g., 'Replace Jax with a different character or explain their resurrection.')"
    }
  ]
}

RULES:
1. Only flag genuine contradictions against the established Continuity Context.
2. If the script is fully consistent, return an empty "warnings" array.
3. Be specific about which character, location, or lore rule is being contradicted.`;

    const userPrompt = `established STORY CONTINUITY CONTEXT:
${continuityContext}

--------------------------------------------------
NEW GENERATED SCRIPT TO VALIDATE:
${scriptText}

Respond with the JSON verification object. No other text.`;

    const response = await activeProvider.generate(
      config,
      systemPrompt,
      userPrompt
    );

    const cleaned = response.content.trim();
    const startIdx = cleaned.indexOf('{');
    const endIdx = cleaned.lastIndexOf('}');
    if (startIdx === -1 || endIdx <= startIdx) {
      return [];
    }

    const parsed = JSON.parse(cleaned.slice(startIdx, endIdx + 1)) as {
      warnings: ContinuityWarning[];
    };

    return Array.isArray(parsed.warnings) ? parsed.warnings : [];
  } catch (error) {
    console.error('[ContinuityValidator] Validation failed:', error);
    return [];
  }
}
