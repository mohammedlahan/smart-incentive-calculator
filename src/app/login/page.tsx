'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, KeyRound, Mail, Loader2, ArrowRight, Info } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }

      toast(`Welcome back, ${data.user.name}!`, 'success');
      
      // Force refresh of layout/router state to trigger middleware evaluations
      router.push(data.user.role === 'ADMIN' ? '/admin/dashboard' : '/sales/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      toast(err.message || 'Login failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for review
  const handleQuickFill = (emailStr: string, passwordStr: string) => {
    setEmail(emailStr);
    setPassword(passwordStr);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden dashboard-grid">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-card border border-border/80 rounded-2xl shadow-xl relative overflow-hidden transition-all duration-300">
        {/* Top Metallic Border Glow */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary via-rose-500 to-red-700" />
        
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-primary/10 rounded-2xl border border-primary/20 text-primary mb-3">
              <Shield className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              Incentive Portal
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5 font-medium">
              Dealer Incentive & Slab Management System
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-xs font-bold flex items-center gap-2">
              <Info className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@dealership.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm font-semibold placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">
                  <KeyRound className="h-4 w-4" />
                </span>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm font-semibold placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/95 transition-all shadow-md shadow-primary/20 hover:shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick-fill Demo Accounts Section */}
          <div className="mt-8 pt-6 border-t border-border/80">
            <div className="space-y-3">
              <label className="block text-center text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                Quick-Fill Demo Account
              </label>
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) return;
                  const [uEmail, uPass] = val.split('|');
                  handleQuickFill(uEmail, uPass);
                }}
                className="w-full px-3 py-2 rounded-lg border border-border bg-muted/30 text-foreground text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer text-center"
              >
                <option value="">-- Choose a Pre-Seeded Account --</option>
                <optgroup label="Administrators (Role: ADMIN)">
                  <option value="admin@dealership.com|admin123">Manager Admin (admin@dealership.com)</option>
                  <option value="manager@dealership.com|admin123">Toyota GM (manager@dealership.com)</option>
                </optgroup>
                <optgroup label="Sales Officers (Role: SALES_OFFICER)">
                  <option value="sales@dealership.com|sales123">John Sales (sales@dealership.com)</option>
                  <option value="alice@dealership.com|sales123">Alice Dealer (alice@dealership.com)</option>
                  <option value="bob@dealership.com|sales123">Bob Seller (bob@dealership.com)</option>
                  <option value="charlie@dealership.com|sales123">Charlie Toyota (charlie@dealership.com)</option>
                </optgroup>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
