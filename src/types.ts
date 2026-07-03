export interface ProjectSetup {
  projectName: string;
  client: string;
  bidDate: string;
  estimator: string;
  projectType: string;
  markupPercent: number;
  contingencyPercent: number;
}

export interface CostLibraryItem {
  code: string;
  description: string;
  unit: string;
  laborRate: number;
  materialRate: number;
  equipmentRate: number;
}

export interface AssemblyItem {
  id: string;
  assemblyName: string;
  costCode: string; // maps to CostLibraryItem.code
  qtyFactor: number;
}

export interface EstimateInputRow {
  id: string;
  wbs: string;
  assemblyName: string;
  quantity: number;
}

export interface ActualCostRow {
  costCode: string;
  actualQty: number;
  actualCost: number;
}

export type TabId = 'setup' | 'library' | 'assembly' | 'estimate' | 'summary' | 'tracking' | 'export';
