import type { GenerateRequest } from './types';

/**
 * Modular prompt builder — composed of discrete sections.
 * Each section is built independently, then assembled into
 * the final system + user prompt pair.
 */

// ==========================================
// SECTION BUILDERS
// ==========================================

function buildSystemInstructions(): string {
  return `You are a world-class film director and award-winning screenwriting system crafting scene-by-scene scripts targeted for Google's Veo 3 video model.

Your task is to generate TWO distinct, production-ready, and highly creative video scripts (variantA and variantB) based on the user's story prompt and configuration.

CREATIVE DIRECTION RULES:
1. Generate two distinctly different creative approaches rather than minor variations (e.g., contrasting narrative concepts, dramatic genres, pacing styles, emotional tones, or visual styles).
2. Prioritize visual storytelling, pacing, emotional payoff, suspense, humor, and cinematic composition over dry, technical checklists.
3. Dialogue must be natural, realistic, and character-driven. Avoid robotic or overly expository lines.
4. Keep descriptions concise, active, and highly evocative. Focus on what is visible on screen.

CRITICAL FORMAT RULES:
1. You MUST respond with valid JSON only — no markdown, no commentary, no extra text.
2. The JSON keys and format must match the response schema exactly.

RESPONSE SCHEMA:
{
  "variantA": {
    "title": "Creative title for Variant A",
    "summary": "2-3 sentence high-level summary of the script's concept, narrative tone, and visual direction",
    "fullScript": "Complete time-coded script targeting Veo 3 with all scenes",
    "estimatedDuration": "e.g. 30s"
  },
  "variantB": {
    "title": "Creative title for Variant B",
    "summary": "2-3 sentence high-level summary of the script's concept, narrative tone, and visual direction",
    "fullScript": "Complete time-coded script targeting Veo 3 with all scenes",
    "estimatedDuration": "e.g. 30s"
  }
}`;
}

function buildGenerationRules(): string {
  return `VEO 3 SCRIPT FORMAT RULES:
For the "fullScript" property, write a fluid scene-by-scene script.
Each scene MUST follow this exact concise format:

[TIME CODE Range, e.g., 00:00 - 00:05]
- Scene description: [Describe the setting and overall look, but keep it concise and evocative]
- Character actions: [Describe the actions, movements, and expressions of characters in this shot]
- Dialogue: [Insert character dialogue if needed; keep it highly natural and short. Omit if silent]
- Camera direction: [ONLY include if it materially improves the shot, e.g. Close-up tracking Jax. Do not force technical parameters in every scene]
- Audio: [ONLY include if it materially affects the scene mood or story, e.g. low mechanical hum, screeching tire. Omit if not important]
- Transition: [e.g., cut to, fade to, dissolve to]

SCENIC WRITING GUIDELINES:
- Flow & Connectivity: Every scene must connect smoothly to the next to tell a cohesive story.
- Technical Restraint: Do NOT include repetitive lighting, atmosphere, weather, lens type, color palette, or environment details in every single scene unless they change or materially impact the narrative.
- Character & World Consistency: Maintain a character's key visual traits (hair color, clothing, key items) whenever they appear to keep the visual look stable across generating frames.
- Pacing & payoff: Design a satisfying flow of narrative tension, humor, or emotion that builds to a clear visual payoff.
- Duration: Time codes must sum up exactly to the requested target duration.

INTERNAL QUALITY CHECKLIST:
Before producing the final JSON response, internally verify:
1. The story has a clear, satisfying structure (beginning, middle, and end).
2. Every scene advances the narrative progression.
3. Dialogue sounds natural, realistic, and is only used when necessary.
4. Visual descriptions are highly concise and cinematic.
5. Camera directions are included ONLY when they actively improve storytelling.
6. Variant A and Variant B take substantially different creative paths.
7. The script is immediately usable as a high-quality Google Veo 3 prompt without additional editing.`;
}

function buildDurationSection(duration: string): string {
  return `TARGET DURATION: ${duration}
Your generated scenes' time codes MUST start at 00:00 and end exactly at ${duration}. Ensure scenes are evenly distributed to match this target duration.`;
}

function buildStyleSection(style: string): string {
  return `VISUAL STYLE / GENRE: ${style}
All visual actions, camera choices, lenses, lighting styles, color palettes, and audio descriptions must strictly adhere to the "${style}" aesthetic.`;
}

function buildTemplateSection(template: string): string {
  return `PROMPT TEMPLATE INSTRUCTIONS:
${template}
Follow these template guidelines for overall narrative structure and pacing.`;
}

function buildStoryModeSection(
  mode: 'one-time' | 'storyline',
  episodeNumber?: number
): string {
  if (mode === 'storyline' && episodeNumber) {
    return `STORY MODE: Episodic Storyline — Episode ${episodeNumber}
This script is part of a serial storyline. Write scripts that function as Episode ${episodeNumber}. Ensure there is an initial hook connecting to the setting, a core visual climax, and a final scene that leaves a compelling hook for the next episode.`;
  }
  return `STORY MODE: One-Time Standalone
Write the scripts as self-contained short stories with a complete, satisfying visual arc.`;
}

