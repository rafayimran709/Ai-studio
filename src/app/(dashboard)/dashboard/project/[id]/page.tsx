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
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Film,
  Camera,
  Copy,
  Video,
  Clapperboard,
  Sparkles,
  Zap,
  Eye,
  Loader2,
  Maximize2,
  Skull,
  Smile,
  Tv,
  Globe,
  Heart,
  Flame,
  HelpCircle,
  Palette,
  Award,
  AlertCircle,
  History as HistoryIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  listTemplatesAction,
  listCharactersAction,
  loadStoryBibleAction,
  listStorylinesAction,
  listProjectsAction,
  listGenerationHistoryAction,
  createGenerationHistoryAction,
  createEpisodeAction,
} from '@/app/actions';

// Options definitions
const STYLES = [
  { name: 'Cinematic', icon: Camera },
  { name: 'Horror', icon: Skull },
  { name: 'Comedy', icon: Smile },
  { name: 'Documentary', icon: Tv },
  { name: 'Sci-Fi', icon: Globe },
  { name: 'Fantasy', icon: Sparkles },
  { name: 'Romance', icon: Heart },
  { name: 'Action', icon: Flame },
  { name: 'Mystery', icon: HelpCircle },
  { name: 'Drama', icon: Film },
  { name: 'Animated', icon: Palette },
  { name: 'Anime', icon: Tv },
  { name: 'Realistic', icon: Eye },
  { name: 'Thriller', icon: Zap },
  { name: 'Superhero', icon: Award },
  { name: 'Post-Apocalyptic', icon: Skull },
];

const DURATIONS = ['10s', '15s', '20s', '30s', '45s', '60s', '90s', '2min'];

