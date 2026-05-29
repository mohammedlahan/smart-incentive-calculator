'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Loader2, AlertCircle, BarChart3, TrendingUp, DollarSign, Award } from 'lucide-react';

interface MonthlyTrend {
  month: string;
  sales: number;
  incentive: number;
}

interface Performer {
  name: string;
  sales: number;
  incentive: number;
}

interface ModelSale {
  model: string;
  sales: number;
}

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trends, setTrends] = useState<MonthlyTrend[]>([]);
  const [performers, setPerformers] = useState<Performer[]>([]);
  const [modelSales, setModelSales] = useState<ModelSale[]>([]);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/admin/analytics');
        if (!res.ok) {
          throw new Error('Failed to fetch analytics data.');
        }
        const data = await res.json();
        setTrends(data.monthlyTrends);
        setPerformers(data.topPerformers);
        setModelSales(data.modelSales);
      } catch (err: any) {
        setError(err.message || 'Error occurred compiling analytics.');
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
        <p className="text-muted-foreground text-sm font-semibold">Generating Interactive Charts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl flex items-start gap-3">
        <AlertCircle className="h-6 w-6 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-extrabold text-sm">Analytics Compile Error</h3>
          <p className="text-xs mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // Format month label "2026-05" -> "May 2026"
  const formatMonth = (mStr: string) => {
    try {
      const [year, month] = mStr.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch (e) {
      return mStr;
    }
  };

  const chartTrendsData = trends.map(t => ({
    ...t,
    formattedMonth: formatMonth(t.month),
    payoutK: t.incentive / 1000 // Show in thousands
  }));

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          <span>Extended Analytics</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5 font-medium">
          Detailed graphic insights into monthly sales distributions, team performance trends, and total cash layouts.
        </p>
      </div>

      {trends.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center shadow-sm">
          <BarChart3 className="h-12 w-12 text-muted-foreground/60 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-1">Insufficient Data</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Interactive charts will automatically compile once Sales Officers have logged sales data.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Chart 1: Monthly Sales Volume Trend */}
          <div className="bg-card border border-border/80 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="font-extrabold text-sm text-foreground">Monthly Sales Volume Trend</h3>
              </div>
              <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-extrabold text-muted-foreground uppercase tracking-wider">Line Chart</span>
            </div>
            <div className="h-80 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartTrendsData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="formattedMonth" stroke="#64748B" tickLine={false} />
                  <YAxis stroke="#64748B" tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))',
                      color: 'hsl(var(--foreground))',
                      borderRadius: 'var(--radius)'
                    }} 
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    name="Cars Sold" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3} 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Monthly Incentive Payouts */}
          <div className="bg-card border border-border/80 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-rose-500" />
                <h3 className="font-extrabold text-sm text-foreground">Monthly Incentive Payout (K)</h3>
              </div>
              <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-extrabold text-muted-foreground uppercase tracking-wider">Bar Chart</span>
            </div>
            <div className="h-80 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartTrendsData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="formattedMonth" stroke="#64748B" tickLine={false} />
                  <YAxis stroke="#64748B" tickLine={false} unit="k" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))',
                      color: 'hsl(var(--foreground))',
                      borderRadius: 'var(--radius)'
                    }} 
                    formatter={(value: any) => [`₹${(value * 1000).toLocaleString('en-IN')}`, 'Total Payout']}
                  />
                  <Legend />
                  <Bar 
                    dataKey="payoutK" 
                    name="Payout (₹ in Thousands)" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Officers Leaderboard */}
          <div className="bg-card border border-border/80 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                <h3 className="font-extrabold text-sm text-foreground">Officers Volume Leaderboard</h3>
              </div>
              <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-extrabold text-muted-foreground uppercase tracking-wider">Horizontal Bar</span>
            </div>
            <div className="h-80 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performers} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis type="number" stroke="#64748B" tickLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#64748B" tickLine={false} width={80} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))',
                      color: 'hsl(var(--foreground))',
                      borderRadius: 'var(--radius)'
                    }} 
                  />
                  <Legend />
                  <Bar 
                    dataKey="sales" 
                    name="Cars Sold (All Time)" 
                    fill="#10b981" 
                    radius={[0, 4, 4, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Catalog Distribution Grid */}
          <div className="bg-card border border-border/80 rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-extrabold text-sm text-foreground">Model Sales Distribution</h3>
                <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-extrabold text-muted-foreground uppercase tracking-wider">Status Grid</span>
              </div>
              <div className="space-y-4 py-2">
                {modelSales.map((item, idx) => {
                  const total = modelSales.reduce((acc, m) => acc + m.sales, 0) || 1;
                  const pct = ((item.sales / total) * 100).toFixed(1);
                  return (
                    <div key={idx} className="flex items-center justify-between text-xs border-b border-border/40 pb-3 last:border-b-0 last:pb-0">
                      <div className="space-y-0.5">
                        <div className="font-extrabold text-foreground">{item.model}</div>
                        <div className="text-[10px] text-muted-foreground font-semibold">Share of total catalog sales</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-sm text-primary">{item.sales} sold</div>
                        <div className="text-[10px] text-emerald-500 font-bold font-mono">{pct}% share</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground font-semibold flex items-center justify-between mt-6 pt-4 border-t border-border/40">
              <span>Updated in real-time</span>
              <span>Total vehicle sales logged: {modelSales.reduce((acc, m) => acc + m.sales, 0)} units</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
