'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Car, 
  Loader2, 
  Trophy, 
  AlertCircle,
  TrendingDown,
  ArrowRight,
  Sliders
} from 'lucide-react';
import Link from 'next/link';

interface SummaryData {
  totalSales: number;
  totalIncentives: number;
  activeOfficersCount: number;
  totalCarModelsCount: number;
}

interface Performer {
  name: string;
  email: string;
  sales: number;
  incentive: number;
}

interface ModelSale {
  model: string;
  sales: number;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [performers, setPerformers] = useState<Performer[]>([]);
  const [modelSales, setModelSales] = useState<ModelSale[]>([]);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/admin/analytics');
        if (!res.ok) {
          throw new Error('Failed to load dashboard data.');
        }
        const data = await res.json();
        setSummary(data.summary);
        setPerformers(data.topPerformers);
        setModelSales(data.modelSales);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch analytics data.');
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-sm font-semibold">Loading Dashboard Details...</p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="p-6 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl flex items-start gap-3">
        <AlertCircle className="h-6 w-6 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-extrabold text-sm">Dashboard Error</h3>
          <p className="text-xs mt-1">{error || 'Could not compile analytics summary data.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1.5 font-medium">
          Dealership sales statistics, payout aggregates, and team leaderboard.
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Sales */}
        <div className="bg-card border border-border/80 rounded-xl p-6 glow-card transition-all duration-300 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-15">
            <Car className="h-20 w-20 text-primary" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Sales</span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Car className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-foreground">{summary.totalSales}</span>
            <span className="text-xs text-muted-foreground font-medium">cars sold</span>
          </div>
          <div className="text-[10px] text-emerald-500 font-bold mt-3 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>Active models tracked</span>
          </div>
        </div>

        {/* Card 2: Total Incentive Payout */}
        <div className="bg-card border border-border/80 rounded-xl p-6 glow-card transition-all duration-300 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-15">
            <DollarSign className="h-20 w-20 text-indigo-500" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Incentives</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black tracking-tight text-foreground">₹{summary.totalIncentives.toLocaleString('en-IN')}</span>
          </div>
          <div className="text-[10px] text-indigo-500 font-bold mt-3 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>Dealer dynamic payout rate</span>
          </div>
        </div>

        {/* Card 3: Active Officers */}
        <div className="bg-card border border-border/80 rounded-xl p-6 glow-card transition-all duration-300 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-15">
            <Users className="h-20 w-20 text-emerald-500" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Sales Officers</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-foreground">{summary.activeOfficersCount}</span>
            <span className="text-xs text-muted-foreground font-medium">officers</span>
          </div>
          <div className="text-[10px] text-emerald-500 font-bold mt-3 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>Currently active on field</span>
          </div>
        </div>

        {/* Card 4: Car Models */}
        <div className="bg-card border border-border/80 rounded-xl p-6 glow-card transition-all duration-300 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-15">
            <Sliders className="h-20 w-20 text-amber-500" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Models Catalog</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Sliders className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-foreground">{summary.totalCarModelsCount}</span>
            <span className="text-xs text-muted-foreground font-medium">variants</span>
          </div>
          <div className="text-[10px] text-amber-500 font-bold mt-3 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>Configured in database</span>
          </div>
        </div>
      </div>

      {/* Grid: Leaderboard and Model Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Top Performers Leaderboard (8 cols) */}
        <div className="bg-card border border-border/80 rounded-xl p-6 shadow-sm lg:col-span-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                <h3 className="font-extrabold text-md text-foreground">Top-Performing Officers</h3>
              </div>
              <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-extrabold text-muted-foreground uppercase tracking-wider">Leaderboard</span>
            </div>

            {performers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground text-sm font-semibold">No sales logged yet for any officer.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border/60 pb-3">
                      <th className="pb-3 pl-2">Rank</th>
                      <th className="pb-3">Name</th>
                      <th className="pb-3 text-center">Cars Sold</th>
                      <th className="pb-3 text-right pr-2">Total Incentives</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {performers.map((p, idx) => (
                      <tr key={idx} className="hover:bg-muted/30 transition-colors">
                        <td className="py-4 pl-2 font-black text-sm text-muted-foreground">
                          {idx + 1 === 1 ? (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold border border-amber-500/20">
                              🥇
                            </span>
                          ) : idx + 1 === 2 ? (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-400/10 text-slate-400 text-xs font-bold border border-slate-400/20">
                              🥈
                            </span>
                          ) : idx + 1 === 3 ? (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-700/10 text-amber-700 text-xs font-bold border border-amber-700/20">
                              🥉
                            </span>
                          ) : (
                            `#${idx + 1}`
                          )}
                        </td>
                        <td className="py-4 font-bold text-sm text-foreground">
                          <div>
                            <div className="font-extrabold">{p.name}</div>
                            <div className="text-[10px] text-muted-foreground font-semibold font-mono">{p.email}</div>
                          </div>
                        </td>
                        <td className="py-4 text-center font-black text-sm text-foreground">
                          {p.sales}
                        </td>
                        <td className="py-4 text-right pr-2 font-black text-sm text-primary">
                          ₹{p.incentive.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="pt-6 border-t border-border/60 mt-6 flex justify-end">
            <Link
              href="/admin/analytics"
              className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
            >
              <span>View Extended Charts & Trends</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Model Sales Breakdown (4 cols) */}
        <div className="bg-card border border-border/80 rounded-xl p-6 shadow-sm lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-extrabold text-md text-foreground">Sales by Model</h3>
              <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-extrabold text-muted-foreground uppercase tracking-wider">Catalog</span>
            </div>

            {modelSales.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground text-sm font-semibold">No vehicles logged as sold.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {modelSales.map((item, index) => {
                  // Find percentage of max sales to show progress bars
                  const maxSales = Math.max(...modelSales.map(m => m.sales)) || 1;
                  const pct = (item.sales / maxSales) * 100;
                  
                  return (
                    <div key={index} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-foreground truncate pr-2">{item.model}</span>
                        <span className="font-black text-muted-foreground font-mono">{item.sales} sold</span>
                      </div>
                      <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-primary h-full rounded-full transition-all duration-500" 
                          style={{ width: `${pct}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="pt-6 border-t border-border/60 mt-6 flex justify-end">
            <Link
              href="/admin/car-models"
              className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
            >
              <span>Manage Models</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
