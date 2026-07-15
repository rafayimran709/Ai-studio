'use client';

import * as React from 'react';
import { useStoryStore } from '@/hooks/useStoryStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Users, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export default function CharacterManager() {
  const { characters, addCharacter, activeProjectId } = useStoryStore();
  const [isOpen, setIsOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [role, setRole] = React.useState('Protagonist');
  const [physicalDescription, setPhysicalDescription] = React.useState('');
  const [personalityTraits, setPersonalityTraits] = React.useState('');

  const activeCharacters = characters[activeProjectId || ''] || [];

  const handleSaveCharacter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !physicalDescription.trim()) {
      toast.warning(
        'Name and physical description are required for Veo 3 continuity!'
      );
      return;
    }
    addCharacter(activeProjectId!, {
      name,
      role,
      physicalDescription,
      personalityTraits,
    });
    setIsOpen(false);
    setName('');
    setRole('Protagonist');
    setPhysicalDescription('');
    setPersonalityTraits('');
    toast.success(`Character "${name}" registered for continuity tracking!`);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-8">
      {/* Title */}
      <div className="flex flex-col justify-between gap-4 border-b border-white/5 pb-6 md:flex-row md:items-center">
        <div>
          <h1 className="mb-2 flex items-center gap-2 text-3xl font-extrabold tracking-tight text-white">
            <Users className="text-glow-cyan h-8 w-8 text-cyan-400" />
            Character Manager
          </h1>
          <p className="text-neutral-400">
            Define character details to preserve look-and-feel consistency
            across script visual directions.
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger className="flex h-8 cursor-pointer items-center gap-2 rounded-lg border border-transparent bg-cyan-500 px-2.5 text-sm font-semibold text-black select-none hover:bg-cyan-400">
            <UserPlus className="h-4 w-4" />
            Add Character
          </DialogTrigger>
          <DialogContent className="border-white/10 bg-[#0e0e12] text-neutral-100">
            <DialogHeader>
              <DialogTitle className="text-white">
                New Character Registry
              </DialogTitle>
              <DialogDescription className="text-neutral-400">
                Visual details are crucial for text-to-video alignment in Veo 3
                generation.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveCharacter} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold tracking-widest text-neutral-400 uppercase">
                  Character Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jax Vance"
                  className="border-white/5 bg-[#131318] text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold tracking-widest text-neutral-400 uppercase">
                  Casting Role
                </label>
                <Select
                  value={role}
                  onValueChange={(val) => setRole(val || '')}
                >
                  <SelectTrigger className="border-white/5 bg-[#131318] text-white">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#131318] text-white">
                    <SelectItem value="Protagonist">
                      Protagonist (Hero)
                    </SelectItem>
                    <SelectItem value="Antagonist">
                      Antagonist (Villain)
                    </SelectItem>
                    <SelectItem value="Deuteragonist">
                      Deuteragonist (Sidekick)
                    </SelectItem>
                    <SelectItem value="Narrator">Narrator</SelectItem>
                    <SelectItem value="Supporting">Supporting Cast</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold tracking-widest text-neutral-400 uppercase">
                  Physical Traits (Veo Prompt Details)
                </label>
                <Textarea
                  value={physicalDescription}
                  onChange={(e) => setPhysicalDescription(e.target.value)}
                  placeholder="e.g. Late 30s, tall athletic build, cybernetic silver hair, green leather jacket, scars on jawline."
                  className="min-h-[80px] border-white/5 bg-[#131318] text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold tracking-widest text-neutral-400 uppercase">
                  Personality & speech habits
                </label>
                <Textarea
                  value={personalityTraits}
                  onChange={(e) => setPersonalityTraits(e.target.value)}
                  placeholder="e.g. cynical attitude, whispers dialogues, frequently checks wrist hologram watch."
                  className="min-h-[60px] border-white/5 bg-[#131318] text-white"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-cyan-500 font-bold text-black hover:bg-cyan-400"
              >
                Save Character Context
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid List */}
      {activeCharacters.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-[#0e0e12]/30 py-16 text-center">
          <Users className="mx-auto mb-3 h-10 w-10 text-neutral-600" />
          <h3 className="mb-1 text-base font-bold text-white">
            No Characters Defined
          </h3>
          <p className="mx-auto max-w-sm text-xs text-neutral-500">
            Create characters to enable narrative continuity prompts that keep
            physical consistency.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {activeCharacters.map((char) => (
            <Card
              key={char.id}
              className="group relative overflow-hidden border-white/5 bg-[#0e0e12]/60 transition-all duration-300 hover:border-violet-500/20"
            >
              <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-violet-500 to-cyan-500 opacity-0 transition-opacity group-hover:opacity-100" />
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div>
                  <CardTitle className="text-lg font-bold text-white">
                    {char.name}
                  </CardTitle>
                  <CardDescription className="mt-0.5 text-xs font-semibold text-cyan-400 uppercase">
                    {char.role}
                  </CardDescription>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-violet-500/20 bg-violet-500/10 text-xs font-extrabold text-violet-400">
                  {char.name.substring(0, 2).toUpperCase()}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5 rounded-lg border border-white/5 bg-[#07070a] p-3">
                  <span className="block text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
                    Veo Prompting Visuals
                  </span>
                  <p className="text-xs leading-relaxed text-neutral-300">
                    {char.physicalDescription}
                  </p>
                </div>
                {char.personalityTraits && (
                  <div className="space-y-1">
                    <span className="block text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
                      Narrative Traits
                    </span>
                    <p className="text-xs text-neutral-400">
                      {char.personalityTraits}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
