'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Car, 
  Loader2, 
  AlertCircle, 
  Award,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { calculateIncentive, Slab } from '@/lib/incentive';

interface SalesItem {
  id: string;
  carModel: {
    modelName: string;
    baseSuffix: string;
  };
  quantity: number;
}

interface SalesLog {
  id: string;
  totalSales: number;
  totalIncentive: number;
  salesItems: SalesItem[];
}

export default function RealTimeTrackerPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [salesLog, setSalesLog] = useState<SalesLog | null>(null);
  const [slabs, setSlabs] = useState<Slab[]>([]);

  const activeMonth = new Date().toISOString().substring(0, 7);

  useEffect(() => {
    async function fetchTrackerData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/sales/logs?month=${activeMonth}`);
        if (!res.ok) {
          throw new Error('Failed to fetch simulator parameters.');
        }
        const data = await res.json();
        setSalesLog(data.salesLog);
        setSlabs(data.slabs);
      } catch (err: any) {
        setError(err.message || 'Error occurred compiling tracker.');
      } finally {
        setLoading(false);
      }
    }
    fetchTrackerData();
  }, [activeMonth]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-sm font-semibold">Loading Progress Simulator...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl flex items-start gap-3">
        <AlertCircle className="h-6 w-6 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-extrabold text-sm">Tracker Error</h3>
          <p className="text-xs mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const totalCars = salesLog ? salesLog.totalSales : 0;
  const calc = calculateIncentive(totalCars, slabs);
  const sortedSlabs = [...slabs].sort((a, b) => a.minRange - b.minRange);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-primary" />
          <span>Real-time Incentive Tracker</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5 font-medium">
          Gamified status meter mapping your performance against target payouts. Sell more units to unlock larger rates.
        </p>
      </div>

      {/* Target Level Progress Ladder */}
      {sortedSlabs.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center shadow-sm">
          <p className="text-muted-foreground text-sm">No incentive slabs configured by Administrator.</p>
        </div>
      ) : (
        <div className="bg-card border border-border/80 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-8">
            <Zap className="h-5 w-5 text-amber-500 animate-bounce" />
            <h3 className="font-extrabold text-sm text-foreground">Incentive Slab Milestones</h3>
          </div>

          {/* Slab milestones step pipeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {sortedSlabs.map((slab, idx) => {
              const isAchieved = totalCars >= slab.minRange;
              const isActive = calc.currentSlab?.id === slab.id;
              
              return (
                <div 
                  key={slab.id}
                  className={`p-5 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                    isActive 
                      ? 'bg-primary/10 border-primary shadow-md scale-[1.03]' 
                      : isAchieved 
                      ? 'bg-emerald-500/10 border-emerald-500/30' 
                      : 'bg-muted/30 border-border/80'
                  }`}
                >
                  {/* Status Banner badge */}
                  <span className={`absolute top-0 right-0 px-2 py-0.5 rounded-bl text-[8px] font-extrabold uppercase tracking-widest ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : isAchieved 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-muted-foreground/20 text-muted-foreground'
                  }`}>
                    {isActive ? 'Active Tier' : isAchieved ? 'Achieved' : 'Locked'}
                  </span>

                  <div className="flex items-center gap-3 mb-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : isAchieved 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-muted text-muted-foreground border border-border'
                    }`}>
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-foreground uppercase tracking-wide">
                        {slab.maxRange === null ? `${slab.minRange}+ Cars` : `${slab.minRange} – ${slab.maxRange} Cars`}
                      </h4>
                      <p className="text-[10px] text-muted-foreground font-semibold">Monthly target volume</p>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1 mt-4">
                    <span className={`text-2xl font-black ${
                      isAchieved ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      ₹{slab.incentivePerCar.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-bold">/car</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid: Simulator breakdown cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Real-time breakdown (7 cols) */}
        <div className="bg-card border border-border/80 rounded-xl p-6 shadow-sm md:col-span-7 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <h3 className="font-extrabold text-md text-foreground">Estimated Payout Statement</h3>
            <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-extrabold text-muted-foreground uppercase tracking-wider">Breakdown</span>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-semibold">Total Vehicles Logged</span>
              <span className="font-extrabold text-foreground font-mono">{totalCars} units</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-semibold">Active Slab Rate Achieved</span>
              <span className="font-extrabold text-foreground font-mono">₹{calc.ratePerCar.toLocaleString('en-IN')}/car</span>
            </div>

            <div className="flex justify-between items-center text-xs pb-4 border-b border-border/40">
              <span className="text-muted-foreground font-semibold">Multiplier Calculation</span>
              <span className="font-extrabold text-muted-foreground font-mono">
                {totalCars} units × ₹{calc.ratePerCar.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-primary/10 border border-primary/20 rounded-xl">
              <span className="text-sm font-extrabold text-primary flex items-center gap-1.5">
                <ShieldCheck className="h-4.5 w-4.5 text-primary shrink-0" />
                <span>Estimated Monthly Incentive</span>
              </span>
              <span className="text-xl font-black text-foreground font-mono">
                ₹{calc.totalIncentive.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed model logs (5 cols) */}
        <div className="bg-card border border-border/80 rounded-xl p-6 shadow-sm md:col-span-5 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <h3 className="font-extrabold text-md text-foreground">Models Details</h3>
            <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-extrabold text-muted-foreground uppercase tracking-wider font-mono">Units</span>
          </div>

          {!salesLog || salesLog.salesItems.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm font-semibold">
              No sales logged this month.
            </div>
          ) : (
            <div className="space-y-4">
              {salesLog.salesItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs pb-3 border-b border-border/40 last:border-0 last:pb-0">
                  <div className="overflow-hidden pr-4">
                    <div className="font-extrabold text-foreground truncate">{item.carModel.modelName}</div>
                    <div className="text-[10px] text-muted-foreground font-semibold uppercase truncate">{item.carModel.baseSuffix}</div>
                  </div>
                  <div className="font-black text-sm text-foreground bg-muted px-2.5 py-0.5 rounded border border-border/60 font-mono">
                    {item.quantity} cars
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
