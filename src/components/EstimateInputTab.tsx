import React, { useState } from 'react';
import { EstimateInputRow, AssemblyItem, CostLibraryItem, ProjectSetup } from '../types';
import { Plus, Trash2, Edit2, Check, X, ShieldAlert, DollarSign, Hammer, Box, Truck } from 'lucide-react';

interface EstimateInputTabProps {
  rows: EstimateInputRow[];
  assemblies: AssemblyItem[];
  costLibrary: CostLibraryItem[];
  setup: ProjectSetup;
  onAddRow: (row: EstimateInputRow) => void;
  onUpdateRow: (id: string, updated: EstimateInputRow) => void;
  onDeleteRow: (id: string) => void;
}

export const EstimateInputTab: React.FC<EstimateInputTabProps> = ({
  rows,
  assemblies,
  costLibrary,
  setup,
  onAddRow,
  onUpdateRow,
  onDeleteRow
}) => {
  // Local state for editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editWbs, setEditWbs] = useState('');
  const [editAssemblyName, setEditAssemblyName] = useState('');
  const [editQuantity, setEditQuantity] = useState<number>(0);

  // Local state for new entry
  const [newWbs, setNewWbs] = useState('');
  const [newAssemblyName, setNewAssemblyName] = useState('');
  const [newQuantity, setNewQuantity] = useState<number>(100);
  const [addError, setAddError] = useState<string | null>(null);

  // Group unique assembly names for dropdowns
  const uniqueAssemblyNames = Array.from(new Set(assemblies.map(a => a.assemblyName)));

  // Master helper to calculate costs for an input quantity
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
    const markupFactor = setup.markupPercent / 100;
    const contingencyFactor = setup.contingencyPercent / 100;

    const markup = directCost * markupFactor;
    const contingency = directCost * contingencyFactor;
    const loadedTotal = directCost + markup + contingency;

    return {
      labor,
      material,
      equipment,
      directCost,
      markup,
      contingency,
      loadedTotal
    };
  };

  // Compute aggregated KPI highlights for the Estimator console
  let totalLabor = 0;
  let totalMaterial = 0;
  let totalEquipment = 0;
  let totalDirect = 0;

  rows.forEach(r => {
    const calc = calculateRowCosts(r.assemblyName, r.quantity);
    totalLabor += calc.labor;
    totalMaterial += calc.material;
    totalEquipment += calc.equipment;
    totalDirect += calc.directCost;
  });

  const totalMarkup = totalDirect * (setup.markupPercent / 100);
  const totalContingency = totalDirect * (setup.contingencyPercent / 100);
  const totalLoaded = totalDirect + totalMarkup + totalContingency;

  // Max direct cost in list for inline data bar scaling
  const maxDirectInList = Math.max(...rows.map(r => calculateRowCosts(r.assemblyName, r.quantity).directCost), 1);

  const handleStartEdit = (row: EstimateInputRow) => {
    setEditingId(row.id);
    setEditWbs(row.wbs);
    setEditAssemblyName(row.assemblyName);
    setEditQuantity(row.quantity);
  };

  const handleSaveEdit = (id: string) => {
    if (!editAssemblyName) return;
    onUpdateRow(id, {
      id,
      wbs: editWbs,
      assemblyName: editAssemblyName,
      quantity: editQuantity
    });
    setEditingId(null);
  };

  const handleAddNewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWbs.trim()) {
      setAddError("WBS code/description is required.");
      return;
    }
    if (!newAssemblyName) {
      setAddError("Please select a standard Cost Assembly.");
      return;
    }
    if (newQuantity <= 0) {
      setAddError("Quantity must be greater than zero.");
      return;
    }

    setAddError(null);
    onAddRow({
      id: `EST-${Date.now()}`,
      wbs: newWbs.trim(),
      assemblyName: newAssemblyName,
      quantity: newQuantity
    });

    setNewWbs('');
    setNewAssemblyName('');
    setNewQuantity(100);
  };

  return (
    <div className="space-y-8 tab-fade-up">
      {/* Dynamic Summary Cards / KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="kpi-card">
          <div className="flex justify-between items-start text-gray-500">
            <span className="label-uppercase">Est. Labor Sum</span>
            <Hammer className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="font-display text-3xl font-bold text-[var(--color-primary)] mt-2 font-mono-val">
            ${totalLabor.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[var(--color-muted)] text-[11px] mt-1 font-mono-val">
            {(totalDirect > 0 ? (totalLabor / totalDirect) * 100 : 0).toFixed(1)}% of Direct costs
          </p>
        </div>

        <div className="kpi-card">
          <div className="flex justify-between items-start text-gray-500">
            <span className="label-uppercase">Est. Material Sum</span>
            <Box className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="font-display text-3xl font-bold text-[var(--color-primary)] mt-2 font-mono-val">
            ${totalMaterial.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[var(--color-muted)] text-[11px] mt-1 font-mono-val">
            {(totalDirect > 0 ? (totalMaterial / totalDirect) * 100 : 0).toFixed(1)}% of Direct costs
          </p>
        </div>

        <div className="kpi-card">
          <div className="flex justify-between items-start text-gray-500">
            <span className="label-uppercase">Est. Equipment Sum</span>
            <Truck className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="font-display text-3xl font-bold text-[var(--color-primary)] mt-2 font-mono-val">
            ${totalEquipment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[var(--color-muted)] text-[11px] mt-1 font-mono-val">
            {(totalDirect > 0 ? (totalEquipment / totalDirect) * 100 : 0).toFixed(1)}% of Direct costs
          </p>
        </div>

        <div className="kpi-card bg-[var(--insight-bg)] border-r-4 border-[var(--color-accent)]">
          <div className="flex justify-between items-start text-[var(--color-accent)]">
            <span className="label-uppercase text-[var(--color-accent)] font-semibold">Loaded Proposal Value</span>
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="font-display text-3xl font-bold text-[var(--color-accent)] mt-2 font-mono-val">
            ${totalLoaded.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[var(--color-muted)] text-[11px] mt-1 font-mono-val">
            Direct Subtotal: ${totalDirect.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {/* Adding Estimate Rows */}
      <div className="standard-card">
        <h3 className="font-heading-title text-lg font-semibold text-[var(--color-primary)] mb-4">
          Add Construction Scope Estimating Line
        </h3>
        <form onSubmit={handleAddNewSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* WBS Code */}
          <div className="flex flex-col space-y-1">
            <label className="label-uppercase">WBS Phase/Division</label>
            <input
              type="text"
              id="est-wbs"
              placeholder="e.g. 03-300 Concrete Slab"
              className="input-editable"
              value={newWbs}
              onChange={e => setNewWbs(e.target.value)}
            />
          </div>

          {/* Assemblies */}
          <div className="flex flex-col space-y-1">
            <label className="label-uppercase">Composite Assembly</label>
            <select
              id="est-assembly"
              className="input-editable h-[38px]"
              value={newAssemblyName}
              onChange={e => setNewAssemblyName(e.target.value)}
            >
              <option value="">-- Choose Assembly --</option>
              {uniqueAssemblyNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div className="flex flex-col space-y-1">
            <label className="label-uppercase">Takeoff Quantity</label>
            <input
              type="number"
              id="est-qty"
              min="0.01"
              step="0.01"
              className="input-editable font-mono-val"
              value={newQuantity}
              onChange={e => setNewQuantity(parseFloat(e.target.value) || 0)}
            />
          </div>

          {/* Add Action Button */}
          <div>
            <button
              type="submit"
              id="btn-add-estimate-row"
              className="w-full bg-[var(--color-primary)] text-white font-medium py-2 px-4 rounded-[var(--radius-sm)] flex items-center justify-center gap-1.5 hover:bg-[rgba(5,28,44,0.9)] cursor-pointer text-xs uppercase tracking-wider h-[38px]"
            >
              <Plus className="w-4 h-4" /> Add Bid Line
            </button>
          </div>
        </form>

        {addError && (
          <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 p-2.5 rounded-[var(--radius-sm)] text-xs font-medium">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{addError}</span>
          </div>
        )}
      </div>

      {/* Estimate Sheet Table */}
      <div className="bg-white rounded-[var(--radius-md)] shadow-md overflow-hidden animate-in">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--table-header-bg)] border-b-2 border-[var(--table-header-sep)] h-[var(--row-height-header)]">
                <th className="px-6 text-[var(--text-table-head)] font-semibold label-uppercase py-3">WBS Phase</th>
                <th className="px-6 text-[var(--text-table-head)] font-semibold label-uppercase py-3">Selected Assembly</th>
                <th className="px-6 text-[var(--text-table-head)] font-semibold label-uppercase py-3 text-right">Qty</th>
                <th className="px-6 text-[var(--text-table-head)] font-semibold label-uppercase py-3 text-right">Labor ($)</th>
                <th className="px-6 text-[var(--text-table-head)] font-semibold label-uppercase py-3 text-right">Material ($)</th>
                <th className="px-6 text-[var(--text-table-head)] font-semibold label-uppercase py-3 text-right">Equipment ($)</th>
                <th className="px-6 text-[var(--text-table-head)] font-semibold label-uppercase py-3 text-right">Direct Subtotal ($)</th>
                <th className="px-6 text-[var(--text-table-head)] font-semibold label-uppercase py-3 text-right">Fully Loaded ($)</th>
                <th className="px-6 text-[var(--text-table-head)] font-semibold label-uppercase py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                const isEditing = editingId === row.id;
                const rowClass = idx % 2 === 0 ? 'bg-[var(--color-bg)]/20' : 'bg-white';

                // Calculating dynamic components values
                const costs = calculateRowCosts(row.assemblyName, row.quantity);

                return (
                  <tr
                    key={row.id}
                    className={`${rowClass} border-b border-[var(--color-border)] hover:bg-[rgba(5,28,44,0.02)] transition-colors h-[var(--row-height-body)]`}
                  >
                    {/* WBS */}
                    <td className="px-6 py-3 font-semibold text-[var(--color-primary)] text-xs">
                      {isEditing ? (
                        <input
                          type="text"
                          className="input-editable w-full"
                          value={editWbs}
                          onChange={e => setEditWbs(e.target.value)}
                        />
                      ) : (
                        row.wbs
                      )}
                    </td>

                    {/* Assembly Name */}
                    <td className="px-6 py-3 text-xs font-medium">
                      {isEditing ? (
                        <select
                          className="input-editable w-full"
                          value={editAssemblyName}
                          onChange={e => setEditAssemblyName(e.target.value)}
                        >
                          {uniqueAssemblyNames.map(name => (
                            <option key={name} value={name}>{name}</option>
                          ))}
                        </select>
                      ) : (
                        row.assemblyName
                      )}
                    </td>

                    {/* Quantity */}
                    <td className="px-6 py-3 text-right text-xs font-mono-val font-semibold">
                      {isEditing ? (
                        <input
                          type="number"
                          className="input-editable w-24 text-right"
                          value={editQuantity}
                          onChange={e => setEditQuantity(parseFloat(e.target.value) || 0)}
                        />
                      ) : (
                        row.quantity.toLocaleString(undefined, { maximumFractionDigits: 2 })
                      )}
                    </td>

                    {/* Labor Cost */}
                    <td className="px-6 py-3 text-right text-xs font-mono-val text-gray-600">
                      ${costs.labor.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Material Cost */}
                    <td className="px-6 py-3 text-right text-xs font-mono-val text-gray-600">
                      ${costs.material.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Equipment Cost */}
                    <td className="px-6 py-3 text-right text-xs font-mono-val text-gray-600">
                      ${costs.equipment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Direct Cost */}
                    <td className="px-6 py-3 text-right text-xs font-mono-val font-medium text-[var(--color-primary)]">
                      <div className="flex flex-col items-end justify-center h-full">
                        <span>${costs.directCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        {/* Dynamic inline data bar scaling relative to highest direct cost row */}
                        <div className="w-full h-1 bg-[rgba(34,81,255,0.1)] rounded-full overflow-hidden mt-1 max-w-[100px]">
                          <div
                            className="bg-[var(--color-accent)] h-full rounded-full transition-all duration-300"
                            style={{ width: `${(costs.directCost / maxDirectInList) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Fully Loaded Total Cost */}
                    <td className="px-6 py-3 text-right text-xs font-mono-val font-bold text-[var(--color-accent)]">
                      ${costs.loadedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(row.id)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStartEdit(row)}
                              className="p-1.5 text-[var(--color-accent)] hover:bg-blue-50 rounded cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteRow(row.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
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
