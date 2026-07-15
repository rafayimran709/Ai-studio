'use client';

import * as React from 'react';
import { useStoryStore } from '@/hooks/useStoryStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Zap,
  Play,
  Copy,
  Check,
  Video,
  Clapperboard,
  Camera,
  Sun,
  Volume2,
} from 'lucide-react';
import { toast } from 'sonner';

const STYLES = [
  'Cinematic',
  'Horror',
  'Comedy',
  'Documentary',
  'Sci-Fi',
  'Fantasy',
  'Romance',
  'Action',
  'Mystery',
  'Drama',
  'Animated',
  'Anime',
  'Realistic',
  'Thriller',
  'Superhero',
  'Post-Apocalyptic',
];

const DURATIONS = [
  { value: '10s', label: '10 seconds (Short/Veo teaser)' },
  { value: '15s', label: '15 seconds (TikTok/Reel)' },
  { value: '20s', label: '20 seconds' },
  { value: '30s', label: '30 seconds (Standard Scene)' },
  { value: '45s', label: '45 seconds' },
  { value: '60s', label: '60 seconds (1 minute intro)' },
  { value: '90s', label: '90 seconds' },
  { value: '2min', label: '2 minutes (Epic segment)' },
];

const MOCK_SCRIPTS = {
  A: {
    title: 'Neon Grid Runaways',
    mood: 'High-octane cyberpunk suspense',
    cameraStyleOverview:
      'Anamorphic wide-angle lenses, low-angle tracking shots close to ground, fast panning.',
    lightingStyleOverview:
      'Low-key key light, wet street reflection, intense neon purple & cyan backlight.',
    scenes: [
      {
        timecode: '00:00 - 00:03',
        shotSize: 'Extreme Wide Shot',
        cameraMovement: 'Tracking Shot',
        cameraAngle: 'Low Angle',
        lightingDescription:
          'Volumetric cyber neon pink backlight, wet asphalt reflection.',
        visuals:
          'Jax Vance speeds through rain-slicked alleys on a hovering motorcycle. His cybernetic eye flares cyan in the mist.',
        audioVoiceover: "Jax (VO): 'They said the Grid was secure. They lied.'",
        soundEffects:
          'Deep hum of hovercycle engine, rain patter against metal, distant siren wails.',
      },
      {
        timecode: '00:03 - 00:07',
        shotSize: 'Close Up',
        cameraMovement: 'Push In',
        cameraAngle: 'Eye Level',
        lightingDescription: 'Flashing cyan light illuminating tactical gear.',
        visuals:
          'Nova Miller frantically typing on her glowing cyberdeck. Rain drops run down her tactical glasses.',
        audioVoiceover:
          "Nova: 'Security lock broken. We have thirty seconds, Jax!'",
        soundEffects:
          'Rapid keyboard clicks, mechanical locking click, hum of high-voltage grids.',
      },
    ],
  },
  B: {
    title: 'The Grid Core Infiltration',
    mood: 'Methodical, claustrophobic cyber heist',
    cameraStyleOverview:
      'Macro lens closeups, slow push-ins, high-angle static surveillance style.',
    lightingStyleOverview:
      'Cold monochromatic white key lighting, intense emergency red alarms, low ambient values.',
    scenes: [
      {
        timecode: '00:00 - 00:03',
        shotSize: 'Macro',
        cameraMovement: 'Static',
        cameraAngle: 'Eye Level',
        lightingDescription: 'Monochromatic white, lens glare.',
        visuals:
          'Extreme closeup of cybernetic eye lens adjusting aperture. Reflected green linecode scrolls across the iris.',
        audioVoiceover:
          "Jax (VO): 'Stealth isn't about hiding. It's about being invisible in plain sight.'",
        soundEffects:
          'Aperture clicking, high-frequency electric whine, low room hum.',
      },
      {
        timecode: '00:03 - 00:07',
        shotSize: 'Medium Shot',
        cameraMovement: 'Push In',
        cameraAngle: 'High Angle',
        lightingDescription: 'Emergency warning red pulse light.',
        visuals:
          'Nova slides down a steel access ladder into the server crawlspace. Red sirens paint shadows on the walls.',
        audioVoiceover: "Nova: 'Internal pressure dropping. Keep moving.'",
        soundEffects:
          'Metal grating slide, alarm siren echo, heavy pneumatic hiss.',
      },
    ],
  },
};

