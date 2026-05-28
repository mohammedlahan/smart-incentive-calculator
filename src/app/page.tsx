'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Trigger router evaluation. Edge middleware intercepts and handles routing
    router.refresh();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="p-4 rounded-xl bg-card border border-border flex flex-col items-center shadow-lg max-w-sm w-full text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <h2 className="text-md font-bold text-foreground mb-1">Authenticating Session</h2>
        <p className="text-muted-foreground text-xs font-semibold animate-pulse">
          Please wait while we direct you to your dashboard...
        </p>
      </div>
    </div>
  );
}
