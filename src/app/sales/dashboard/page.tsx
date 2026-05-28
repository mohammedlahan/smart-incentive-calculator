'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Car, 
  Loader2, 
  AlertCircle, 
  PenTool, 
  Award,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { calculateIncentive, Slab } from '@/lib/incentive';

interface SalesItem {
  id: string;
  carModel: {
    modelName: string;
    baseSuffix: string;
    variant: string;
  };
  quantity: number;
}

interface SalesLog {
  id: string;
  month: string;
  totalSales: number;
  totalIncentive: number;
  salesItems: SalesItem[];
}

export default function SalesDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [salesLog, setSalesLog] = useState<SalesLog | null>(null);
  const [slabs, setSlabs] = useState<Slab[]>([]);
  
  const activeMonth = new Date().toISOString().substring(0, 7); // Format: "YYYY-MM"

  useEffect(() => {
    async function fetchCurrentMonthData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/sales/logs?month=${activeMonth}`);
        if (!res.ok) {
          throw new Error('Failed to load performance metrics.');
        }
        const data = await res.json();
        setSalesLog(data.salesLog);
        setSlabs(data.slabs);
      } catch (err: any) {
        setError(err.message || 'Error occurred fetching dashboard details.');
      } finally {
        setLoading(false);
      }
    }
    fetchCurrentMonthData();
  }, [activeMonth]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-sm font-semibold">Loading Performance Metrics...</p>
      </div>
    );
  }

  // Calculate incentive details using engine
  const totalCars = salesLog ? salesLog.totalSales : 0;
  const calc = calculateIncentive(totalCars, slabs);

  // Format month name for title e.g. "2026-05" -> "May 2026"
  const monthName = () => {
    try {
      const [year, month] = activeMonth.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch (e) {
      return activeMonth;
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Officer Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1.5 font-medium">
            Real-time tracking and incentive metrics for <span className="text-primary font-bold">{monthName()}</span>.
          </p>
        </div>
        <Link
          href="/sales/log-sales"
          className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-primary/20 hover:bg-primary/95 transition-all cursor-pointer w-full sm:w-auto"
        >
          <PenTool className="h-4.5 w-4.5" />
          <span>Log Current Sales</span>
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-6 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl flex items-start gap-3">
          <AlertCircle className="h-6 w-6 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-extrabold text-sm">Dashboard Error</h3>
            <p className="text-xs mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* KPI 1: Vehicles Sold */}
        <div className="bg-card border border-border/80 rounded-xl p-6 glow-card transition-all duration-300 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-15">
            <Car className="h-20 w-20 text-primary" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Vehicles Sold</span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Car className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-foreground">{totalCars}</span>
            <span className="text-xs text-muted-foreground font-medium">units</span>
          </div>
          <p className="text-[10px] text-muted-foreground font-semibold mt-3">Monthly sales target logged</p>
        </div>

        {/* KPI 2: Active Incentive Rate */}
        <div className="bg-card border border-border/80 rounded-xl p-6 glow-card transition-all duration-300 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-15">
            <Award className="h-20 w-20 text-emerald-500" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Incentive Rate</span>
            <div className="p-2 rounded-lg bg-emerald-50/10 text-emerald-500 border border-emerald-500/20">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black tracking-tight text-foreground">₹{calc.ratePerCar.toLocaleString('en-IN')}</span>
            <span className="text-xs text-muted-foreground font-medium">/car</span>
          </div>
          <p className="text-[10px] text-emerald-500 font-bold mt-3">
            {calc.currentSlab 
              ? `Tier Level reached` 
              : 'Log sales to reach first slab'}
          </p>
        </div>

        {/* KPI 3: Estimated Monthly Payout */}
        <div className="bg-card border border-border/80 rounded-xl p-6 glow-card transition-all duration-300 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-15">
            <DollarSign className="h-20 w-20 text-indigo-500" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Estimated Payout</span>
            <div className="p-2 rounded-lg bg-indigo-50/10 text-indigo-500 border border-indigo-500/20">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black tracking-tight text-foreground">₹{calc.totalIncentive.toLocaleString('en-IN')}</span>
          </div>
          <p className="text-[10px] text-indigo-500 font-bold mt-3">Subject to monthly manager approval</p>
        </div>
      </div>

      {/* Main Grid: Goal Tracker & Current Month Sales Items */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Goal Tracker Card (7 cols) */}
        <div className="bg-card border border-border/80 rounded-xl p-6 shadow-sm md:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
                <h3 className="font-extrabold text-md text-foreground">Monthly Slab Progress</h3>
              </div>
              <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-extrabold text-muted-foreground uppercase tracking-wider">Goal Tracker</span>
            </div>

            {/* Progress Bar logic */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-bold text-muted-foreground mb-2">
                  <span>Slab Achieved: {calc.currentSlab ? `₹${calc.ratePerCar}/car` : 'None'}</span>
                  <span>
                    {calc.nextSlab 
                      ? `Next Tier Target: ${calc.nextSlab.minRange} cars` 
                      : 'Max Payout Tier Reached!'}
                  </span>
                </div>
                
                {/* Progress bar visual */}
                {calc.nextSlab ? (
                  (() => {
                    const currentPct = (totalCars / calc.nextSlab.minRange) * 100;
                    return (
                      <div className="w-full bg-secondary h-4 rounded-full overflow-hidden border border-border/60">
                        <div 
                          className="bg-gradient-to-r from-primary to-indigo-600 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(currentPct, 100)}%` }} 
                        />
                      </div>
                    );
                  })()
                ) : (
                  <div className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 h-4 rounded-full border border-border/60" />
                )}
              </div>

              {/* Status Message */}
              <div className="p-4 bg-muted/40 border border-border/60 rounded-lg">
                <p className="text-xs font-bold text-foreground leading-relaxed">
                  {calc.nextSlab && calc.carsNeededForNextSlab !== null ? (
                    <>
                      You have sold <span className="text-primary font-extrabold">{totalCars} cars</span>. You need only{' '}
                      <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{calc.carsNeededForNextSlab} more car(s)</span>{' '}
                      to unlock the next tier rate of{' '}
                      <span className="text-primary font-extrabold">₹{calc.nextSlab.incentivePerCar.toLocaleString('en-IN')}/car</span>{' '}
                      (increasing your payout potential significantly!).
                    </>
                  ) : (
                    <>
                      🎉 <span className="text-emerald-500 font-extrabold">Outstanding work!</span> You have reached the highest incentive slab of{' '}
                      <span className="text-emerald-500 font-extrabold">₹{calc.ratePerCar}/car</span>. All cars sold this month will be paid out at this maximum rate.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border/60 mt-8 flex justify-end">
            <Link
              href="/sales/realtime-tracker"
              className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
            >
              <span>Launch Live Simulator</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Current Month Sales Breakdown (5 cols) */}
        <div className="bg-card border border-border/80 rounded-xl p-6 shadow-sm md:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-extrabold text-md text-foreground">Logged Model Log</h3>
              <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-extrabold text-muted-foreground uppercase tracking-wider">Breakdown</span>
            </div>

            {!salesLog || salesLog.salesItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Car className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground text-sm font-semibold">No sales logged for this month yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {salesLog.salesItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs border-b border-border/40 pb-3 last:border-b-0 last:pb-0">
                    <div>
                      <div className="font-extrabold text-foreground">{item.carModel.modelName}</div>
                      <div className="text-[10px] text-muted-foreground font-semibold uppercase">{item.carModel.baseSuffix} • {item.carModel.variant}</div>
                    </div>
                    <div className="font-black text-sm text-foreground bg-muted px-3 py-1 rounded border border-border/60 font-mono">
                      {item.quantity} units
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-border/60 mt-8 flex justify-end">
            <Link
              href="/sales/history"
              className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
            >
              <span>View Past Month Statements</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
