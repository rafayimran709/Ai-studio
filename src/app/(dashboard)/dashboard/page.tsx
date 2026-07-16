'use client';

import { useStoryStore } from '@/hooks/useStoryStore';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  Briefcase,
  Plus,
  Calendar,
  ArrowRight,
  FolderKanban,
  Edit2,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  listProjectsAction,
  createProjectAction,
  updateProjectAction,
  deleteProjectAction,
} from '@/app/actions';

export default function Dashboard() {
  const { setActiveProject } = useStoryStore();

  // Fetch projects from database
  const {
    data: projects = [],
    refetch: refetchProjects,
    isLoading,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: () => listProjectsAction(),
  });

  // Create Project mutation
  const createProjectMutation = useMutation({
    mutationFn: createProjectAction,
    onSuccess: (newProj) => {
      refetchProjects();
      toast.success(`Project "${newProj.name}" created successfully!`);
    },
    onError: (err: Error) => {
      toast.error(`Failed to create project: ${err.message}`);
    },
  });

  // Update Project mutation
  const updateProjectMutation = useMutation({
    mutationFn: ({
      id,
      name,
      description,
    }: {
      id: string;
      name: string;
      description?: string | null;
    }) => updateProjectAction(id, { name, description }),
    onSuccess: (updatedProj) => {
      refetchProjects();
      toast.success(`Project updated to "${updatedProj.name}"!`);
    },
    onError: (err: Error) => {
      toast.error(`Failed to update project: ${err.message}`);
    },
  });

  // Delete Project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: deleteProjectAction,
    onSuccess: () => {
      refetchProjects();
      setActiveProject(null);
      toast.success('Project deleted successfully!');
    },
    onError: (err: Error) => {
      toast.error(`Failed to delete project: ${err.message}`);
    },
  });

  const handleCreateProject = () => {
    const name = prompt('Enter Project Name:');
    if (!name) return;
    const desc = prompt('Enter Project Description (Optional):') || '';
    createProjectMutation.mutate({ name, description: desc });
  };

  const handleRenameProject = (
    id: string,
    currentName: string,
    currentDesc: string | null
  ) => {
    const newName = prompt('Enter New Project Name:', currentName);
    if (!newName) return;
    const newDesc =
      prompt('Enter New Project Description (Optional):', currentDesc || '') ||
      '';
    updateProjectMutation.mutate({ id, name: newName, description: newDesc });
  };

  const handleDeleteProject = (id: string, name: string) => {
    if (
      confirm(
        `Are you sure you want to delete project "${name}"? This action cannot be undone.`
      )
    ) {
      deleteProjectMutation.mutate(id);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-8">
      {/* Welcome Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-900 pb-6 md:flex-row md:items-center">
        <div>
          <h1 className="font-sans text-3xl font-bold tracking-tight text-white">
            Workspace Projects
          </h1>
          <p className="text-sm text-zinc-400">
            Select an existing workspace project or create a new one to begin
            writing scripts.
          </p>
        </div>
        <Button
          onClick={handleCreateProject}
          disabled={createProjectMutation.isPending}
          className="flex items-center gap-2 bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-zinc-200"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[190px] animate-pulse rounded-xl border border-zinc-900 bg-zinc-900/10"
            />
          ))}
        </div>
      ) : (
        /* Projects Grid */
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((proj) => (
            <Card
              key={proj.id}
              className="group relative overflow-hidden border-zinc-800 bg-zinc-900/20 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900/40"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="mb-2 w-fit rounded border border-zinc-800 bg-zinc-900 p-2 text-zinc-400 transition-colors group-hover:text-zinc-200">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  {/* Actions buttons */}
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-zinc-400 hover:text-white"
                      onClick={() =>
                        handleRenameProject(
                          proj.id,
                          proj.name,
                          proj.description
                        )
                      }
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-zinc-400 hover:text-red-400"
                      onClick={() => handleDeleteProject(proj.id, proj.name)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="truncate text-base font-bold text-white transition-colors group-hover:text-zinc-200">
                  {proj.name}
                </CardTitle>
                <CardDescription className="text-zinc-650 font-mono text-[10px]">
                  ID: {proj.id}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="line-clamp-2 min-h-[32px] text-xs leading-relaxed text-zinc-400">
                  {proj.description || 'No description provided.'}
                </p>
              </CardContent>
              <CardFooter className="text-zinc-550 flex items-center justify-between border-t border-zinc-900/60 pt-3 text-[10px]">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Today</span>
                </div>
                <Link
                  href={`/dashboard/project/${proj.id}`}
                  onClick={() => setActiveProject(proj.id)}
                  className="flex items-center gap-1 font-semibold text-white hover:underline"
                >
                  <span>Open Workspace</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </CardFooter>
            </Card>
          ))}

          {/* Create Project card */}
          <button
            onClick={handleCreateProject}
            className="group flex min-h-[190px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 p-6 text-center transition-colors hover:border-zinc-700 hover:bg-zinc-900/10"
          >
            <FolderKanban className="text-zinc-650 mb-2 h-6 w-6 transition-colors group-hover:text-zinc-400" />
            <span className="text-xs font-medium text-zinc-400 transition-colors group-hover:text-zinc-200">
              Create Project
            </span>
            <span className="text-zinc-650 mt-1 max-w-[150px] text-[10px]">
              Start a new visual scripting directory
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
