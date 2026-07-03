import React, { useState } from 'react';
import { EstimateInputRow, AssemblyItem, CostLibraryItem, ProjectSetup } from '../types';
import { Download, Clipboard, Check, Share2, Info } from 'lucide-react';

interface SmartSheetExportTabProps {
  rows: EstimateInputRow[];
  assemblies: AssemblyItem[];
  costLibrary: CostLibraryItem[];
  setup: ProjectSetup;
}

export const SmartSheetExportTab: React.FC<SmartSheetExportTabProps> = ({ rows, assemblies, costLibrary, setup }) => {
  const [copied, setCopied] = useState(false);

  // Parse unit from assembly name or assign standard fallback
  const getAssemblyUnit = (name: string): string => {
    const lowercase = name.toLowerCase();
    if (lowercase.includes('sf')) return 'SF';
    if (lowercase.includes('cy')) return 'CY';
    if (lowercase.includes('ton')) return 'Ton';
    if (lowercase.includes('ea')) return 'EA';
    if (lowercase.includes('lf')) return 'LF';
    return 'UNIT';
  };

  // Helper to calculate costs for an input quantity
  const calculateRowCosts = (assemblyName: string, quantity: number) => {
    let labor = 0;
    let material = 0;
    let equipment = 0;

    const comps = assemblies.filter(a => a.assemblyName === assemblyName);
    comps.forEach(comp => {
      const rateItem = costLibrary.find(cl => cl.code === comp.costCode);
      if (rateItem) {
        const itemQty = quantity * comp.qtyFactor;
        labor += itemQty * rateItem.laborRate;
        material += itemQty * rateItem.materialRate;
        equipment += itemQty * rateItem.equipmentRate;
      }
    });

    const directCost = labor + material + equipment;
    const markup = directCost * (setup.markupPercent / 100);
    const contingency = directCost * (setup.contingencyPercent / 100);
    const totalBudget = directCost + markup + contingency;

    return {
      labor,
      material,
      equipment,
      directCost,
      markup,
      contingency,
      totalBudget
    };
  };

  // Build the flat SmartSheet compatible rows
  const exportRows = rows.map((row, idx) => {
    const taskId = `SS-${String(idx + 1).padStart(3, '0')}`;
    const unit = getAssemblyUnit(row.assemblyName);
    const costs = calculateRowCosts(row.assemblyName, row.quantity);

    return {
      taskId,
      wbs: row.wbs,
      description: row.assemblyName,
      quantity: row.quantity,
      unit,
      labor: costs.labor,
      material: costs.material,
      equipment: costs.equipment,
      markup: costs.markup,
      contingency: costs.contingency,
      totalBudget: costs.totalBudget,
      status: "Approved"
    };
  });

  // Construct CSV content
  const generateCSV = (): string => {
    const headers = [
      "Task ID",
      "WBS Phase",
      "Description",
      "Quantity",
      "Unit",
      "Direct Labor",
      "Direct Material",
      "Direct Equipment",
      "G&A Markup",
      "Contingency",
      "Total Budget",
      "Status"
    ];

    const lines = [headers.join(",")];

    exportRows.forEach(r => {
      const rowArr = [
        `"${r.taskId}"`,
        `"${r.wbs.replace(/"/g, '""')}"`,
        `"${r.description.replace(/"/g, '""')}"`,
        r.quantity.toFixed(2),
        `"${r.unit}"`,
        r.labor.toFixed(2),
        r.material.toFixed(2),
        r.equipment.toFixed(2),
        r.markup.toFixed(2),
        r.contingency.toFixed(2),
        r.totalBudget.toFixed(2),
        `"${r.status}"`
      ];
      lines.push(rowArr.join(","));
    });

    return lines.join("\n");
  };

  const handleCopyToClipboard = () => {
    const csvContent = generateCSV();
    navigator.clipboard.writeText(csvContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadCSV = () => {
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${setup.projectName.replace(/\s+/g, '_')}_AIA_SmartSheet_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 tab-fade-up">
      {/* Description Panel & Actions */}
      <div className="standard-card flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h3 className="font-heading-title text-xl font-bold text-[var(--color-primary)]">SmartSheet Mapping Bridge</h3>
          <p className="text-[var(--color-muted)] text-xs mt-1 max-w-2xl">
            This module normalizes the complex, multi-tiered G703 AIA estimate database into a flat CSV mapping structure. You can import this directly into SmartSheet workspaces, keeping and preserving cost structures.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Copy CSV */}
          <button
            type="button"
            id="btn-copy-csv"
            onClick={handleCopyToClipboard}
            className="bg-white text-[var(--color-primary)] border border-[var(--color-border)] py-2 px-4 rounded-[var(--radius-sm)] text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 hover:bg-slate-50 active:scale-[0.97] transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" /> Copied
              </>
            ) : (
              <>
                <Clipboard className="w-4 h-4" /> Copy CSV Schema
              </>
            )}
          </button>

          {/* Download CSV file */}
          <button
            type="button"
            id="btn-download-csv"
            onClick={handleDownloadCSV}
            className="bg-[var(--color-primary)] text-white py-2 px-4 rounded-[var(--radius-sm)] text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 hover:bg-[rgba(5,28,44,0.9)] active:scale-[0.97] transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export CSV File
          </button>
        </div>
      </div>

      {/* Grid Workspace Preview */}
      <div className="bg-white rounded-[var(--radius-md)] shadow-md overflow-hidden animate-in">
        <div className="p-4 border-b border-[var(--color-border)] bg-slate-50 flex items-center gap-2 text-xs">
          <Share2 className="w-4 h-4 text-[var(--color-accent)]" />
          <span className="font-semibold text-[var(--color-primary)] uppercase tracking-wider">SmartSheet Import File Fields Mapping Preview</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--table-header-bg)] border-b-2 border-[var(--table-header-sep)] h-10">
                <th className="px-5 text-[11px] font-semibold label-uppercase py-2">Task ID</th>
                <th className="px-5 text-[11px] font-semibold label-uppercase py-2">WBS Phase</th>
                <th className="px-5 text-[11px] font-semibold label-uppercase py-2">Description</th>
                <th className="px-5 text-[11px] font-semibold label-uppercase py-2 text-right">Quantity</th>
                <th className="px-5 text-[11px] font-semibold label-uppercase py-2 text-center">Unit</th>
                <th className="px-5 text-[11px] font-semibold label-uppercase py-2 text-right">Labor ($)</th>
                <th className="px-5 text-[11px] font-semibold label-uppercase py-2 text-right">Material ($)</th>
                <th className="px-5 text-[11px] font-semibold label-uppercase py-2 text-right">Equipment ($)</th>
                <th className="px-5 text-[11px] font-semibold label-uppercase py-2 text-right">G&A Markup ($)</th>
                <th className="px-5 text-[11px] font-semibold label-uppercase py-2 text-right">Contingency ($)</th>
                <th className="px-5 text-[11px] font-semibold label-uppercase py-2 text-right">Total Budget ($)</th>
                <th className="px-5 text-[11px] font-semibold label-uppercase py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {exportRows.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-12 text-xs text-[var(--color-muted)] font-medium">
                    Please build some estimate takeoff entries first to generate the SmartSheet mapping bridge.
                  </td>
                </tr>
              ) : (
                exportRows.map((r, idx) => {
                  const rowClass = idx % 2 === 0 ? 'bg-[var(--color-bg)]/25' : 'bg-white';
                  return (
                    <tr key={r.taskId} className={`${rowClass} border-b border-[var(--color-border)] hover:bg-[rgba(5,28,44,0.01)] transition-colors h-[38px] text-xs`}>
                      <td className="px-5 py-2 font-mono-val font-semibold text-[var(--color-primary)]">{r.taskId}</td>
                      <td className="px-5 py-2 font-medium">{r.wbs}</td>
                      <td className="px-5 py-2">{r.description}</td>
                      <td className="px-5 py-2 text-right font-mono-val">{r.quantity.toFixed(2)}</td>
                      <td className="px-5 py-2 text-center text-gray-400 font-mono-val">{r.unit}</td>
                      <td className="px-5 py-2 text-right font-mono-val">${r.labor.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-5 py-2 text-right font-mono-val">${r.material.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-5 py-2 text-right font-mono-val">${r.equipment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-5 py-2 text-right font-mono-val text-gray-500">${r.markup.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-5 py-2 text-right font-mono-val text-gray-500">${r.contingency.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-5 py-2 text-right font-mono-val font-bold text-[var(--color-accent)]">${r.totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-5 py-2 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-blue-50 text-[var(--color-accent)] border border-blue-100">
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Informative Guidance Panel */}
      <div className="insight-block flex items-start gap-3">
        <Info className="w-5 h-5 text-[var(--color-accent)] flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-heading-title text-base font-semibold text-[var(--color-primary)] mb-1">
            SmartSheet Integration Step-by-Step
          </h4>
          <ol className="list-decimal list-inside text-xs text-[var(--color-body-text)] space-y-1.5 mt-2">
            <li>Click the <span className="font-semibold text-[var(--color-primary)]">Export CSV File</span> button above to download the direct CSV spreadsheet to your local desktop folder.</li>
            <li>Launch your SmartSheet Account and navigate to <span className="font-medium">File &gt; Import &gt; Import Excel/CSV Sheet</span>.</li>
            <li>Select the downloaded CSV file, map the column fields (which are preset in optimal order), and initiate the workspace.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