function buildCharactersSection(
  characters: GenerateRequest['characters']
): string {
  if (characters.length === 0) return '';

  const charDescriptions = characters
    .map((c) => {
      let desc = `- ${c.name}: Appearance details [${c.appearance}]`;
      if (c.personality) desc += ` | Personality: ${c.personality}`;
      return desc;
    })
    .join('\n');

  return `CHARACTERS:
${charDescriptions}
When these characters appear in a scene, repeat their visual appearance details (e.g., jacket, hair color, eye traits) to guarantee AI visual consistency.`;
}

function buildStoryBibleSection(bible: GenerateRequest['storyBible']): string {
  if (!bible) return '';

  const sections: string[] = [];

  if (bible.worldSetting) {
    sections.push(`World Setting: ${bible.worldSetting}`);
  }
  if (bible.visualStyle) {
    sections.push(`Visual Style: ${bible.visualStyle}`);
  }
  if (bible.narrativeTone) {
    sections.push(`Narrative Tone: ${bible.narrativeTone}`);
  }
  if (bible.writingRules) {
    sections.push(`Writing Rules: ${bible.writingRules}`);
  }
  if (bible.lore) {
    sections.push(`Lore / Rules: ${bible.lore}`);
  }

  if (sections.length === 0) return '';

  return `STORY BIBLE:
${sections.join('\n')}`;
}

function buildUserStoryPrompt(prompt: string): string {
  return `STORY PROMPT:
${prompt}`;
}

// ==========================================
// MAIN BUILDER
// ==========================================

export interface BuiltPrompts {
  system: string;
  user: string;
}

function buildRegenerationSection(
  mode?: 'A' | 'B' | 'both',
  existingVariantA?: GenerateRequest['existingVariantA'],
  existingVariantB?: GenerateRequest['existingVariantB']
): string {
  if (!mode || mode === 'both') return '';

  if (mode === 'A' && existingVariantB) {
    return `REGENERATION REQUEST:
We are regenerating VARIANT A. The user wants to keep VARIANT B exactly the same.
Here is the existing VARIANT B that you must preserve exactly:
{
  "title": "${existingVariantB.title.replace(/"/g, '\\"')}",
  "summary": "${existingVariantB.summary.replace(/"/g, '\\"')}",
  "fullScript": "${existingVariantB.fullScript.replace(/"/g, '\\"')}",
  "estimatedDuration": "${existingVariantB.estimatedDuration.replace(/"/g, '\\"')}"
}

Please write a completely new, improved, and different VARIANT A based on the prompt and configuration, while returning the exact same VARIANT B as shown above. Your final JSON response must include both variantA and variantB.`;
  }

  if (mode === 'B' && existingVariantA) {
    return `REGENERATION REQUEST:
We are regenerating VARIANT B. The user wants to keep VARIANT A exactly the same.
Here is the existing VARIANT A that you must preserve exactly:
{
  "title": "${existingVariantA.title.replace(/"/g, '\\"')}",
  "summary": "${existingVariantA.summary.replace(/"/g, '\\"')}",
  "fullScript": "${existingVariantA.fullScript.replace(/"/g, '\\"')}",
  "estimatedDuration": "${existingVariantA.estimatedDuration.replace(/"/g, '\\"')}"
}

Please write a completely new, improved, and different VARIANT B based on the prompt and configuration, while returning the exact same VARIANT A as shown above. Your final JSON response must include both variantA and variantB.`;
  }

  return '';
}

/**
 * Composes the system + user prompts from discrete, modular sections.
 * Each section is independently built and conditionally included.
 */
export function buildPrompts(req: GenerateRequest): BuiltPrompts {
  // System prompt: fixed instructions + generation rules
  const systemParts = [buildSystemInstructions(), buildGenerationRules()];
  const system = systemParts.join('\n\n');

  // User prompt: all contextual sections assembled in order
  const userParts: string[] = [
    buildUserStoryPrompt(req.prompt),
    buildDurationSection(req.duration),
    buildStyleSection(req.style),
    buildStoryModeSection(req.storyMode, req.episodeNumber),
  ];

  if (req.template) {
    userParts.push(buildTemplateSection(req.template));
  }

  if (req.characters.length > 0) {
    userParts.push(buildCharactersSection(req.characters));
  }

  const bibleSection = buildStoryBibleSection(req.storyBible);
  if (bibleSection) {
    userParts.push(bibleSection);
  }

  // Inject continuity context from the intelligence engine (if available)
  if (req.continuityContext) {
    userParts.push(req.continuityContext);
  }

  const regenSection = buildRegenerationSection(
    req.regenerateMode,
    req.existingVariantA,
    req.existingVariantB
  );
  if (regenSection) {
    userParts.push(regenSection);
  }

  // Final instruction reminder
  userParts.push(
    'Respond with the JSON object containing variantA and variantB. No other text.'
  );

  const user = userParts.join('\n\n');

  return { system, user };
}
