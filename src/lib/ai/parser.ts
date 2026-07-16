import { generateResponseSchema, AIError } from './types';
import type { GenerateResponsePayload } from './types';

/**
 * Step 1: Strip markdown code fences from a raw string.
 * Handles ```json ... ```, ``` ... ```, and stray backtick wrappers.
 */
function stripCodeFences(raw: string): string {
  const fenceMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch) {
    return fenceMatch[1].trim();
  }
  return raw.trim();
}

/**
 * Step 2: Extract the first complete JSON object from a string.
 * Uses brace-depth counting to find the matching closing brace,
 * correctly skipping braces inside string literals.
 */
function extractJSONObject(raw: string): string {
  const startIdx = raw.indexOf('{');
  if (startIdx === -1) {
    throw new AIError(
      'invalid_response',
      'No JSON object found in AI response.'
    );
  }

  let depth = 0;
  let inString = false;
  let escapeNext = false;

  for (let i = startIdx; i < raw.length; i++) {
    const ch = raw[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (ch === '\\' && inString) {
      escapeNext = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth === 0) {
        return raw.slice(startIdx, i + 1);
      }
    }
  }

  // Unclosed object — return best effort (everything from first { to last })
  const endIdx = raw.lastIndexOf('}');
  if (endIdx > startIdx) {
    return raw.slice(startIdx, endIdx + 1);
  }

  throw new AIError(
    'invalid_response',
    'No complete JSON object found in AI response.'
  );
}

/**
 * Step 3: Attempt one safe JSON repair pass for common LLM output issues.
 *
 * Fixes applied (all syntactic, never semantic):
 * - Trailing commas before } or ] (e.g. `"a": 1,}`)
 * - Single-quoted strings → double-quoted strings (outside existing doubles)
 * - Unescaped newlines/tabs inside string values
 * - Missing closing braces/brackets (appends them)
 *
 * Does NOT fabricate missing fields or alter content.
 */
function repairJSON(raw: string): string {
  let repaired = raw;

  // Fix trailing commas: `,` followed by optional whitespace then `}` or `]`
  repaired = repaired.replace(/,\s*([\]}])/g, '$1');

  // Fix single-quoted strings → double-quoted strings.
  // Only replaces single quotes used as string delimiters (not inside double-quoted strings).
  // Strategy: process character-by-character to avoid breaking apostrophes in values.
  repaired = replaceSingleQuotes(repaired);

  // Fix unescaped literal newlines/tabs inside JSON strings
  repaired = escapeStringInternals(repaired);

  // Fix unclosed brackets/braces by counting depth
  repaired = closeOpenBrackets(repaired);

  return repaired;
}

/**
 * Replace single-quoted JSON string delimiters with double quotes.
 * Processes character-by-character to avoid breaking contractions/apostrophes
 * inside already double-quoted strings.
 */
function replaceSingleQuotes(input: string): string {
  const chars = input.split('');
  let inDouble = false;
  let inSingle = false;
  let escapeNext = false;

  for (let i = 0; i < chars.length; i++) {
    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (chars[i] === '\\') {
      escapeNext = true;
      continue;
    }

    if (chars[i] === '"' && !inSingle) {
      inDouble = !inDouble;
      continue;
    }

    if (chars[i] === "'" && !inDouble) {
      // Check if this looks like a string delimiter (preceded/followed by
      // structural characters, whitespace, or colon) vs an apostrophe in text
      const prev = i > 0 ? chars[i - 1] : '';
      const next = i < chars.length - 1 ? chars[i + 1] : '';

      if (!inSingle) {
        // Opening single quote: preceded by structural char or start
        const structuralBefore = /[{[\s:,]/.test(prev) || i === 0;
        if (structuralBefore) {
          chars[i] = '"';
          inSingle = true;
          continue;
        }
      } else {
        // Closing single quote: followed by structural char or end
        const structuralAfter =
          /[}\]\s:,]/.test(next) || i === chars.length - 1;
        if (structuralAfter) {
          chars[i] = '"';
          inSingle = false;
          continue;
        }
      }
    }
  }

  return chars.join('');
}

/**
 * Escape literal newlines and tabs that appear inside JSON string values.
 * Processes the string by tracking whether we're inside a quoted value.
 */
function escapeStringInternals(input: string): string {
  const result: string[] = [];
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (escapeNext) {
      escapeNext = false;
      result.push(ch);
      continue;
    }

    if (ch === '\\') {
      escapeNext = true;
      result.push(ch);
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      result.push(ch);
      continue;
    }

    if (inString) {
      if (ch === '\n') {
        result.push('\\n');
        continue;
      }
      if (ch === '\r') {
        result.push('\\r');
        continue;
      }
      if (ch === '\t') {
        result.push('\\t');
        continue;
      }
    }

    result.push(ch);
  }

  return result.join('');
}

/**
 * Append missing closing brackets/braces based on depth counting.
 * Only appends — never removes or reorders content.
 */
function closeOpenBrackets(input: string): string {
  let braceDepth = 0;
  let bracketDepth = 0;
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    if (ch === '\\' && inString) {
      escapeNext = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (ch === '{') braceDepth++;
    if (ch === '}') braceDepth--;
    if (ch === '[') bracketDepth++;
    if (ch === ']') bracketDepth--;
  }

  let suffix = '';
  while (bracketDepth > 0) {
    suffix += ']';
    bracketDepth--;
  }
  while (braceDepth > 0) {
    suffix += '}';
    braceDepth--;
  }

  return suffix ? input + suffix : input;
}

/**
 * Attempt to parse a JSON string, falling back to a single repair pass.
 * Returns the parsed object or throws AIError.
 */
function safeParseJSON(jsonString: string): unknown {
  // Attempt 1: direct parse
  try {
    return JSON.parse(jsonString);
  } catch {
    // Fall through to repair
  }

  // Attempt 2: repair then parse
  try {
    const repaired = repairJSON(jsonString);
    return JSON.parse(repaired);
  } catch {
    throw new AIError(
      'invalid_response',
      'AI response contained invalid JSON that could not be repaired.'
    );
  }
}

/**
 * Parses the raw AI response content into validated script variants.
 *
 * Pipeline:
 * 1. Strip markdown code fences
 * 2. Extract the first complete JSON object
 * 3. Parse JSON (with one safe repair fallback for common issues)
 * 4. Validate with Zod schema
 * 5. Return typed result or throw AIError('invalid_response')
 */
export function parseAIResponse(rawContent: string): GenerateResponsePayload {
  if (!rawContent || rawContent.trim() === '') {
    throw new AIError('invalid_response', 'AI returned an empty response.');
  }

  // Step 1: Strip markdown code fences
  const stripped = stripCodeFences(rawContent);

  // Step 2: Extract the first complete JSON object
  let jsonString: string;
  try {
    jsonString = extractJSONObject(stripped);
  } catch (error: unknown) {
    if (error instanceof AIError) throw error;
    throw new AIError(
      'invalid_response',
      'Failed to extract JSON from AI response.'
    );
  }

  // Step 3: Parse JSON with safe repair fallback
  const parsed = safeParseJSON(jsonString);

  // Step 4: Validate with Zod
  const result = generateResponseSchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new AIError(
      'invalid_response',
      `AI response failed schema validation: ${issues}`
    );
  }

  return result.data as GenerateResponsePayload;
}
