'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Loader2, 
  AlertCircle, 
  PenTool, 
  Calendar, 
  CheckCircle2, 
  Sparkles,
  Calculator,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { calculateIncentive, Slab } from '@/lib/incentive';

interface CarModel {
  id: string;
  modelName: string;
  baseSuffix: string;
  variant: string;
}

interface SalesItem {
  carModelId: string;
  quantity: number;
}

export default function LogSalesPage() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Month selector - Default to current month
  const [month, setMonth] = useState(() => {
    return new Date().toISOString().substring(0, 7);
  });

  // DB Data
  const [carModels, setCarModels] = useState<CarModel[]>([]);
  const [slabs, setSlabs] = useState<Slab[]>([]);
  
  // Quantities entered by user - Map of carModelId -> quantity string
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Fetch data when month changes
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/sales/logs?month=${month}`);
        if (!res.ok) {
          throw new Error('Failed to retrieve monthly catalog details.');
        }
        const data = await res.json();
        setCarModels(data.carModels);
        setSlabs(data.slabs);

        // Prepopulate inputs if logs exist
        const initialQuantities: Record<string, string> = {};
        
        // Initialize all models to empty/0 string
        data.carModels.forEach((model: CarModel) => {
          initialQuantities[model.id] = '';
        });

        // Overlay existing database log values
        if (data.salesLog && data.salesLog.salesItems) {
          data.salesLog.salesItems.forEach((item: any) => {
            initialQuantities[item.carModelId] = item.quantity.toString();
          });
        }

        setQuantities(initialQuantities);
      } catch (err: any) {
        setError(err.message || 'Error loading logging context.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [month]);

  // Handle number changes
  const handleQuantityChange = (modelId: string, value: string) => {
    // Basic sanitization (only positive digits)
    if (value !== '' && (!/^\d+$/.test(value))) return;
    setQuantities(prev => ({
      ...prev,
      [modelId]: value
    }));
  };

  // Compute total sales in real time
  const totalSales = useMemo(() => {
    let sum = 0;
    Object.values(quantities).forEach((qty) => {
      const parsed = parseInt(qty, 10);
      if (!isNaN(parsed) && parsed > 0) {
        sum += parsed;
      }
    });
    return sum;
  }, [quantities]);

  // Compute dynamic incentive payout in real time using client-side helper
  const calc = useMemo(() => {
    return calculateIncentive(totalSales, slabs);
  }, [totalSales, slabs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Format sales payload
    const salesPayload = Object.entries(quantities).map(([carModelId, qty]) => ({
      carModelId,
      quantity: parseInt(qty, 10) || 0
    }));

    try {
      const res = await fetch('/api/sales/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, sales: salesPayload })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to log monthly sales.');
      }

      toast('Sales logs submitted and payouts updated successfully!', 'success');
    } catch (err: any) {
      toast(err.message || 'Submission failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading && carModels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-sm font-semibold">Loading Sales Catalog Form...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
          <PenTool className="h-8 w-8 text-primary" />
          <span>Log Monthly Sales</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5 font-medium">
          Enter the number of cars sold per model below to simulate and log your dynamic monthly payout.
        </p>
      </div>

      {/* Error state */}
      {error && carModels.length === 0 && (
        <div className="p-6 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl flex items-start gap-3">
          <AlertCircle className="h-6 w-6 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-extrabold text-sm">Logging Page Error</h3>
            <p className="text-xs mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Logging Form (8 cols) */}
        <div className="lg:col-span-8 bg-card border border-border/80 rounded-xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Month Selector Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <label className="text-sm font-bold text-foreground">Select Sales Month</label>
              </div>
              <input
                type="month"
                required
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer w-full sm:w-auto"
              />
            </div>

            {/* Models Input Fields */}
            {carModels.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm font-semibold">
                No car models configured by Admin yet.
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider mb-2">
                  Car Models Sales Quantities
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {carModels.map((model) => (
                    <div 
                      key={model.id} 
                      className="p-4 rounded-xl border border-border bg-muted/20 flex items-center justify-between gap-4 hover:border-primary/20 transition-colors"
                    >
                      <div className="overflow-hidden">
                        <h4 className="font-extrabold text-sm text-foreground truncate">{model.modelName}</h4>
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase truncate">
                          {model.baseSuffix} • {model.variant}
                        </p>
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="0"
                        value={quantities[model.id] ?? ''}
                        onChange={(e) => handleQuantityChange(model.id, e.target.value)}
                        className="w-20 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm font-bold font-mono text-center focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form Action Button */}
            <div className="pt-6 border-t border-border/60 flex justify-end">
              <button
                type="submit"
                disabled={saving || carModels.length === 0}
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg text-sm font-bold shadow-md shadow-primary/20 hover:bg-primary/95 transition-all cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving log data...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4.5 w-4.5" />
                    <span>Submit & Save Performance Log</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Real-time calculation Simulator Card (4 cols) */}
        <div className="lg:col-span-4 bg-card border border-border/85 rounded-xl shadow-md p-6 sticky top-6 overflow-hidden">
          {/* Decorative Corner Glow */}
          <div className="absolute -top-12 -right-12 h-24 w-24 bg-primary/20 rounded-full blur-2xl" />

          <div className="flex items-center gap-2 mb-6">
            <Calculator className="h-5 w-5 text-primary" />
            <h3 className="font-extrabold text-md text-foreground">Real-time Estimator</h3>
          </div>

          <div className="space-y-6">
            {/* Real-time Stat 1: Total Units */}
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Sales</span>
              <div className="text-right">
                <div className="text-xl font-black text-foreground font-mono">{totalSales}</div>
                <div className="text-[10px] text-muted-foreground font-semibold">cars entered</div>
              </div>
            </div>

            {/* Real-time Stat 2: Active Slab Rate */}
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Rate</span>
              <div className="text-right">
                <div className="text-xl font-black text-primary font-mono">
                  ₹{calc.ratePerCar.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-primary font-bold">
                  {calc.currentSlab ? 'Slab unlocked' : 'Below first slab'}
                </div>
              </div>
            </div>

            {/* Real-time Stat 3: Total Payout */}
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl relative overflow-hidden text-center">
              <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest block mb-1">
                Estimated Incentive Payout
              </span>
              <div className="text-2xl font-black text-foreground font-mono transition-transform duration-300">
                ₹{calc.totalIncentive.toLocaleString('en-IN')}
              </div>
            </div>

            {/* Real-time Goal Tracker status */}
            <div className="text-xs font-bold text-foreground leading-relaxed p-3 bg-muted/40 border border-border/60 rounded-lg">
              {calc.nextSlab && calc.carsNeededForNextSlab !== null ? (
                <div className="space-y-1">
                  <div>
                    Need <span className="text-primary font-extrabold">{calc.carsNeededForNextSlab} more car(s)</span> to trigger next rate tier:
                  </div>
                  <div className="text-primary font-black flex items-center gap-1 mt-1">
                    <span>₹{calc.nextSlab.incentivePerCar}/car</span>
                    <ArrowRight className="h-3 w-3" />
                    <span>Starts at {calc.nextSlab.minRange} units</span>
                  </div>
                </div>
              ) : slabs.length > 0 ? (
                <div className="text-emerald-500 flex items-center gap-1.5">
                  <Sparkles className="h-4.5 w-4.5 shrink-0" />
                  <span>Maximum Slab Tier Rate unlocked!</span>
                </div>
              ) : (
                <span className="text-muted-foreground">Add slabs to calculate.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
