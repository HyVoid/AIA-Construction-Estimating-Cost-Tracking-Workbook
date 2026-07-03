import React, { useState } from 'react';
import { CostLibraryItem, EstimateInputRow, AssemblyItem, ActualCostRow } from '../types';
import { AlertCircle, CheckCircle, ShieldAlert, TrendingDown, DollarSign, X } from 'lucide-react';

interface CostTrackingTabProps {
  costLibrary: CostLibraryItem[];
  estimateRows: EstimateInputRow[];
  assemblies: AssemblyItem[];
  actualCosts: ActualCostRow[];
  onUpdateActualCost: (costCode: string, actualQty: number, actualCost: number) => void;
}

export const CostTrackingTab: React.FC<CostTrackingTabProps> = ({
  costLibrary,
  estimateRows,
  assemblies,
  actualCosts,
  onUpdateActualCost
}) => {
  // Local edit states
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editQty, setEditQty] = useState<number>(0);
  const [editCost, setEditCost] = useState<number>(0);

  // Calculate standard estimate quantities and totals mapped down to individual Cost Codes
  const getEstimatedMetrics = (code: string) => {
    let estQty = 0;
    const rateItem = costLibrary.find(item => item.code === code);
    if (!rateItem) return { estQty: 0, estCost: 0 };

    const unitRate = rateItem.laborRate + rateItem.materialRate + rateItem.equipmentRate;

    // Search estimate rows
    estimateRows.forEach(row => {
      // Find assembly components matching this cost code
      const matchedComps = assemblies.filter(
        a => a.assemblyName === row.assemblyName && a.costCode === code
      );
      matchedComps.forEach(comp => {
        estQty += row.quantity * comp.qtyFactor;
      });
    });

    const estCost = estQty * unitRate;
    return { estQty, estCost };
  };

  const handleStartEdit = (code: string, currentQty: number, currentCost: number) => {
    setEditingCode(code);
    setEditQty(currentQty);
    setEditCost(currentCost);
  };

  const handleSaveEdit = (code: string) => {
    onUpdateActualCost(code, editQty, editCost);
    setEditingCode(null);
  };

  // Aggregated totals
  let totalEst = 0;
  let totalAct = 0;
  let overrunCount = 0;

  costLibrary.forEach(item => {
    const { estCost } = getEstimatedMetrics(item.code);
    const actRow = actualCosts.find(ac => ac.costCode === item.code);
    const actCost = actRow ? actRow.actualCost : 0;
    totalEst += estCost;
    totalAct += actCost;
    if (actCost > estCost && estCost > 0) {
      overrunCount++;
    }
  });

  const netVariance = totalEst - totalAct;
  const netVariancePercent = totalEst > 0 ? (netVariance / totalEst) * 100 : 0;

  return (
    <div className="space-y-8 tab-fade-up">
      {/* Title & Aggregated Variance Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="standard-card">
          <span className="label-uppercase block text-xs">Total Estimated Baseline</span>
          <span className="font-display text-3xl font-bold text-[var(--color-primary)] font-mono-val mt-1 block">
            ${totalEst.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[var(--color-muted)] text-[11px] block mt-1">Sum of all takeoff assembly baselines</span>
        </div>

        <div className="standard-card">
          <span className="label-uppercase block text-xs">Total Actual Cost Spent</span>
          <span className="font-display text-3xl font-bold text-[var(--color-primary)] font-mono-val mt-1 block">
            ${totalAct.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[var(--color-muted)] text-[11px] block mt-1">Sum of field-reported actual receipts</span>
        </div>

        {/* Net Cost Variance */}
        <div className={`standard-card ${netVariance < 0 ? 'bg-[var(--anomaly-bg)] border-r-4 border-[var(--color-negative)]' : 'bg-[var(--insight-bg)] border-r-4 border-[var(--color-accent)]'}`}>
          <span className={`label-uppercase block text-xs ${netVariance < 0 ? 'text-red-800' : 'text-blue-800'}`}>
            Project Net Variance (Estimate - Actual)
          </span>
          <span className={`font-display text-3xl font-bold font-mono-val mt-1 block ${netVariance < 0 ? 'text-[var(--color-negative)]' : 'text-[var(--color-accent)]'}`}>
            {netVariance < 0 ? '-' : ''}${Math.abs(netVariance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[var(--color-muted)] text-[11px] block mt-1">
            {netVariance < 0 ? `${Math.abs(netVariancePercent).toFixed(1)}% Cost Overrun` : `${netVariancePercent.toFixed(1)}% Under Budget`}
          </span>
        </div>
      </div>

      {/* Critical Overruns Flag Block (Anomaly Signal only) */}
      {overrunCount > 0 && (
        <div className="anomaly-block flex items-start gap-3 animate-in">
          <AlertCircle className="w-5 h-5 text-[var(--color-negative)] flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-heading-title text-base font-bold text-[var(--color-negative)]">
              {overrunCount} Active Cost Code Overruns Detected
            </h4>
            <p className="text-xs text-[var(--color-body-text)] mt-1">
              Certain components have breached their allocated estimate baselines. Cost items flagged with a red <span className="font-semibold uppercase tracking-wider text-red-700 text-[10px]">Breached</span> status require dynamic review, field auditing, or client-approved change orders to normalize spending.
            </p>
          </div>
        </div>
      )}

      {/* Tracking Ledger Table */}
      <div className="bg-white rounded-[var(--radius-md)] shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--table-header-bg)] border-b-2 border-[var(--table-header-sep)] h-[var(--row-height-header)]">
                <th className="px-6 text-[var(--text-table-head)] font-semibold label-uppercase py-3">Cost Code</th>
                <th className="px-6 text-[var(--text-table-head)] font-semibold label-uppercase py-3">Item Description</th>
                <th className="px-6 text-[var(--text-table-head)] font-semibold label-uppercase py-3 text-right">Est. Qty</th>
                <th className="px-6 text-[var(--text-table-head)] font-semibold label-uppercase py-3 text-right">Est. Budget ($)</th>
                <th className="px-6 text-[var(--text-table-head)] font-semibold label-uppercase py-3 text-right">Actual Qty</th>
                <th className="px-6 text-[var(--text-table-head)] font-semibold label-uppercase py-3 text-right">Actual Cost ($)</th>
                <th className="px-6 text-[var(--text-table-head)] font-semibold label-uppercase py-3 text-right">Variance ($)</th>
                <th className="px-6 text-[var(--text-table-head)] font-semibold label-uppercase py-3 text-center">Status</th>
                <th className="px-6 text-[var(--text-table-head)] font-semibold label-uppercase py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {costLibrary.map((item, idx) => {
                const { estQty, estCost } = getEstimatedMetrics(item.code);
                const actRow = actualCosts.find(ac => ac.costCode === item.code);
                const actQty = actRow ? actRow.actualQty : 0;
                const actCost = actRow ? actRow.actualCost : 0;

                const variance = estCost - actCost;
                const isOverrun = actCost > estCost && estCost > 0;
                const isEditing = editingCode === item.code;

                // Status label & color
                let statusLabel = "On Track";
                let statusClass = "bg-gray-100 text-gray-700";

                if (estCost === 0 && actCost === 0) {
                  statusLabel = "Pending";
                  statusClass = "bg-slate-50 text-slate-400";
                } else if (isOverrun) {
                  statusLabel = "Breached";
                  statusClass = "bg-red-50 text-red-700 border border-red-200";
                }

                const rowBg = isOverrun
                  ? 'anomaly-row border-b border-red-100 hover:bg-red-50/50'
                  : idx % 2 === 0
                  ? 'bg-[var(--color-bg)]/20 border-b border-[var(--color-border)] hover:bg-[rgba(5,28,44,0.02)]'
                  : 'bg-white border-b border-[var(--color-border)] hover:bg-[rgba(5,28,44,0.02)]';

                return (
                  <tr key={item.code} className={`${rowBg} transition-colors h-[var(--row-height-body)] text-xs`}>
                    {/* Cost Code */}
                    <td className="px-6 py-3 font-semibold text-[var(--color-primary)] font-mono-val">{item.code}</td>

                    {/* Description */}
                    <td className="px-6 py-3 font-medium">{item.description}</td>

                    {/* Est. Qty */}
                    <td className="px-6 py-3 text-right font-mono-val text-gray-500">
                      {estQty.toLocaleString(undefined, { maximumFractionDigits: 2 })} {item.unit}
                    </td>

                    {/* Est. Cost */}
                    <td className="px-6 py-3 text-right font-mono-val font-semibold text-[var(--color-primary)]">
                      ${estCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Actual Qty */}
                    <td className="px-6 py-3 text-right font-mono-val font-semibold">
                      {isEditing ? (
                        <input
                          type="number"
                          className="input-editable w-24 text-right"
                          value={editQty}
                          onChange={e => setEditQty(parseFloat(e.target.value) || 0)}
                        />
                      ) : (
                        `${actQty.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${item.unit}`
                      )}
                    </td>

                    {/* Actual Cost */}
                    <td className="px-6 py-3 text-right font-mono-val font-bold">
                      {isEditing ? (
                        <input
                          type="number"
                          className="input-editable w-28 text-right"
                          value={editCost}
                          onChange={e => setEditCost(parseFloat(e.target.value) || 0)}
                        />
                      ) : (
                        `$${actCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      )}
                    </td>

                    {/* Variance */}
                    <td className={`px-6 py-3 text-right font-mono-val font-bold ${isOverrun ? 'text-anomaly' : 'text-gray-700'}`}>
                      {variance < 0 ? '-' : ''}${Math.abs(variance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-3 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase ${statusClass}`}>
                        {statusLabel}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(item.code)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                              title="Commit actual costs"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCode(null)}
                              className="p-1 text-gray-500 hover:bg-gray-100 rounded cursor-pointer"
                              title="Discard"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStartEdit(item.code, actQty, actCost)}
                            className="p-1.5 text-[var(--color-accent)] hover:bg-blue-50 rounded cursor-pointer text-[11px] font-semibold flex items-center gap-1 uppercase tracking-wider"
                          >
                            <DollarSign className="w-3.5 h-3.5" /> Log
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
