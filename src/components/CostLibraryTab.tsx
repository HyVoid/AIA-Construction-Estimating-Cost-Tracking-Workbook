import React, { useState } from 'react';
import { CostLibraryItem } from '../types';
import { Plus, Trash2, Edit2, Check, X, ShieldAlert } from 'lucide-react';

interface CostLibraryTabProps {
  items: CostLibraryItem[];
  onAdd: (item: CostLibraryItem) => void;
  onUpdate: (code: string, updated: CostLibraryItem) => void;
  onDelete: (code: string) => void;
}

export const CostLibraryTab: React.FC<CostLibraryTabProps> = ({ items, onAdd, onUpdate, onDelete }) => {
  // Local state for editing/adding
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CostLibraryItem | null>(null);

  const [newForm, setNewForm] = useState<CostLibraryItem>({
    code: '',
    description: '',
    unit: 'EA',
    laborRate: 0,
    materialRate: 0,
    equipmentRate: 0
  });

  const [addError, setAddError] = useState<string | null>(null);

  // Finding max values for dynamic inline data bar calculations
  const maxLabor = Math.max(...items.map(i => i.laborRate), 1);
  const maxMaterial = Math.max(...items.map(i => i.materialRate), 1);
  const maxEquipment = Math.max(...items.map(i => i.equipmentRate), 1);

  const handleStartEdit = (item: CostLibraryItem) => {
    setEditingCode(item.code);
    setEditForm({ ...item });
  };

  const handleCancelEdit = () => {
    setEditingCode(null);
    setEditForm(null);
  };

  const handleSaveEdit = () => {
    if (!editForm) return;
    onUpdate(editForm.code, editForm);
    setEditingCode(null);
    setEditForm(null);
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.code.trim()) {
      setAddError("Cost code is required.");
      return;
    }
    if (items.some(i => i.code.toUpperCase() === newForm.code.toUpperCase())) {
      setAddError(`Cost code "${newForm.code}" already exists in library.`);
      return;
    }
    setAddError(null);
    onAdd({
      ...newForm,
      code: newForm.code.toUpperCase().trim()
    });
    setNewForm({
      code: '',
      description: '',
      unit: 'EA',
      laborRate: 0,
      materialRate: 0,
      equipmentRate: 0
    });
  };

  return (
    <div className="space-y-8 tab-fade-up">
      {/* Title & Action Zone */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h2 className="font-heading-title text-2xl font-bold text-[var(--color-primary)]">Unit Cost Library</h2>
          <p className="text-[var(--color-muted)] text-sm mt-1">
            Maintain unit labor, material, and equipment standard rates. Changes instantly recalculate downstream assembly configurations.
          </p>
        </div>
      </div>

      {/* Add Item Form */}
      <div className="standard-card">
        <h3 className="font-heading-title text-lg font-semibold text-[var(--color-primary)] mb-4">Register New Unit Rate</h3>
        <form onSubmit={handleAddNew} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
          <div className="flex flex-col space-y-1">
            <label className="label-uppercase">Cost Code</label>
            <input
              type="text"
              id="new-cost-code"
              placeholder="e.g. CONC-005"
              className="input-editable uppercase"
              value={newForm.code}
              onChange={e => setNewForm({ ...newForm, code: e.target.value })}
            />
          </div>
          <div className="flex flex-col space-y-1 sm:col-span-2 md:col-span-1 lg:col-span-2">
            <label className="label-uppercase">Description</label>
            <input
              type="text"
              id="new-cost-desc"
              placeholder="Concrete Pumping Assist"
              className="input-editable"
              value={newForm.description}
              onChange={e => setNewForm({ ...newForm, description: e.target.value })}
            />
          </div>
          <div className="flex flex-col space-y-1">
            <label className="label-uppercase">Unit</label>
            <input
              type="text"
              id="new-cost-unit"
              placeholder="e.g. CY, HR, SF"
              className="input-editable uppercase"
              value={newForm.unit}
              onChange={e => setNewForm({ ...newForm, unit: e.target.value.toUpperCase() })}
            />
          </div>
          <div className="flex flex-col space-y-1">
            <label className="label-uppercase">Labor Unit Rate ($)</label>
            <input
              type="number"
              id="new-cost-labor"
              step="0.01"
              min="0"
              className="input-editable font-mono-val"
              value={newForm.laborRate}
              onChange={e => setNewForm({ ...newForm, laborRate: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="flex flex-col space-y-1">
            <label className="label-uppercase">Material Unit Rate ($)</label>
            <input
              type="number"
              id="new-cost-material"
              step="0.01"
              min="0"
              className="input-editable font-mono-val"
              value={newForm.materialRate}
              onChange={e => setNewForm({ ...newForm, materialRate: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="flex flex-col space-y-1">
            <label className="label-uppercase">Equipment Unit Rate ($)</label>
            <input
              type="number"
              id="new-cost-equipment"
              step="0.01"
              min="0"
              className="input-editable font-mono-val"
              value={newForm.equipmentRate}
              onChange={e => setNewForm({ ...newForm, equipmentRate: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="sm:col-span-2 md:col-span-3 lg:col-span-1">
            <button
              type="submit"
              id="btn-add-cost-item"
              className="w-full bg-[var(--color-primary)] text-white font-medium py-2 px-4 rounded-[var(--radius-sm)] flex items-center justify-center gap-1.5 hover:bg-[rgba(5,28,44,0.9)] cursor-pointer text-xs uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" /> Add Item
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

      {/* Main Rates Table */}
      <div className="bg-white rounded-[var(--radius-md)] shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--table-header-bg)] border-b-2 border-[var(--table-header-sep)] h-[var(--row-height-header)]">
                <th className="px-6 text-[var(--text-table-head)] font-semibold label-uppercase py-3">Cost Code</th>
                <th className="px-6 text-[var(--text-table-head)] font-semibold label-uppercase py-3">Description</th>
                <th className="px-6 text-[var(--text-table-head)] font-semibold label-uppercase py-3 text-center">Unit</th>
                <th className="px-6 text-[var(--text-table-head)] font-semibold label-uppercase py-3 text-right w-1/5">Labor Rate</th>
                <th className="px-6 text-[var(--text-table-head)] font-semibold label-uppercase py-3 text-right w-1/5">Material Rate</th>
                <th className="px-6 text-[var(--text-table-head)] font-semibold label-uppercase py-3 text-right w-1/5">Equipment Rate</th>
                <th className="px-6 text-[var(--text-table-head)] font-semibold label-uppercase py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const isEditing = editingCode === item.code;
                const rowClass = idx % 2 === 0 ? 'bg-[var(--color-bg)]/20' : 'bg-white';

                return (
                  <tr
                    key={item.code}
                    className={`${rowClass} border-b border-[var(--color-border)] hover:bg-[rgba(5,28,44,0.02)] transition-colors h-[var(--row-height-body)]`}
                  >
                    {/* Code */}
                    <td className="px-6 py-3 font-semibold text-[var(--color-primary)] font-mono-val text-xs">
                      {item.code}
                    </td>

                    {/* Description */}
                    <td className="px-6 py-3 text-xs font-medium max-w-[240px] truncate">
                      {isEditing ? (
                        <input
                          type="text"
                          className="input-editable w-full"
                          value={editForm?.description || ''}
                          onChange={e => setEditForm({ ...editForm!, description: e.target.value })}
                        />
                      ) : (
                        item.description
                      )}
                    </td>

                    {/* Unit */}
                    <td className="px-6 py-3 text-center text-xs font-mono-val">
                      {isEditing ? (
                        <input
                          type="text"
                          className="input-editable w-16 text-center uppercase"
                          value={editForm?.unit || ''}
                          onChange={e => setEditForm({ ...editForm!, unit: e.target.value.toUpperCase() })}
                        />
                      ) : (
                        item.unit
                      )}
                    </td>

                    {/* Labor Rate */}
                    <td className="px-6 py-3 text-right text-xs relative font-mono-val">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          className="input-editable w-full text-right"
                          value={editForm?.laborRate || 0}
                          onChange={e => setEditForm({ ...editForm!, laborRate: parseFloat(e.target.value) || 0 })}
                        />
                      ) : (
                        <div className="flex flex-col items-end justify-center h-full">
                          <span className="z-10">${item.laborRate.toFixed(2)}</span>
                          {/* Inline data bar with accent fill & 10% opacity track */}
                          <div className="w-full h-1.5 bg-[rgba(34,81,255,0.1)] rounded-full overflow-hidden mt-1 max-w-[120px]">
                            <div
                              className="bg-[var(--color-accent)] h-full rounded-full transition-all duration-300"
                              style={{ width: `${(item.laborRate / maxLabor) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Material Rate */}
                    <td className="px-6 py-3 text-right text-xs relative font-mono-val">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          className="input-editable w-full text-right"
                          value={editForm?.materialRate || 0}
                          onChange={e => setEditForm({ ...editForm!, materialRate: parseFloat(e.target.value) || 0 })}
                        />
                      ) : (
                        <div className="flex flex-col items-end justify-center h-full">
                          <span className="z-10">${item.materialRate.toFixed(2)}</span>
                          {/* Inline data bar */}
                          <div className="w-full h-1.5 bg-[rgba(34,81,255,0.1)] rounded-full overflow-hidden mt-1 max-w-[120px]">
                            <div
                              className="bg-[var(--color-accent)] h-full rounded-full transition-all duration-300"
                              style={{ width: `${(item.materialRate / maxMaterial) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Equipment Rate */}
                    <td className="px-6 py-3 text-right text-xs relative font-mono-val">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          className="input-editable w-full text-right"
                          value={editForm?.equipmentRate || 0}
                          onChange={e => setEditForm({ ...editForm!, equipmentRate: parseFloat(e.target.value) || 0 })}
                        />
                      ) : (
                        <div className="flex flex-col items-end justify-center h-full">
                          <span className="z-10">${item.equipmentRate.toFixed(2)}</span>
                          {/* Inline data bar */}
                          <div className="w-full h-1.5 bg-[rgba(34,81,255,0.1)] rounded-full overflow-hidden mt-1 max-w-[120px]">
                            <div
                              className="bg-[var(--color-accent)] h-full rounded-full transition-all duration-300"
                              style={{ width: `${(item.equipmentRate / maxEquipment) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={handleSaveEdit}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                              title="Save Changes"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded cursor-pointer"
                              title="Cancel Edit"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStartEdit(item)}
                              className="p-1.5 text-[var(--color-accent)] hover:bg-blue-50 rounded cursor-pointer"
                              title="Edit Item"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDelete(item.code)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                              title="Delete Item"
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
