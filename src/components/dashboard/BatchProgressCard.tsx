
import React from 'react';
import { Clock, Edit, Trash, AlertTriangle, AlertCircle } from 'lucide-react';
import { Batch } from '@/types';
import { cn } from '@/lib/utils';
import ProgressDonut from '@/components/dashboard/ProgressDonut';
import { Button } from '@/components/ui/button';
import { useDeleteBatch } from '@/hooks/useBatches';
import { toast } from '@/hooks/use-toast';
import { useBatchAnomalies, hasDeviations, getTotalAffectedQuantity, getDeviationNumbers } from '@/hooks/useBatchAnomalies';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BatchProgressCardProps {
  batch: Batch;
  onEdit: (batch: Batch) => void;
}

const BatchProgressCard = ({ batch, onEdit }: BatchProgressCardProps) => {
  // Calculer le nombre total de boîtes traitées par tous les opérateurs (assignments)
  const totalProcessedByAssignments = batch.assignments && batch.assignments.length > 0
    ? batch.assignments.reduce((sum: number, a: any) => sum + (a.processedBoxes || 0), 0)
    : batch.processedBoxes || 0;
  const progress = batch.totalBoxes > 0 && !isNaN(totalProcessedByAssignments)
    ? Math.round((totalProcessedByAssignments / batch.totalBoxes) * 100)
    : 0;
  const { mutateAsync: deleteBatch } = useDeleteBatch();

  // Récupérer les anomalies liées à ce lot
  const { data: anomalies = [], isLoading: isLoadingAnomalies } = useBatchAnomalies(batch.id);

  // Vérifier si le lot a des déviations
  const batchHasDeviations = hasDeviations(anomalies);

  // Calculer la quantité totale affectée par les anomalies
  const totalAffectedQuantity = getTotalAffectedQuantity(anomalies);

  // Récupérer les numéros de déviation
  const deviationNumbers = getDeviationNumbers(anomalies);

  const getStatusColor = (status: Batch['status']) => {
    switch (status) {
      case 'pending':
        return '#8E9196'; // Gris neutre
      case 'in-progress':
        return '#0EA5E9'; // Bleu
      case 'completed':
        return '#22C55E'; // Vert
      case 'delayed':
        return '#EF4444'; // Rouge
      default:
        return '#8E9196';
    }
  };

  const getStatusText = (status: Batch['status']) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'in-progress':
        return 'En cours';
      case 'completed':
        return 'Terminé';
      case 'delayed':
        return 'En retard';
      default:
        return 'Inconnu';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const handleDelete = async () => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le lot ${batch.code} ?`)) {
      try {
        await deleteBatch(batch.id);
        toast({
          description: `Lot ${batch.code} supprimé avec succès.`,
        });
      } catch (error: any) {
        toast({
          variant: 'destructive',
          description: `Erreur lors de la suppression: ${error.message}`,
        });
      }
    }
  };

  return (
    <div className="bg-pharma-blue-light rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-white font-bold">{batch.medicationName}</h3>
          <p className="text-pharma-text-muted text-sm">Lot #{batch.code}</p>
        </div>
        <div className={cn(
          "px-2 py-1 rounded text-xs font-semibold",
          batch.status === 'completed' ? "bg-pharma-accent-green/20 text-pharma-accent-green" :
          batch.status === 'delayed' ? "bg-pharma-accent-red/20 text-pharma-accent-red" :
          batch.status === 'in-progress' ? "bg-pharma-accent-blue/20 text-pharma-accent-blue" :
          "bg-pharma-text-muted/20 text-pharma-text-muted"
        )}>
          {getStatusText(batch.status)}
        </div>
      </div>

      <div className="flex justify-between items-center mb-2 text-sm">
        <div className="flex items-center gap-1 text-pharma-text-muted">
          <Clock size={14} />
          <span>Date limite: {formatDate(batch.expectedCompletionDate)}</span>
        </div>
        <div className="text-white">
          {totalProcessedByAssignments} / {batch.totalBoxes} boîtes
        </div>
      </div>

      {/* Affichage des informations sur les déviations */}
      {batchHasDeviations && (
        <div className="mb-3 mt-1 bg-pharma-blue-dark/40 p-2 rounded-md">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-yellow-500" />
            <span className="text-yellow-500 text-sm font-medium">Déviation signalée</span>
          </div>
          <div className="text-xs text-pharma-text-light">
            <div className="flex justify-between mb-1">
              <span>Quantité impactée:</span>
              <span className="text-white font-medium">{totalAffectedQuantity} boîtes</span>
            </div>
            {deviationNumbers.length > 0 && (
              <div className="flex justify-between">
                <span>N° de déviation:</span>
                <span className="text-white font-medium">
                  {deviationNumbers.join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cercle de progression */}
      <div className="flex justify-center items-center my-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <ProgressDonut
                  value={progress}
                  colors={{
                    background: '#2A3042',
                    fill: getStatusColor(batch.status)
                  }}
                  size="sm"
                />
                {batchHasDeviations && !isLoadingAnomalies && (
                  <div className="relative">
                    <div className="absolute -top-8 -right-2">
                      <AlertCircle size={16} className="text-yellow-500" />
                    </div>
                  </div>
                )}
              </div>
            </TooltipTrigger>
            {batchHasDeviations && (
              <TooltipContent side="top">
                <p className="text-xs">Ce lot a {anomalies.length} anomalie(s) signalée(s)</p>
                <p className="text-xs">Quantité impactée: {totalAffectedQuantity} boîtes</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        {batch.assignments && batch.assignments.length > 0 ? (
          batch.assignments.map((assignment) => (
            <div key={assignment.id} className="bg-pharma-blue-dark/40 p-2 rounded">
              <div className="text-white font-medium">{assignment.operatorName}</div>
              <div className="text-pharma-text-muted">
                {assignment.processedBoxes} / {assignment.assignedBoxes} boîtes
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center text-pharma-text-muted p-2 bg-pharma-blue-dark/40 rounded">
            Aucun opérateur assigné
          </div>
        )}
      </div>

      {/* Boutons d'actions */}
      <div className="mt-4 flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(batch)}
          className="text-pharma-text-light hover:text-white"
        >
          <Edit size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="text-pharma-text-light hover:text-pharma-accent-red"
        >
          <Trash size={16} />
        </Button>
      </div>
    </div>
  );
};

export default BatchProgressCard;
