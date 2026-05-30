'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  Sliders, 
  X, 
  Sparkles,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface Slab {
  id: string;
  minRange: number;
  maxRange: number | null;
  incentivePerCar: number;
}

export default function IncentiveSlabsPage() {
  const { toast } = useToast();
  
  const [slabs, setSlabs] = useState<Slab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [minRange, setMinRange] = useState('');
  const [maxRange, setMaxRange] = useState('');
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [incentivePerCar, setIncentivePerCar] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchSlabs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/slabs');
      if (!res.ok) {
        throw new Error('Failed to load incentive slabs.');
      }
      const data = await res.json();
      setSlabs(data.slabs);
    } catch (err: any) {
      setError(err.message || 'Error occurred fetching slabs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlabs();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setMinRange('');
    setMaxRange('');
    setIsUnlimited(false);
    setIncentivePerCar('');
    setModalOpen(true);
  };

  const openEditModal = (slab: Slab) => {
    setEditingId(slab.id);
    setMinRange(slab.minRange.toString());
    if (slab.maxRange === null) {
      setMaxRange('');
      setIsUnlimited(true);
    } else {
      setMaxRange(slab.maxRange.toString());
      setIsUnlimited(false);
    }
    setIncentivePerCar(slab.incentivePerCar.toString());
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const min = parseInt(minRange, 10);
    const max = isUnlimited ? null : parseInt(maxRange, 10);
    const rate = parseFloat(incentivePerCar);

    if (isNaN(min) || (max !== null && isNaN(max)) || isNaN(rate)) {
      toast('Please enter valid numeric parameters.', 'error');
      return;
    }

    if (min < 0 || (max !== null && max < min) || rate < 0) {
      toast('Please enter valid range bounds and incentive rate.', 'error');
      return;
    }

    setSaving(true);
    try {
      const url = editingId ? `/api/admin/slabs/${editingId}` : '/api/admin/slabs';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minRange: min, maxRange: max, incentivePerCar: rate }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save incentive slab.');
      }

      toast(
        editingId ? 'Incentive slab updated successfully.' : 'New incentive slab added successfully.',
        'success'
      );
      
      setModalOpen(false);
      fetchSlabs();
    } catch (err: any) {
      toast(err.message || 'Save failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/slabs/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete slab.');
      }

      toast('Incentive slab deleted successfully.', 'success');
      fetchSlabs();
    } catch (err: any) {
      toast(err.message || 'Deletion failed.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading && slabs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-sm font-semibold">Loading Incentive Slabs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Incentive Slabs</h1>
          <p className="text-sm text-muted-foreground mt-1.5 font-medium">
            Configure dynamic range parameters and rate-per-car payouts for sales targets.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-primary/20 hover:bg-primary/95 transition-all cursor-pointer w-full sm:w-auto"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Add Slab</span>
        </button>
      </div>

      {/* Main Content Area */}
      {error && slabs.length === 0 ? (
        <div className="p-6 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl flex items-start gap-3">
          <AlertCircle className="h-6 w-6 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-extrabold text-sm">Fetch Error</h3>
            <p className="text-xs mt-1">{error}</p>
          </div>
        </div>
      ) : slabs.length === 0 ? (
        <div className="bg-card border border-border/80 rounded-xl p-12 text-center shadow-sm">
          <div className="inline-flex p-4 rounded-full bg-primary/10 border border-primary/20 text-primary mb-4">
            <Sliders className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">No Slabs Configured</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
            You must configure at least one dynamic incentive slab range so payouts can be calculated for sales logs.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/95 transition-all shadow-md cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Configure First Slab</span>
          </button>
        </div>
      ) : (
        <>
          {/* Slabs Table Card - Hidden on Mobile */}
          <div className="hidden md:block bg-card border border-border/80 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest border-b border-border/80 bg-muted/20">
                    <th className="py-4 px-6">Slab Range</th>
                    <th className="py-4 px-6">Min Volume</th>
                    <th className="py-4 px-6">Max Volume</th>
                    <th className="py-4 px-6">Incentive Per Car</th>
                    <th className="py-4 px-6 text-right pr-8">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {slabs.map((slab) => (
                    <tr key={slab.id} className="hover:bg-muted/10 transition-colors">
                      <td className="py-4 px-6 font-extrabold text-sm text-foreground flex items-center gap-2.5">
                        <div className="p-1.5 rounded bg-primary/15 text-primary">
                          <Sliders className="h-4 w-4" />
                        </div>
                        <span>
                          {slab.maxRange === null 
                            ? `${slab.minRange}+ cars sold` 
                            : `${slab.minRange} – ${slab.maxRange} cars sold`}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-semibold text-xs font-mono text-muted-foreground">
                        {slab.minRange} units
                      </td>
                      <td className="py-4 px-6 text-xs font-semibold font-mono text-muted-foreground">
                        {slab.maxRange === null ? '∞ (No Limit)' : `${slab.maxRange} units`}
                      </td>
                      <td className="py-4 px-6 text-sm font-black text-primary">
                        ₹{slab.incentivePerCar.toLocaleString('en-IN')}/car
                      </td>
                      <td className="py-4 px-6 text-right pr-8">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => openEditModal(slab)}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors border border-transparent hover:border-border cursor-pointer"
                            title="Edit Slab"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete this slab?`)) {
                                handleDelete(slab.id);
                              }
                            }}
                            disabled={deletingId === slab.id}
                            className="p-2 text-destructive/80 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors border border-transparent hover:border-destructive/20 cursor-pointer disabled:opacity-50"
                            title="Delete Slab"
                          >
                            {deletingId === slab.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Slabs Cards List - Visible on Mobile Only */}
          {slabs.length > 0 && (
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {slabs.map((slab) => (
                <div key={slab.id} className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded bg-primary/15 text-primary">
                        <Sliders className="h-4 w-4" />
                      </div>
                      <span className="font-extrabold text-sm text-foreground">
                        {slab.maxRange === null 
                          ? `${slab.minRange}+ Units Target` 
                          : `${slab.minRange} – ${slab.maxRange} Units Target`}
                      </span>
                    </div>
                    <span className="text-xs font-black text-primary bg-primary/10 px-2.5 py-1 rounded border border-primary/20">
                      ₹{slab.incentivePerCar.toLocaleString('en-IN')}/car
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-t border-border/40 pt-3.5">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">Min Bound</span>
                      <span className="font-bold text-foreground">{slab.minRange} units</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block text-right">Max Bound</span>
                      <span className="font-bold text-foreground block text-right">
                        {slab.maxRange === null ? 'No Limit' : `${slab.maxRange} units`}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 border-t border-border/40 pt-3.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(slab)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted border border-border/60 rounded-lg transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete this slab?`)) {
                          handleDelete(slab.id);
                        }
                      }}
                      disabled={deletingId === slab.id}
                      className="px-3.5 py-1.5 text-xs font-semibold text-destructive border border-destructive/20 hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md relative overflow-hidden animate-slide-in">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-rose-500" />
            
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <h3 className="font-extrabold text-md text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span>{editingId ? 'Edit Incentive Slab' : 'Add Incentive Slab'}</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground hover:bg-muted p-1.5 rounded transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2">
                      Min Range Limit
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="e.g. 1, 4, 8"
                      value={minRange}
                      onChange={(e) => setMinRange(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2">
                      Max Range Limit
                    </label>
                    <input
                      type="number"
                      required={!isUnlimited}
                      disabled={isUnlimited}
                      min={minRange || "0"}
                      placeholder={isUnlimited ? "Unlimited" : "e.g. 3, 7"}
                      value={isUnlimited ? "" : maxRange}
                      onChange={(e) => setMaxRange(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:bg-muted/40 disabled:text-muted-foreground disabled:border-border/60"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    id="unlimited-checkbox"
                    type="checkbox"
                    checked={isUnlimited}
                    onChange={(e) => setIsUnlimited(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                  />
                  <label htmlFor="unlimited-checkbox" className="text-xs font-bold text-foreground cursor-pointer select-none">
                    Slab is open-ended (e.g., "8+ cars sold")
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2">
                    Incentive Rate (₹ per Car)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">
                      <DollarSign className="h-4.5 w-4.5 text-muted-foreground" />
                    </span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      placeholder="e.g. 1000, 2000, 3500"
                      value={incentivePerCar}
                      onChange={(e) => setIncentivePerCar(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 bg-muted/30 border-t border-border/80">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-bold hover:bg-muted transition-colors cursor-pointer border border-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editingId ? 'Update Slab' : 'Create Slab'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