export default function ProjectWorkspace() {
  const {
    activeProjectId,
    promptInput,
    setPromptInput,
    selectedDuration,
    setSelectedDuration,
    selectedStyle,
    setSelectedStyle,
  } = useStoryStore();

  const [storyMode, setStoryMode] = React.useState<'one-time' | 'storyline'>(
    'one-time'
  );
  const [selectedTemplate, setSelectedTemplate] = React.useState<string>('');
  const [selectedCharacters, setSelectedCharacters] = React.useState<string[]>(
    []
  );
  const [storylineProject, setStorylineProject] = React.useState<string>(
    activeProjectId || ''
  );
  const [selectedStoryline, setSelectedStoryline] = React.useState<string>('');
  const [episodeNum, setEpisodeNum] = React.useState<number>(1);

  // UI state variables
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [hasGenerated, setHasGenerated] = React.useState(false);
  const [isExpandOpen, setIsExpandOpen] = React.useState(false);
  const [expandedVariant, setExpandedVariant] = React.useState<'A' | 'B'>('A');

  // React Query: Load data from Supabase
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => listProjectsAction(),
  });

  const { data: dbTemplates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: () => listTemplatesAction(),
  });

  const { data: activeProjectCharacters = [] } = useQuery({
    queryKey: ['characters', activeProjectId],
    queryFn: () =>
      activeProjectId
        ? listCharactersAction(activeProjectId)
        : Promise.resolve([]),
    enabled: !!activeProjectId,
  });

  const { data: bible } = useQuery({
    queryKey: ['storyBible', activeProjectId],
    queryFn: () =>
      activeProjectId
        ? loadStoryBibleAction(activeProjectId)
        : Promise.resolve(null),
    enabled: !!activeProjectId,
  });

  const { data: activeProjectStorylines = [] } = useQuery({
    queryKey: ['storylines', activeProjectId],
    queryFn: () =>
      activeProjectId
        ? listStorylinesAction(activeProjectId)
        : Promise.resolve([]),
    enabled: !!activeProjectId,
  });

  const { data: history = [], refetch: refetchHistory } = useQuery({
    queryKey: ['generationHistory', activeProjectId],
    queryFn: () =>
      activeProjectId
        ? listGenerationHistoryAction(activeProjectId)
        : Promise.resolve([]),
    enabled: !!activeProjectId,
  });

  // Select first storyline by default
  React.useEffect(() => {
    if (activeProjectStorylines.length > 0 && !selectedStoryline) {
      setSelectedStoryline(activeProjectStorylines[0].id);
    }
  }, [activeProjectStorylines, selectedStoryline]);

  const handleTemplateChange = (val: string) => {
    setSelectedTemplate(val);
    const tmpl = dbTemplates.find((t) => t.name === val);
    if (tmpl) {
      setPromptInput(tmpl.system_prompt);
      toast.info(`Applied "${val}" template outline`);
    }
  };

  const toggleCharacter = (charName: string) => {
    setSelectedCharacters((prev) =>
      prev.includes(charName)
        ? prev.filter((c) => c !== charName)
        : [...prev, charName]
    );
  };

  // Generation DB commits
  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!activeProjectId) return;

      // 1. Create history record
      await createGenerationHistoryAction({
        project_id: activeProjectId,
        storyline_id:
          storyMode === 'storyline' && selectedStoryline
            ? selectedStoryline
            : null,
        episode_id: null,
        prompt: promptInput,
        status: 'completed',
      });

      // 2. Create episode if in storyline mode
      if (storyMode === 'storyline' && selectedStoryline) {
        await createEpisodeAction({
          storyline_id: selectedStoryline,
          episode_number: episodeNum,
          title: `Episode ${episodeNum} draft`,
          prompt: promptInput,
          duration: selectedDuration,
          style: selectedStyle,
          template: selectedTemplate || null,
          status: 'draft',
        });
      }
    },
    onSuccess: () => {
      refetchHistory();
      setIsGenerating(false);
      setHasGenerated(true);
      toast.success('Veo 3 script variations generated successfully!');
    },
    onError: (err: Error) => {
      setIsGenerating(false);
      toast.error(`Generation failed: ${err.message}`);
    },
  });

  const handleGenerate = () => {
    if (!promptInput.trim()) {
      toast.error('Please describe a story prompt first');
      return;
    }
    setIsGenerating(true);
    setHasGenerated(false);

    // Simulate AI loading state with skeletons, then call database mutation
    setTimeout(() => {
      generateMutation.mutate();
    }, 2000);
  };

  // Mock script data
  const mockScripts = {
    A: {
      title: 'Neon Mirage Chase',
      mood: 'Suspenseful and hyper-stylized',
      duration: selectedDuration || '30s',
      cameraStyle:
        'Anamorphic wide-angle lenses, tracking shots close to ground',
      lightingStyle:
        'Deep purple neon keylight, reflective wet asphalt downlight',
      sceneCount: 3,
      scenes: [
        {
          time: '00:00 - 00:10',
          shot: 'Extreme Wide Shot',
          action:
            'Jax speeds through the narrow futuristic alleys on a hovering motorcycle. Heavy rain refracts the neon purple signs.',
        },
        {
          time: '00:10 - 00:20',
          shot: 'Close Up',
          action:
            "Jax's cybernetic left eye glows cyan as he checks his rear-view hologram mirror. Drones pursue.",
        },
        {
          time: '00:20 - 00:30',
          shot: 'Medium Action',
          action:
            'Jax makes a sharp turn around a structural column, leaving a trace of blue spark particles.',
        },
      ],
    },
    B: {
      title: 'Grid Gate Breakout',
      mood: 'Claustrophobic, industrial heist',
      duration: selectedDuration || '30s',
      cameraStyle:
        'Handheld macro lenses, slow tracking shots from security camera angles',
      lightingStyle:
        'Emergency strobe pulse red keylight, dark background fields',
      sceneCount: 3,
      scenes: [
        {
          time: '00:00 - 00:10',
          shot: 'Close Up Portrait',
          action:
            'Nova looks down from a dark air vent grating. Emergency white light strips flash.',
        },
        {
          time: '00:10 - 00:20',
          shot: 'Medium Tracking Shot',
          action:
            'Nova drops into the mainframe crawlspace, pulling out her silver cyberdeck.',
        },
        {
          time: '00:20 - 00:30',
          shot: 'Extreme Close Up',
          action:
            "Nova's fingers tap rapidly on a holographic keypad as pressure valves release steam.",
        },
      ],
    },
  };

  return (
    <div className="grid w-full grid-cols-1 lg:absolute lg:inset-0 lg:grid-cols-12 lg:overflow-hidden">
      {/* Left Configuration Console */}
      <div className="flex flex-col border-r border-zinc-900 bg-zinc-950/20 lg:col-span-4 lg:h-full lg:min-h-0 lg:overflow-hidden xl:col-span-3">
        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-6 p-5">
            <div>
              <h2 className="font-sans text-sm font-semibold tracking-wider text-zinc-400 uppercase">
                Configuration Console
              </h2>
              <p className="mt-1 text-xs text-zinc-500">
                Configure your prompt parameters for Veo 3 visual script
                targeting.
              </p>
            </div>

            <Separator className="bg-zinc-900" />

            {/* Prompt templates dropdown */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                Prompt Template
              </label>
              <Select
                value={selectedTemplate}
                onValueChange={(val) => handleTemplateChange(val || '')}
              >
                <SelectTrigger className="border-zinc-900 bg-zinc-950 text-xs text-zinc-300">
                  <SelectValue placeholder="Select a template..." />
                </SelectTrigger>
                <SelectContent className="border-zinc-900 bg-zinc-950 text-zinc-300">
                  {dbTemplates.map((tmpl) => (
                    <SelectItem
                      key={tmpl.id}
                      value={tmpl.name}
                      className="text-xs"
                    >
                      {tmpl.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Large story prompt */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                  Story prompt
                </label>
                <span className="text-zinc-650 font-mono text-[9px]">
                  {promptInput.length} / 2000
                </span>
              </div>
              <Textarea
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Describe the story you want AI Story Studio to create..."
                maxLength={2000}
                className="placeholder:text-zinc-750 min-h-[120px] resize-none border-zinc-900 bg-zinc-950 text-xs text-zinc-200 focus:border-zinc-800"
              />
              <p className="text-zinc-650 text-[10px] leading-relaxed">
                Describe the key characters, locations, actions, and sound
                directions for the scenes.
              </p>
            </div>

            <Separator className="bg-zinc-900" />

            {/* Target Duration Selector (Modern Cards Grid) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                Target Duration
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {DURATIONS.map((dur) => {
                  const isSelected = selectedDuration === dur;
                  return (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setSelectedDuration(dur)}
                      className={`rounded border py-2 text-center font-mono text-xs transition-all ${
                        isSelected
                          ? 'border-white bg-zinc-900 font-bold text-white'
                          : 'border-zinc-900 bg-zinc-950 text-zinc-500 hover:border-zinc-800 hover:text-zinc-300'
                      }`}
                    >
                      {dur}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Script Style Selector (Grid with Icons) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                Script Style
              </label>
              <div className="grid max-h-[160px] grid-cols-2 gap-1.5 overflow-y-auto rounded-lg border border-zinc-900/50 bg-zinc-950/40 p-1.5 pr-1">
                {STYLES.map((style) => {
                  const isSelected = selectedStyle === style.name;
                  return (
                    <button
                      key={style.name}
                      type="button"
                      onClick={() => setSelectedStyle(style.name)}
                      className={`flex items-center gap-2 rounded border px-2.5 py-1.5 text-left text-xs transition-all ${
                        isSelected
                          ? 'border-white bg-zinc-900 font-semibold text-white'
                          : 'border-zinc-900 bg-zinc-950 text-zinc-500 hover:border-zinc-800 hover:text-zinc-300'
                      }`}
                    >
                      <style.icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{style.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Separator className="bg-zinc-900" />

            {/* Story Mode Segmented Control */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                Story Mode
              </label>
              <div className="grid grid-cols-2 gap-1 rounded border border-zinc-900 bg-zinc-950 p-1">
                <button
                  type="button"
                  onClick={() => setStoryMode('one-time')}
                  className={`rounded py-1 text-center text-xs font-medium transition-all ${
                    storyMode === 'one-time'
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  One-Time Story
                </button>
                <button
                  type="button"
                  onClick={() => setStoryMode('storyline')}
                  className={`rounded py-1 text-center text-xs font-medium transition-all ${
                    storyMode === 'storyline'
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Storyline
                </button>
              </div>

              {/* Storyline Mode specific subforms */}
              {storyMode === 'storyline' && (
                <div className="animate-in fade-in slide-in-from-top-1 mt-2 space-y-3 rounded-lg border border-zinc-900 bg-zinc-950/40 p-3 duration-150">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold tracking-wider text-zinc-500">
                      Project Selector
                    </label>
                    <select
                      value={storylineProject}
                      onChange={(e) => setStorylineProject(e.target.value)}
                      className="w-full rounded border border-zinc-900 bg-zinc-950 px-2 py-1 text-xs text-zinc-300 outline-none"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold tracking-wider text-zinc-500">
                      Storyline Selector
                    </label>
                    <select
                      value={selectedStoryline}
                      onChange={(e) => setSelectedStoryline(e.target.value)}
                      className="w-full rounded border border-zinc-900 bg-zinc-950 px-2 py-1 text-xs text-zinc-300 outline-none"
                    >
                      {activeProjectStorylines.length === 0 ? (
                        <option value="">No storylines available</option>
                      ) : (
                        activeProjectStorylines.map((line) => (
                          <option key={line.id} value={line.id}>
                            {line.title}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] font-bold tracking-wider text-zinc-500">
                      Episode Indicator
                    </label>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 border border-zinc-900 text-zinc-400"
                        onClick={() =>
                          setEpisodeNum(Math.max(1, episodeNum - 1))
                        }
                      >
                        -
                      </Button>
                      <span className="min-w-8 px-2 text-center font-mono text-xs font-bold text-zinc-200">
                        {episodeNum}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 border border-zinc-900 text-zinc-400"
                        onClick={() => setEpisodeNum(episodeNum + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  <Button
                    disabled
                    className="mt-1 w-full cursor-not-allowed border border-zinc-800 bg-zinc-900 text-xs font-medium text-zinc-500"
                  >
                    Continue Story (Continuity Lock)
                  </Button>
                </div>
              )}
            </div>

            {/* Character Manager Panel chips */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                  Inject Characters
                </label>
                {selectedCharacters.length > 0 && (
                  <button
                    onClick={() => setSelectedCharacters([])}
                    className="text-zinc-650 text-[9px] hover:text-zinc-400"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeProjectCharacters.length === 0 ? (
                  <p className="text-[10px] text-zinc-600">
                    No characters registered for this project.
                  </p>
                ) : (
                  activeProjectCharacters.map((char) => {
                    const isSelected = selectedCharacters.includes(char.name);
                    return (
                      <button
                        key={char.id}
                        type="button"
                        onClick={() => toggleCharacter(char.name)}
                        className={`rounded border px-2 py-1 text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-zinc-100 bg-zinc-900 text-zinc-100'
                            : 'border-zinc-900 bg-zinc-950 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {char.name}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Story Bible Preview Card */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                Story Bible Preview
              </label>
              <Card className="space-y-3 border-zinc-900 bg-zinc-950/40 p-3">
                <div className="space-y-1">
                  <span className="block text-[8px] font-bold text-zinc-600 uppercase">
                    World Setting
                  </span>
                  <p className="truncate text-[10px] leading-relaxed text-zinc-400">
                    {bible?.world_setting || 'No world setting defined.'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 border-t border-zinc-900 pt-2 text-[10px]">
                  <div>
                    <span className="block text-[8px] font-bold text-zinc-600 uppercase">
                      Visual Style
                    </span>
                    <span className="block truncate text-zinc-400">
                      {bible?.visual_style || 'Not defined'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-zinc-600 uppercase">
                      Tone
                    </span>
                    <span className="block truncate text-zinc-400">
                      {bible?.narrative_tone || 'Not defined'}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 border-t border-zinc-900 pt-2 text-[10px]">
                  <div>
                    <span className="block text-[8px] font-bold text-zinc-600 uppercase">
                      Writing Rules
                    </span>
                    <span className="block truncate text-zinc-400">
                      {bible?.writing_rules || 'Not defined'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-zinc-600 uppercase">
                      Status
                    </span>
                    <span className="block text-zinc-400">Synced</span>
                  </div>
                </div>
              </Card>
            </div>

            <Separator className="bg-zinc-900" />

            {/* Large Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex h-11 w-full items-center justify-center gap-2 bg-white text-xs font-semibold text-black transition-all hover:bg-zinc-200"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  <span>Generating Script variations...</span>
                </>
              ) : (
                <>
                  <Clapperboard className="h-4.5 w-4.5" />
                  <span>Generate Script</span>
                </>
              )}
            </Button>
          </div>
        </ScrollArea>
      </div>

      {/* Center Canvas / Results Workspace */}
      <div className="flex flex-col border-r border-zinc-900 bg-zinc-950 lg:col-span-5 lg:h-full lg:min-h-0 lg:overflow-hidden xl:col-span-6">
        {/* Workspace Canvas Header */}
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-900 bg-zinc-950 px-6">
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-zinc-400" />
            <h3 className="font-sans text-xs font-semibold text-zinc-200">
              Script Writer Workspace
            </h3>
          </div>
          {hasGenerated && (
            <Badge
              variant="outline"
              className="border-zinc-800 text-[10px] text-zinc-400"
            >
              Draft A & B Completed
            </Badge>
          )}
        </div>

        {/* Scrollable Canvas Area */}
        <ScrollArea className="min-h-0 flex-1">
          <div className="p-6">
            {isGenerating ? (
              // Loading skeleton state
              <div className="animate-pulse space-y-6">
                <div className="h-10 w-48 rounded bg-zinc-900" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-32 space-y-3 rounded-lg bg-zinc-900 p-4">
                    <div className="h-4 w-2/3 rounded bg-zinc-800" />
                    <div className="h-3 w-1/2 rounded bg-zinc-800" />
                    <div className="h-3 w-3/4 rounded bg-zinc-800" />
                  </div>
                  <div className="h-32 space-y-3 rounded-lg bg-zinc-900 p-4">
                    <div className="h-4 w-2/3 rounded bg-zinc-800" />
                    <div className="h-3 w-1/2 rounded bg-zinc-800" />
                    <div className="h-3 w-3/4 rounded bg-zinc-800" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 w-24 rounded bg-zinc-900" />
                  <div className="h-20 rounded bg-zinc-900" />
                  <div className="h-20 rounded bg-zinc-900" />
                </div>
              </div>
            ) : hasGenerated ? (
              // Results Panel comparison view (Variant A & B side-by-side)
              <div className="space-y-6">
                <div>
                  <h4 className="mb-4 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                    Comparison Matrix
                  </h4>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Variant A */}
                    <Card className="flex flex-col justify-between border-zinc-800 bg-zinc-900/30 p-5">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="block text-[10px] font-bold tracking-wide text-zinc-500">
                              VARIANT A
                            </span>
                            <h5 className="mt-1 text-base font-bold text-zinc-100">
                              {mockScripts.A.title}
                            </h5>
                          </div>
                          <Badge
                            variant="outline"
                            className="border-zinc-800 text-[10px] text-zinc-400"
                          >
                            Narrative
                          </Badge>
                        </div>

                        <Separator className="bg-zinc-900" />

                        <div className="space-y-3 text-xs leading-relaxed">
                          <div>
                            <span className="block text-[10px] font-medium text-zinc-500">
                              Mood
                            </span>
                            <p className="text-zinc-300">
                              {mockScripts.A.mood}
                            </p>
                          </div>
                          <div>
                            <span className="block text-[10px] font-medium text-zinc-500">
                              Camera Style
                            </span>
                            <p className="text-zinc-300">
                              {mockScripts.A.cameraStyle}
                            </p>
                          </div>
                          <div>
                            <span className="block text-[10px] font-medium text-zinc-500">
                              Lighting Style
                            </span>
                            <p className="text-zinc-300">
                              {mockScripts.A.lightingStyle}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-2 border-t border-zinc-900/60 pt-3 text-[10px] text-zinc-400">
                            <div>
                              <span>Duration:</span>{' '}
                              <span className="font-mono text-zinc-200">
                                {mockScripts.A.duration}
                              </span>
                            </div>
                            <div>
                              <span>Scenes:</span>{' '}
                              <span className="font-mono text-zinc-200">
                                {mockScripts.A.sceneCount}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 flex items-center gap-2 border-t border-zinc-900 pt-4">
                        <Button
                          disabled
                          variant="ghost"
                          size="sm"
                          className="flex-1 cursor-not-allowed border border-zinc-900 text-xs font-medium text-zinc-500"
                        >
                          <Copy className="mr-1.5 h-3.5 w-3.5" />
                          Copy (Disabled)
                        </Button>
                        <Button
                          onClick={() => {
                            setExpandedVariant('A');
                            setIsExpandOpen(true);
                          }}
                          variant="ghost"
                          size="sm"
                          className="border border-zinc-900 px-3 text-xs font-medium text-zinc-400 hover:text-white"
                        >
                          <Maximize2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </Card>

                    {/* Variant B */}
                    <Card className="flex flex-col justify-between border-zinc-800 bg-zinc-900/30 p-5">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="block text-[10px] font-bold tracking-wide text-zinc-500">
                              VARIANT B
                            </span>
                            <h5 className="mt-1 text-base font-bold text-zinc-100">
                              {mockScripts.B.title}
                            </h5>
                          </div>
                          <Badge
                            variant="outline"
                            className="border-zinc-800 text-[10px] text-zinc-400"
                          >
                            Stylized Action
                          </Badge>
                        </div>

                        <Separator className="bg-zinc-900" />

                        <div className="space-y-3 text-xs leading-relaxed">
                          <div>
                            <span className="block text-[10px] font-medium text-zinc-500">
                              Mood
                            </span>
                            <p className="text-zinc-300">
                              {mockScripts.B.mood}
                            </p>
                          </div>
                          <div>
                            <span className="block text-[10px] font-medium text-zinc-500">
                              Camera Style
                            </span>
                            <p className="text-zinc-300">
                              {mockScripts.B.cameraStyle}
                            </p>
                          </div>
                          <div>
                            <span className="block text-[10px] font-medium text-zinc-500">
                              Lighting Style
                            </span>
                            <p className="text-zinc-300">
                              {mockScripts.B.lightingStyle}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-2 border-t border-zinc-900/60 pt-3 text-[10px] text-zinc-400">
                            <div>
                              <span>Duration:</span>{' '}
                              <span className="font-mono text-zinc-200">
                                {mockScripts.B.duration}
                              </span>
                            </div>
                            <div>
                              <span>Scenes:</span>{' '}
                              <span className="font-mono text-zinc-200">
                                {mockScripts.B.sceneCount}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 flex items-center gap-2 border-t border-zinc-900 pt-4">
                        <Button
                          disabled
                          variant="ghost"
                          size="sm"
                          className="flex-1 cursor-not-allowed border border-zinc-900 text-xs font-medium text-zinc-500"
                        >
                          <Copy className="mr-1.5 h-3.5 w-3.5" />
                          Copy (Disabled)
                        </Button>
                        <Button
                          onClick={() => {
                            setExpandedVariant('B');
                            setIsExpandOpen(true);
                          }}
                          variant="ghost"
                          size="sm"
                          className="border border-zinc-900 px-3 text-xs font-medium text-zinc-400 hover:text-white"
                        >
                          <Maximize2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </Card>
                  </div>
                </div>

                <div className="flex gap-3 rounded-lg border border-zinc-900 bg-zinc-900/10 p-4 text-xs leading-relaxed text-zinc-400">
                  <AlertCircle className="h-5 w-5 shrink-0 text-zinc-500" />
                  <p>
                    These previews represent structural visual scripts. Click
                    the expand button to review time-coded scene scripts ready
                    to import to Veo 3 or similar text-to-video systems.
                  </p>
                </div>
              </div>
            ) : (
              // Empty State
              <div className="flex h-[50vh] flex-col items-center justify-center p-8 text-center">
                <Video className="mb-4 h-12 w-12 stroke-1 text-zinc-700" />
                <h3 className="mb-1 text-sm font-semibold text-zinc-300">
                  No script generated yet.
                </h3>
                <p className="max-w-sm text-xs leading-relaxed text-zinc-500">
                  Compose your visual concepts, duration parameters, and story
                  direction templates in the configuration console to run
                  comparisons.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right Sidebar: History Panel */}
      <div className="hidden flex-col bg-zinc-950/20 lg:col-span-3 lg:flex lg:h-full lg:min-h-0 lg:overflow-hidden">
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-900 bg-zinc-950/45 px-4">
          <div className="flex items-center gap-2">
            <HistoryIcon className="h-3.5 w-3.5 text-zinc-500" />
            <span className="font-sans text-xs font-semibold text-zinc-300">
              History
            </span>
          </div>
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-4 p-4">
            <h4 className="text-zinc-650 mb-2 font-sans text-[9px] font-bold tracking-widest uppercase">
              Recent Generations
            </h4>
            {history.length === 0 ? (
              <p className="py-8 text-center text-[10px] text-zinc-600">
                No generation history.
              </p>
            ) : (
              history.map((item) => (
                <Card
                  key={item.id}
                  className="cursor-pointer space-y-1.5 border-zinc-900/60 bg-zinc-900/10 p-3 transition-colors hover:bg-zinc-900/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate text-[10px] font-bold text-zinc-300">
                      Generation Script
                    </span>
                    <span className="font-mono text-[8px] text-zinc-600">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-[10px] leading-relaxed text-zinc-500">
                    &quot;{item.prompt}&quot;
                  </p>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Expanded view script details Modal */}
      <Dialog open={isExpandOpen} onOpenChange={setIsExpandOpen}>
        <DialogContent className="max-w-2xl border-zinc-900 bg-zinc-950 text-zinc-100">
          <DialogHeader className="border-b border-zinc-900 pb-4">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-white">
              <Clapperboard className="h-4.5 w-4.5 text-zinc-400" />
              <span>{mockScripts[expandedVariant].title}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              Review scene breakdowns structured for text-to-video AI alignment.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] space-y-4 overflow-y-auto pt-4 pr-1 text-xs">
            <div className="grid grid-cols-2 gap-4 rounded-lg border border-zinc-900 bg-zinc-900/10 p-3">
              <div>
                <span className="block text-[8px] font-bold tracking-wide text-zinc-500 uppercase">
                  CAMERA METADATA
                </span>
                <span className="mt-1 block leading-relaxed font-medium text-zinc-300">
                  {mockScripts[expandedVariant].cameraStyle}
                </span>
              </div>
              <div>
                <span className="block text-[8px] font-bold tracking-wide text-zinc-500 uppercase">
                  LIGHTING METADATA
                </span>
                <span className="mt-1 block leading-relaxed font-medium text-zinc-300">
                  {mockScripts[expandedVariant].lightingStyle}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-sans text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                Scene Breakdowns
              </h4>
              {mockScripts[expandedVariant].scenes.map((scene, idx) => (
                <div
                  key={idx}
                  className="space-y-2 rounded-lg border border-zinc-900 bg-zinc-900/50 p-4"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="rounded border border-zinc-800 bg-zinc-900 px-2 py-0.5 font-mono font-bold text-zinc-300">
                      {scene.time}
                    </span>
                    <span className="font-bold tracking-wider text-zinc-500 uppercase">
                      {scene.shot}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-zinc-600 uppercase">
                      VISUAL ACTIONS
                    </span>
                    <p className="mt-1 font-sans leading-relaxed text-zinc-300">
                      {scene.action}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
