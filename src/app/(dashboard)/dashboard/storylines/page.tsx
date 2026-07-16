'use client';

import * as React from 'react';
import { useStoryStore } from '@/hooks/useStoryStore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen, Film, ArrowRight, Edit2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  listStorylinesAction,
  createStorylineAction,
  updateStorylineAction,
  deleteStorylineAction,
  listProjectsAction,
} from '@/app/actions';
import { toast } from 'sonner';

export default function StorylinesPage() {
  const { activeProjectId, setActiveProject } = useStoryStore();

  // Load project list as fallback or selection
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => listProjectsAction(),
  });

  const activeProject = projects.find((p) => p.id === activeProjectId);

  // Load storylines for the active project
  const {
    data: activeStorylines = [],
    refetch: refetchStorylines,
    isLoading,
  } = useQuery({
    queryKey: ['storylines', activeProjectId],
    queryFn: () =>
      activeProjectId
        ? listStorylinesAction(activeProjectId)
        : Promise.resolve([]),
    enabled: !!activeProjectId,
  });

  // Create Storyline mutation
  const createStorylineMutation = useMutation({
    mutationFn: createStorylineAction,
    onSuccess: () => {
      refetchStorylines();
      toast.success('Storyline thread created successfully!');
    },
    onError: (err: Error) => {
      toast.error(`Failed to create storyline: ${err.message}`);
    },
  });

  // Update Storyline mutation
  const updateStorylineMutation = useMutation({
    mutationFn: ({
      id,
      title,
      synopsis,
    }: {
      id: string;
      title: string;
      synopsis?: string | null;
    }) => updateStorylineAction(id, { title, synopsis }),
    onSuccess: () => {
      refetchStorylines();
      toast.success('Storyline thread updated!');
    },
    onError: (err: Error) => {
      toast.error(`Failed to update storyline: ${err.message}`);
    },
  });

  // Delete Storyline mutation
  const deleteStorylineMutation = useMutation({
    mutationFn: deleteStorylineAction,
    onSuccess: () => {
      refetchStorylines();
      toast.success('Storyline thread deleted!');
    },
    onError: (err: Error) => {
      toast.error(`Failed to delete storyline: ${err.message}`);
    },
  });

  const handleCreateStoryline = () => {
    if (!activeProjectId) return;
    const title = prompt('Enter Storyline Title:');
    if (!title) return;
    const synopsis = prompt('Enter Storyline Synopsis (Optional):') || '';
    createStorylineMutation.mutate({
      project_id: activeProjectId,
      title,
      synopsis,
    });
  };

  const handleRenameStoryline = (
    id: string,
    currentTitle: string,
    currentSynopsis: string | null
  ) => {
    const newTitle = prompt('Enter New Storyline Title:', currentTitle);
    if (!newTitle) return;
    const newSynopsis =
      prompt(
        'Enter New Storyline Synopsis (Optional):',
        currentSynopsis || ''
      ) || '';
    updateStorylineMutation.mutate({
      id,
      title: newTitle,
      synopsis: newSynopsis,
    });
  };

  const handleDeleteStoryline = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete storyline "${title}"?`)) {
      deleteStorylineMutation.mutate(id);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-8">
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-800 pb-6 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Storylines
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Manage continuous narrative threads and episodes for your video
            projects.
          </p>
        </div>
        {activeProjectId && (
          <Button
            onClick={handleCreateStoryline}
            disabled={createStorylineMutation.isPending}
            className="flex items-center gap-2 bg-white text-black hover:bg-zinc-200"
          >
            <Plus className="h-4 w-4" />
            Create Storyline
          </Button>
        )}
      </div>

      {activeProject ? (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span>Active Project:</span>
            <span className="font-semibold text-white">
              {activeProject.name}
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-[150px] animate-pulse rounded-xl border border-zinc-900 bg-zinc-900/10"
                />
              ))}
            </div>
          ) : activeStorylines.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950/30 py-16 text-center">
              <BookOpen className="text-zinc-650 mb-4 h-12 w-12" />
              <h3 className="mb-1 text-lg font-semibold text-white">
                No Storylines Created
              </h3>
              <p className="mb-4 max-w-xs text-sm text-zinc-500">
                Create a storyline thread to chain episodes and keep narrative
                continuity.
              </p>
              <Button
                onClick={handleCreateStoryline}
                className="bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-zinc-200"
              >
                Create First Storyline
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {activeStorylines.map((line) => (
                <Card
                  key={line.id}
                  className="group border-zinc-800 bg-zinc-900/40 transition-colors hover:border-zinc-700"
                >
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div className="space-y-1">
                      <CardTitle className="text-lg text-white">
                        {line.title}
                      </CardTitle>
                      <CardDescription className="text-zinc-500">
                        Continuous narrative thread
                      </CardDescription>
                    </div>
                    {/* Inline Actions */}
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-zinc-400 hover:text-white"
                        onClick={() =>
                          handleRenameStoryline(
                            line.id,
                            line.title,
                            line.synopsis
                          )
                        }
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-zinc-400 hover:text-red-400"
                        onClick={() =>
                          handleDeleteStoryline(line.id, line.title)
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="min-h-[40px] text-sm leading-relaxed text-zinc-400">
                      {line.synopsis || 'No synopsis provided.'}
                    </p>
                    <div className="flex items-center justify-between border-t border-zinc-800/60 pt-4">
                      <span className="font-mono text-xs text-zinc-500">
                        Status: {line.status}
                      </span>
                      <Link
                        href={`/dashboard/project/${activeProjectId}`}
                        className="flex items-center gap-1 text-xs font-medium text-white hover:underline"
                      >
                        <span>Open Editor</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950/30 py-16 text-center">
          <Film className="text-zinc-650 mb-4 h-12 w-12" />
          <h3 className="mb-1 text-lg font-semibold text-white">
            Choose a Project
          </h3>
          <p className="mb-6 max-w-xs text-sm text-zinc-500">
            Please select a project to view and manage its storylines.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {projects.map((proj) => (
              <Button
                key={proj.id}
                variant="outline"
                onClick={() => setActiveProject(proj.id)}
                className="border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white"
              >
                {proj.name}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
