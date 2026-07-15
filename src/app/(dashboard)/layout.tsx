'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStoryStore } from '@/hooks/useStoryStore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Film,
  ChevronLeft,
  BookOpen,
  Users,
  CreditCard,
  PlusCircle,
  Briefcase,
  LayoutDashboard,
  Sparkles,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const {
    activeProjectId,
    projects,
    setActiveProject,
    isSidebarCollapsed,
    setSidebarCollapsed,
    creditsRemaining,
    subscriptionPlan,
    addProject,
  } = useStoryStore();

  const handleCreateProject = () => {
    const name = prompt('Enter Project Name:');
    if (!name) return;
    addProject(name, 'New narrative storyline script.');
    toast.success(`Project "${name}" created!`);
  };

  const activeProject = projects.find((p) => p.id === activeProjectId);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0c] font-sans text-neutral-100">
      {/* Sidebar */}
      <aside
        className={cn(
          'z-35 flex flex-col border-r border-white/5 bg-[#0d0d11]/80 backdrop-blur-md transition-all duration-300',
          isSidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/5 px-4">
          <Link href="/" className="flex items-center gap-2 overflow-hidden">
            <Film className="text-glow-cyan h-5 w-5 shrink-0 text-cyan-400" />
            {!isSidebarCollapsed && (
              <span className="bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-sm font-bold tracking-tight text-white">
                AI Story Studio
              </span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
            className="text-neutral-400 hover:text-white"
          >
            <ChevronLeft
              className={cn(
                'h-4 w-4 transition-transform',
                isSidebarCollapsed && 'rotate-180'
              )}
            />
          </Button>
        </div>

        {/* Navigation list */}
        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-6">
            {/* Core Workspace Section */}
            <div>
              {!isSidebarCollapsed && (
                <div className="mb-2 px-3 text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
                  Studio Workspace
                </div>
              )}
              <nav className="space-y-1">
                <Link href="/dashboard" passHref>
                  <span
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      pathname === '/dashboard'
                        ? 'bg-cyan-500/10 text-cyan-400'
                        : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <LayoutDashboard className="h-4 w-4 shrink-0" />
                    {!isSidebarCollapsed && <span>Dashboard Overview</span>}
                  </span>
                </Link>

                <Link href="/dashboard/billing" passHref>
                  <span
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      pathname === '/dashboard/billing'
                        ? 'bg-cyan-500/10 text-cyan-400'
                        : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <CreditCard className="h-4 w-4 shrink-0" />
                    {!isSidebarCollapsed && <span>Credits & Plans</span>}
                  </span>
                </Link>
              </nav>
            </div>

            {/* Project Navigation (Displays active project configuration tools) */}
            {activeProjectId && activeProject && (
              <div>
                {!isSidebarCollapsed && (
                  <div className="mb-2 px-3 text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
                    Active Project: {activeProject.name}
                  </div>
                )}
                <nav className="space-y-1">
                  <Link href={`/dashboard/project/${activeProjectId}`} passHref>
                    <span
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        pathname === `/dashboard/project/${activeProjectId}`
                          ? 'border-l-2 border-violet-500 bg-violet-500/10 text-violet-400'
                          : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                      )}
                    >
                      <Film className="h-4 w-4 shrink-0" />
                      {!isSidebarCollapsed && <span>Script Writer</span>}
                    </span>
                  </Link>

                  <Link
                    href={`/dashboard/project/${activeProjectId}/bible`}
                    passHref
                  >
                    <span
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        pathname ===
                          `/dashboard/project/${activeProjectId}/bible`
                          ? 'border-l-2 border-violet-500 bg-violet-500/10 text-violet-400'
                          : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                      )}
                    >
                      <BookOpen className="h-4 w-4 shrink-0" />
                      {!isSidebarCollapsed && <span>Story Bible</span>}
                    </span>
                  </Link>

                  <Link
                    href={`/dashboard/project/${activeProjectId}/characters`}
                    passHref
                  >
                    <span
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        pathname ===
                          `/dashboard/project/${activeProjectId}/characters`
                          ? 'border-l-2 border-violet-500 bg-violet-500/10 text-violet-400'
                          : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                      )}
                    >
                      <Users className="h-4 w-4 shrink-0" />
                      {!isSidebarCollapsed && <span>Character Manager</span>}
                    </span>
                  </Link>
                </nav>
              </div>
            )}

            {/* Projects Switcher list */}
            <div>
              {!isSidebarCollapsed && (
                <div className="mb-2 flex items-center justify-between px-3">
                  <span className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
                    Switch Project
                  </span>
                  <button
                    onClick={handleCreateProject}
                    className="text-neutral-400 transition-colors hover:text-white"
                  >
                    <PlusCircle className="h-3 w-3" />
                  </button>
                </div>
              )}
              <nav className="space-y-1">
                {projects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => {
                      setActiveProject(proj.id);
                      router.push(`/dashboard/project/${proj.id}`);
                      toast.info(`Switched to "${proj.name}"`);
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-1.5 text-left text-xs font-medium transition-colors',
                      activeProjectId === proj.id
                        ? 'bg-cyan-500/5 text-cyan-400'
                        : 'text-neutral-500 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <Briefcase className="h-3.5 w-3.5 shrink-0" />
                    {!isSidebarCollapsed && (
                      <span className="truncate">{proj.name}</span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </ScrollArea>

        {/* Sidebar Footer Credit Balance Info */}
        <div className="shrink-0 border-t border-white/5 bg-black/20 p-4">
          <Link href="/dashboard/billing">
            <div className="flex w-full cursor-pointer items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-white/5">
              <div className="shrink-0 rounded-lg bg-gradient-to-br from-cyan-500/10 to-violet-500/10 p-2 text-cyan-400">
                <Zap className="text-glow-cyan h-4 w-4" />
              </div>
              {!isSidebarCollapsed && (
                <div className="overflow-hidden">
                  <div className="mb-1 text-[10px] leading-none font-bold tracking-widest text-neutral-500 uppercase">
                    Credits Left
                  </div>
                  <div className="text-sm leading-none font-extrabold text-white">
                    {creditsRemaining} Credits
                  </div>
                </div>
              )}
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/5 bg-[#0d0d11]/40 px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {activeProject ? (
              <div className="flex items-center gap-2">
                <span className="rounded border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-xs font-semibold text-cyan-400 uppercase">
                  Project
                </span>
                <h2 className="text-sm font-bold tracking-tight text-white">
                  {activeProject.name}
                </h2>
              </div>
            ) : (
              <span className="text-sm text-neutral-400">
                Select or Create a Project
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Link href="/dashboard/billing">
              <div className="flex items-center gap-1.5 rounded-full border border-white/5 bg-white/5 px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:bg-white/10">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span>
                  Plan:{' '}
                  <span className="text-cyan-400 capitalize">
                    {subscriptionPlan.replace('_', ' ')}
                  </span>
                </span>
              </div>
            </Link>
            <Separator orientation="vertical" className="h-6 bg-white/5" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-violet-600 text-xs font-bold text-white">
                ME
              </div>
              <span className="hidden text-xs font-semibold text-neutral-300 md:inline">
                Creative Studio
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable Content View */}
        <main className="relative flex-1 overflow-y-auto bg-[#070709]">
          {children}
        </main>
      </div>
    </div>
  );
}
