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
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import {
  listTemplatesAction,
  listCharactersAction,
  loadStoryBibleAction,
  listStorylinesAction,
  listProjectsAction,
  listGenerationHistoryAction,
  createGenerationHistoryAction,
  createEpisodeAction,
  updateEpisodeAction,
  validateContinuityAction,
  listStoryArcsAction,
  listSeasonsAction,
  listEpisodesAction,
} from '@/app/actions';
import type { ScriptVariant } from '@/lib/ai/types';
import type {
  DbGenerationHistory,
  DbEpisode,
  DbStoryArc,
  DbSeason,
} from '@/lib/database/types';

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

/** Generated script result for a single variant */
interface GeneratedScripts {
  variantA: ScriptVariant;
  variantB: ScriptVariant;
  model: string;
  provider: string;
}

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

  // Real AI generation state
  const [generatedScripts, setGeneratedScripts] =
    React.useState<GeneratedScripts | null>(null);

  // Streaming & Generation Stage States
  const [generationStage, setGenerationStage] = React.useState<
    | 'idle'
    | 'preparing'
    | 'connecting'
    | 'generating_a'
    | 'generating_b'
    | 'finalizing'
    | 'completed'
    | 'cancelled'
    | 'error'
  >('idle');

  const [streamVariantA, setStreamVariantA] = React.useState('');
  const [streamVariantB, setStreamVariantB] = React.useState('');
  const [variantAMeta, setVariantAMeta] = React.useState({
    title: '',
    summary: '',
    estimatedDuration: '',
  });
  const [variantBMeta, setVariantBMeta] = React.useState({
    title: '',
    summary: '',
    estimatedDuration: '',
  });
  const [errorMsg, setErrorMsg] = React.useState('');

  // Milestone 5: Storyline Intelligence states
  const [continuityWarnings, setContinuityWarnings] = React.useState<
    Array<{
      severity: 'warning' | 'info';
      category: 'character' | 'location' | 'lore' | 'plot';
      message: string;
      suggestion?: string;
    }>
  >([]);
  const [lastContinuityContext, setLastContinuityContext] = React.useState<
    string | null
  >(null);
  const [isTimelineOpen, setIsTimelineOpen] = React.useState(false);
  const [timelineEpisodes, setTimelineEpisodes] = React.useState<DbEpisode[]>(
    []
  );
  const [timelineArcs, setTimelineArcs] = React.useState<DbStoryArc[]>([]);
  const [timelineSeasons, setTimelineSeasons] = React.useState<DbSeason[]>([]);
  const [isTimelineLoading, setIsTimelineLoading] = React.useState(false);

  const abortControllerRef = React.useRef<AbortController | null>(null);
  const bufferARef = React.useRef('');
  const bufferBRef = React.useRef('');
  const flushIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const startFlushTimer = () => {
    if (flushIntervalRef.current) clearInterval(flushIntervalRef.current);
    flushIntervalRef.current = setInterval(() => {
      setStreamVariantA(bufferARef.current);
      setStreamVariantB(bufferBRef.current);
    }, 80);
  };

  const stopFlushTimer = () => {
    if (flushIntervalRef.current) {
      clearInterval(flushIntervalRef.current);
      flushIntervalRef.current = null;
    }
    setStreamVariantA(bufferARef.current);
    setStreamVariantB(bufferBRef.current);
  };

  // 1. Save draft on state updates
  React.useEffect(() => {
    if (activeProjectId) {
      const draft = {
        projectId: activeProjectId,
        promptInput,
        selectedDuration,
        selectedStyle,
        storyMode,
        selectedTemplate,
        selectedCharacters,
        episodeNum,
        generationStage,
        streamVariantA,
        streamVariantB,
        variantAMeta,
        variantBMeta,
        generatedScripts,
      };

      if (generationStage !== 'idle' && generationStage !== 'completed') {
        localStorage.setItem(
          'ai_story_studio_draft_generation',
          JSON.stringify(draft)
        );
      } else if (generationStage === 'completed') {
        localStorage.removeItem('ai_story_studio_draft_generation');
      }
    }
  }, [
    activeProjectId,
    promptInput,
    selectedDuration,
    selectedStyle,
    storyMode,
    selectedTemplate,
    selectedCharacters,
    episodeNum,
    generationStage,
    streamVariantA,
    streamVariantB,
    variantAMeta,
    variantBMeta,
    generatedScripts,
  ]);

  // 2. Load/Restore draft on project change or mount
  React.useEffect(() => {
    const savedDraft = localStorage.getItem('ai_story_studio_draft_generation');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (draft && draft.projectId === activeProjectId) {
          setPromptInput(draft.promptInput || '');
          setSelectedDuration(draft.selectedDuration || '30s');
          setSelectedStyle(draft.selectedStyle || 'Cinematic');
          setStoryMode(draft.storyMode || 'one-time');
          setSelectedTemplate(draft.selectedTemplate || '');
          setSelectedCharacters(draft.selectedCharacters || []);
          setEpisodeNum(draft.episodeNum || 1);
          setStreamVariantA(draft.streamVariantA || '');
          setStreamVariantB(draft.streamVariantB || '');
          setVariantAMeta(
            draft.variantAMeta || {
              title: '',
              summary: '',
              estimatedDuration: '',
            }
          );
          setVariantBMeta(
            draft.variantBMeta || {
              title: '',
              summary: '',
              estimatedDuration: '',
            }
          );
          setGeneratedScripts(draft.generatedScripts || null);

          if (draft.generatedScripts) {
            setHasGenerated(true);
            setGenerationStage('completed');
          } else if (
            draft.generationStage !== 'idle' &&
            draft.generationStage !== 'completed'
          ) {
            setGenerationStage('error');
            setErrorMsg(
              'The previous generation was interrupted. You can retry below.'
            );
            setHasGenerated(false);
          }
          toast.info('Restored your draft workspace state!');
        }
      } catch (e) {
        console.error('Failed to restore draft:', e);
      }
    }
  }, [activeProjectId, setPromptInput, setSelectedDuration, setSelectedStyle]);

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

  // Copy script text to clipboard
  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);
    } catch {
      toast.error('Failed to copy to clipboard.');
    }
  };

  const handleCopyVariant = (variant: ScriptVariant, label: string) => {
    const text = `# ${variant.title}
**Summary**: ${variant.summary}
**Estimated Duration**: ${variant.estimatedDuration}
**Style**: ${selectedStyle}

## Full Script
${variant.fullScript}`;
    handleCopy(text, label);
  };

  const saveHistoryBackground = async (result: {
    variantA: ScriptVariant;
    variantB: ScriptVariant;
    model: string;
    provider: string;
    rawResponse: string;
    episodeId?: string | null;
    continuityContext?: string | null;
  }) => {
    if (!activeProjectId) return;
    try {
      // Invariant: Save style and metadata inside variant JSONB to avoid changing DB schema
      const variantAWithMeta = {
        ...result.variantA,
        style: selectedStyle,
      };
      const variantBWithMeta = {
        ...result.variantB,
        style: selectedStyle,
      };

      await createGenerationHistoryAction({
        project_id: activeProjectId,
        storyline_id:
          storyMode === 'storyline' && selectedStoryline
            ? selectedStoryline
            : null,
        episode_id: null,
        prompt: promptInput,
        status: 'completed',
        variant_a: variantAWithMeta as unknown as Record<string, unknown>,
        variant_b: variantBWithMeta as unknown as Record<string, unknown>,
        model: result.model,
        provider: result.provider,
        raw_response: result.rawResponse,
      });

      // For storylines, update the pre-created episode with the final title and set status to completed
      if (storyMode === 'storyline' && selectedStoryline && result.episodeId) {
        await updateEpisodeAction(result.episodeId, {
          title: result.variantA.title,
          prompt: promptInput,
          duration: selectedDuration,
          style: selectedStyle,
          template: selectedTemplate || null,
          status: 'completed',
        });
      }

      refetchHistory();
      toast.success('Generation history updated.');
    } catch (err: unknown) {
      console.error('Background history save failed:', err);
      toast.error('Scripts generated, but failed to save history record.');
    }
  };

  const handleSSEEvent = (event: string, data: string) => {
    if (event === 'stage') {
      setGenerationStage(data as typeof generationStage);
    } else if (event === 'variant_a_delta') {
      try {
        const parsed = JSON.parse(data);
        bufferARef.current += parsed.delta;
      } catch {}
    } else if (event === 'variant_b_delta') {
      try {
        const parsed = JSON.parse(data);
        bufferBRef.current += parsed.delta;
      } catch {}
    } else if (event === 'variant_a_complete') {
      try {
        const meta = JSON.parse(data);
        setVariantAMeta(meta);
      } catch {}
    } else if (event === 'variant_b_complete') {
      try {
        const meta = JSON.parse(data);
        setVariantBMeta(meta);
      } catch {}
    } else if (event === 'complete') {
      try {
        const result = JSON.parse(data);
        setGeneratedScripts({
          variantA: result.variantA,
          variantB: result.variantB,
          model: result.model,
          provider: result.provider,
        });
        setHasGenerated(true);
        setIsGenerating(false);
        setGenerationStage('completed');
        toast.success('Veo 3 script variations generated successfully!');

        // Milestone 5: Validate continuity if context was returned
        if (result.continuityContext) {
          setLastContinuityContext(result.continuityContext);
          validateContinuityAction({
            scriptText: result.variantA.fullScript,
            continuityContext: result.continuityContext,
          })
            .then((warnings) => {
              setContinuityWarnings(warnings);
            })
            .catch((err) => {
              console.error('Continuity check failed:', err);
            });
        } else {
          setLastContinuityContext(null);
          setContinuityWarnings([]);
        }

        saveHistoryBackground(result);
      } catch {}
    } else if (event === 'error') {
      try {
        const parsed = JSON.parse(data);
        setErrorMsg(parsed.message);
      } catch {
        setErrorMsg(data);
      }
      setGenerationStage('error');
      setIsGenerating(false);
    }
  };

  const handleGenerateStream = async (options?: {
    regenerateMode?: 'A' | 'B';
  }) => {
    const regenMode = options?.regenerateMode || 'both';

    if (!promptInput.trim()) {
      toast.error('Please describe a story prompt first');
      return;
    }

    if (isGenerating) {
      toast.warning('A generation is already in progress.');
      return;
    }

    setIsGenerating(true);
    setHasGenerated(false);
    setErrorMsg('');

    // Setup buffers
    if (regenMode === 'both') {
      bufferARef.current = '';
      bufferBRef.current = '';
      setStreamVariantA('');
      setStreamVariantB('');
      setVariantAMeta({ title: '', summary: '', estimatedDuration: '' });
      setVariantBMeta({ title: '', summary: '', estimatedDuration: '' });
      setGeneratedScripts(null);
    } else if (regenMode === 'A') {
      bufferARef.current = '';
      setStreamVariantA('');
      setVariantAMeta({ title: '', summary: '', estimatedDuration: '' });
      if (generatedScripts) {
        bufferBRef.current = generatedScripts.variantB.fullScript;
        setStreamVariantB(generatedScripts.variantB.fullScript);
        setVariantBMeta({
          title: generatedScripts.variantB.title,
          summary: generatedScripts.variantB.summary,
          estimatedDuration: generatedScripts.variantB.estimatedDuration,
        });
      }
    } else if (regenMode === 'B') {
      bufferBRef.current = '';
      setStreamVariantB('');
      setVariantBMeta({ title: '', summary: '', estimatedDuration: '' });
      if (generatedScripts) {
        bufferARef.current = generatedScripts.variantA.fullScript;
        setStreamVariantA(generatedScripts.variantA.fullScript);
        setVariantAMeta({
          title: generatedScripts.variantA.title,
          summary: generatedScripts.variantA.summary,
          estimatedDuration: generatedScripts.variantA.estimatedDuration,
        });
      }
    }

    setGenerationStage('preparing');
    abortControllerRef.current = new AbortController();

    try {
      const charData = activeProjectCharacters
        .filter((c) => selectedCharacters.includes(c.name))
        .map((c) => ({
          name: c.name,
          appearance: c.appearance,
          personality: c.personality ?? null,
        }));

      const bibleData = bible
        ? {
            worldSetting: bible.world_setting ?? null,
            visualStyle: bible.visual_style ?? null,
            narrativeTone: bible.narrative_tone ?? null,
            writingRules: bible.writing_rules ?? null,
            lore: bible.lore ?? null,
          }
        : null;

      const tmpl = dbTemplates.find((t) => t.name === selectedTemplate);

      let episodeId: string | null = null;
      if (storyMode === 'storyline' && selectedStoryline) {
        try {
          const ep = await createEpisodeAction({
            storyline_id: selectedStoryline,
            episode_number: episodeNum,
            title: `Episode ${episodeNum} Draft`,
            prompt: promptInput,
            duration: selectedDuration,
            style: selectedStyle,
            template: selectedTemplate || null,
            status: 'draft',
          });
          episodeId = ep.id;
        } catch (err) {
          console.error('Failed to create pre-generation episode:', err);
        }
      }

      const requestBody = {
        prompt: promptInput,
        duration: selectedDuration,
        style: selectedStyle,
        template: tmpl?.system_prompt ?? null,
        storyMode,
        episodeNumber: storyMode === 'storyline' ? episodeNum : undefined,
        characters: charData,
        storyBible: bibleData,
        regenerateMode: regenMode,
        existingVariantA:
          regenMode === 'B' && generatedScripts
            ? generatedScripts.variantA
            : null,
        existingVariantB:
          regenMode === 'A' && generatedScripts
            ? generatedScripts.variantB
            : null,
        projectId: activeProjectId,
        storylineId: selectedStoryline,
        episodeId,
      };

      setGenerationStage('connecting');

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorText = await response
          .text()
          .catch(() => 'Connection failed');
        throw new Error(errorText || `API error (HTTP ${response.status})`);
      }

      if (!response.body) {
        throw new Error('API returned empty response body.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamBuffer = '';

      startFlushTimer();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        streamBuffer += decoder.decode(value, { stream: true });
        const parts = streamBuffer.split('\n\n');
        streamBuffer = parts.pop() || '';

        for (const part of parts) {
          const lines = part.split('\n');
          let eventName = '';
          let dataVal = '';

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventName = line.substring(7).trim();
            } else if (line.startsWith('data: ')) {
              dataVal = line.substring(6).trim();
            }
          }

          if (eventName) {
            handleSSEEvent(eventName, dataVal);
          }
        }
      }

      if (streamBuffer.trim()) {
        const lines = streamBuffer.split('\n');
        let eventName = '';
        let dataVal = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventName = line.substring(7).trim();
          } else if (line.startsWith('data: ')) {
            dataVal = line.substring(6).trim();
          }
        }
        if (eventName) {
          handleSSEEvent(eventName, dataVal);
        }
      }

      stopFlushTimer();
      abortControllerRef.current = null;
    } catch (err: unknown) {
      stopFlushTimer();
      setIsGenerating(false);

      const errorObj = err as Error;
      if (
        errorObj.name === 'AbortError' ||
        abortControllerRef.current?.signal.aborted
      ) {
        setGenerationStage('cancelled');
        toast.info('Generation cancelled. Partial output preserved.');
      } else {
        setGenerationStage('error');
        setErrorMsg(errorObj.message || 'Generation failed.');
        toast.error(errorObj.message || 'Generation failed.');
      }
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    stopFlushTimer();
    setIsGenerating(false);
    setGenerationStage('cancelled');
    toast.info('Generation cancelled.');
    localStorage.removeItem('ai_story_studio_draft_generation');
  };

  const handleReopenHistory = (item: DbGenerationHistory) => {
    if (isGenerating) {
      toast.warning('Cannot reopen history while generation is active.');
      return;
    }
    setPromptInput(item.prompt || '');

    const variantA = item.variant_a as unknown as ScriptVariant & {
      style?: string;
    };
    const variantB = item.variant_b as unknown as ScriptVariant & {
      style?: string;
    };
    const itemWithStyle = item as unknown as { style?: string };

    if (variantA?.estimatedDuration) {
      setSelectedDuration(variantA.estimatedDuration);
    }
    const restoredStyle =
      variantA?.style || itemWithStyle.style || selectedStyle;
    setSelectedStyle(restoredStyle);

    if (variantA && variantB) {
      setGeneratedScripts({
        variantA,
        variantB,
        model: item.model || 'Unknown',
        provider: item.provider || 'Unknown',
      });
      setStreamVariantA(variantA.fullScript || '');
      setStreamVariantB(variantB.fullScript || '');
      setVariantAMeta({
        title: variantA.title || '',
        summary: variantA.summary || '',
        estimatedDuration: variantA.estimatedDuration || '',
      });
      setVariantBMeta({
        title: variantB.title || '',
        summary: variantB.summary || '',
        estimatedDuration: variantB.estimatedDuration || '',
      });
      setHasGenerated(true);
      setGenerationStage('completed');
      toast.success('Reopened generation workspace.');
    }
  };

  const handleOpenTimeline = async () => {
    if (!selectedStoryline) {
      toast.warning('Please select a storyline first.');
      return;
    }
    setIsTimelineLoading(true);
    setIsTimelineOpen(true);
    try {
      const [episodes, arcs, seasons] = await Promise.all([
        listEpisodesAction(selectedStoryline),
        listStoryArcsAction(selectedStoryline),
        listSeasonsAction(selectedStoryline),
      ]);
      setTimelineEpisodes(episodes || []);
      setTimelineArcs(arcs || []);
      setTimelineSeasons(seasons || []);
    } catch (err) {
      console.error('Failed to load storyline timeline:', err);
      toast.error('Failed to load storyline timeline.');
    } finally {
      setIsTimelineLoading(false);
    }
  };

  // Helper to get the active variant data for rendering
  const activeVariantData =
    generatedScripts && expandedVariant === 'A'
      ? generatedScripts.variantA
      : (generatedScripts?.variantB ?? null);

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
                    onClick={handleOpenTimeline}
                    className="mt-1 w-full border border-zinc-800 bg-zinc-900 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  >
                    <HistoryIcon className="mr-1 h-3.5 w-3.5" />
                    <span>View Storyline Timeline</span>
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
              onClick={() => handleGenerateStream()}
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
            {generationStage !== 'idle' && generationStage !== 'completed' && (
              <div className="space-y-6">
                {/* Generation Stage Banner */}
                <Card className="border-zinc-800 bg-zinc-900/20 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {generationStage !== 'error' &&
                      generationStage !== 'cancelled' ? (
                        <Loader2 className="h-4.5 w-4.5 animate-spin text-white" />
                      ) : (
                        <AlertCircle className="h-4.5 w-4.5 text-zinc-500" />
                      )}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                          Current Stage
                        </span>
                        <h4 className="text-xs font-semibold text-zinc-200 capitalize">
                          {generationStage.replace('_', ' ')}
                        </h4>
                      </div>
                    </div>
                    {generationStage !== 'error' &&
                      generationStage !== 'cancelled' && (
                        <Button
                          onClick={handleCancel}
                          variant="destructive"
                          size="sm"
                          className="h-8 border border-red-900/30 bg-red-950/40 text-[10px] font-bold tracking-wider text-red-400 uppercase hover:bg-red-950/80"
                        >
                          Cancel
                        </Button>
                      )}
                  </div>
                </Card>

                {/* Error Banner with Retry */}
                {generationStage === 'error' && (
                  <Card className="space-y-3 border-red-950 bg-red-950/10 p-4">
                    <div className="flex items-start gap-3 text-red-400">
                      <AlertCircle className="h-5 w-5 shrink-0" />
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold tracking-wider uppercase">
                          Generation Failed
                        </h4>
                        <p className="text-xs leading-relaxed text-red-300">
                          {errorMsg || 'An unexpected error occurred.'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleGenerateStream()}
                        className="h-8 bg-red-900 text-[10px] font-bold text-white uppercase hover:bg-red-800"
                      >
                        Retry
                      </Button>
                      <Button
                        onClick={() => {
                          setGenerationStage('idle');
                          setStreamVariantA('');
                          setStreamVariantB('');
                          setVariantAMeta({
                            title: '',
                            summary: '',
                            estimatedDuration: '',
                          });
                          setVariantBMeta({
                            title: '',
                            summary: '',
                            estimatedDuration: '',
                          });
                          setGeneratedScripts(null);
                          setHasGenerated(false);
                        }}
                        variant="ghost"
                        className="h-8 border border-zinc-800 text-[10px] font-bold text-zinc-400 uppercase hover:text-white"
                      >
                        Dismiss
                      </Button>
                    </div>
                  </Card>
                )}

                {/* Live Side-by-side stream matrices */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Variant A Card */}
                  <Card className="flex flex-col justify-between border-zinc-800 bg-zinc-900/30 p-5">
                    <div className="space-y-4">
                      <div>
                        <span className="block text-[10px] font-bold tracking-wide text-zinc-500">
                          VARIANT A
                        </span>
                        <h5 className="mt-1 text-sm font-bold text-zinc-100">
                          {variantAMeta.title ||
                            (generationStage === 'generating_a'
                              ? 'Writing title...'
                              : 'Waiting for Variant A...')}
                        </h5>
                      </div>

                      <Separator className="bg-zinc-900" />

                      <div className="space-y-3 text-xs leading-relaxed">
                        <div>
                          <span className="block text-[10px] font-medium text-zinc-500">
                            Summary
                          </span>
                          <p className="text-zinc-300">
                            {variantAMeta.summary ||
                              (generationStage === 'generating_a'
                                ? 'Writing summary...'
                                : 'Waiting...')}
                          </p>
                        </div>
                        <div>
                          <span className="block text-[10px] font-medium text-zinc-500">
                            Script Preview
                          </span>
                          <div className="max-h-[250px] overflow-y-auto rounded-lg border border-zinc-900/60 bg-zinc-950/40 p-3">
                            {streamVariantA ? (
                              <pre className="font-sans text-[11px] leading-relaxed whitespace-pre-wrap text-zinc-400">
                                {streamVariantA}
                                {generationStage === 'generating_a' && (
                                  <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-white" />
                                )}
                              </pre>
                            ) : (
                              <div className="text-zinc-650 flex h-20 items-center justify-center text-[10px]">
                                {generationStage === 'generating_a' ? (
                                  <span className="flex items-center gap-1.5">
                                    <Loader2 className="h-3 w-3 animate-spin" />{' '}
                                    Writing...
                                  </span>
                                ) : (
                                  'Waiting...'
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        {variantAMeta.estimatedDuration && (
                          <div className="text-zinc-450 font-mono text-[10px]">
                            <span>Duration:</span>{' '}
                            <span className="text-zinc-300">
                              {variantAMeta.estimatedDuration}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>

                  {/* Variant B Card */}
                  <Card className="flex flex-col justify-between border-zinc-800 bg-zinc-900/30 p-5">
                    <div className="space-y-4">
                      <div>
                        <span className="block text-[10px] font-bold tracking-wide text-zinc-500">
                          VARIANT B
                        </span>
                        <h5 className="mt-1 text-sm font-bold text-zinc-100">
                          {variantBMeta.title ||
                            (generationStage === 'generating_b'
                              ? 'Writing title...'
                              : 'Waiting for Variant B...')}
                        </h5>
                      </div>

                      <Separator className="bg-zinc-900" />

                      <div className="space-y-3 text-xs leading-relaxed">
                        <div>
                          <span className="block text-[10px] font-medium text-zinc-500">
                            Summary
                          </span>
                          <p className="text-zinc-300">
                            {variantBMeta.summary ||
                              (generationStage === 'generating_b'
                                ? 'Writing summary...'
                                : 'Waiting...')}
                          </p>
                        </div>
                        <div>
                          <span className="block text-[10px] font-medium text-zinc-500">
                            Script Preview
                          </span>
                          <div className="max-h-[250px] overflow-y-auto rounded-lg border border-zinc-900/60 bg-zinc-950/40 p-3">
                            {streamVariantB ? (
                              <pre className="font-sans text-[11px] leading-relaxed whitespace-pre-wrap text-zinc-400">
                                {streamVariantB}
                                {generationStage === 'generating_b' && (
                                  <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-white" />
                                )}
                              </pre>
                            ) : (
                              <div className="text-zinc-650 flex h-20 items-center justify-center text-[10px]">
                                {generationStage === 'generating_b' ? (
                                  <span className="flex items-center gap-1.5">
                                    <Loader2 className="h-3 w-3 animate-spin" />{' '}
                                    Writing...
                                  </span>
                                ) : (
                                  'Waiting...'
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        {variantBMeta.estimatedDuration && (
                          <div className="text-zinc-450 font-mono text-[10px]">
                            <span>Duration:</span>{' '}
                            <span className="text-zinc-300">
                              {variantBMeta.estimatedDuration}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {generationStage === 'completed' && generatedScripts ? (
              // Results Panel comparison view (Variant A & B side-by-side)
              <div className="space-y-6">
                {/* Continuity Alerts Panel */}
                {continuityWarnings.length > 0 ? (
                  <Card className="animate-in fade-in slide-in-from-top-2 border-amber-900/60 bg-amber-950/20 p-4 duration-200">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                      <div className="w-full space-y-1">
                        <h4 className="text-xs font-bold tracking-wider text-amber-400 uppercase">
                          Continuity Inconsistencies Detected
                        </h4>
                        <p className="text-[11px] text-zinc-400">
                          The script editor flagged the following contradictions
                          against established story/character/location states:
                        </p>
                        <div className="mt-3 space-y-2">
                          {continuityWarnings.map((warning, index) => (
                            <div
                              key={index}
                              className="rounded border border-zinc-900 bg-zinc-950/60 p-2.5 text-xs text-zinc-300"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-[10px] font-semibold tracking-wider text-amber-500 capitalize">
                                  [{warning.category}] {warning.severity}
                                </span>
                              </div>
                              <p className="mt-1 text-zinc-200">
                                {warning.message}
                              </p>
                              {warning.suggestion && (
                                <p className="mt-1 text-[11px] text-zinc-500">
                                  <span className="font-semibold text-zinc-400">
                                    Suggestion:
                                  </span>{' '}
                                  {warning.suggestion}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ) : (
                  lastContinuityContext && (
                    <Card className="animate-in fade-in slide-in-from-top-2 flex items-center gap-2.5 border-green-950/60 bg-green-950/15 p-3.5 text-xs text-green-400 duration-200">
                      <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                      <div className="space-y-0.5">
                        <p className="font-semibold text-green-300">
                          Continuity Check Passed
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          All characters, locations, and lore facts are
                          consistent with preceding episode memories.
                        </p>
                      </div>
                    </Card>
                  )
                )}

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
                              {generatedScripts.variantA.title}
                            </h5>
                          </div>
                          <Badge
                            variant="outline"
                            className="border-zinc-800 text-[10px] text-zinc-400"
                          >
                            {selectedStyle}
                          </Badge>
                        </div>

                        <Separator className="bg-zinc-900" />

                        <div className="space-y-3 text-xs leading-relaxed">
                          <div>
                            <span className="block text-[10px] font-medium text-zinc-500">
                              Summary
                            </span>
                            <p className="text-zinc-300">
                              {generatedScripts.variantA.summary}
                            </p>
                          </div>
                          <div>
                            <span className="block text-[10px] font-medium text-zinc-500">
                              Script Preview
                            </span>
                            <p className="line-clamp-4 whitespace-pre-wrap text-zinc-400">
                              {generatedScripts.variantA.fullScript}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-2 border-t border-zinc-900/60 pt-3 text-[10px] text-zinc-400">
                            <div>
                              <span>Duration:</span>{' '}
                              <span className="font-mono text-zinc-200">
                                {generatedScripts.variantA.estimatedDuration}
                              </span>
                            </div>
                            <div>
                              <span>Model:</span>{' '}
                              <span className="font-mono text-zinc-200">
                                {generatedScripts.model.split('/').pop()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 space-y-3 border-t border-zinc-900 pt-4">
                        {/* Copy tools bar */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Button
                            onClick={() =>
                              handleCopyVariant(
                                generatedScripts.variantA,
                                'Variant A'
                              )
                            }
                            variant="ghost"
                            size="sm"
                            className="h-8 border border-zinc-900 text-[10px] font-medium text-zinc-400 hover:text-white"
                          >
                            Copy Variant
                          </Button>
                          <Button
                            onClick={() =>
                              handleCopy(
                                generatedScripts.variantA.summary,
                                'Summary A'
                              )
                            }
                            variant="ghost"
                            size="sm"
                            className="h-8 border border-zinc-900 text-[10px] font-medium text-zinc-400 hover:text-white"
                          >
                            Summary
                          </Button>
                          <Button
                            onClick={() =>
                              handleCopy(
                                generatedScripts.variantA.fullScript,
                                'Script A'
                              )
                            }
                            variant="ghost"
                            size="sm"
                            className="h-8 border border-zinc-900 text-[10px] font-medium text-zinc-400 hover:text-white"
                          >
                            Script
                          </Button>
                          <Button
                            onClick={() =>
                              handleCopy(
                                JSON.stringify(
                                  generatedScripts.variantA,
                                  null,
                                  2
                                ),
                                'Variant A JSON'
                              )
                            }
                            variant="ghost"
                            size="sm"
                            className="h-8 border border-zinc-900 text-[10px] font-medium text-zinc-400 hover:text-white"
                          >
                            JSON
                          </Button>
                          <Button
                            onClick={() => {
                              setExpandedVariant('A');
                              setIsExpandOpen(true);
                            }}
                            variant="ghost"
                            size="sm"
                            className="ml-auto h-8 border border-zinc-900 px-3 text-xs font-medium text-zinc-400 hover:text-white"
                          >
                            <Maximize2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        {/* Regenerate card button */}
                        <Button
                          onClick={() =>
                            handleGenerateStream({ regenerateMode: 'A' })
                          }
                          disabled={isGenerating}
                          variant="outline"
                          size="sm"
                          className="h-8 w-full border border-zinc-800 text-[10px] font-bold tracking-wider text-zinc-300 uppercase hover:bg-zinc-900"
                        >
                          <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                          Regenerate Variant A Only
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
                              {generatedScripts.variantB.title}
                            </h5>
                          </div>
                          <Badge
                            variant="outline"
                            className="border-zinc-800 text-[10px] text-zinc-400"
                          >
                            {selectedStyle}
                          </Badge>
                        </div>

                        <Separator className="bg-zinc-900" />

                        <div className="space-y-3 text-xs leading-relaxed">
                          <div>
                            <span className="block text-[10px] font-medium text-zinc-500">
                              Summary
                            </span>
                            <p className="text-zinc-300">
                              {generatedScripts.variantB.summary}
                            </p>
                          </div>
                          <div>
                            <span className="block text-[10px] font-medium text-zinc-500">
                              Script Preview
                            </span>
                            <p className="line-clamp-4 whitespace-pre-wrap text-zinc-400">
                              {generatedScripts.variantB.fullScript}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-2 border-t border-zinc-900/60 pt-3 text-[10px] text-zinc-400">
                            <div>
                              <span>Duration:</span>{' '}
                              <span className="font-mono text-zinc-200">
                                {generatedScripts.variantB.estimatedDuration}
                              </span>
                            </div>
                            <div>
                              <span>Provider:</span>{' '}
                              <span className="font-mono text-zinc-200 capitalize">
                                {generatedScripts.provider}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 space-y-3 border-t border-zinc-900 pt-4">
                        {/* Copy tools bar */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Button
                            onClick={() =>
                              handleCopyVariant(
                                generatedScripts.variantB,
                                'Variant B'
                              )
                            }
                            variant="ghost"
                            size="sm"
                            className="h-8 border border-zinc-900 text-[10px] font-medium text-zinc-400 hover:text-white"
                          >
                            Copy Variant
                          </Button>
                          <Button
                            onClick={() =>
                              handleCopy(
                                generatedScripts.variantB.summary,
                                'Summary B'
                              )
                            }
                            variant="ghost"
                            size="sm"
                            className="h-8 border border-zinc-900 text-[10px] font-medium text-zinc-400 hover:text-white"
                          >
                            Summary
                          </Button>
                          <Button
                            onClick={() =>
                              handleCopy(
                                generatedScripts.variantB.fullScript,
                                'Script B'
                              )
                            }
                            variant="ghost"
                            size="sm"
                            className="h-8 border border-zinc-900 text-[10px] font-medium text-zinc-400 hover:text-white"
                          >
                            Script
                          </Button>
                          <Button
                            onClick={() =>
                              handleCopy(
                                JSON.stringify(
                                  generatedScripts.variantB,
                                  null,
                                  2
                                ),
                                'Variant B JSON'
                              )
                            }
                            variant="ghost"
                            size="sm"
                            className="h-8 border border-zinc-900 text-[10px] font-medium text-zinc-400 hover:text-white"
                          >
                            JSON
                          </Button>
                          <Button
                            onClick={() => {
                              setExpandedVariant('B');
                              setIsExpandOpen(true);
                            }}
                            variant="ghost"
                            size="sm"
                            className="ml-auto h-8 border border-zinc-900 px-3 text-xs font-medium text-zinc-400 hover:text-white"
                          >
                            <Maximize2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        {/* Regenerate B */}
                        <Button
                          onClick={() =>
                            handleGenerateStream({ regenerateMode: 'B' })
                          }
                          disabled={isGenerating}
                          variant="outline"
                          size="sm"
                          className="h-8 w-full border border-zinc-800 text-[10px] font-bold tracking-wider text-zinc-300 uppercase hover:bg-zinc-900"
                        >
                          <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                          Regenerate Variant B Only
                        </Button>
                      </div>
                    </Card>
                  </div>
                </div>

                <div className="flex gap-3 rounded-lg border border-zinc-900 bg-zinc-900/10 p-4 text-xs leading-relaxed text-zinc-400">
                  <AlertCircle className="h-5 w-5 shrink-0 text-zinc-500" />
                  <p>
                    These are AI-generated Veo 3 scripts powered by{' '}
                    <span className="font-semibold text-zinc-300 capitalize">
                      {generatedScripts.provider}
                    </span>{' '}
                    with model{' '}
                    <span className="font-semibold text-zinc-300">
                      {generatedScripts.model}
                    </span>
                    . Click expand to review full script or copy items.
                  </p>
                </div>
              </div>
            ) : null}

            {generationStage === 'idle' && (
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
              <p className="text-zinc-655 py-8 text-center text-[10px]">
                No generation history.
              </p>
            ) : (
              history.map((item) => {
                const displayTime = new Date(item.created_at).toLocaleString(
                  undefined,
                  {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }
                );
                const modelName = item.model
                  ? item.model.split('/').pop()
                  : 'N/A';

                const variantA = item.variant_a as unknown as
                  (ScriptVariant & { style?: string }) | null;
                const itemWithStyle = item as unknown as { style?: string };

                // Status Badge styling
                let badgeClass = 'border-zinc-800 text-zinc-450 bg-zinc-950/20';
                if (item.status === 'completed') {
                  badgeClass =
                    'border-green-950/60 text-green-400 bg-green-950/20';
                } else if (item.status === 'failed') {
                  badgeClass = 'border-red-950/60 text-red-400 bg-red-950/20';
                } else if (
                  item.status === 'generating' ||
                  item.status === 'pending'
                ) {
                  badgeClass =
                    'border-amber-950/60 text-amber-400 bg-amber-950/20';
                }

                return (
                  <Card
                    key={item.id}
                    onClick={() => handleReopenHistory(item)}
                    className="cursor-pointer space-y-2 border-zinc-900 bg-zinc-900/10 p-3 transition-colors hover:bg-zinc-900/20"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[8px] text-zinc-500">
                        {displayTime}
                      </span>
                      <Badge
                        variant="outline"
                        className={`px-1 py-0 text-[8px] ${badgeClass}`}
                      >
                        {item.status || 'completed'}
                      </Badge>
                    </div>
                    <p className="line-clamp-2 text-[10px] leading-relaxed text-zinc-400">
                      &quot;{item.prompt}&quot;
                    </p>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 border-t border-zinc-900/60 pt-2 font-mono text-[9px] text-zinc-500">
                      <div>
                        <span>Duration:</span>{' '}
                        <span className="text-zinc-350">
                          {variantA?.estimatedDuration || 'N/A'}
                        </span>
                      </div>
                      <div className="truncate">
                        <span>Style:</span>{' '}
                        <span className="text-zinc-350">
                          {variantA?.style ||
                            itemWithStyle.style ||
                            selectedStyle}
                        </span>
                      </div>
                      <div>
                        <span>Provider:</span>{' '}
                        <span className="text-zinc-355 capitalize">
                          {item.provider || 'N/A'}
                        </span>
                      </div>
                      <div className="truncate">
                        <span>Model:</span>{' '}
                        <span className="text-zinc-355">{modelName}</span>
                      </div>
                    </div>
                  </Card>
                );
              })
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
              <span>{activeVariantData?.title ?? 'Script'}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              Full Veo 3 production script — Variant {expandedVariant}. Ready to
              import into text-to-video AI systems.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] space-y-4 overflow-y-auto pt-4 pr-1 text-xs">
            {activeVariantData && (
              <>
                <div className="rounded-lg border border-zinc-900 bg-zinc-900/10 p-3">
                  <span className="block text-[8px] font-bold tracking-wide text-zinc-500 uppercase">
                    SUMMARY
                  </span>
                  <p className="mt-1 leading-relaxed text-zinc-300">
                    {activeVariantData.summary}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 rounded-lg border border-zinc-900 bg-zinc-900/10 p-3">
                  <div>
                    <span className="block text-[8px] font-bold tracking-wide text-zinc-500 uppercase">
                      ESTIMATED DURATION
                    </span>
                    <span className="mt-1 block font-mono font-medium text-zinc-300">
                      {activeVariantData.estimatedDuration}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold tracking-wide text-zinc-500 uppercase">
                      STYLE
                    </span>
                    <span className="mt-1 block font-medium text-zinc-300">
                      {selectedStyle}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-sans text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                      Full Script
                    </h4>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Button
                        onClick={() =>
                          handleCopyVariant(
                            activeVariantData,
                            `Variant ${expandedVariant}`
                          )
                        }
                        variant="ghost"
                        size="sm"
                        className="h-7 border border-zinc-800 px-2 text-[10px] text-zinc-400 hover:text-white"
                      >
                        Copy Variant
                      </Button>
                      <Button
                        onClick={() =>
                          handleCopy(activeVariantData.summary, 'Summary')
                        }
                        variant="ghost"
                        size="sm"
                        className="h-7 border border-zinc-800 px-2 text-[10px] text-zinc-400 hover:text-white"
                      >
                        Copy Summary
                      </Button>
                      <Button
                        onClick={() =>
                          handleCopy(activeVariantData.fullScript, 'Script')
                        }
                        variant="ghost"
                        size="sm"
                        className="h-7 border border-zinc-800 px-2 text-[10px] text-zinc-400 hover:text-white"
                      >
                        Copy Script
                      </Button>
                      <Button
                        onClick={() =>
                          handleCopy(
                            JSON.stringify(activeVariantData, null, 2),
                            'JSON'
                          )
                        }
                        variant="ghost"
                        size="sm"
                        className="h-7 border border-zinc-800 px-2 text-[10px] text-zinc-400 hover:text-white"
                      >
                        Copy JSON
                      </Button>
                    </div>
                  </div>
                  <div className="rounded-lg border border-zinc-900 bg-zinc-900/50 p-4">
                    <pre className="font-sans leading-relaxed whitespace-pre-wrap text-zinc-300">
                      {activeVariantData.fullScript}
                    </pre>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Storyline Timeline Dialog Modal */}
      <Dialog open={isTimelineOpen} onOpenChange={setIsTimelineOpen}>
        <DialogContent className="flex max-h-[85vh] max-w-3xl flex-col border-zinc-900 bg-zinc-950 text-zinc-100">
          <DialogHeader className="border-b border-zinc-900 pb-4">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-white">
              <Layers className="h-4.5 w-4.5 text-zinc-400" />
              <span>Storyline Narrative Timeline</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              View chronological sequence of episode summaries, story arcs, and
              seasons.
            </DialogDescription>
          </DialogHeader>

          {isTimelineLoading ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
              <span className="text-xs font-medium text-zinc-500">
                Reading memory matrices...
              </span>
            </div>
          ) : timelineEpisodes.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
              <HistoryIcon className="mb-3 h-10 w-10 text-zinc-800" />
              <h4 className="text-zinc-350 text-sm font-semibold">
                Timeline Empty
              </h4>
              <p className="mt-1 max-w-sm text-xs text-zinc-600">
                No completed episodes generated under this storyline yet.
              </p>
            </div>
          ) : (
            <ScrollArea className="min-h-0 flex-1 pr-2">
              <div className="space-y-6 py-4">
                {/* Render Season rollup summaries if available */}
                {timelineSeasons.map((season) => (
                  <div
                    key={season.id}
                    className="space-y-2 rounded-lg border border-green-950/40 bg-green-950/5 p-4"
                  >
                    <span className="text-[9px] font-bold tracking-widest text-green-400 uppercase">
                      SEASON {season.season_number} ROLLUP
                    </span>
                    <h4 className="text-sm font-bold text-white">
                      {season.title}
                    </h4>
                    <p className="text-zinc-350 text-xs leading-relaxed">
                      {season.summary}
                    </p>
                  </div>
                ))}

                {/* Render Story Arc rollup summaries if available */}
                {timelineArcs.map((arc) => (
                  <div
                    key={arc.id}
                    className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-900/10 p-4"
                  >
                    <span className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase">
                      STORY ARC {arc.arc_number} (Episodes {arc.start_episode}–
                      {arc.end_episode})
                    </span>
                    <h4 className="text-sm font-bold text-zinc-200">
                      {arc.title}
                    </h4>
                    <p className="text-xs leading-relaxed text-zinc-400">
                      {arc.summary}
                    </p>
                  </div>
                ))}

                <Separator className="bg-zinc-900" />

                <h4 className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                  Chronological Episodes
                </h4>

                <div className="space-y-4">
                  {timelineEpisodes.map((ep) => (
                    <div
                      key={ep.id}
                      className="relative space-y-2 border-l border-zinc-900 pl-6"
                    >
                      <div className="absolute top-1 -left-1.5 h-3 w-3 rounded-full border border-zinc-800 bg-zinc-950" />
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-zinc-300">
                          Episode {ep.episode_number}: {ep.title}
                        </span>
                        <span className="font-mono text-[10px] text-zinc-500 capitalize">
                          Status: {ep.status}
                        </span>
                      </div>
                      {ep.summary ? (
                        <p className="text-xs leading-relaxed text-zinc-400">
                          {ep.summary}
                        </p>
                      ) : (
                        <p className="text-xs text-zinc-600 italic">
                          No summary generated for this episode yet.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
