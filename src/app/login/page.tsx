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

  const performLogin = async (emailVal: string, passwordVal: string) => {
    const trimmedEmail = emailVal.trim();
    if (!trimmedEmail || !passwordVal) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password: passwordVal }),
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(email, password);
  };

  // Quick fill helper for review
  const handleQuickFill = async (role: 'admin' | 'sales') => {
    const emailVal = role === 'admin' ? 'admin@dealership.com' : 'sales@dealership.com';
    const passwordVal = role === 'admin' ? 'admin123' : 'sales123';
    
    setEmail(emailVal);
    setPassword(passwordVal);
    await performLogin(emailVal, passwordVal);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 relative overflow-hidden">
      {/* Premium Background Image of Toyota Showroom */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[15000ms] scale-105 pointer-events-none"
        style={{ backgroundImage: "url('/bg-cars.png')" }}
      />
      
      {/* High-end vignette and overlays */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/85 to-black/30 pointer-events-none" />
      <div className="absolute inset-0 bg-red-950/20 backdrop-blur-[2px] pointer-events-none" />

      {/* Decorative Red neon glow behind the login box */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[450px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-primary/40">
        {/* Top Crimson Metallic Border Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-red-500 to-primary" />
        
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-primary/10 rounded-2xl border border-primary/20 text-primary mb-3 shadow-inner">
              <Shield className="h-7 w-7 text-primary animate-pulse" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white uppercase">
              Toyota Portal
            </h1>
            <p className="text-[10px] text-zinc-400 mt-1 font-bold uppercase tracking-wider">
              Dealer Incentive & Slab Management
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-xs font-semibold flex items-center gap-2">
              <Info className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@dealership.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm font-semibold placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                  <KeyRound className="h-4 w-4" />
                </span>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm font-semibold placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/95 transition-all shadow-md shadow-primary/20 hover:shadow-lg disabled:opacity-50 cursor-pointer mt-2"
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
          <div className="mt-8 pt-6 border-t border-white/10">
            <h3 className="text-center text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">
              Demo Credentials
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                className="px-3 py-2.5 rounded-lg border border-white/5 bg-white/5 text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer text-center"
              >
                Admin User
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('sales')}
                className="px-3 py-2.5 rounded-lg border border-white/5 bg-white/5 text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer text-center"
              >
                Sales Officer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
