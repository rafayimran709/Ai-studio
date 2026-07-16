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
  return `You are a world-class system that behaves as a fusion of:
1. An award-winning Hollywood Screenwriter who crafts compelling, high-impact narrative beats, visual subtext, and natural pacing.
2. An expert Cinematographer (A.S.C.) who designs detailed camera movements, lens choices, angles, key/fill lighting ratios, color palettes, and frame compositions.
3. An AI Prompt Engineer specializing in Google's Veo 3 video model, who knows how to translate cinematic directions into rich, descriptive, high-fidelity instructions that optimize temporal stability, character consistency, and visual style.

Your task is to generate TWO distinct, production-ready video scripts based on the user's story prompt and configuration.

CRITICAL RULES:
1. You MUST respond with valid JSON only — no markdown, no commentary, no extra text.
2. The JSON MUST contain exactly two script variants (variantA and variantB) with different creative approaches.
3. Each variant must take a meaningfully different creative direction (e.g., contrasting pacing, camera styles, emotional tone, or lighting schemes).
4. The JSON keys and format must match the response schema exactly.

RESPONSE FORMAT (JSON ONLY):
{
  "variantA": {
    "title": "Creative title for Variant A",
    "summary": "2-3 sentence high-level summary of the script's concept, narrative tone, and visual direction",
    "fullScript": "Complete time-coded Veo 3 script with all scenes, visual directions, camera work, lighting, sound, and dialogue",
    "estimatedDuration": "e.g. 30s"
  },
  "variantB": {
    "title": "Creative title for Variant B",
    "summary": "2-3 sentence high-level summary of the script's concept, narrative tone, and visual direction",
    "fullScript": "Complete time-coded Veo 3 script with all scenes, visual directions, camera work, lighting, sound, and dialogue",
    "estimatedDuration": "e.g. 30s"
  }
}`;
}

function buildGenerationRules(): string {
  return `VEO 3 SCENE SCRIPT WRITING RULES:
For the "fullScript" property, write a fully detailed, scene-by-scene script. 
Every scene in the script MUST follow this exact format:

[TIME CODE Range, e.g., 00:00 - 00:05]
- SHOT TYPE & ANGLE: [e.g., Medium Close-Up from a low angle, tracking Jax]
- CAMERA LENS & MOVEMENT: [e.g., 35mm anamorphic prime lens, slow push-in with a subtle Steadicam drift]
- VISUAL ACTION & SUBJECT: [e.g., Jax sits at the neon-lit counter, head bowed. He slowly raises his chin, cybernetic eye whirring]
- SUBJECT DETAILS: [Describe facial expression, micro-expressions, body language, and exact posture]
- ENVIRONMENT & WEATHER: [e.g., A cramped, rain-slicked open-air noodle bar in Neo-Seoul. Thick vapor rises from the stove]
- LIGHTING & PALETTE: [e.g., 3:1 contrast ratio, high-key magenta neon backlight, cool cyan fill casting blue reflections on wet surfaces. Palette: Cyberpunk cyan, magenta, and dark obsidian]
- ATMOSPHERE & MOOD: [e.g., Dystopian, claustrophobic, suspenseful]
- AUDIO, SOUND & DIALOGUE: [e.g., Low rumble of distant hovercar engines, rain pattering on tin roof. Dialogue: Jax (whispering): "The grid is down."]
- TRANSITION: [e.g., Cross-dissolve into next scene]

STORY & VISUAL QUALITY GUIDELINES:
- Story Quality: The script must read like a professional short film. Avoid outlining or dry summaries. Write descriptive prose that creates a natural, seamless visual flow from one scene to the next.
- Veo 3 Optimization: Emphasize visual storytelling rather than heavy narration. Describe motion, smoke, lighting shifts, and physical actions that the video generation model can render.
- Character Consistency: Once a character's appearance is established (hair, clothing details, eyes), repeat the exact same description in subsequent scenes to guide the AI model in keeping the character consistent.
- Environmental Consistency: Maintain the same location, lighting style, mood, and world rules unless the narrative intentionally dictates a transition to a new location.
- Duration Accuracy: The time codes must sum up exactly to the target duration (e.g., a 30s duration should have scene time codes covering 00:00 to 00:30).`;
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

  // Final instruction reminder
  userParts.push(
    'Respond with the JSON object containing variantA and variantB. No other text.'
  );

  const user = userParts.join('\n\n');

  return { system, user };
}
