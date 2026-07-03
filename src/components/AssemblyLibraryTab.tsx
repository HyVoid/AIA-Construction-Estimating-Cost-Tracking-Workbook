import React, { useState } from 'react';
import { AssemblyItem, CostLibraryItem } from '../types';
import { Plus, Trash2, Edit2, Check, X, ShieldAlert, FolderOpen } from 'lucide-react';

interface AssemblyLibraryTabProps {
  assemblies: AssemblyItem[];
  costLibrary: CostLibraryItem[];
  onAddAssemblyComponent: (component: Omit<AssemblyItem, 'id'>) => void;
  onUpdateAssemblyFactor: (id: string, qtyFactor: number) => void;
  onDeleteAssemblyComponent: (id: string) => void;
  onDeleteAssemblyGroup: (assemblyName: string) => void;
}

export const AssemblyLibraryTab: React.FC<AssemblyLibraryTabProps> = ({
  assemblies,
  costLibrary,
  onAddAssemblyComponent,
  onUpdateAssemblyFactor,
  onDeleteAssemblyComponent,
  onDeleteAssemblyGroup
}) => {
  // Local state for edits
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFactor, setEditFactor] = useState<number>(0);

  // Local state for adding a new assembly or component
  const [newAssemblyName, setNewAssemblyName] = useState('');
  const [newCostCode, setNewCostCode] = useState('');
  const [newFactor, setNewFactor] = useState<number>(1);
  const [addError, setAddError] = useState<string | null>(null);

  // Group assemblies by Assembly Name
  const groupedAssemblies: { [key: string]: AssemblyItem[] } = {};
  assemblies.forEach(a => {
    if (!groupedAssemblies[a.assemblyName]) {
      groupedAssemblies[a.assemblyName] = [];
    }
    groupedAssemblies[a.assemblyName].push(a);
  });

  const uniqueAssemblyNames = Object.keys(groupedAssemblies);

  const handleStartEdit = (id: string, currentFactor: number) => {
    setEditingId(id);
    setEditFactor(currentFactor);
  };

  const handleSaveEdit = (id: string) => {
    onUpdateAssemblyFactor(id, editFactor);
    setEditingId(null);
  };

  const handleAddComponentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssemblyName.trim()) {
      setAddError("Assembly Name is required.");
      return;
    }
    if (!newCostCode) {
      setAddError("Please select a standard Cost Code.");
      return;
    }
    if (newFactor <= 0) {
      setAddError("Quantity Factor must be a positive number.");
      return;
    }

    setAddError(null);
    onAddAssemblyComponent({
      assemblyName: newAssemblyName.trim(),
      costCode: newCostCode,
      qtyFactor: newFactor
    });

    setNewCostCode('');
    setNewFactor(1);
  };

  return (
    <div className="space-y-8 tab-fade-up">
      {/* Description Header */}
      <div>
        <h2 className="font-heading-title text-2xl font-bold text-[var(--color-primary)]">Cost Assemblies</h2>
        <p className="text-[var(--color-muted)] text-sm mt-1">
          Standardize typical construction items by building logical unit assemblies. A single assembly groups multiple cost library components with predefined multipliers (factors) to calculate composite per-unit prices.
        </p>
      </div>

      {/* Assembly Creation Panel */}
      <div className="standard-card">
        <h3 className="font-heading-title text-lg font-semibold text-[var(--color-primary)] mb-4">
          Add or Configure an Assembly Item
        </h3>
        <form onSubmit={handleAddComponentSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          {/* Assembly Name */}
          <div className="flex flex-col space-y-1 lg:col-span-2">
            <label className="label-uppercase">Assembly Name</label>
            <input
              type="text"
              id="assembly-select-name"
              list="assembly-names-list"
              placeholder="Select existing or type new assembly name..."
              className="input-editable w-full"
              value={newAssemblyName}
              onChange={e => setNewAssemblyName(e.target.value)}
            />
            <datalist id="assembly-names-list">
              {uniqueAssemblyNames.map(name => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>

          {/* Cost Code */}
          <div className="flex flex-col space-y-1">
            <label className="label-uppercase">Component Cost Code</label>
            <select
              id="assembly-select-code"
              className="input-editable h-[38px]"
              value={newCostCode}
              onChange={e => setNewCostCode(e.target.value)}
            >
              <option value="">-- Choose Code --</option>
              {costLibrary.map(item => (
                <option key={item.code} value={item.code}>
                  {item.code} - {item.description}
                </option>
              ))}
            </select>
          </div>

          {/* Qty Factor */}
          <div className="flex flex-col space-y-1">
            <label className="label-uppercase">Quantity Factor (Multiplier)</label>
            <input
              type="number"
              id="assembly-factor"
              step="0.00001"
              min="0.00001"
              className="input-editable font-mono-val"
              value={newFactor}
              onChange={e => setNewFactor(parseFloat(e.target.value) || 0)}
            />
          </div>

          {/* Add Button */}
          <div>
            <button
              type="submit"
              id="btn-add-assembly-comp"
              className="w-full bg-[var(--color-primary)] text-white font-medium py-2 px-4 rounded-[var(--radius-sm)] flex items-center justify-center gap-1.5 hover:bg-[rgba(5,28,44,0.9)] cursor-pointer text-xs uppercase tracking-wider h-[38px]"
            >
              <Plus className="w-4 h-4" /> Link Component
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

      {/* Assembly List */}
      <div className="space-y-8">
        {uniqueAssemblyNames.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] text-[var(--color-muted)]">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-30 text-[var(--color-primary)]" />
            <p className="font-heading-title text-lg font-medium">No assemblies configured yet</p>
            <p className="text-xs">Create a new assembly above by linking cost library items.</p>
          </div>
        ) : (
          uniqueAssemblyNames.map(assemblyName => {
            const components = groupedAssemblies[assemblyName];

            // Compute assembly unit rates
            let assemblyLaborRate = 0;
            let assemblyMaterialRate = 0;
            let assemblyEquipmentRate = 0;

            components.forEach(comp => {
              const matchedItem = costLibrary.find(item => item.code === comp.costCode);
              if (matchedItem) {
                assemblyLaborRate += comp.qtyFactor * matchedItem.laborRate;
                assemblyMaterialRate += comp.qtyFactor * matchedItem.materialRate;
                assemblyEquipmentRate += comp.qtyFactor * matchedItem.equipmentRate;
              }
            });

            const totalAssemblyRate = assemblyLaborRate + assemblyMaterialRate + assemblyEquipmentRate;

            return (
              <div key={assemblyName} className="bg-white rounded-[var(--radius-lg)] shadow-md overflow-hidden animate-in">
                {/* Card Header with Assembly Summary */}
                <div className="px-6 py-5 bg-[var(--color-primary)] text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="font-heading-title text-xl font-bold tracking-wide">{assemblyName}</h3>
                    <p className="text-blue-100 text-xs mt-1">
                      Composite unit assembly comprised of {components.length} interconnected cost components.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteAssemblyGroup(assemblyName)}
                    className="self-start md:self-auto text-red-200 hover:text-red-400 bg-red-950/30 hover:bg-red-950/50 px-3 py-1.5 rounded-[var(--radius-sm)] text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Purge Assembly
                  </button>
                </div>

                {/* Rates Panel */}
                <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-[var(--color-border)] bg-slate-50 text-center">
                  <div className="p-4 border-r border-[var(--color-border)]">
                    <span className="label-uppercase block text-xs">Labor Composition</span>
                    <span className="font-display text-2xl font-semibold text-[var(--color-primary)] font-mono-val mt-1 block">
                      ${assemblyLaborRate.toFixed(2)}
                    </span>
                  </div>
                  <div className="p-4 border-r border-[var(--color-border)]">
                    <span className="label-uppercase block text-xs">Material Composition</span>
                    <span className="font-display text-2xl font-semibold text-[var(--color-primary)] font-mono-val mt-1 block">
                      ${assemblyMaterialRate.toFixed(2)}
                    </span>
                  </div>
                  <div className="p-4 border-r border-[var(--color-border)]">
                    <span className="label-uppercase block text-xs">Equipment Composition</span>
                    <span className="font-display text-2xl font-semibold text-[var(--color-primary)] font-mono-val mt-1 block">
                      ${assemblyEquipmentRate.toFixed(2)}
                    </span>
                  </div>
                  <div className="p-4 bg-[var(--insight-bg)]">
                    <span className="label-uppercase text-[var(--color-accent)] block text-xs">Composite Unit Cost</span>
                    <span className="font-display text-2xl font-bold text-[var(--color-accent)] font-mono-val mt-1 block">
                      ${totalAssemblyRate.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Components Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[var(--table-header-bg)] border-b border-[var(--table-header-sep)] h-10">
                        <th className="px-6 label-uppercase text-xs font-semibold py-2">Component Code</th>
                        <th className="px-6 label-uppercase text-xs font-semibold py-2">Component Description</th>
                        <th className="px-6 label-uppercase text-xs font-semibold py-2 text-center">Unit</th>
                        <th className="px-6 label-uppercase text-xs font-semibold py-2 text-right">Factor Multiplier</th>
                        <th className="px-6 label-uppercase text-xs font-semibold py-2 text-right">Unit Rate</th>
                        <th className="px-6 label-uppercase text-xs font-semibold py-2 text-right">Allocated Assembly Cost</th>
                        <th className="px-6 label-uppercase text-xs font-semibold py-2 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {components.map((comp, idx) => {
                        const matchedItem = costLibrary.find(item => item.code === comp.costCode);
                        const isEditing = editingId === comp.id;
                        const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-[var(--color-bg)]/10';

                        if (!matchedItem) return null;

                        const itemUnitRate = matchedItem.laborRate + matchedItem.materialRate + matchedItem.equipmentRate;
                        const allocatedCost = comp.qtyFactor * itemUnitRate;

                        return (
                          <tr key={comp.id} className={`${rowBg} border-b border-[var(--color-border)] h-11 text-xs hover:bg-[rgba(5,28,44,0.01)] transition-colors`}>
                            <td className="px-6 py-2 font-mono-val font-semibold text-[var(--color-primary)]">{comp.costCode}</td>
                            <td className="px-6 py-2">{matchedItem.description}</td>
                            <td className="px-6 py-2 text-center text-gray-500 font-mono-val">{matchedItem.unit}</td>
                            <td className="px-6 py-2 text-right font-mono-val font-semibold">
                              {isEditing ? (
                                <input
                                  type="number"
                                  step="0.00001"
                                  className="input-editable w-28 text-right font-mono-val"
                                  value={editFactor}
                                  onChange={e => setEditFactor(parseFloat(e.target.value) || 0)}
                                />
                              ) : (
                                comp.qtyFactor.toString()
                              )}
                            </td>
                            <td className="px-6 py-2 text-right text-gray-500 font-mono-val">${itemUnitRate.toFixed(2)}</td>
                            <td className="px-6 py-2 text-right font-semibold text-[var(--color-primary)] font-mono-val">
                              ${allocatedCost.toFixed(2)}
                            </td>
                            <td className="px-6 py-2 text-center">
                              <div className="flex items-center justify-center gap-1">
                                {isEditing ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEdit(comp.id)}
                                      className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingId(null)}
                                      className="p-1 text-gray-500 hover:bg-gray-100 rounded cursor-pointer"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleStartEdit(comp.id, comp.qtyFactor)}
                                      className="p-1 text-[var(--color-accent)] hover:bg-blue-50 rounded cursor-pointer"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => onDeleteAssemblyComponent(comp.id)}
                                      className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
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
            );
          })
        )}
      </div>
    </div>
  );
};
