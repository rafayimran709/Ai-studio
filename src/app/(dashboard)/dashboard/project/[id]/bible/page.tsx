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

export default function StoryBible() {
  const { storyBibles, updateStoryBible, activeProjectId } = useStoryStore();

  const bible = storyBibles[activeProjectId || ''] || {
    projectId: activeProjectId || '',
    worldSetting: '',
    visualRules: '',
    narrativeTone: '',
    notes: '',
  };

  const [worldSetting, setWorldSetting] = React.useState(bible.worldSetting);
  const [visualRules, setVisualRules] = React.useState(bible.visualRules);
  const [narrativeTone, setNarrativeTone] = React.useState(bible.narrativeTone);
  const [notes, setNotes] = React.useState(bible.notes);
  const [isSaving, setIsSaving] = React.useState(false);

  // Sync state with store if active project changes
  React.useEffect(() => {
    setWorldSetting(bible.worldSetting);
    setVisualRules(bible.visualRules);
    setNarrativeTone(bible.narrativeTone);
    setNotes(bible.notes);
  }, [
    activeProjectId,
    bible.worldSetting,
    bible.visualRules,
    bible.narrativeTone,
    bible.notes,
  ]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Simulate API delay
    setTimeout(() => {
      updateStoryBible(activeProjectId!, {
        worldSetting,
        visualRules,
        narrativeTone,
        notes,
      });
      setIsSaving(false);
      toast.success('Story Bible guidelines saved successfully!');
    }, 400);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-8">
      {/* Title */}
      <div className="flex flex-col justify-between gap-4 border-b border-white/5 pb-6 md:flex-row md:items-center">
        <div>
          <h1 className="mb-2 flex items-center gap-2 text-3xl font-extrabold tracking-tight text-white">
            <BookOpen className="text-glow-cyan h-8 w-8 text-cyan-400" />
            Story Bible
          </h1>
          <p className="text-neutral-400">
            Define world laws, camera boundaries, and narrative guidelines to
            align the generation model context.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <Card className="relative overflow-hidden border-white/5 bg-[#0e0e12]/60">
          <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-cyan-500 to-violet-500" />
          <CardHeader>
            <CardTitle className="text-lg text-white">
              World & Visual Directives
            </CardTitle>
            <CardDescription className="text-xs text-neutral-400">
              The AI generation engine reads these rules as system constraints
              for every scene breakdown.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold tracking-widest text-neutral-400 uppercase">
                World Setting & Lore
              </label>
              <Textarea
                value={worldSetting}
                onChange={(e) => setWorldSetting(e.target.value)}
                placeholder="e.g. A sprawling neon cyberpunk city in the year 2099. Dystopian megacorporation high-rises overlook wet streets. Rain is constant, refracting pink and cyan light."
                className="min-h-[100px] border-white/5 bg-[#131318] text-sm text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold tracking-widest text-neutral-400 uppercase">
                Visual & Cinematic Rules (Veo 3 Guidelines)
              </label>
              <Textarea
                value={visualRules}
                onChange={(e) => setVisualRules(e.target.value)}
                placeholder="e.g. Use anamorphic wide shots. Keep camera angles low to emphasize height. Emphasize shadows and high contrast key lighting. Avoid high-key daylight visual prompts."
                className="min-h-[100px] border-white/5 bg-[#131318] text-sm text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold tracking-widest text-neutral-400 uppercase">
                Narrative Tone & Dialogue Rules
              </label>
              <Textarea
                value={narrativeTone}
                onChange={(e) => setNarrativeTone(e.target.value)}
                placeholder="e.g. Neo-noir mystery. Cynical dialogues, sparse speaking lines, heavy atmospheric visual storytelling. Subdued voiceover delivery."
                className="min-h-[80px] border-white/5 bg-[#131318] text-sm text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold tracking-widest text-neutral-400 uppercase">
                General Writing Constraints
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Do not mention modern 2020s tech names. Refer to mobile devices as cyberdecks or holograms."
                className="min-h-[60px] border-white/5 bg-[#131318] text-sm text-white"
              />
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-end border-t border-white/5 bg-black/10 pt-6">
            <Button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-violet-600 px-6 font-bold text-white hover:from-cyan-400 hover:to-violet-500"
            >
              {isSaving ? (
                <Check className="h-4 w-4 text-cyan-300" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{isSaving ? 'Saving...' : 'Save Bible Guidelines'}</span>
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
