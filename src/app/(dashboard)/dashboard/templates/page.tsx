'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { listTemplatesAction } from '@/app/actions';

export default function TemplatesPage() {
  // Fetch templates from database
  const { data: dbTemplates = [], isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => listTemplatesAction(),
  });

  const handleUseTemplate = (name: string) => {
    toast.success(
      `Template "${name}" active! Go to the Script Writer to begin.`
    );
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-8">
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-800 pb-6 md:flex-row md:items-center">
        <div>
          <h1 className="font-sans text-3xl font-bold tracking-tight text-white">
            Prompt Templates
          </h1>
          <p className="text-sm text-zinc-400">
            Speed up your scripting workflow with predefined structure templates
            optimized for Veo 3.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[200px] animate-pulse rounded-xl border border-zinc-900 bg-zinc-900/10"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dbTemplates.map((tmpl) => (
            <Card
              key={tmpl.id}
              className="flex flex-col justify-between border-zinc-800 bg-zinc-900/40 transition-colors hover:border-zinc-700"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-400 uppercase">
                    Veo 3
                  </span>
                  <Sparkles className="h-4 w-4 text-zinc-500" />
                </div>
                <CardTitle className="mt-3 text-lg text-white">
                  {tmpl.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 text-sm leading-relaxed text-zinc-400">
                  {tmpl.description || 'Custom template outline.'}
                </p>
              </CardContent>
              <CardFooter className="border-t border-zinc-800/60 pt-4">
                <Button
                  onClick={() => handleUseTemplate(tmpl.name)}
                  className="w-full bg-white text-xs font-semibold text-black hover:bg-zinc-200"
                >
                  Use Template
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
