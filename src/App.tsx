import React, { useState, useEffect, useRef } from 'react';
import { TabId, ProjectSetup, CostLibraryItem, AssemblyItem, EstimateInputRow, ActualCostRow } from './types';
import {
  INITIAL_SETUP,
  INITIAL_COST_LIBRARY,
  INITIAL_ASSEMBLIES,
  INITIAL_ESTIMATE_INPUTS,
  INITIAL_ACTUAL_COSTS
} from './initialData';

// Component Imports
import { ProjectSetupTab } from './components/ProjectSetupTab';
import { CostLibraryTab } from './components/CostLibraryTab';
import { AssemblyLibraryTab } from './components/AssemblyLibraryTab';
import { EstimateInputTab } from './components/EstimateInputTab';
import { AIASummaryTab } from './components/AIASummaryTab';
import { CostTrackingTab } from './components/CostTrackingTab';
import { SmartSheetExportTab } from './components/SmartSheetExportTab';

// Icons
import {
  Database,
  CloudLightning,
  Download,
  Upload,
  RotateCcw,
  Sliders,
  Layers,
  Component as AssemblyIcon,
  FileSpreadsheet,
  Award,
  TrendingUp,
  Share2,
  CheckCircle,
  FileDown,
  FileUp
} from 'lucide-react';

