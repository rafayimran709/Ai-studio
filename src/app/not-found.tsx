import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Film } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 rounded-full bg-cyan-500/10 p-4 text-cyan-400">
        <Film className="h-8 w-8 animate-pulse" />
      </div>
      <h1 className="text-glow-cyan mb-2 text-4xl font-extrabold tracking-tight text-cyan-400">
        404
      </h1>
      <h2 className="mb-2 text-2xl font-bold tracking-tight">
        Scene Not Found
      </h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        This storyline path doesn&apos;t exist. The script might have been
        deleted, or the URI is incorrect.
      </p>
      <Link href="/" className={buttonVariants({ variant: 'default' })}>
        Return to Studio Home
      </Link>
    </div>
  );
}
