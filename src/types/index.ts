// Types pour l'application de vignettage

export interface Operator {
  id: string;
  name: string;
  productivity: number; // Boîtes par heure moyennes
  totalBoxesProcessed: number;
  totalTimeSpent: number; // En minutes
}

export interface Batch {
  id: string;
  code: string;
  medicationName: string;
  totalBoxes: number;
  processedBoxes: number;
  receivedDate: string;
  expectedCompletionDate: string;
  status: BatchStatusType;
  assignments: Assignment[];
}

export interface Assignment {
  id: string;
  batchId: string;
  operatorId: string;
  operatorName: string;
  assignedBoxes: number;
  processedBoxes: number;
  startTime: string;
  endTime: string | null;
  expectedEndTime: string;
  status: 'pending' | 'in-progress' | 'completed';
}

// Bien utiliser BatchStatusType comme type unique pour le statut des lots
export type BatchStatusType = 'pending' | 'in-progress' | 'completed' | 'delayed';

// Interface pour statuts agrégés par nombre de lots
export interface BatchStatusCount {
  pending: number;
  inProgress: number;
  completed: number;
  delayed: number;
}

export interface Performance {
  operatorId: string;
  operatorName: string;
  averageSpeed: number; // Boîtes par heure
  totalBoxesProcessed: number;
  totalAssignments: number;
  completedOnTime: number;
  efficiency: number; // pourcentage
}

export interface DashboardStats {
  totalBatches: number;
  activeBatches: number;
  completedToday: number;
  totalBoxes: number;
  processedBoxes: number;
  remainingBoxes: number;
  completionRate: number;
  operators: {
    total: number;
    active: number;
  };
  performance: {
    averageBoxesPerHour: number;
    mostEfficientOperator: string;
  };
  batchStatus: BatchStatusCount;
}

export type AnomalyType = 'damaged_box' | 'empty_case' | 'missing_from_original' | 'other';

export interface Anomaly {
  id: string;
  assignment_id: string;
  batch_id: string;
  operator_id: string;
  type: AnomalyType;
  quantity: number;
  description: string;
  detection_date: string;
  deviation_number?: string;
}
