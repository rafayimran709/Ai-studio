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
import { Briefcase, Plus, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function Dashboard() {
  const { projects, addProject, setActiveProject } = useStoryStore();

  const handleCreateProject = () => {
    const name = prompt('Enter Project Name:');
    if (!name) return;
    const desc =
      prompt('Enter Project Description (Optional):') ||
      'A custom video script timeline.';
    addProject(name, desc);
    toast.success(`Project "${name}" created successfully!`);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-8">
      {/* Welcome Banner */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-white">
            Workspace Home
          </h1>
          <p className="text-neutral-400">
            Create or select a story project to write camera-ready scripts.
          </p>
        </div>
        <Button
          onClick={handleCreateProject}
          className="flex items-center gap-2 bg-cyan-500 font-semibold text-black hover:bg-cyan-400"
        >
          <Plus className="h-4 w-4" />
          Create New Project
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((proj) => (
          <Card
            key={proj.id}
            className="group relative overflow-hidden border-white/5 bg-[#0e0e12]/60 transition-all duration-300 hover:border-cyan-500/20"
          >
            <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-cyan-500 to-violet-500 opacity-0 transition-opacity group-hover:opacity-100" />
            <CardHeader>
              <div className="mb-3 w-fit rounded-lg bg-white/5 p-2 text-neutral-400">
                <Briefcase className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg font-bold text-white transition-colors group-hover:text-cyan-400">
                {proj.name}
              </CardTitle>
              <CardDescription className="text-xs text-neutral-400">
                ID: {proj.id}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-2 text-sm text-neutral-400">
                {proj.description || 'No description provided.'}
              </p>
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t border-white/5 pt-4 text-xs text-neutral-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>Created today</span>
              </div>
              <Link
                href={`/dashboard/project/${proj.id}`}
                onClick={() => setActiveProject(proj.id)}
                className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:underline"
              >
                <span>Open Workspace</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
