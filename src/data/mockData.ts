
import { Assignment, Batch, BatchStatusType, Operator, Performance, DashboardStats, BatchStatusCount } from '@/types';

// Opérateurs
export const operators: Operator[] = [
  {
    id: 'op1',
    name: 'Ahmed Benali',
    productivity: 85,
    totalBoxesProcessed: 4250,
    totalTimeSpent: 3200,
  },
  {
    id: 'op2',
    name: 'Sophie Moreau',
    productivity: 92,
    totalBoxesProcessed: 5100,
    totalTimeSpent: 3450,
  },
  {
    id: 'op3',
    name: 'Mohammed El Fassi',
    productivity: 78,
    totalBoxesProcessed: 3800,
    totalTimeSpent: 2950,
  },
  {
    id: 'op4',
    name: 'Leila Benziane',
    productivity: 88,
    totalBoxesProcessed: 4600,
    totalTimeSpent: 3300,
  },
  {
    id: 'op5',
    name: 'Thomas Dupont',
    productivity: 82,
    totalBoxesProcessed: 3950,
    totalTimeSpent: 3050,
  },
];

// Lots
export const batches: Batch[] = [
  {
    id: 'batch1',
    code: 'LDM-2024-001',
    medicationName: 'Doliprane 500mg',
    totalBoxes: 5000,
    processedBoxes: 3750,
    receivedDate: '2024-04-10',
    expectedCompletionDate: '2024-04-18',
    status: 'in-progress',
    assignments: [],
  },
  {
    id: 'batch2',
    code: 'LDM-2024-002',
    medicationName: 'Amoxicilline 250mg',
    totalBoxes: 3000,
    processedBoxes: 3000,
    receivedDate: '2024-04-08',
    expectedCompletionDate: '2024-04-15',
    status: 'completed',
    assignments: [],
  },
  {
    id: 'batch3',
    code: 'LDM-2024-003',
    medicationName: 'Ibuprofène 400mg',
    totalBoxes: 4500,
    processedBoxes: 1800,
    receivedDate: '2024-04-12',
    expectedCompletionDate: '2024-04-20',
    status: 'in-progress',
    assignments: [],
  },
  {
    id: 'batch4',
    code: 'LDM-2024-004',
    medicationName: 'Metformine 1000mg',
    totalBoxes: 2500,
    processedBoxes: 0,
    receivedDate: '2024-04-15',
    expectedCompletionDate: '2024-04-22',
    status: 'pending',
    assignments: [],
  },
  {
    id: 'batch5',
    code: 'LDM-2024-005',
    medicationName: 'Pantoprazole 40mg',
    totalBoxes: 3500,
    processedBoxes: 2100,
    receivedDate: '2024-04-11',
    expectedCompletionDate: '2024-04-17',
    status: 'delayed',
    assignments: [],
  },
];

// Affectations
export const assignments: Assignment[] = [
  {
    id: 'assign1',
    batchId: 'batch1',
    operatorId: 'op1',
    operatorName: 'Ahmed Benali',
    assignedBoxes: 1500,
    processedBoxes: 1200,
    startTime: '2024-04-10T08:00:00',
    endTime: null,
    expectedEndTime: '2024-04-17T16:00:00',
    status: 'in-progress',
  },
  {
    id: 'assign2',
    batchId: 'batch1',
    operatorId: 'op2',
    operatorName: 'Sophie Moreau',
    assignedBoxes: 2000,
    processedBoxes: 1800,
    startTime: '2024-04-10T08:00:00',
    endTime: null,
    expectedEndTime: '2024-04-17T16:00:00',
    status: 'in-progress',
  },
  {
    id: 'assign3',
    batchId: 'batch2',
    operatorId: 'op3',
    operatorName: 'Mohammed El Fassi',
    assignedBoxes: 1500,
    processedBoxes: 1500,
    startTime: '2024-04-08T08:00:00',
    endTime: '2024-04-14T15:30:00',
    expectedEndTime: '2024-04-15T16:00:00',
    status: 'completed',
  },
  {
    id: 'assign4',
    batchId: 'batch2',
    operatorId: 'op4',
    operatorName: 'Leila Benziane',
    assignedBoxes: 1500,
    processedBoxes: 1500,
    startTime: '2024-04-08T08:00:00',
    endTime: '2024-04-15T11:45:00',
    expectedEndTime: '2024-04-15T16:00:00',
    status: 'completed',
  },
  {
    id: 'assign5',
    batchId: 'batch3',
    operatorId: 'op5',
    operatorName: 'Thomas Dupont',
    assignedBoxes: 2000,
    processedBoxes: 800,
    startTime: '2024-04-12T08:00:00',
    endTime: null,
    expectedEndTime: '2024-04-19T16:00:00',
    status: 'in-progress',
  },
  {
    id: 'assign6',
    batchId: 'batch3',
    operatorId: 'op1',
    operatorName: 'Ahmed Benali',
    assignedBoxes: 2500,
    processedBoxes: 1000,
    startTime: '2024-04-12T08:00:00',
    endTime: null,
    expectedEndTime: '2024-04-19T16:00:00',
    status: 'in-progress',
  },
  {
    id: 'assign7',
    batchId: 'batch5',
    operatorId: 'op2',
    operatorName: 'Sophie Moreau',
    assignedBoxes: 2000,
    processedBoxes: 1200,
    startTime: '2024-04-11T08:00:00',
    endTime: null,
    expectedEndTime: '2024-04-16T16:00:00',
    status: 'in-progress',
  },
  {
    id: 'assign8',
    batchId: 'batch5',
    operatorId: 'op3',
    operatorName: 'Mohammed El Fassi',
    assignedBoxes: 1500,
    processedBoxes: 900,
    startTime: '2024-04-11T08:00:00',
    endTime: null,
    expectedEndTime: '2024-04-16T16:00:00',
    status: 'in-progress',
  },
];

