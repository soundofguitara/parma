
import { useState, useEffect } from 'react';
import { Assignment } from '@/types';
import { toast } from '@/hooks/use-toast';
import { useAddAssignment, useUpdateAssignment } from '@/hooks/useAssignmentMutations';

interface UseAssignmentFormProps {
  assignment: any | null;
  operators: any[];
  onClose: () => void;
}

export const useAssignmentForm = ({ assignment, operators, onClose }: UseAssignmentFormProps) => {
  const isEditing = Boolean(assignment);
  const [form, setForm] = useState({
    batchId: "",
    operatorId: "",
    operatorName: "",
    assignedBoxes: 0,
    processedBoxes: 0,
    startTime: new Date().toISOString(),
    endTime: null,
    expectedEndTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    status: "pending" as "pending" | "in-progress" | "completed"
  });

  const { mutateAsync: addAssignment, isPending: isAddingPending } = useAddAssignment();
  const { mutateAsync: updateAssignment, isPending: isUpdatingPending } = useUpdateAssignment();
  const isPending = isAddingPending || isUpdatingPending;

  useEffect(() => {
    if (assignment) {
      setForm({
        batchId: assignment.batch_id,
        operatorId: assignment.operator_id,
        operatorName: assignment.operator_name,
        assignedBoxes: assignment.assigned_boxes,
        processedBoxes: assignment.processed_boxes || 0,
        startTime: assignment.start_time,
        endTime: assignment.end_time,
        expectedEndTime: assignment.expected_end_time,
        status: assignment.status
      });
    } else {
      setForm({
        batchId: "",
        operatorId: "",
        operatorName: "",
        assignedBoxes: 0,
        processedBoxes: 0,
        startTime: new Date().toISOString(),
        endTime: null,
        expectedEndTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: "pending"
      });
    }
  }, [assignment]);

  const getOperatorName = (operatorId: string): string => {
    const operator = operators.find(op => op.id === operatorId);
    return operator ? operator.name : "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "operatorId") {
      const operatorName = getOperatorName(value);
      setForm({ ...form, operatorId: value, operatorName });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (assignment) {
        await updateAssignment({
          id: assignment.id,
          assignment: form
        });
        toast({
          description: "Affectation mise à jour avec succès"
        });
      } else {
        await addAssignment(form as Omit<Assignment, "id">);
        toast({
          description: "Nouvelle affectation créée avec succès"
        });
      }
      onClose();
    } catch (err: any) {
      toast({
        variant: "destructive",
        description: `Erreur: ${err.message}`
      });
    }
  };

  return {
    form,
    setForm,
    handleChange,
    handleSubmit,
    isEditing,
    isPending
  };
};
