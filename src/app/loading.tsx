import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <Loader2 className="mb-4 h-10 w-10 animate-spin text-cyan-400" />
      <p className="text-muted-foreground animate-pulse">
        Initializing AI Story Studio...
      </p>
    </div>
  );
}
