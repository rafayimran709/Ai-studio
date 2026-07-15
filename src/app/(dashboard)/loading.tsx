import { Loader2 } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center text-center">
      <Loader2 className="mb-2 h-8 w-8 animate-spin text-violet-400" />
      <p className="text-muted-foreground animate-pulse text-sm">
        Syncing timeline metadata...
      </p>
    </div>
  );
}
