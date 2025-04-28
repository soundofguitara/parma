
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Assignment } from "@/types";

export function useAddAssignment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newAssignment: Omit<Assignment, "id">) => {
      // Détermination automatique du statut à la création
      let status = newAssignment.status;
      if (!status) {
        status = "pending";
      }
      const { data, error } = await supabase
        .from("assignments")
        .insert([{
          batch_id: newAssignment.batchId,
          operator_id: newAssignment.operatorId,
          operator_name: newAssignment.operatorName,
          assigned_boxes: newAssignment.assignedBoxes,
          processed_boxes: newAssignment.processedBoxes || 0,
          start_time: newAssignment.startTime,
          end_time: newAssignment.endTime,
          expected_end_time: newAssignment.expectedEndTime,
          status: status
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["batches"] });
    },
  });
}

export function useUpdateAssignment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, assignment }: { id: string, assignment: Partial<Assignment> }) => {
      const updateData: Record<string, any> = {};
      // Convert from camelCase to snake_case for database
      if (assignment.batchId !== undefined) updateData.batch_id = assignment.batchId;
      if (assignment.operatorId !== undefined) updateData.operator_id = assignment.operatorId;
      if (assignment.operatorName !== undefined) updateData.operator_name = assignment.operatorName;
      if (assignment.assignedBoxes !== undefined) updateData.assigned_boxes = assignment.assignedBoxes;
      if (assignment.processedBoxes !== undefined) updateData.processed_boxes = assignment.processedBoxes;
      if (assignment.startTime !== undefined) updateData.start_time = assignment.startTime;
      if (assignment.endTime !== undefined) updateData.end_time = assignment.endTime;
      if (assignment.expectedEndTime !== undefined) updateData.expected_end_time = assignment.expectedEndTime;
      // Logique de statut automatique sauf si statut explicitement fourni
      if (assignment.status !== undefined) {
        updateData.status = assignment.status;
      } else if (
        (assignment.processedBoxes !== undefined || assignment.assignedBoxes !== undefined)
      ) {
        // Utiliser les valeurs existantes si non fournies dans la mise à jour
        const processed = assignment.processedBoxes !== undefined ? assignment.processedBoxes : undefined;
        const assigned = assignment.assignedBoxes !== undefined ? assignment.assignedBoxes : undefined;
        // On suppose que les valeurs actuelles sont déjà dans la base si non fournies
        // Pour une logique robuste, il faudrait idéalement récupérer l'affectation actuelle si une des deux valeurs manque
        if (processed === 0) {
          updateData.status = "pending";
        } else if (
          processed > 0 &&
          assigned !== undefined &&
          processed < assigned
        ) {
          updateData.status = "in-progress";
        } else if (
          assigned !== undefined &&
          processed >= assigned
        ) {
          updateData.status = "completed";
        }
      }
      const { data, error } = await supabase
        .from("assignments")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["batches"] });
    },
  });
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("assignments")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["batches"] });
    },
  });
}
