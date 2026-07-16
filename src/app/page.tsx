import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Film, Zap, UserCheck, Cpu, Sparkles, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 font-sans text-zinc-100 selection:bg-zinc-800 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-zinc-900 bg-zinc-950/80 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-white text-black">
            <Film className="h-3.5 w-3.5" />
          </div>
          <span className="font-sans text-sm font-semibold tracking-tight text-white">
            AI Story Studio
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="#features"
            className="text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-200"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-200"
          >
            Pricing
          </Link>
          <Link
            href="/dashboard"
            className={buttonVariants({
              variant: 'outline',
              className:
                'border-zinc-850 h-8 bg-zinc-900 px-3 text-xs font-semibold text-white hover:bg-zinc-800',
            })}
          >
            Open Studio
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative mx-auto flex max-w-4xl flex-1 flex-col items-center justify-center px-6 py-32 text-center">
        <div className="space-y-6">
          <div className="border-zinc-850 inline-flex items-center gap-1.5 rounded-full border bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-400">
            <Sparkles className="h-3 w-3 text-yellow-500" />
            <span>NVIDIA NIM & Veo 3 Optimization Toolkit</span>
          </div>
          <h1 className="max-w-3xl font-sans text-4xl leading-none font-bold tracking-tight text-white sm:text-6xl">
            Generate production-ready video scripts for Veo 3.
          </h1>
          <p className="mx-auto max-w-2xl font-sans text-sm leading-relaxed text-zinc-400 sm:text-base">
            AI Story Studio translates raw creative concepts into professional,
            multi-modal video scripts. Fully structured with camera directions,
            lighting parameters, dialogues, and sound design.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 pt-4 sm:flex-row">
            <Link
              href="/dashboard"
              className={buttonVariants({
                size: 'default',
                className:
                  'flex h-10 items-center gap-2 bg-white px-6 text-xs font-semibold text-black hover:bg-zinc-200',
              })}
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="#features"
              className={buttonVariants({
                size: 'default',
                variant: 'outline',
                className:
                  'border-zinc-850 h-10 bg-zinc-900 px-6 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white',
              })}
            >
              Explore Features
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section
        id="features"
        className="border-t border-zinc-900 bg-zinc-900/10 px-6 py-24"
      >
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 space-y-2 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Complete Scriptwriting Ecosystem
            </h2>
            <p className="mx-auto max-w-md text-xs text-zinc-400">
              Everything required to plan, structure, and refine
              narrative-continuity scripts.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-4 rounded-xl border border-zinc-900 bg-zinc-950/20 p-6 transition-colors hover:border-zinc-800">
              <div className="flex h-8 w-8 items-center justify-center rounded border border-zinc-800 bg-zinc-900 text-zinc-400">
                <Cpu className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">
                Dual Output Ideation
              </h3>
              <p className="text-xs leading-relaxed text-zinc-400">
                Generate two distinct visual scripts side-by-side. Compare
                lighting, camera layouts, and pacing before committing to
                production.
              </p>
            </div>
            <div className="space-y-4 rounded-xl border border-zinc-900 bg-zinc-950/20 p-6 transition-colors hover:border-zinc-800">
              <div className="flex h-8 w-8 items-center justify-center rounded border border-zinc-800 bg-zinc-900 text-zinc-400">
                <UserCheck className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">
                Character Manager
              </h3>
              <p className="text-xs leading-relaxed text-zinc-400">
                Define visual traits, casting roles, and behavior specifications
                for continuous visual appearance in the AI video output
                pipeline.
              </p>
            </div>
            <div className="space-y-4 rounded-xl border border-zinc-900 bg-zinc-950/20 p-6 transition-colors hover:border-zinc-800">
              <div className="flex h-8 w-8 items-center justify-center rounded border border-zinc-800 bg-zinc-900 text-zinc-400">
                <Zap className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">
                Story Bible Registry
              </h3>
              <p className="text-xs leading-relaxed text-zinc-400">
                Document world laws, visual direction guides, and narrative tone
                profiles to ensure absolute context sync on subsequent
                generations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section
        id="pricing"
        className="border-t border-zinc-900 bg-zinc-950/50 px-6 py-24"
      >
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            Start writing your next video story
          </h2>
          <p className="mx-auto max-w-lg text-xs leading-relaxed text-zinc-400">
            Create a workspace today and get 50 generation credits free. Upgrade
            anytime for unlimited storytelling timelines and priority processing
            queues.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className={buttonVariants({
                size: 'default',
                className:
                  'h-10 bg-white px-8 py-2 text-xs font-semibold text-black hover:bg-zinc-200',
              })}
            >
              Launch Studio Workspace
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-900 bg-zinc-950 px-6 py-8 text-center text-[10px] text-zinc-600">
        <p>
          © {new Date().getFullYear()} AI Story Studio. Built for Next-gen Video
          Filmmaking. Powered by NVIDIA NIM.
        </p>
      </footer>
    </div>
  );
}
