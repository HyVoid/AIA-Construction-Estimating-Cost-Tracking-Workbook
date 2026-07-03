import React from 'react';
import { EstimateInputRow, AssemblyItem, CostLibraryItem, ProjectSetup } from '../types';
import { Award, DollarSign, PieChart, Info, Percent } from 'lucide-react';

interface AIASummaryTabProps {
  rows: EstimateInputRow[];
  assemblies: AssemblyItem[];
  costLibrary: CostLibraryItem[];
  setup: ProjectSetup;
}

export const AIASummaryTab: React.FC<AIASummaryTabProps> = ({ rows, assemblies, costLibrary, setup }) => {
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
    return { labor, material, equipment, directCost };
  };

  // Group elements by WBS / Division name
  const summaryMap: {
    [wbs: string]: {
      labor: number;
      material: number;
      equipment: number;
      direct: number;
    };
  } = {};

  rows.forEach(r => {
    const costs = calculateRowCosts(r.assemblyName, r.quantity);
    if (!summaryMap[r.wbs]) {
      summaryMap[r.wbs] = { labor: 0, material: 0, equipment: 0, direct: 0 };
    }
    summaryMap[r.wbs].labor += costs.labor;
    summaryMap[r.wbs].material += costs.material;
    summaryMap[r.wbs].equipment += costs.equipment;
    summaryMap[r.wbs].direct += costs.directCost;
  });

  const wbsKeys = Object.keys(summaryMap).sort();

  // Aggregate global values
  let totalLabor = 0;
  let totalMaterial = 0;
  let totalEquipment = 0;
  let totalDirect = 0;

  wbsKeys.forEach(k => {
    const s = summaryMap[k];
    totalLabor += s.labor;
    totalMaterial += s.material;
    totalEquipment += s.equipment;
    totalDirect += s.direct;
  });

  const markupAmount = totalDirect * (setup.markupPercent / 100);
  const contingencyAmount = totalDirect * (setup.contingencyPercent / 100);
  const loadedTotal = totalDirect + markupAmount + contingencyAmount;

  return (
    <div className="space-y-8 tab-fade-up">
      {/* Bid Cover Metadata Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="standard-card lg:col-span-2">
          <h3 className="font-heading-title text-xl font-bold text-[var(--color-primary)] mb-1">AIA G703 Schedule of Values</h3>
          <p className="text-[var(--color-muted)] text-xs mb-6">
            Authorized professional cost distribution summary structured according to the American Institute of Architects AIA G703 specifications.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="label-uppercase text-gray-500">Project Name</span>
              <span className="block font-semibold text-[var(--color-primary)] truncate mt-0.5">{setup.projectName}</span>
            </div>
            <div>
              <span className="label-uppercase text-gray-500">Client entity</span>
              <span className="block font-semibold text-[var(--color-primary)] truncate mt-0.5">{setup.client}</span>
            </div>
            <div>
              <span className="label-uppercase text-gray-500">Lead estimator</span>
              <span className="block font-semibold text-[var(--color-primary)] truncate mt-0.5">{setup.estimator}</span>
            </div>
            <div>
              <span className="label-uppercase text-gray-500">Scheduled Bid Date</span>
              <span className="block font-semibold text-[var(--color-primary)] mt-0.5">{setup.bidDate}</span>
            </div>
          </div>
        </div>

        {/* Highlighting Summary KPIs */}
        <div className="kpi-card bg-[var(--color-primary)] text-white flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="label-uppercase text-blue-200">Total Bid Proposal Price</span>
            <Award className="w-5 h-5 text-blue-300" />
          </div>
          <div className="my-3">
            <span className="font-display text-4xl font-extrabold tracking-wide font-mono-val">
              ${loadedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center text-[11px] text-blue-100 border-t border-blue-900 pt-2 font-mono-val">
            <span>Direct Cost: ${totalDirect.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            <span>Markup & Cont: +{((setup.markupPercent + setup.contingencyPercent)).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Division Allocation Horizontal Bar Chart (Custom Clean HTML) */}
      <div className="standard-card">
        <h3 className="font-heading-title text-lg font-semibold text-[var(--color-primary)] mb-4 flex items-center gap-1.5">
          <PieChart className="w-4 h-4 text-[var(--color-accent)]" /> Division Weight Allocation
        </h3>
        <div className="space-y-4">
          {wbsKeys.map(key => {
            const rowDirect = summaryMap[key].direct;
            const percentage = totalDirect > 0 ? (rowDirect / totalDirect) * 100 : 0;
            return (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-[var(--color-primary)]">{key}</span>
                  <span className="font-mono-val text-gray-500 font-semibold">{percentage.toFixed(1)}%</span>
                </div>
                {/* Horizontal progress bar */}
                <div className="w-full h-3 bg-[rgba(5,28,44,0.05)] rounded-full overflow-hidden">
                  <div
                    className="bg-[var(--color-accent)] h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Standard AIA G703 Table representation */}
      <div className="bg-white rounded-[var(--radius-md)] shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {/* Header Group */}
              <tr className="bg-[var(--table-header-bg)] border-b-2 border-[var(--table-header-sep)] h-[var(--row-height-header)]">
                <th className="px-6 text-[var(--text-table-head)] font-semibold label-uppercase py-3">WBS/Division Description</th>
                <th className="px-6 text-[var(--text-table-head)] font-semibold label-uppercase py-3 text-right">Direct Labor</th>
                <th className="px-6 text-[var(--text-table-head)] font-semibold label-uppercase py-3 text-right">Direct Material</th>
                <th className="px-6 text-[var(--text-table-head)] font-semibold label-uppercase py-3 text-right">Direct Equipment</th>
                <th className="px-6 text-[var(--text-table-head)] font-semibold label-uppercase py-3 text-right">Total Direct Cost</th>
                <th className="px-6 text-[var(--text-table-head)] font-semibold label-uppercase py-3 text-right">Markup Allocation</th>
                <th className="px-6 text-[var(--text-table-head)] font-semibold label-uppercase py-3 text-right">Contingency Allocation</th>
                <th className="px-6 text-[var(--text-table-head)] font-semibold label-uppercase py-3 text-right">Fully Loaded Bid Value</th>
              </tr>
            </thead>
            <tbody>
              {wbsKeys.map((wbs, idx) => {
                const s = summaryMap[wbs];
                const rowClass = idx % 2 === 0 ? 'bg-[var(--color-bg)]/20' : 'bg-white';

                const rowMarkup = s.direct * (setup.markupPercent / 100);
                const rowContingency = s.direct * (setup.contingencyPercent / 100);
                const rowTotal = s.direct + rowMarkup + rowContingency;

                return (
                  <tr
                    key={wbs}
                    className={`${rowClass} border-b border-[var(--color-border)] hover:bg-[rgba(5,28,44,0.02)] transition-colors h-[var(--row-height-body)] text-xs`}
                  >
                    <td className="px-6 py-3 font-semibold text-[var(--color-primary)]">{wbs}</td>
                    <td className="px-6 py-3 text-right font-mono-val text-gray-600">${s.labor.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-6 py-3 text-right font-mono-val text-gray-600">${s.material.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-6 py-3 text-right font-mono-val text-gray-600">${s.equipment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-6 py-3 text-right font-mono-val font-semibold text-[var(--color-primary)]">
                      ${s.direct.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-3 text-right font-mono-val text-gray-500">${rowMarkup.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-6 py-3 text-right font-mono-val text-gray-500">${rowContingency.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-6 py-3 text-right font-mono-val font-bold text-[var(--color-accent)]">
                      ${rowTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}

              {/* Total Row */}
              <tr className="bg-[rgba(5,28,44,0.06)] border-t-2 border-[var(--color-primary)] h-[var(--row-height-header)] text-xs font-bold text-[var(--color-primary)]">
                <td className="px-6 py-3 uppercase tracking-wider font-bold">Comprehensive Summary Subtotal</td>
                <td className="px-6 py-3 text-right font-mono-val">${totalLabor.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="px-6 py-3 text-right font-mono-val">${totalMaterial.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="px-6 py-3 text-right font-mono-val">${totalEquipment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="px-6 py-3 text-right font-mono-val">${totalDirect.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="px-6 py-3 text-right font-mono-val">${markupAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="px-6 py-3 text-right font-mono-val">${contingencyAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="px-6 py-3 text-right font-mono-val text-base text-[var(--color-accent)]">
                  ${loadedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Formula Footnote */}
      <div className="insight-block flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[var(--color-accent)] flex-shrink-0 mt-0.5" />
        <div className="text-xs space-y-1 text-[var(--color-body-text)]">
          <p className="font-semibold">AIA Standard Allocation Methodology</p>
          <p>
            General & Administrative Markup (<span className="font-medium">{setup.markupPercent}%</span>) and Project Contingency (<span className="font-medium">{setup.contingencyPercent}%</span>) are allocated proportionally to the respective Divisions to satisfy the standard G703 bid billing presentation.
          </p>
        </div>
      </div>
    </div>
  );
};