// Performances
export const performances: Performance[] = [
  {
    operatorId: 'op1',
    operatorName: 'Ahmed Benali',
    averageSpeed: 85,
    totalBoxesProcessed: 2200,
    totalAssignments: 2,
    completedOnTime: 1,
    efficiency: 92,
  },
  {
    operatorId: 'op2',
    operatorName: 'Sophie Moreau',
    averageSpeed: 92,
    totalBoxesProcessed: 3000,
    totalAssignments: 2,
    completedOnTime: 2,
    efficiency: 98,
  },
  {
    operatorId: 'op3',
    operatorName: 'Mohammed El Fassi',
    averageSpeed: 78,
    totalBoxesProcessed: 2400,
    totalAssignments: 2,
    completedOnTime: 1,
    efficiency: 86,
  },
  {
    operatorId: 'op4',
    operatorName: 'Leila Benziane',
    averageSpeed: 88,
    totalBoxesProcessed: 1500,
    totalAssignments: 1,
    completedOnTime: 1,
    efficiency: 94,
  },
  {
    operatorId: 'op5',
    operatorName: 'Thomas Dupont',
    averageSpeed: 82,
    totalBoxesProcessed: 800,
    totalAssignments: 1,
    completedOnTime: 0,
    efficiency: 89,
  },
];

// Statistiques du tableau de bord
export const dashboardStats: DashboardStats = {
  totalBatches: 5,
  activeBatches: 3,
  completedToday: 1,
  totalBoxes: 18500,
  processedBoxes: 10650,
  remainingBoxes: 7850,
  completionRate: 57.6,
  operators: {
    total: 5,
    active: 4,
  },
  performance: {
    averageBoxesPerHour: 85,
    mostEfficientOperator: 'Sophie Moreau',
  },
  batchStatus: {
    pending: 1,
    inProgress: 2,
    completed: 1,
    delayed: 1,
  },
};

// Connect assignments to batches
batches.forEach(batch => {
  batch.assignments = assignments.filter(assignment => assignment.batchId === batch.id);
});

// Helper functions to access and manipulate data
export const getBatchById = (id: string): Batch | undefined => {
  return batches.find(batch => batch.id === id);
};

export const getOperatorById = (id: string): Operator | undefined => {
  return operators.find(operator => operator.id === id);
};

export const getAssignmentById = (id: string): Assignment | undefined => {
  return assignments.find(assignment => assignment.id === id);
};

export const getOperatorPerformance = (id: string): Performance | undefined => {
  return performances.find(performance => performance.operatorId === id);
};

export const getActiveBatches = (): Batch[] => {
  return batches.filter(batch => batch.status === 'in-progress' || batch.status === 'delayed');
};

export const getPendingBatches = (): Batch[] => {
  return batches.filter(batch => batch.status === 'pending');
};

export const getCompletedBatches = (): Batch[] => {
  return batches.filter(batch => batch.status === 'completed');
};

export const updateAssignment = (updatedAssignment: Assignment): void => {
  const index = assignments.findIndex(assignment => assignment.id === updatedAssignment.id);
  if (index !== -1) {
    assignments[index] = updatedAssignment;
    
    // Update batch processed boxes
    const batch = getBatchById(updatedAssignment.batchId);
    if (batch) {
      const batchAssignments = assignments.filter(a => a.batchId === batch.id);
      batch.processedBoxes = batchAssignments.reduce((sum, a) => sum + a.processedBoxes, 0);
      
      // Update batch status
      if (batch.processedBoxes >= batch.totalBoxes) {
        batch.status = 'completed';
      } else if (new Date(updatedAssignment.expectedEndTime) < new Date() && batch.processedBoxes < batch.totalBoxes) {
        batch.status = 'delayed';
      } else if (batch.processedBoxes > 0) {
        batch.status = 'in-progress';
      }
    }
  }
};
