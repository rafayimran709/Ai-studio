'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Eye, Film } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { listGenerationHistoryAction, listProjectsAction } from '@/app/actions';
import { useStoryStore } from '@/hooks/useStoryStore';

export default function HistoryPage() {
  const { activeProjectId, setActiveProject } = useStoryStore();

  // Load project list for project filtering
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => listProjectsAction(),
  });

  const activeProject = projects.find((p) => p.id === activeProjectId);

  // Fetch generation history from database
  const { data: history = [], isLoading } = useQuery({
    queryKey: ['generationHistory', activeProjectId],
    queryFn: () =>
      activeProjectId
        ? listGenerationHistoryAction(activeProjectId)
        : Promise.resolve([]),
    enabled: !!activeProjectId,
  });

  const activeProjectName = activeProject ? activeProject.name : '';

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-8">
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-800 pb-6 md:flex-row md:items-center">
        <div>
          <h1 className="font-sans text-3xl font-bold tracking-tight text-white">
            Generation History
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Browse and review your previously generated visual script concepts.
          </p>
        </div>
      </div>

      {activeProjectId ? (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span>Active Project:</span>
            <span className="font-semibold text-white">
              {activeProjectName}
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-[120px] animate-pulse rounded-xl border border-zinc-900 bg-zinc-900/10"
                />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950/30 py-16 text-center">
              <Film className="text-zinc-650 mb-4 h-12 w-12" />
              <h3 className="mb-1 text-sm font-semibold text-zinc-300">
                No generation history.
              </h3>
              <p className="max-w-xs text-xs leading-relaxed text-zinc-500">
                Your generated scripts will appear here. Go to the Script Writer
                to generate a script.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {history.map((item) => (
                <Card
                  key={item.id}
                  className="border-zinc-800 bg-zinc-900/40 transition-colors hover:border-zinc-700"
                >
                  <CardHeader className="flex flex-row items-start justify-between pb-3">
                    <div className="space-y-1">
                      <CardTitle className="max-w-[280px] truncate text-base text-white">
                        Script Generation
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 text-xs text-zinc-500">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Status: {item.status}</span>
                        <span>•</span>
                        <span>
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 border border-zinc-800 text-xs text-zinc-400 hover:text-white"
                    >
                      <Eye className="mr-1.5 h-3.5 w-3.5" />
                      View
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-2 rounded-lg border border-zinc-800/40 bg-zinc-950/20 p-3 text-xs leading-relaxed text-zinc-400 italic">
                      &quot;{item.prompt}&quot;
                    </p>
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
            Please select a project to view its generation history.
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
