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
import { Users, UserPlus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  listCharactersAction,
  createCharacterAction,
  updateCharacterAction,
  deleteCharacterAction,
} from '@/app/actions';
import { DbCharacter } from '@/lib/database/types';

export default function CharacterManager() {
  const { activeProjectId } = useStoryStore();
  const [isOpen, setIsOpen] = React.useState(false);
  const [editCharId, setEditCharId] = React.useState<string | null>(null);

  // Form states
  const [name, setName] = React.useState('');
  const [role, setRole] = React.useState('Protagonist');
  const [physicalDescription, setPhysicalDescription] = React.useState('');
  const [age, setAge] = React.useState<number>(30);
  const [notes, setNotes] = React.useState('');

  // Fetch characters
  const {
    data: activeCharacters = [],
    refetch: refetchCharacters,
    isLoading,
  } = useQuery({
    queryKey: ['characters', activeProjectId],
    queryFn: () =>
      activeProjectId
        ? listCharactersAction(activeProjectId)
        : Promise.resolve([]),
    enabled: !!activeProjectId,
  });

  // Create Character mutation
  const createCharacterMutation = useMutation({
    mutationFn: createCharacterAction,
    onSuccess: () => {
      refetchCharacters();
      setIsOpen(false);
      resetForm();
      toast.success('Character registered successfully!');
    },
    onError: (err: Error) => {
      toast.error(`Failed to create character: ${err.message}`);
    },
  });

  // Update Character mutation
  const updateCharacterMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Omit<DbCharacter, 'id' | 'created_at'>;
    }) => updateCharacterAction(id, data),
    onSuccess: () => {
      refetchCharacters();
      setIsOpen(false);
      resetForm();
      toast.success('Character updated successfully!');
    },
    onError: (err: Error) => {
      toast.error(`Failed to update character: ${err.message}`);
    },
  });

  // Delete Character mutation
  const deleteCharacterMutation = useMutation({
    mutationFn: deleteCharacterAction,
    onSuccess: () => {
      refetchCharacters();
      toast.success('Character deleted!');
    },
    onError: (err: Error) => {
      toast.error(`Failed to delete character: ${err.message}`);
    },
  });

  const resetForm = () => {
    setEditCharId(null);
    setName('');
    setRole('Protagonist');
    setPhysicalDescription('');
    setAge(30);
    setNotes('');
  };

  const handleOpenEdit = (char: DbCharacter) => {
    setEditCharId(char.id);
    setName(char.name);
    setRole(char.personality || 'Protagonist'); // mapping local role logic or personality
    setPhysicalDescription(char.appearance);
    setAge(char.age || 30);
    setNotes(char.notes || '');
    setIsOpen(true);
  };

  const handleSaveCharacter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !physicalDescription.trim()) {
      toast.warning('Name and physical description are required!');
      return;
    }

    const payload = {
      project_id: activeProjectId!,
      name,
      appearance: physicalDescription,
      personality: role, // saving role context inside personality
      age: age,
      notes: notes,
    };

    if (editCharId) {
      updateCharacterMutation.mutate({ id: editCharId, data: payload });
    } else {
      createCharacterMutation.mutate(payload);
    }
  };

  const handleDeleteCharacter = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete character "${name}"?`)) {
      deleteCharacterMutation.mutate(id);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-900 pb-6 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-white">
            <Users className="h-7 w-7 text-zinc-400" />
            Character Manager
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Define character visual details to preserve look-and-feel
            consistency across AI video scripts.
          </p>
        </div>

        <Dialog
          open={isOpen}
          onOpenChange={(val) => {
            setIsOpen(val);
            if (!val) resetForm();
          }}
        >
          <DialogTrigger className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-zinc-800 bg-white px-4 text-xs font-semibold text-black select-none hover:bg-zinc-200">
            <UserPlus className="h-4 w-4" />
            Add Character
          </DialogTrigger>
          <DialogContent className="max-w-md border-zinc-900 bg-zinc-950 text-zinc-100">
            <DialogHeader>
              <DialogTitle className="text-base text-white">
                {editCharId ? 'Edit Character' : 'New Character Registry'}
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500">
                Visual details are crucial for text-to-video alignment in Veo 3
                generation.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveCharacter} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                  Character Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jax Vance"
                  className="border-zinc-900 bg-zinc-950 text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                    Casting Role
                  </label>
                  <Select
                    value={role}
                    onValueChange={(val) => setRole(val || '')}
                  >
                    <SelectTrigger className="border-zinc-900 bg-zinc-950 text-xs text-white">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent className="border-zinc-900 bg-zinc-950 text-white">
                      <SelectItem value="Protagonist" className="text-xs">
                        Protagonist (Hero)
                      </SelectItem>
                      <SelectItem value="Antagonist" className="text-xs">
                        Antagonist (Villain)
                      </SelectItem>
                      <SelectItem value="Deuteragonist" className="text-xs">
                        Deuteragonist
                      </SelectItem>
                      <SelectItem value="Narrator" className="text-xs">
                        Narrator
                      </SelectItem>
                      <SelectItem value="Supporting" className="text-xs">
                        Supporting Cast
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                    Age
                  </label>
                  <Input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                    className="border-zinc-900 bg-zinc-950 text-xs text-white"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                  Physical Traits (Veo Prompt Details)
                </label>
                <Textarea
                  value={physicalDescription}
                  onChange={(e) => setPhysicalDescription(e.target.value)}
                  placeholder="e.g. Late 30s, tall athletic build, cybernetic silver hair, green leather jacket, scars on jawline."
                  className="min-h-[80px] border-zinc-900 bg-zinc-950 text-xs text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                  Notes
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Speaks slowly, cynical attitude."
                  className="min-h-[60px] border-zinc-900 bg-zinc-950 text-xs text-white"
                />
              </div>
              <Button
                type="submit"
                disabled={
                  createCharacterMutation.isPending ||
                  updateCharacterMutation.isPending
                }
                className="w-full bg-white py-2 text-xs font-semibold text-black hover:bg-zinc-200"
              >
                Save Character Context
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-[200px] animate-pulse rounded-xl border border-zinc-900 bg-zinc-900/10"
            />
          ))}
        </div>
      ) : activeCharacters.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950/30 py-16 text-center">
          <Users className="mx-auto mb-4 h-10 w-10 text-zinc-700" />
          <h3 className="mb-1 text-sm font-semibold text-zinc-300">
            No Characters Defined
          </h3>
          <p className="mx-auto max-w-sm text-xs leading-relaxed text-zinc-500">
            Create characters to enable narrative continuity prompts that
            preserve physical consistency across script variants.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {activeCharacters.map((char) => (
            <Card
              key={char.id}
              className="group relative overflow-hidden border-zinc-800 bg-zinc-900/20 transition-all duration-200 hover:border-zinc-700"
            >
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div className="space-y-1">
                  <CardTitle className="text-lg text-white">
                    {char.name}
                  </CardTitle>
                  <CardDescription className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                    {char.personality || 'Protagonist'}{' '}
                    {char.age ? `(Age: ${char.age})` : ''}
                  </CardDescription>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-zinc-400 hover:text-white"
                    onClick={() => handleOpenEdit(char)}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-zinc-400 hover:text-red-400"
                    onClick={() => handleDeleteCharacter(char.id, char.name)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1 rounded border border-zinc-900 bg-zinc-950/40 p-3">
                  <span className="block text-[8px] font-bold tracking-widest text-zinc-500 uppercase">
                    Veo Prompting Visuals
                  </span>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-300">
                    {char.appearance}
                  </p>
                </div>
                {char.notes && (
                  <div className="space-y-1">
                    <span className="block text-[8px] font-bold tracking-widest text-zinc-500 uppercase">
                      Narrative Notes
                    </span>
                    <p className="text-xs leading-relaxed text-zinc-400">
                      {char.notes}
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
