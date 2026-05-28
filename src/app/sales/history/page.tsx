'use client';

import React, { useState, useEffect } from 'react';
import { 
  Loader2, 
  AlertCircle, 
  History, 
  Download, 
  Printer, 
  ChevronDown, 
  ChevronUp, 
  Car,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';

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
  createdAt: string;
}

export default function SalesHistoryPage() {
  const { toast } = useToast();

  const [logs, setLogs] = useState<SalesLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track which log IDs are expanded to see car model breakdowns
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        const res = await fetch('/api/sales/history');
        if (!res.ok) {
          throw new Error('Failed to fetch historical logs.');
        }
        const data = await res.json();
        setLogs(data.logs);
      } catch (err: any) {
        setError(err.message || 'Error occurred fetching historical statements.');
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Convert month "2026-05" -> "May 2026"
  const formatMonth = (mStr: string) => {
    try {
      const [year, month] = mStr.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch (e) {
      return mStr;
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (logs.length === 0) {
      toast('No historical logs available to export.', 'error');
      return;
    }

    try {
      // Setup CSV headers
      let csvContent = 'Month,Car Model,Base Suffix,Variant,Quantity Sold,Estimated Incentive Rate (INR),Total Incentive (INR)\r\n';

      logs.forEach((log) => {
        const monthLabel = formatMonth(log.month);
        const rateVal = log.totalSales > 0 ? (log.totalIncentive / log.totalSales) : 0;
        const avgRate = rateVal.toFixed(2);

        // Add row for each item
        if (log.salesItems.length === 0) {
          csvContent += `"${monthLabel}","No cars logged","-","-",0,0,0\r\n`;
        } else {
          log.salesItems.forEach((item) => {
            const rowIncentive = (item.quantity * rateVal).toFixed(2);
            csvContent += `"${monthLabel}","${item.carModel.modelName}","${item.carModel.baseSuffix}","${item.carModel.variant}",${item.quantity},${avgRate},${rowIncentive}\r\n`;
          });
        }
      });

      // Create download trigger
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `sales_history_statement_${new Date().toISOString().substring(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast('CSV file downloaded successfully.', 'success');
    } catch (err) {
      toast('Failed to generate CSV export.', 'error');
    }
  };

  // Trigger print view (optimized with standard CSS page breaks for PDF rendering)
  const handlePrintPDF = () => {
    if (logs.length === 0) {
      toast('No historical records to print.', 'error');
      return;
    }
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-sm font-semibold">Compiling Statement History...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <History className="h-8 w-8 text-primary" />
            <span>Sales History Statements</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 font-medium">
            Review previous monthly sales summaries and payout breakdowns. Export records for documentation.
          </p>
        </div>
        
        {/* Export buttons row */}
        {logs.length > 0 && (
          <div className="flex flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center justify-center gap-2 bg-card hover:bg-muted text-foreground border border-border px-4 py-2.5 rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer flex-1 sm:flex-none"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handlePrintPDF}
              className="inline-flex items-center justify-center gap-2 bg-card hover:bg-muted text-foreground border border-border px-4 py-2.5 rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer flex-1 sm:flex-none"
            >
              <Printer className="h-4 w-4 text-primary" />
              <span>Print Statement / PDF</span>
            </button>
          </div>
        )}
      </div>

      {/* Printable Title Block */}
      <div className="hidden print:block text-center border-b border-border pb-6 mb-8">
        <h1 className="text-2xl font-black text-foreground uppercase tracking-wider">Vehicle Dealership Sales History</h1>
        <p className="text-xs text-muted-foreground mt-1">Generated Statement Report • {new Date().toLocaleDateString()}</p>
      </div>

      {/* Main Content */}
      {error ? (
        <div className="p-6 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl flex items-start gap-3 print:hidden">
          <AlertCircle className="h-6 w-6 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-extrabold text-sm">Fetch Error</h3>
            <p className="text-xs mt-1">{error}</p>
          </div>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-card border border-border/80 rounded-xl p-12 text-center shadow-sm">
          <History className="h-10 w-10 text-muted-foreground/60 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-1">No Past Statements Found</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Once you log and submit sales logs, monthly statements will populate here.
          </p>
        </div>
      ) : (
        /* History lists */
        <div className="space-y-4">
          {logs.map((log) => {
            const isExpanded = !!expandedIds[log.id];
            const avgRate = log.totalSales > 0 ? (log.totalIncentive / log.totalSales) : 0;
            
            return (
              <div 
                key={log.id} 
                className="bg-card border border-border/85 rounded-xl shadow-sm overflow-hidden transition-all duration-300 print:border-none print:shadow-none print:break-inside-avoid"
              >
                {/* Master summary row */}
                <div 
                  onClick={() => toggleExpand(log.id)}
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-muted/10 transition-colors print:cursor-default"
                >
                  <div className="space-y-1">
                    <h3 className="text-md font-extrabold text-foreground">
                      {formatMonth(log.month)}
                    </h3>
                    <p className="text-[10px] text-muted-foreground font-semibold">
                      Submitted on: {new Date(log.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 md:gap-12">
                    <div className="text-center hidden sm:block">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-0.5">Sales</span>
                      <span className="font-black text-sm text-foreground font-mono">{log.totalSales} cars</span>
                    </div>

                    <div className="text-center hidden sm:block">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-0.5">Avg Rate</span>
                      <span className="font-black text-sm text-foreground font-mono">₹{avgRate.toLocaleString('en-IN')}/car</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-0.5 print:text-[8px]">Incentive Payout</span>
                      <span className="font-black text-md text-primary font-mono">
                        ₹{log.totalIncentive.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="text-muted-foreground print:hidden">
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details list (and forced visible in print mode) */}
                <div className={`${isExpanded ? 'block' : 'hidden print:block'} bg-muted/20 border-t border-border/60 p-5 space-y-4`}>
                  <div className="flex items-center gap-2">
                    <Car className="h-4.5 w-4.5 text-primary" />
                    <h4 className="text-xs font-extrabold text-foreground uppercase tracking-wider">Models Sales Breakdown</h4>
                  </div>

                  {log.salesItems.length === 0 ? (
                    <p className="text-xs text-muted-foreground font-semibold pl-6">No specific vehicle quantities recorded.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pl-0 sm:pl-6">
                      {log.salesItems.map((item) => {
                        const itemIncentive = item.quantity * avgRate;
                        return (
                          <div 
                            key={item.id}
                            className="flex items-center justify-between p-3 bg-card border border-border rounded-lg text-xs"
                          >
                            <div className="overflow-hidden pr-2 space-y-0.5">
                              <div className="font-extrabold text-foreground truncate">{item.carModel.modelName}</div>
                              <div className="text-[9px] text-muted-foreground font-semibold uppercase truncate">
                                {item.carModel.baseSuffix} • {item.carModel.variant}
                              </div>
                              <div className="text-[9px] text-primary font-bold font-mono">
                                ₹{itemIncentive.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                            </div>
                            <span className="font-black text-foreground bg-secondary px-2 py-0.5 rounded font-mono shrink-0">
                              {item.quantity} units
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
