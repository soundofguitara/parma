
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useAddAnomaly } from "@/hooks/useAnomalies";
import AnomalyForm from "./AnomalyForm";
import AnomalyWarning from "./AnomalyWarning";
import AssignmentForm from "./AssignmentForm";
import { useAssignmentForm } from "@/hooks/useAssignmentForm";

interface AssignmentModalProps {
  open: boolean;
  onClose: () => void;
  assignment: any | null;
  operators: any[];
  batches: any[];
}

const AssignmentModal = ({ open, onClose, assignment, operators, batches }: AssignmentModalProps) => {
  const [showAnomalyForm, setShowAnomalyForm] = useState(false);
  const { mutateAsync: addAnomaly } = useAddAnomaly();

  const {
    form,
    setForm,
    handleChange,
    handleSubmit,
    isEditing,
    isPending
  } = useAssignmentForm({ assignment, operators, onClose });

  const handleAnomalySubmit = async (anomalyData: any) => {
    try {
      await addAnomaly(anomalyData);
      const updatedAssignedBoxes = form.assignedBoxes - anomalyData.quantity;
      setForm({ ...form, assignedBoxes: updatedAssignedBoxes });
      toast({
        description: "Anomalie enregistrée avec succès"
      });
      setShowAnomalyForm(false);
    } catch (err: any) {
      toast({
        variant: "destructive",
        description: `Erreur: ${err.message}`
      });
    }
  };

  const getAvailableBoxes = () => {
    const batch = batches.find(b => b.id === form.batchId);
    if (!batch) return 0;
    
    const batchAssignments = batch.assignments || [];
    const totalAssignedBoxes = batchAssignments.reduce((total: number, a: any) => {
      if (isEditing && a.id === assignment.id) return total;
      return total + (a.assignedBoxes || 0);
    }, 0);
    
    return batch.total_boxes - totalAssignedBoxes;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifier l'affectation" : "Nouvelle affectation"}</DialogTitle>
        </DialogHeader>
        
        {isEditing && <AnomalyWarning />}

        {showAnomalyForm ? (
          <AnomalyForm
            assignmentId={assignment?.id || ''}
            batchId={form.batchId}
            operatorId={form.operatorId}
            maxQuantity={form.assignedBoxes}
            onSubmit={handleAnomalySubmit}
            onCancel={() => setShowAnomalyForm(false)}
          />
        ) : (
          <AssignmentForm
            form={form}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            isEditing={isEditing}
            isPending={isPending}
            maxAvailableBoxes={getAvailableBoxes()}
            batches={batches}
            operators={operators}
            onClose={onClose}
            setShowAnomalyForm={setShowAnomalyForm}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentModal;
