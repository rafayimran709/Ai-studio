'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 rounded-full bg-red-500/10 p-4 text-red-500">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h1 className="mb-2 text-2xl font-bold tracking-tight">
        Something went wrong
      </h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        An unexpected error occurred in AI Story Studio. Our systems have logged
        this event.
      </p>
      <div className="flex items-center gap-4">
        <Button
          onClick={reset}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Try Again
        </Button>
        <Button onClick={() => (window.location.href = '/')} variant="default">
          Return Home
        </Button>
      </div>
    </div>
  );
}
