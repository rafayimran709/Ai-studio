import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Film, Zap, UserCheck, Cpu, Sparkles } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#070709]">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/5 bg-black/40 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Film className="text-glow-cyan h-6 w-6 text-cyan-400" />
          <span className="bg-gradient-to-r from-white via-white to-neutral-400 bg-clip-text text-xl font-bold tracking-tight text-white">
            AI Story Studio
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="#features"
            className={buttonVariants({
              variant: 'ghost',
              className: 'text-sm text-neutral-400 hover:text-white',
            })}
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className={buttonVariants({
              variant: 'ghost',
              className: 'text-sm text-neutral-400 hover:text-white',
            })}
          >
            Pricing
          </Link>
          <Link
            href="/dashboard"
            className={buttonVariants({
              className:
                'border-0 bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-lg shadow-cyan-500/10 hover:from-cyan-400 hover:to-violet-500',
            })}
          >
            Open Studio
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
        {/* Glow Effects */}
        <div className="pointer-events-none absolute top-1/4 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="pointer-events-none absolute top-1/3 left-1/3 h-[300px] w-[300px] rounded-full bg-violet-600/10 blur-[100px]" />

        <div className="z-10 mx-auto max-w-4xl">
          <div className="glass-panel mb-6 inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 px-3 py-1.5 text-xs text-cyan-400">
            <Sparkles className="h-3.5 w-3.5 animate-spin" />
            <span>NVIDIA NIM & Veo 3 Optimizations Ready</span>
          </div>
          <h1 className="mb-6 text-5xl leading-tight font-extrabold tracking-tight text-white md:text-7xl">
            Generate Production-Ready <br />
            <span className="text-glow-cyan bg-gradient-to-r from-cyan-400 via-teal-300 to-violet-500 bg-clip-text text-transparent">
              Video Scripts for Veo 3
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-neutral-400 md:text-xl">
            AI Story Studio translates raw prompts into professional,
            multi-modal video scripts. Fully structured with camera shots,
            lighting parameters, dialogue columns, and sound design.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/dashboard"
              className={buttonVariants({
                size: 'lg',
                className:
                  'h-12 bg-gradient-to-r from-cyan-500 to-violet-600 px-8 text-base font-medium text-white shadow-xl shadow-cyan-500/15 hover:from-cyan-400 hover:to-violet-500',
              })}
            >
              Get Started Free
            </Link>
            <Link
              href="#features"
              className={buttonVariants({
                size: 'lg',
                variant: 'outline',
                className:
                  'h-12 border-white/10 bg-transparent px-8 text-white hover:bg-white/5',
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
        className="border-t border-white/5 bg-black/20 px-6 py-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              Complete Scriptwriting Ecosystem
            </h2>
            <p className="mx-auto max-w-md text-neutral-400">
              Everything required to plan, structure, and refine
              narrative-continuity scripts.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="glass-panel rounded-2xl border border-white/5 p-8 transition-all duration-300 hover:border-cyan-500/20">
              <Cpu className="mb-4 h-8 w-8 text-cyan-400" />
              <h3 className="mb-2 text-xl font-bold text-white">
                Dual Output Ideation
              </h3>
              <p className="text-sm leading-relaxed text-neutral-400">
                Generate two distinct visual scripts side-by-side. Compare
                lighting, camera layouts, and pacing before committing to
                production.
              </p>
            </div>
            <div className="glass-panel rounded-2xl border border-white/5 p-8 transition-all duration-300 hover:border-violet-500/20">
              <UserCheck className="mb-4 h-8 w-8 text-violet-400" />
              <h3 className="mb-2 text-xl font-bold text-white">
                Character Manager
              </h3>
              <p className="text-sm leading-relaxed text-neutral-400">
                Define visual traits, casting roles, and behavior specifications
                for continuous visual appearance in the AI video output
                pipeline.
              </p>
            </div>
            <div className="glass-panel rounded-2xl border border-white/5 p-8 transition-all duration-300 hover:border-cyan-500/20">
              <Zap className="mb-4 h-8 w-8 text-cyan-400" />
              <h3 className="mb-2 text-xl font-bold text-white">
                Story Bible Registry
              </h3>
              <p className="text-sm leading-relaxed text-neutral-400">
                Document world laws, visual direction guides, and narrative tone
                profiles to ensure absolute context sync on subsequent storyline
                generations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Call-to-action Preview */}
      <section
        id="pricing"
        className="relative border-t border-white/5 px-6 py-20"
      >
        <div className="pointer-events-none absolute right-1/4 bottom-0 h-[300px] w-[300px] rounded-full bg-violet-600/5 blur-[100px]" />
        <div className="glass-panel relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/10 p-12 text-center">
          <div className="absolute top-0 right-0 rounded-bl-xl border-b border-l border-white/5 bg-cyan-500/10 p-3 text-xs font-medium text-cyan-400">
            Beta Launch
          </div>
          <h2 className="mb-4 text-3xl font-bold text-white">
            Start Writing Your Next Video Story
          </h2>
          <p className="mx-auto mb-8 max-w-lg text-neutral-400">
            Create an account today and get 50 generation credits free. Upgrade
            anytime for unlimited storytelling timelines.
          </p>
          <Link
            href="/dashboard"
            className={buttonVariants({
              size: 'lg',
              className:
                'bg-gradient-to-r from-cyan-500 to-violet-600 px-10 text-white shadow-lg shadow-cyan-500/10 hover:from-cyan-400 hover:to-violet-500',
            })}
          >
            Launch Workspace
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/5 bg-black/40 px-6 py-8 text-center text-xs text-neutral-600">
        <p>
          © {new Date().getFullYear()} AI Story Studio. Built for Next-gen Video
          Filmmaking. Powered by NVIDIA NIM.
        </p>
      </footer>
    </div>
  );
}
