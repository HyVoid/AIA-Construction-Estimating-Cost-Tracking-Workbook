import { ProjectSetup, CostLibraryItem, AssemblyItem, EstimateInputRow, ActualCostRow } from './types';

export const INITIAL_SETUP: ProjectSetup = {
  projectName: "Oakridge Commercial Center - Phase II",
  client: "Oakridge Development Partners LLC",
  bidDate: "2026-07-15",
  estimator: "Walker Hong",
  projectType: "Commercial Core & Shell",
  markupPercent: 12.0,
  contingencyPercent: 5.0
};

export const INITIAL_COST_LIBRARY: CostLibraryItem[] = [
  { code: "CONC-001", description: "Concrete Mix 4000 PSI", unit: "CY", laborRate: 35.00, materialRate: 145.00, equipmentRate: 15.00 },
  { code: "CONC-002", description: "Deformed Rebar Grade 60 (#4)", unit: "LF", laborRate: 1.80, materialRate: 1.40, equipmentRate: 0.15 },
  { code: "CONC-003", description: "Plywood Formwork (10 Reuses)", unit: "SF", laborRate: 5.20, materialRate: 2.10, equipmentRate: 0.30 },
  { code: "CONC-004", description: "Concrete Finisher / Placer", unit: "HR", laborRate: 58.00, materialRate: 0.00, equipmentRate: 4.50 },
  { code: "MAS-001", description: "CMU Block 8x8x16 Standard", unit: "EA", laborRate: 5.50, materialRate: 3.20, equipmentRate: 0.40 },
  { code: "MAS-002", description: "Type S Masonry Mortar Mix", unit: "CF", laborRate: 12.50, materialRate: 7.50, equipmentRate: 0.80 },
  { code: "MET-001", description: "Structural Wide-Flange Beams", unit: "LBS", laborRate: 2.10, materialRate: 2.80, equipmentRate: 1.20 },
  { code: "MET-002", description: "Field Welder & Erector Rig", unit: "HR", laborRate: 85.00, materialRate: 15.00, equipmentRate: 45.00 }
];

export const INITIAL_ASSEMBLIES: AssemblyItem[] = [
  // Slab Foundation
  { id: "A1-1", assemblyName: "Slab Foundation (per SF)", costCode: "CONC-001", qtyFactor: 0.012 }, // 0.012 CY per SF
  { id: "A1-2", assemblyName: "Slab Foundation (per SF)", costCode: "CONC-002", qtyFactor: 1.45 },  // 1.45 LF rebar per SF
  { id: "A1-3", assemblyName: "Slab Foundation (per SF)", costCode: "CONC-003", qtyFactor: 0.12 },  // 0.12 SF formwork per SF slab
  { id: "A1-4", assemblyName: "Slab Foundation (per SF)", costCode: "CONC-004", qtyFactor: 0.02 },  // 0.02 hours finishing per SF slab

  // CMU Wall 8"
  { id: "A2-1", assemblyName: "CMU Wall 8\" Standard (per SF)", costCode: "MAS-001", qtyFactor: 1.125 }, // 1.125 blocks per SF
  { id: "A2-2", assemblyName: "CMU Wall 8\" Standard (per SF)", costCode: "MAS-002", qtyFactor: 0.18 },  // 0.18 CF mortar per SF

  // Structural Column
  { id: "A3-1", assemblyName: "Structural Steel Frame (per Ton)", costCode: "MET-001", qtyFactor: 2000 },  // 2000 lbs steel per Ton
  { id: "A3-2", assemblyName: "Structural Steel Frame (per Ton)", costCode: "MET-002", qtyFactor: 4.5 }     // 4.5 erection rig hours per Ton
];

export const INITIAL_ESTIMATE_INPUTS: EstimateInputRow[] = [
  { id: "EST-001", wbs: "03-300 Concrete Foundation", assemblyName: "Slab Foundation (per SF)", quantity: 8500 },
  { id: "EST-002", wbs: "04-200 Unit Masonry", assemblyName: "CMU Wall 8\" Standard (per SF)", quantity: 4200 },
  { id: "EST-003", wbs: "05-100 Structural Metal", assemblyName: "Structural Steel Frame (per Ton)", quantity: 24 }
];

export const INITIAL_ACTUAL_COSTS: ActualCostRow[] = [
  { costCode: "CONC-001", actualQty: 110, actualCost: 19800 },
  { costCode: "CONC-002", actualQty: 12500, actualCost: 41000 },
  { costCode: "CONC-003", actualQty: 1050, actualCost: 8200 },
  { costCode: "CONC-004", actualQty: 180, actualCost: 11200 },
  { costCode: "MAS-001", actualQty: 4600, actualCost: 40250 },
  { costCode: "MAS-002", actualQty: 780, actualCost: 15600 },
  { costCode: "MET-001", actualQty: 47500, actualCost: 242000 },
  { costCode: "MET-002", actualQty: 115, actualCost: 16100 }
];
