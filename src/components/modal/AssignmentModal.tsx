
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
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
  const {
    form,
    handleChange,
    handleSubmit,
    isEditing,
    isPending
  } = useAssignmentForm({ assignment, operators, onClose });

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
      <DialogContent className="sm:max-w-4xl w-[90vw]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifier l'affectation" : "Nouvelle affectation"}</DialogTitle>
        </DialogHeader>

        {isEditing && <AnomalyWarning />}

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
          setShowAnomalyForm={() => {}}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentModal;
