'use client';

import Link from 'next/link';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center shadow-lg relative overflow-hidden">
        {/* Neon Gradient Accent */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-rose-500 to-amber-500" />

        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 animate-bounce">
            <ShieldAlert className="h-12 w-12" />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-foreground mb-2">Access Denied</h1>
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          You do not have the required permissions to view this portal. If you believe this is an error, please contact your administrator.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/95 transition-all shadow-md shadow-primary/10"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go to Dashboard</span>
          </Link>
          
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-semibold hover:bg-muted border border-border transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4 text-muted-foreground" />
            <span>Switch Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}
