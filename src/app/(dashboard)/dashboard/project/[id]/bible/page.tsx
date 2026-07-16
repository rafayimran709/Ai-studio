'use client';

import * as React from 'react';
import { useStoryStore } from '@/hooks/useStoryStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { BookOpen, Save, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation } from '@tanstack/react-query';
import { loadStoryBibleAction, saveStoryBibleAction } from '@/app/actions';

export default function StoryBible() {
  const { activeProjectId } = useStoryStore();

  // Load Story Bible data via React Query
  const {
    data: bible,
    refetch: refetchBible,
    isLoading,
  } = useQuery({
    queryKey: ['storyBible', activeProjectId],
    queryFn: () =>
      activeProjectId
        ? loadStoryBibleAction(activeProjectId)
        : Promise.resolve(null),
    enabled: !!activeProjectId,
  });

  const [worldSetting, setWorldSetting] = React.useState('');
  const [visualRules, setVisualRules] = React.useState('');
  const [narrativeTone, setNarrativeTone] = React.useState('');
  const [notes, setNotes] = React.useState('');

  // Sync loaded bible data to local input states
  React.useEffect(() => {
    if (bible) {
      setWorldSetting(bible.world_setting || '');
      setVisualRules(bible.visual_style || '');
      setNarrativeTone(bible.narrative_tone || '');
      setNotes(bible.writing_rules || '');
    } else {
      setWorldSetting('');
      setVisualRules('');
      setNarrativeTone('');
      setNotes('');
    }
  }, [bible]);

  // Save Story Bible mutation
  const saveBibleMutation = useMutation({
    mutationFn: saveStoryBibleAction,
    onSuccess: () => {
      refetchBible();
      toast.success('Story Bible guidelines saved successfully!');
    },
    onError: (err: Error) => {
      toast.error(`Failed to save Story Bible: ${err.message}`);
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProjectId) return;
    saveBibleMutation.mutate({
      project_id: activeProjectId,
      world_setting: worldSetting,
      visual_style: visualRules,
      narrative_tone: narrativeTone,
      writing_rules: notes,
      lore: '',
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-8">
      {/* Title */}
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-900 pb-6 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-white">
            <BookOpen className="h-7 w-7 text-zinc-400" />
            Story Bible
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Define world laws, camera boundaries, and narrative guidelines to
            align the generation model context.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-[400px] animate-pulse rounded-xl border border-zinc-900 bg-zinc-900/10" />
      ) : (
        <form onSubmit={handleSave}>
          <Card className="border-zinc-800 bg-zinc-900/20">
            <CardHeader>
              <CardTitle className="text-base text-white">
                World & Visual Directives
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                The AI generation engine reads these rules as system constraints
                for every scene breakdown.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                  World Setting & Lore
                </label>
                <Textarea
                  value={worldSetting}
                  onChange={(e) => setWorldSetting(e.target.value)}
                  placeholder="e.g. A sprawling neon cyberpunk city in the year 2099. Dystopian megacorporation high-rises overlook wet streets. Rain is constant, refracting pink and cyan light."
                  className="min-h-[100px] border-zinc-900 bg-zinc-950 text-xs text-zinc-200"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                  Visual & Cinematic Rules (Veo 3 Guidelines)
                </label>
                <Textarea
                  value={visualRules}
                  onChange={(e) => setVisualRules(e.target.value)}
                  placeholder="e.g. Use anamorphic wide shots. Keep camera angles low to emphasize height. Emphasize shadows and high contrast key lighting. Avoid high-key daylight visual prompts."
                  className="min-h-[100px] border-zinc-900 bg-zinc-950 text-xs text-zinc-200"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                  Narrative Tone & Dialogue Rules
                </label>
                <Textarea
                  value={narrativeTone}
                  onChange={(e) => setNarrativeTone(e.target.value)}
                  placeholder="e.g. Neo-noir mystery. Cynical dialogues, sparse speaking lines, heavy atmospheric visual storytelling. Subdued voiceover delivery."
                  className="min-h-[80px] border-zinc-900 bg-zinc-950 text-xs text-zinc-200"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                  General Writing Constraints
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Do not mention modern 2020s tech names. Refer to mobile devices as cyberdecks or holograms."
                  className="min-h-[60px] border-zinc-900 bg-zinc-950 text-xs text-zinc-200"
                />
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-end border-t border-zinc-900 bg-zinc-900/10 pt-4">
              <Button
                type="submit"
                disabled={saveBibleMutation.isPending}
                className="flex items-center gap-2 bg-white px-6 py-2 text-xs font-semibold text-black hover:bg-zinc-200"
              >
                {saveBibleMutation.isPending ? (
                  <Check className="h-4 w-4 animate-bounce" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>
                  {saveBibleMutation.isPending
                    ? 'Saving...'
                    : 'Save Bible Guidelines'}
                </span>
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  );
}
