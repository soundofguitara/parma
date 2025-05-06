import React, { useState, useMemo } from 'react';
import { Activity, Box, Clock, Package, Users } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import BatchProgressCard from '@/components/dashboard/BatchProgressCard';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import BatchStatusPie from '@/components/dashboard/BatchStatusPie';
import ProgressDonut from '@/components/dashboard/ProgressDonut';
import TrendLine from '@/components/dashboard/TrendLine';
import ReportDownload from '@/components/dashboard/ReportDownload';
import EditBatchModal from '@/components/modal/EditBatchModal';
import { Batch, BatchStatusCount, DashboardStats } from '@/types';
import { useBatches } from '@/hooks/useBatches';
import { useOperators } from '@/hooks/useOperators';
import { useAssignments } from '@/hooks/useAssignments';

const Dashboard = () => {
  const { data: batches = [] } = useBatches();
  const { data: operators = [] } = useOperators();
  const { data: assignments = [] } = useAssignments();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentBatch, setCurrentBatch] = useState<Batch | null>(null);

  const dashboardStats: DashboardStats = useMemo(() => {
    // Calculer le nombre total de boîtes et de boîtes traitées
    const totalBoxes = batches.reduce((sum, batch) => sum + (batch.total_boxes || 0), 0);
    const processedBoxes = assignments.reduce((sum, assignment) => sum + (assignment.processed_boxes || 0), 0);
    const remainingBoxes = Math.max(0, totalBoxes - processedBoxes);
    const completionRate = totalBoxes > 0 && !isNaN(processedBoxes) ? Math.round((processedBoxes / totalBoxes) * 100) : 0;

    // Calculate performance metrics
    const totalTimeSpentMinutes = assignments.reduce((sum, assignment) => {
      if (!assignment.start_time) return sum;
      const start = new Date(assignment.start_time);
      const end = assignment.end_time ? new Date(assignment.end_time) : new Date();
      return sum + (end.getTime() - start.getTime()) / (1000 * 60);
    }, 0);

    const averageBoxesPerHour = totalTimeSpentMinutes > 0
      ? Math.round((processedBoxes / totalTimeSpentMinutes) * 60)
      : 0;

    // Count batches by status
    const batchStatus: BatchStatusCount = batches.reduce((acc: BatchStatusCount, batch) => {
      acc[batch.status as keyof BatchStatusCount]++;
      return acc;
    }, {
      pending: 0,
      inProgress: 0,
      completed: 0,
      delayed: 0
    });

    // Get active operators count (those with ongoing assignments)
    const activeOperatorIds = new Set(
      assignments
        .filter(a => a.status === 'in-progress')
        .map(a => a.operator_id)
    );

    return {
      totalBatches: batches.length,
      activeBatches: batches.filter(b => b.status === 'in-progress').length,
      completedToday: assignments.filter(a => {
        if (!a.end_time) return false;
        const today = new Date();
        const endDate = new Date(a.end_time);
        return endDate.toDateString() === today.toDateString() && a.status === 'completed';
      }).length,
      totalBoxes,
      processedBoxes,
      remainingBoxes,
      completionRate,
      operators: {
        total: operators.length,
        active: activeOperatorIds.size
      },
      performance: {
        averageBoxesPerHour,
        mostEfficientOperator: operators.length > 0
          ? operators.reduce((max, op) => op.productivity > (max?.productivity || 0) ? op : max, operators[0]).name
          : 'N/A'
      },
      batchStatus
    };
  }, [batches, operators, assignments]);

  // Sample data for trend lines (keep these for visual purposes)
  const productivityTrend = Array.from({ length: 10 }, (_, i) => ({
    value: 75 + Math.random() * 20
  }));

  const completionTrend = Array.from({ length: 10 }, (_, i) => ({
    value: 50 + i * 5 + Math.random() * 5
  }));

  const handleEditBatch = (batch: Batch) => {
    setCurrentBatch(batch);
    setEditModalOpen(true);
  };

  const activeBatches = useMemo(() =>
    batches.filter(b => b.status === 'in-progress')
  , [batches]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Tableau de bord</h1>
        <div className="bg-pharma-blue-light rounded-lg px-4 py-2 text-sm text-pharma-text-light font-medium">
          {new Date().toLocaleDateString('fr-FR', { dateStyle: 'full' })}
        </div>
      </div>

      {currentBatch && (
        <EditBatchModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          batch={currentBatch}
        />
      )}

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Lots actifs"
          value={dashboardStats.activeBatches}
          icon={<Package size={20} />}
          trend={{ value: 20, isPositive: true, label: "vs sem. dernière" }}
          chart={<TrendLine data={productivityTrend} color="#0EA5E9" />}
        />

        <StatCard
          title="Boîtes traitées"
          value={dashboardStats.processedBoxes.toLocaleString()}
          secondaryValue={`${dashboardStats.completionRate}% complété`}
          icon={<Box size={20} />}
          chart={<ProgressDonut value={Math.round(dashboardStats.completionRate)} size="sm" />}
        />

        <StatCard
          title="Opérateurs actifs"
          value={dashboardStats.operators.active}
          secondaryValue={`sur ${dashboardStats.operators.total} opérateurs`}
          icon={<Users size={20} />}
        />

        <StatCard
          title="Vitesse moyenne"
          value={`${dashboardStats.performance.averageBoxesPerHour} boîtes/h`}
          trend={{ value: 5, isPositive: true }}
          icon={<Activity size={20} />}
        />
      </div>

      {/* Progress and performance section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Batch status and charts */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Avancement des lots</h2>
              <div className="text-pharma-accent-blue text-sm font-medium cursor-pointer hover:underline">
                Voir tous les lots
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeBatches.map(batch => (
                <BatchProgressCard
                  key={batch.id}
                  batch={{
                    ...batch,
                    medicationName: batch.medicationName || batch.medication_name || '',
                    code: batch.code,
                    totalBoxes: batch.total_boxes,
                    processedBoxes: batch.processed_boxes,
                    assignments: batch.assignments || []
                  }}
                  onEdit={handleEditBatch}
                />
              ))}
            </div>
          </div>

          <PerformanceChart data={operators} />
        </div>

        {/* Right column with stats */}
        <div className="space-y-6">
          <div className="bg-pharma-blue-light rounded-lg p-4">
            <h2 className="text-white text-lg font-medium mb-4">Progression globale</h2>
            <div className="flex flex-col items-center">
              <ProgressDonut
                value={Math.round(dashboardStats.completionRate)}
                size="lg"
                colors={{ background: '#2A3042', fill: '#22C55E' }}
              />
              <div className="mt-4 text-center">
                <p className="text-pharma-text-light">
                  {dashboardStats.processedBoxes.toLocaleString()} / {dashboardStats.totalBoxes.toLocaleString()} boîtes
                </p>
                <p className="text-pharma-text-muted text-sm mt-1">
                  Reste {dashboardStats.remainingBoxes.toLocaleString()} boîtes à traiter
                </p>
              </div>
            </div>
          </div>

          <BatchStatusPie data={dashboardStats.batchStatus} />

          {/* New Report Download Section */}
          <ReportDownload />
        </div>
      </div>

      {/* Operator performance section */}
      <div className="bg-pharma-blue-light rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Meilleurs opérateurs</h2>
          <div className="text-pharma-accent-blue text-sm font-medium cursor-pointer hover:underline">
            Voir tous les opérateurs
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {operators
            .sort((a, b) => b.efficiency - a.efficiency)
            .slice(0, 3)
            .map((operator, index) => (
              <div key={operator.id} className="bg-pharma-blue-dark/30 p-4 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-pharma-accent-blue flex items-center justify-center text-white font-bold">
                      {operator.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{operator.name}</h3>
                      <p className="text-pharma-text-muted text-sm">
                        {operator.totalBoxesProcessed.toLocaleString()} boîtes traitées
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className={index === 0 ? "text-pharma-accent-green" : "text-pharma-text-light"}>
                      #{index + 1}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="text-center p-2 bg-pharma-blue-dark/30 rounded">
                    <p className="text-pharma-text-muted text-xs">Vitesse</p>
                    <p className="text-white font-medium">{operator.productivity} boîtes/h</p>
                  </div>
                  <div className="text-center p-2 bg-pharma-blue-dark/30 rounded">
                    <p className="text-pharma-text-muted text-xs">Efficacité</p>
                    <p className="text-white font-medium">{operator.efficiency}%</p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
