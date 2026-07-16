'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStoryStore } from '@/hooks/useStoryStore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useQuery, useMutation } from '@tanstack/react-query';
import { listProjectsAction, createProjectAction } from '@/app/actions';
import {
  Film,
  ChevronLeft,
  BookOpen,
  Users,
  LayoutDashboard,
  Sparkles,
  History,
  LayoutGrid,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  FolderOpen,
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
    setActiveProject,
    isSidebarCollapsed,
    setSidebarCollapsed,
    creditsRemaining,
    subscriptionPlan,
  } = useStoryStore();

  const [searchFocused, setSearchFocused] = React.useState(false);
  const [isDark, setIsDark] = React.useState(true);

  // Fetch projects from database via React Query
  const { data: projects = [], refetch: refetchProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => listProjectsAction(),
  });

  // Project creation mutation
  const createProjectMutation = useMutation({
    mutationFn: createProjectAction,
    onSuccess: (newProj) => {
      refetchProjects();
      setActiveProject(newProj.id);
      router.push(`/dashboard/project/${newProj.id}`);
      toast.success(`Project "${newProj.name}" created!`);
    },
    onError: (err: Error) => {
      toast.error(`Failed to create project: ${err.message}`);
    },
  });

  const handleCreateProject = () => {
    const name = prompt('Enter Project Name:');
    if (!name) return;
    createProjectMutation.mutate({
      name,
      description: 'A premium narrative video script.',
    });
  };

  const activeProject = projects.find((p) => p.id === activeProjectId);

  // Sync first project if no active project is set
  React.useEffect(() => {
    if (!activeProjectId && projects.length > 0) {
      setActiveProject(projects[0].id);
    }
  }, [projects, activeProjectId, setActiveProject]);

  const mainNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Storylines', href: '/dashboard/storylines', icon: FolderOpen },
    { name: 'History', href: '/dashboard/history', icon: History },
    { name: 'Templates', href: '/dashboard/templates', icon: LayoutGrid },
  ];

  // Define active project sub-navigation links
  const projectNavItems = activeProjectId
    ? [
        {
          name: 'Script Writer',
          href: `/dashboard/project/${activeProjectId}`,
          icon: Film,
        },
        {
          name: 'Story Bible',
          href: `/dashboard/project/${activeProjectId}/bible`,
          icon: BookOpen,
        },
        {
          name: 'Character Manager',
          href: `/dashboard/project/${activeProjectId}/characters`,
          icon: Users,
        },
      ]
    : [];

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 font-sans text-zinc-100 antialiased selection:bg-zinc-800 selection:text-white">
      {/* Left Sidebar */}
      <aside
        className={cn(
          'z-30 flex flex-col border-r border-zinc-900 bg-zinc-900/20 backdrop-blur-sm transition-all duration-300',
          isSidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Sidebar Header: Logo & Collapse button */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-900 px-4">
          <Link href="/" className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-white text-black">
              <Film className="h-3.5 w-3.5" />
            </div>
            {!isSidebarCollapsed && (
              <span className="font-sans text-sm font-semibold tracking-tight text-white">
                Story Studio
              </span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
            className="h-7 w-7 text-zinc-400 hover:bg-zinc-900 hover:text-white"
            aria-label={
              isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
            }
          >
            <ChevronLeft
              className={cn(
                'h-4 w-4 transition-transform',
                isSidebarCollapsed && 'rotate-180'
              )}
            />
          </Button>
        </div>

        {/* Project Selector - Sleek & Modern */}
        {!isSidebarCollapsed && (
          <div className="px-3 pt-4">
            <div className="relative">
              <select
                value={activeProjectId || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'create-new') {
                    handleCreateProject();
                  } else {
                    setActiveProject(val || null);
                    router.push(`/dashboard/project/${val}`);
                    toast.info(
                      `Switched to "${projects.find((p) => p.id === val)?.name}"`
                    );
                  }
                }}
                className="w-full appearance-none rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 pr-8 text-xs font-medium text-zinc-300 transition-all outline-none hover:bg-zinc-900 focus:border-zinc-700"
              >
                <option value="" disabled>
                  Select Project...
                </option>
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.name}
                  </option>
                ))}
                <option value="create-new">+ Create New Project</option>
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
            </div>
          </div>
        )}

        {/* Scrollable Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-6">
            {/* Main Navigation */}
            <div>
              {!isSidebarCollapsed && (
                <div className="mb-2 px-3 font-sans text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                  Navigation
                </div>
              )}
              <nav className="space-y-1">
                {mainNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.name} href={item.href} passHref>
                      <span
                        className={cn(
                          'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                          isActive
                            ? 'bg-zinc-900 font-semibold text-white'
                            : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200'
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!isSidebarCollapsed && <span>{item.name}</span>}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Active Project Tools */}
            {activeProjectId && activeProject && (
              <div>
                {!isSidebarCollapsed && (
                  <div className="mb-2 truncate px-3 font-sans text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                    Project: {activeProject.name}
                  </div>
                )}
                <nav className="space-y-1">
                  {projectNavItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link key={item.name} href={item.href} passHref>
                        <span
                          className={cn(
                            'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                            isActive
                              ? 'bg-zinc-900 font-semibold text-white'
                              : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200'
                          )}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          {!isSidebarCollapsed && <span>{item.name}</span>}
                        </span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* User Profile & Credit Balance (Spacious Bottom Area) */}
        <div className="shrink-0 space-y-2 border-t border-zinc-900 bg-zinc-950/40 p-3">
          {/* Credit balance badge */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/10 p-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-sans text-[9px] font-bold tracking-wider text-zinc-500 uppercase">
                Credits
              </span>
              <span className="font-mono font-bold text-zinc-300">
                {creditsRemaining} left
              </span>
            </div>
            {!isSidebarCollapsed && (
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-900">
                <div
                  className="h-full bg-white transition-all"
                  style={{
                    width: `${Math.min(100, (creditsRemaining / 50) * 100)}%`,
                  }}
                />
              </div>
            )}
          </div>

          {/* User profile placeholder */}
          <div
            className={cn(
              'flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-zinc-900',
              isSidebarCollapsed ? 'justify-center' : ''
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-200">
              R
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-semibold text-zinc-200">
                  Rafay
                </div>
                <div className="truncate font-mono text-[10px] text-zinc-500">
                  rafayimran709@gmail.com
                </div>
              </div>
            )}
            {!isSidebarCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-zinc-500 hover:text-white"
                onClick={() => toast.success('Signed out (placeholder)')}
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header Navigation */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-900 bg-zinc-950 px-6">
          {/* Breadcrumb / Current Project */}
          <div className="flex items-center gap-2">
            {activeProject ? (
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span>Projects</span>
                <span>/</span>
                <span className="font-semibold text-zinc-100">
                  {activeProject.name}
                </span>
              </div>
            ) : (
              <span className="text-xs text-zinc-500">
                Story Studio Dashboard
              </span>
            )}
          </div>

          {/* Search bar, Notification, Theme, Profile */}
          <div className="flex items-center gap-4">
            {/* Search Placeholder */}
            <div
              className={cn(
                'relative flex items-center rounded-md border border-zinc-900 bg-zinc-900/20 px-2.5 py-1.5 transition-all duration-150',
                searchFocused ? 'w-64 border-zinc-700 bg-zinc-900/50' : 'w-48'
              )}
            >
              <Search className="mr-2 h-3.5 w-3.5 shrink-0 text-zinc-500" />
              <input
                type="text"
                placeholder="Search workspace..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full bg-transparent text-xs text-zinc-300 outline-none placeholder:text-zinc-600"
              />
              <span className="py-0.2 hidden rounded border border-zinc-800 bg-zinc-950 px-1 font-mono text-[9px] font-bold tracking-tighter text-zinc-700 sm:inline">
                ⌘K
              </span>
            </div>

            {/* Notifications Bell */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-white"
              onClick={() => toast.info('No new notifications')}
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </Button>

            {/* Theme Toggle (Mock) */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-white"
              onClick={() => {
                setIsDark(!isDark);
                toast.success(
                  `Theme switched to ${isDark ? 'Light' : 'Dark'} (Simulated)`
                );
              }}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            <Separator orientation="vertical" className="h-4 bg-zinc-900" />

            {/* User Plan Tag */}
            <div className="flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-[10px] font-semibold text-zinc-400">
              <Sparkles className="h-3 w-3 text-yellow-500" />
              <span className="capitalize">
                {subscriptionPlan.replace('_', ' ')}
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable Content View */}
        <main className="relative flex-1 overflow-y-auto bg-zinc-950/20">
          {children}
        </main>
      </div>
    </div>
  );
}
