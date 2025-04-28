
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Batch, BatchStatusType } from "@/types";

export function useBatches() {
  return useQuery({
    queryKey: ["batches"],
    queryFn: async () => {
      // Récupère les lots avec leurs affectations
      const { data: batches, error: batchesError } = await supabase
        .from("batches")
        .select("*")
        .order("received_date", { ascending: false });
      
      if (batchesError) throw batchesError;

      // Récupère les affectations pour chaque lot
      const { data: assignments, error: assignmentsError } = await supabase
        .from("assignments")
        .select("*");
      
      if (assignmentsError) throw assignmentsError;

      // Associe les affectations à leurs lots respectifs
      const batchesWithAssignments = batches.map((batch: any) => {
        const batchAssignments = assignments.filter(
          (a: any) => a.batch_id === batch.id
        ).map((a: any) => ({
          id: a.id,
          batchId: a.batch_id,
          operatorId: a.operator_id,
          operatorName: a.operator_name,
          assignedBoxes: a.assigned_boxes,
          processedBoxes: a.processed_boxes,
          startTime: a.start_time,
          endTime: a.end_time,
          expectedEndTime: a.expected_end_time,
          status: a.status
        }));
        // Détermination automatique du statut du lot
        let autoStatus = batch.status;
        const now = new Date();
        if (!batchAssignments || batchAssignments.length === 0) {
          autoStatus = 'pending';
        } else {
          const totalAssigned = batchAssignments.reduce((sum, a) => sum + (a.assignedBoxes || 0), 0);
          const totalProcessed = batchAssignments.reduce((sum, a) => sum + (a.processedBoxes || 0), 0);
          const allCompleted = batchAssignments.every(a => a.status === 'completed');
          const deadline = new Date(batch.expected_completion_date);
          if (allCompleted && totalProcessed >= batch.total_boxes) {
            autoStatus = 'completed';
          } else if (deadline < now && totalProcessed < batch.total_boxes) {
            autoStatus = 'delayed';
          } else {
            autoStatus = 'in-progress';
          }
        }
        return {
          ...batch,
          assignments: batchAssignments,
          status: autoStatus
        };
      });
      
      return batchesWithAssignments || [];
    },
  });
}

export function useAddBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newBatch: Omit<Partial<Batch>, "id" | "assignments">) => {
      // Convert camelCase to snake_case for database
      const batchToAdd = {
        code: newBatch.code,
        medication_name: newBatch.medicationName,
        total_boxes: newBatch.totalBoxes,
        processed_boxes: newBatch.processedBoxes || 0,
        received_date: newBatch.receivedDate,
        expected_completion_date: newBatch.expectedCompletionDate,
        status: newBatch.status || 'pending' as BatchStatusType
      };

      const { data, error } = await supabase
        .from("batches")
        .insert([batchToAdd])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
    },
  });
}

export function useUpdateBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (batch: Partial<Batch> & { id: string }) => {
      // Convert camelCase to snake_case for database
      const batchToUpdate = {
        code: batch.code,
        medication_name: batch.medicationName,
        total_boxes: batch.totalBoxes,
        processed_boxes: batch.processedBoxes,
        received_date: batch.receivedDate,
        expected_completion_date: batch.expectedCompletionDate,
        status: batch.status
      };

      const { data, error } = await supabase
        .from("batches")
        .update(batchToUpdate)
        .eq("id", batch.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
    },
  });
}

export function useDeleteBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // D'abord, supprimer toutes les affectations liées à ce lot
      const { error: assignmentsError } = await supabase
        .from("assignments")
        .delete()
        .eq("batch_id", id);
      
      if (assignmentsError) throw assignmentsError;
      
      // Ensuite, supprimer le lot
      const { error } = await supabase
        .from("batches")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
    },
  });
}