export default function ProjectWorkspace() {
  const {
    activeProjectId,
    characters,
    storylines,
    promptInput,
    setPromptInput,
    selectedDuration,
    setSelectedDuration,
    selectedStyle,
    setSelectedStyle,
    selectedCharacterIds,
    toggleCharacterSelection,
    creditsRemaining,
    deductCredit,
  } = useStoryStore();

  const [storyMode, setStoryMode] = React.useState<'one-time' | 'storyline'>(
    'one-time'
  );
  const [selectedStorylineId, setSelectedStorylineId] =
    React.useState<string>('');
  const [activeTab, setActiveTab] = React.useState<'A' | 'B'>('A');

  // Streaming state simulation
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [streamProgress, setStreamProgress] = React.useState(0);
  const [copiedVariant, setCopiedVariant] = React.useState<'A' | 'B' | null>(
    null
  );

  const activeProjectCharacters = characters[activeProjectId || ''] || [];
  const activeProjectStorylines = storylines[activeProjectId || ''] || [];

  const handleGenerate = () => {
    if (creditsRemaining <= 0) {
      toast.error('Insufficient credits! Please refill in Billing.');
      return;
    }
    if (!promptInput.trim()) {
      toast.warning('Please enter a story prompt.');
      return;
    }

    setIsGenerating(true);
    setStreamProgress(0);
    deductCredit();
    toast.info('Initiating streaming generator via NVIDIA LLM model...');

    // Simulate Server-Sent Events (SSE) streaming progress
    const timer = setInterval(() => {
      setStreamProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsGenerating(false);
          toast.success('Veo 3 script versions successfully generated!');
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  const handleCopy = (variant: 'A' | 'B') => {
    const script = MOCK_SCRIPTS[variant];
    const text = `
Title: ${script.title}
Mood: ${script.mood}
Camera Style: ${script.cameraStyleOverview}
Lighting Style: ${script.lightingStyleOverview}

Scenes:
${script.scenes
  .map(
    (s) => `
[${s.timecode}] ${s.shotSize} | ${s.cameraMovement} | ${s.cameraAngle}
Lighting: ${s.lightingDescription}
Visuals: ${s.visuals}
Audio: ${s.audioVoiceover}
SFX: ${s.soundEffects}
`
  )
  .join('\n')}
    `;
    navigator.clipboard.writeText(text);
    setCopiedVariant(variant);
    toast.success(`Variant ${variant} script copied to clipboard!`);
    setTimeout(() => setCopiedVariant(null), 2000);
  };

  return (
    <div className="grid h-[calc(100vh-4rem)] grid-cols-1 overflow-hidden xl:grid-cols-5">
      {/* Parameters Panel */}
      <div className="flex flex-col space-y-6 overflow-y-auto border-r border-white/5 bg-[#0b0b0e] p-6 xl:col-span-2">
        <div>
          <h1 className="mb-1 flex items-center gap-2 text-xl font-extrabold text-white">
            <Clapperboard className="h-5 w-5 text-cyan-400" />
            Script Generator
          </h1>
          <p className="text-xs text-neutral-400">
            Define prompt, styles, duration, and continuity parameters.
          </p>
        </div>

        <Separator className="bg-white/5" />

        {/* Input prompt */}
        <div className="space-y-2">
          <label className="text-xs font-bold tracking-wider text-neutral-400 uppercase">
            Story Outline Prompt
          </label>
          <Textarea
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="Jax Vance enters the main reactor core, while Nova covers him from the vents. A security grid triggers..."
            className="min-h-[120px] border-white/5 bg-[#0e0e12] text-sm text-neutral-200 focus:border-cyan-500"
          />
        </div>

        {/* Option selectors */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-wider text-neutral-400 uppercase">
              Script Style
            </label>
            <Select
              value={selectedStyle}
              onValueChange={(val) => setSelectedStyle(val || '')}
            >
              <SelectTrigger className="border-white/5 bg-[#0e0e12] text-xs text-neutral-300">
                <SelectValue placeholder="Style" />
              </SelectTrigger>
              <SelectContent className="border-white/5 bg-[#0e0e12] text-neutral-300">
                {STYLES.map((st) => (
                  <SelectItem key={st} value={st} className="text-xs">
                    {st}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold tracking-wider text-neutral-400 uppercase">
              Target Duration
            </label>
            <Select
              value={selectedDuration}
              onValueChange={(val) => setSelectedDuration(val || '')}
            >
              <SelectTrigger className="border-white/5 bg-[#0e0e12] text-xs text-neutral-300">
                <SelectValue placeholder="Duration" />
              </SelectTrigger>
              <SelectContent className="border-white/5 bg-[#0e0e12] text-neutral-300">
                {DURATIONS.map((dur) => (
                  <SelectItem
                    key={dur.value}
                    value={dur.value}
                    className="text-xs"
                  >
                    {dur.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Story Mode Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold tracking-wider text-neutral-400 uppercase">
            Generation Mode
          </label>
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-white/5 bg-[#0e0e12] p-1">
            <button
              onClick={() => setStoryMode('one-time')}
              className={`rounded-md py-1.5 text-xs font-medium transition-colors ${
                storyMode === 'one-time'
                  ? 'bg-cyan-500 font-semibold text-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              One-Time Script
            </button>
            <button
              onClick={() => setStoryMode('storyline')}
              className={`rounded-md py-1.5 text-xs font-medium transition-colors ${
                storyMode === 'storyline'
                  ? 'bg-cyan-500 font-semibold text-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Storyline Mode
            </button>
          </div>
        </div>

        {/* Storyline selection if active */}
        {storyMode === 'storyline' && (
          <div className="animate-fade-in space-y-2">
            <label className="text-xs font-bold tracking-wider text-neutral-400 uppercase">
              Select Narrative Thread
            </label>
            <Select
              value={selectedStorylineId}
              onValueChange={(val) => setSelectedStorylineId(val || '')}
            >
              <SelectTrigger className="border-white/5 bg-[#0e0e12] text-xs text-neutral-300">
                <SelectValue placeholder="Select Storyline Thread" />
              </SelectTrigger>
              <SelectContent className="border-white/5 bg-[#0e0e12] text-neutral-300">
                {activeProjectStorylines.length === 0 ? (
                  <SelectItem value="none" disabled className="text-xs">
                    No active storylines. Create one in dashboard.
                  </SelectItem>
                ) : (
                  activeProjectStorylines.map((line) => (
                    <SelectItem
                      key={line.id}
                      value={line.id}
                      className="text-xs"
                    >
                      {line.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Character Manager integration */}
        <div className="space-y-2">
          <label className="text-xs font-bold tracking-wider text-neutral-400 uppercase">
            Inject Characters (Continuity)
          </label>
          {activeProjectCharacters.length === 0 ? (
            <p className="text-xs text-neutral-500">
              No characters registered for this project yet.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {activeProjectCharacters.map((char) => {
                const isSelected = selectedCharacterIds.includes(char.id);
                return (
                  <button
                    key={char.id}
                    onClick={() => toggleCharacterSelection(char.id)}
                    className={`rounded-full border px-2.5 py-1 text-xs transition-all ${
                      isSelected
                        ? 'border-violet-500 bg-violet-500/20 font-semibold text-violet-300'
                        : 'border-white/5 bg-[#0e0e12] text-neutral-400 hover:text-white'
                    }`}
                  >
                    {char.name} ({char.role})
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Submit */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="h-12 w-full bg-gradient-to-r from-cyan-500 to-violet-600 text-sm font-bold text-white shadow-lg shadow-cyan-500/10 hover:from-cyan-400 hover:to-violet-500"
        >
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 animate-bounce text-cyan-300" />
              <span>Streaming Scripts ({streamProgress}%)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              <span>Generate Scripts (1 Credit)</span>
            </div>
          )}
        </Button>
      </div>

      {/* Generation Outputs Screen Canvas */}
      <div className="flex h-full flex-col overflow-hidden bg-[#060608] xl:col-span-3">
        {/* Output Tabs & Info */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/5 px-6">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as 'A' | 'B')}
            className="w-auto"
          >
            <TabsList className="border border-white/5 bg-[#0e0e12]">
              <TabsTrigger
                value="A"
                className="text-xs data-[state=active]:bg-cyan-500 data-[state=active]:font-semibold data-[state=active]:text-black"
              >
                Variant A (Narrative Cut)
              </TabsTrigger>
              <TabsTrigger
                value="B"
                className="text-xs data-[state=active]:bg-cyan-500 data-[state=active]:font-semibold data-[state=active]:text-black"
              >
                Variant B (Stylized Action)
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCopy(activeTab)}
            className="flex items-center gap-1.5 border-white/10 bg-transparent text-xs text-neutral-300"
          >
            {copiedVariant === activeTab ? (
              <Check className="h-3.5 w-3.5 text-cyan-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            <span>
              {copiedVariant === activeTab ? 'Copied' : 'Copy Script'}
            </span>
          </Button>
        </div>

        {/* Script Display Canvas */}
        <ScrollArea className="flex-1 p-6">
          {isGenerating || streamProgress > 0 ? (
            <div className="space-y-6">
              {/* Meta Stream Block */}
              <div className="glass-panel relative overflow-hidden rounded-xl border border-white/5 p-6">
                <div
                  className="absolute top-0 left-0 h-[3px] bg-cyan-500 transition-all duration-150"
                  style={{ width: `${streamProgress}%` }}
                />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs font-bold tracking-widest text-neutral-500 uppercase">
                      Active Stream Metadata
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-white">
                    {streamProgress > 20
                      ? MOCK_SCRIPTS[activeTab].title
                      : 'Thinking...'}
                  </h2>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-medium text-neutral-500">
                        Mood:
                      </span>{' '}
                      <span className="text-neutral-300">
                        {streamProgress > 40
                          ? MOCK_SCRIPTS[activeTab].mood
                          : 'Analyzing mood...'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-neutral-500">
                        Visual Style:
                      </span>{' '}
                      <span className="text-neutral-300">
                        {selectedStyle} ({selectedDuration})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Streaming Cinematic Parameters */}
              {streamProgress > 50 && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1 rounded-xl border border-white/5 bg-[#0e0e12]/60 p-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold tracking-widest text-cyan-400 uppercase">
                      <Camera className="h-3.5 w-3.5" />
                      <span>Camera Style</span>
                    </div>
                    <p className="text-xs leading-relaxed text-neutral-300">
                      {MOCK_SCRIPTS[activeTab].cameraStyleOverview}
                    </p>
                  </div>
                  <div className="space-y-1 rounded-xl border border-white/5 bg-[#0e0e12]/60 p-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold tracking-widest text-violet-400 uppercase">
                      <Sun className="h-3.5 w-3.5" />
                      <span>Lighting Style</span>
                    </div>
                    <p className="text-xs leading-relaxed text-neutral-300">
                      {MOCK_SCRIPTS[activeTab].lightingStyleOverview}
                    </p>
                  </div>
                </div>
              )}

              {/* Scene breakdowns */}
              {streamProgress > 70 && (
                <div className="space-y-4">
                  <h3 className="px-1 text-xs font-bold tracking-widest text-neutral-500 uppercase">
                    Scene Breakdown
                  </h3>
                  {MOCK_SCRIPTS[activeTab].scenes.map((scene, idx) => (
                    <div
                      key={idx}
                      className="space-y-3 rounded-xl border border-white/5 bg-[#0c0c10] p-5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-xs font-bold text-cyan-400">
                          {scene.timecode}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] font-semibold text-neutral-500 uppercase">
                          <span>{scene.shotSize}</span>
                          <span>•</span>
                          <span>{scene.cameraMovement}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-3">
                        <div className="space-y-1.5 md:col-span-2">
                          <span className="block text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
                            Visual Prompt (Veo 3 ready)
                          </span>
                          <p className="rounded-lg border border-white/5 bg-[#070709] p-3 leading-relaxed text-neutral-200">
                            {scene.visuals}
                          </p>
                        </div>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <span className="block text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
                              Voiceover / Dialogue
                            </span>
                            <p className="text-neutral-300 italic">
                              {scene.audioVoiceover || 'Silence'}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <span className="block text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
                              SFX Cues
                            </span>
                            <p className="text-glow-cyan flex items-center gap-1 text-neutral-400">
                              <Volume2 className="h-3 w-3 text-cyan-400" />
                              {scene.soundEffects}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-[50vh] flex-col items-center justify-center p-8 text-center">
              <Video className="mb-4 h-12 w-12 animate-pulse stroke-1 text-neutral-600" />
              <h3 className="mb-1 text-lg font-bold text-white">
                Canvas Awaiting Script Generation
              </h3>
              <p className="max-w-sm text-xs text-neutral-500">
                Define your creative prompts in the configuration console on the
                left and trigger generation to run streaming engine analysis.
              </p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
