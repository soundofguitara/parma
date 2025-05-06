import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EnhancedAnomalyForm from '@/components/modal/EnhancedAnomalyForm';
import { useAddAnomaly } from '@/hooks/useAnomalies';
import { toast } from '@/hooks/use-toast';

interface AnomalyModalProps {
  open: boolean;
  onClose: () => void;
  batchId?: string;
  batchCode?: string;
  medicationName?: string;
  operatorId?: string;
  operatorName?: string;
  assignmentId?: string;
  maxQuantity?: number;
}

const AnomalyModal = ({
  open,
  onClose,
  batchId = '',
  batchCode,
  medicationName,
  operatorId = '',
  operatorName,
  assignmentId,
  maxQuantity
}: AnomalyModalProps) => {
  const { mutateAsync: addAnomaly, isPending } = useAddAnomaly();

  const handleSubmit = async (data: any) => {
    try {
      await addAnomaly(data);
      toast({ description: "Anomalie enregistrée avec succès" });
      onClose();
    } catch (err: any) {
      toast({
        variant: "destructive",
        description: `Erreur: ${err.message}`
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-pharma-blue-dark border-pharma-blue-dark text-white">
        <DialogHeader>
          <DialogTitle>Signaler une anomalie</DialogTitle>
        </DialogHeader>
        <EnhancedAnomalyForm
          batchId={batchId}
          batchCode={batchCode}
          medicationName={medicationName}
          operatorId={operatorId}
          operatorName={operatorName}
          assignmentId={assignmentId}
          maxQuantity={maxQuantity}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AnomalyModal;