export default function App() {
  // ── State Management ──
  const [setup, setSetup] = useState<ProjectSetup>(() => {
    const local = localStorage.getItem('aia_setup');
    return local ? JSON.parse(local) : INITIAL_SETUP;
  });

  const [costLibrary, setCostLibrary] = useState<CostLibraryItem[]>(() => {
    const local = localStorage.getItem('aia_cost_library');
    return local ? JSON.parse(local) : INITIAL_COST_LIBRARY;
  });

  const [assemblies, setAssemblies] = useState<AssemblyItem[]>(() => {
    const local = localStorage.getItem('aia_assemblies');
    return local ? JSON.parse(local) : INITIAL_ASSEMBLIES;
  });

  const [estimateRows, setEstimateRows] = useState<EstimateInputRow[]>(() => {
    const local = localStorage.getItem('aia_estimate_rows');
    return local ? JSON.parse(local) : INITIAL_ESTIMATE_INPUTS;
  });

  const [actualCosts, setActualCosts] = useState<ActualCostRow[]>(() => {
    const local = localStorage.getItem('aia_actual_costs');
    return local ? JSON.parse(local) : INITIAL_ACTUAL_COSTS;
  });

  const [activeTab, setActiveTab] = useState<TabId>('setup');
  const [lastSaved, setLastSaved] = useState<string>('Just now');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Auto Save & Timestamp Engine ──
  useEffect(() => {
    localStorage.setItem('aia_setup', JSON.stringify(setup));
    localStorage.setItem('aia_cost_library', JSON.stringify(costLibrary));
    localStorage.setItem('aia_assemblies', JSON.stringify(assemblies));
    localStorage.setItem('aia_estimate_rows', JSON.stringify(estimateRows));
    localStorage.setItem('aia_actual_costs', JSON.stringify(actualCosts));

    const timeString = new Date().toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    setLastSaved(timeString);
  }, [setup, costLibrary, assemblies, estimateRows, actualCosts]);

  // ── Core Operations ──

  // Cost Library Handlers
  const handleAddCostItem = (item: CostLibraryItem) => {
    setCostLibrary(prev => [...prev, item]);
  };

  const handleUpdateCostItem = (code: string, updated: CostLibraryItem) => {
    setCostLibrary(prev => prev.map(item => item.code === code ? updated : item));
  };

  const handleDeleteCostItem = (code: string) => {
    setCostLibrary(prev => prev.filter(item => item.code !== code));
    // Purge downstream assembly links as well
    setAssemblies(prev => prev.filter(a => a.costCode !== code));
  };

  // Assembly Handlers
  const handleAddAssemblyComponent = (newComp: Omit<AssemblyItem, 'id'>) => {
    const newId = `A-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    setAssemblies(prev => [...prev, { ...newComp, id: newId }]);
  };

  const handleUpdateAssemblyFactor = (id: string, qtyFactor: number) => {
    setAssemblies(prev => prev.map(a => a.id === id ? { ...a, qtyFactor } : a));
  };

  const handleDeleteAssemblyComponent = (id: string) => {
    setAssemblies(prev => prev.filter(a => a.id !== id));
  };

  const handleDeleteAssemblyGroup = (assemblyName: string) => {
    setAssemblies(prev => prev.filter(a => a.assemblyName !== assemblyName));
    // Purge corresponding rows in estimating takeoff sheet
    setEstimateRows(prev => prev.filter(r => r.assemblyName !== assemblyName));
  };

  // Estimate Row Handlers
  const handleAddEstimateRow = (row: EstimateInputRow) => {
    setEstimateRows(prev => [...prev, row]);
  };

  const handleUpdateEstimateRow = (id: string, updated: EstimateInputRow) => {
    setEstimateRows(prev => prev.map(r => r.id === id ? updated : r));
  };

  const handleDeleteEstimateRow = (id: string) => {
    setEstimateRows(prev => prev.filter(r => r.id !== id));
  };

  // Actual Cost Handlers (Field Tracking)
  const handleUpdateActualCost = (costCode: string, actualQty: number, actualCost: number) => {
    setActualCosts(prev => {
      const exists = prev.some(ac => ac.costCode === costCode);
      if (exists) {
        return prev.map(ac => ac.costCode === costCode ? { ...ac, actualQty, actualCost } : ac);
      } else {
        return [...prev, { costCode, actualQty, actualCost }];
      }
    });
  };

  // Backup Import & Export handlers
  const handleExportBackup = () => {
    const payload = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      setup,
      costLibrary,
      assemblies,
      estimateRows,
      actualCosts
    };

    const str = JSON.stringify(payload, null, 2);
    const blob = new Blob([str], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${setup.projectName.replace(/\s+/g, '_')}_AIA_Workbook_Backup.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.setup) setSetup(data.setup);
        if (data.costLibrary) setCostLibrary(data.costLibrary);
        if (data.assemblies) setAssemblies(data.assemblies);
        if (data.estimateRows) setEstimateRows(data.estimateRows);
        if (data.actualCosts) setActualCosts(data.actualCosts);
        alert('AIA Estimating Workbook data imported successfully.');
      } catch (err) {
        alert('Invalid backup file structure. Import aborted.');
      }
    };
    reader.readAsText(file);
    // Reset file input so same file can be imported again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetData = () => {
    setSetup(INITIAL_SETUP);
    setCostLibrary(INITIAL_COST_LIBRARY);
    setAssemblies(INITIAL_ASSEMBLIES);
    setEstimateRows(INITIAL_ESTIMATE_INPUTS);
    setActualCosts(INITIAL_ACTUAL_COSTS);
    setShowResetConfirm(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-body-text)]">
      {/* ── STICKY TOP NAVIGATION BAR (56px) ── */}
      <nav className="nav-sticky px-8 flex items-center justify-between" id="navbar">
        {/* Left Side: Brand Logo */}
        <div className="flex items-center gap-2">
          <CloudLightning className="w-5 h-5 text-[var(--color-accent)]" />
          <span className="font-display text-xl font-bold tracking-wide text-[var(--color-primary)]">
            AIA Estimating Console
          </span>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-[var(--color-accent)] tracking-wider uppercase border border-blue-100">
            SaaS Pro
          </span>
        </div>

        {/* Center/Right: Horizontal Tab Navigation List */}
        <div className="flex items-center space-x-1 h-full select-none overflow-x-auto max-w-[50%] lg:max-w-none">
          <button
            type="button"
            id="tab-setup"
            onClick={() => setActiveTab('setup')}
            className={`px-3 lg:px-4 h-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors border-b-2 cursor-pointer ${
              activeTab === 'setup'
                ? 'border-[var(--color-accent)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--nav-text-inactive)] hover:text-[var(--color-primary)]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> Setup
          </button>

          <button
            type="button"
            id="tab-rates"
            onClick={() => setActiveTab('library')}
            className={`px-3 lg:px-4 h-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors border-b-2 cursor-pointer ${
              activeTab === 'library'
                ? 'border-[var(--color-accent)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--nav-text-inactive)] hover:text-[var(--color-primary)]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Rates
          </button>

          <button
            type="button"
            id="tab-assemblies"
            onClick={() => setActiveTab('assembly')}
            className={`px-3 lg:px-4 h-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors border-b-2 cursor-pointer ${
              activeTab === 'assembly'
                ? 'border-[var(--color-accent)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--nav-text-inactive)] hover:text-[var(--color-primary)]'
            }`}
          >
            <AssemblyIcon className="w-3.5 h-3.5" /> Assemblies
          </button>

          <button
            type="button"
            id="tab-takeoff"
            onClick={() => setActiveTab('estimate')}
            className={`px-3 lg:px-4 h-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors border-b-2 cursor-pointer ${
              activeTab === 'estimate'
                ? 'border-[var(--color-accent)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--nav-text-inactive)] hover:text-[var(--color-primary)]'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Takeoff
          </button>

          <button
            type="button"
            id="tab-summary"
            onClick={() => setActiveTab('summary')}
            className={`px-3 lg:px-4 h-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors border-b-2 cursor-pointer ${
              activeTab === 'summary'
                ? 'border-[var(--color-accent)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--nav-text-inactive)] hover:text-[var(--color-primary)]'
            }`}
          >
            <Award className="w-3.5 h-3.5" /> G703 Summaries
          </button>

          <button
            type="button"
            id="tab-tracking"
            onClick={() => setActiveTab('tracking')}
            className={`px-3 lg:px-4 h-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors border-b-2 cursor-pointer ${
              activeTab === 'tracking'
                ? 'border-[var(--color-accent)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--nav-text-inactive)] hover:text-[var(--color-primary)]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> Field Tracking
          </button>

          <button
            type="button"
            id="tab-export"
            onClick={() => setActiveTab('export')}
            className={`px-3 lg:px-4 h-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors border-b-2 cursor-pointer ${
              activeTab === 'export'
                ? 'border-[var(--color-accent)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--nav-text-inactive)] hover:text-[var(--color-primary)]'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" /> SmartSheet Bridge
          </button>
        </div>

        {/* Right Side: Save Status Indicator & Dynamic Controls */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="hidden lg:flex items-center gap-1.5 text-[var(--color-muted)] border-r border-[var(--color-border)] pr-4 font-mono-val h-full py-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>Saved: {lastSaved}</span>
          </div>

          <div className="flex items-center gap-1">
            {/* Backup Export */}
            <button
              type="button"
              id="btn-export-backup"
              onClick={handleExportBackup}
              className="p-2 hover:bg-slate-50 border border-[var(--color-border)] rounded-[var(--radius-sm)] cursor-pointer text-gray-700 hover:text-[var(--color-accent)] flex items-center gap-1"
              title="Export Backup File (.json)"
            >
              <FileDown className="w-4 h-4" />
              <span className="hidden md:inline-block text-[11px] uppercase tracking-wider">Export</span>
            </button>

            {/* Backup Import */}
            <input
              type="file"
              id="import-backup-file-input"
              ref={fileInputRef}
              onChange={handleImportBackup}
              accept=".json"
              className="hidden"
            />
            <button
              type="button"
              id="btn-import-backup"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-slate-50 border border-[var(--color-border)] rounded-[var(--radius-sm)] cursor-pointer text-gray-700 hover:text-[var(--color-accent)] flex items-center gap-1"
              title="Import Backup File (.json)"
            >
              <FileUp className="w-4 h-4" />
              <span className="hidden md:inline-block text-[11px] uppercase tracking-wider">Import</span>
            </button>

            {/* Reset Defaults */}
            <button
              type="button"
              id="btn-reset-workbook"
              onClick={() => setShowResetConfirm(true)}
              className="p-2 hover:bg-red-50 border border-[var(--color-border)] hover:border-red-200 rounded-[var(--radius-sm)] cursor-pointer text-red-600 flex items-center gap-1"
              title="Reset Workbook Defaults"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden md:inline-block text-[11px] uppercase tracking-wider text-red-600">Reset</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── MAIN CONTENT CANVAS (1400px Max-Width with 40px padding) ── */}
      <main className="flex-grow page-wrapper animate-in" id="main-content-canvas">
        {/* Active Tab View Mounting */}
        {activeTab === 'setup' && (
          <ProjectSetupTab setup={setup} onChange={setSetup} />
        )}

        {activeTab === 'library' && (
          <CostLibraryTab
            items={costLibrary}
            onAdd={handleAddCostItem}
            onUpdate={handleUpdateCostItem}
            onDelete={handleDeleteCostItem}
          />
        )}

        {activeTab === 'assembly' && (
          <AssemblyLibraryTab
            assemblies={assemblies}
            costLibrary={costLibrary}
            onAddAssemblyComponent={handleAddAssemblyComponent}
            onUpdateAssemblyFactor={handleUpdateAssemblyFactor}
            onDeleteAssemblyComponent={handleDeleteAssemblyComponent}
            onDeleteAssemblyGroup={handleDeleteAssemblyGroup}
          />
        )}

        {activeTab === 'estimate' && (
          <EstimateInputTab
            rows={estimateRows}
            assemblies={assemblies}
            costLibrary={costLibrary}
            setup={setup}
            onAddRow={handleAddEstimateRow}
            onUpdateRow={handleUpdateEstimateRow}
            onDeleteRow={handleDeleteEstimateRow}
          />
        )}

        {activeTab === 'summary' && (
          <AIASummaryTab
            rows={estimateRows}
            assemblies={assemblies}
            costLibrary={costLibrary}
            setup={setup}
          />
        )}

        {activeTab === 'tracking' && (
          <CostTrackingTab
            costLibrary={costLibrary}
            estimateRows={estimateRows}
            assemblies={assemblies}
            actualCosts={actualCosts}
            onUpdateActualCost={handleUpdateActualCost}
          />
        )}

        {activeTab === 'export' && (
          <SmartSheetExportTab
            rows={estimateRows}
            assemblies={assemblies}
            costLibrary={costLibrary}
            setup={setup}
          />
        )}
      </main>

      {/* ── RESET CONFIRMATION MODAL (Glassmorphism Overlay) ── */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-[rgba(5,28,44,0.4)] backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-[var(--radius-lg)] p-6 max-w-md w-full shadow-lg border border-[var(--color-border)] animate-in">
            <h4 className="font-heading-title text-xl font-bold text-[var(--color-primary)] mb-2">
              Confirm Workbook Overwrite?
            </h4>
            <p className="text-[var(--color-body-text)] text-xs mb-6">
              You are about to purge all local modifications, custom cost items, and estimating takeoff entries. This action will restore original Oakridge commercial development demonstration presets.
            </p>
            <div className="flex items-center justify-end gap-3 text-xs">
              <button
                type="button"
                id="btn-confirm-reset-cancel"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 border border-[var(--color-border)] rounded-[var(--radius-sm)] font-semibold hover:bg-slate-50 cursor-pointer text-gray-700 uppercase tracking-wider"
              >
                Keep Current
              </button>
              <button
                type="button"
                id="btn-confirm-reset-ok"
                onClick={handleResetData}
                className="px-4 py-2 bg-[var(--color-negative)] text-white rounded-[var(--radius-sm)] font-semibold hover:bg-red-700 cursor-pointer uppercase tracking-wider"
              >
                Reset Workbook
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STANDARD FOOTER ── */}
      <footer className="py-6 border-t border-[var(--color-border)] text-center text-[var(--color-muted)] text-[11px] tracking-wide bg-white">
        <p>© 2026 AIA Estimating Console. Developed strictly in accordance with AIA G703 presentation schemas.</p>
      </footer>
    </div>
  );
}
