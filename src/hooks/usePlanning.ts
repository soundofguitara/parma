
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export interface PlanningItem {
  id: string;
  batch_id: string;
  planned_start_date: string;
  planned_end_date: string;
  required_operators: number;
  priority: number;
  notes?: string;
  batches?: {
    id: string;
    code: string;
    medication_name: string;
  };
}

export function usePlanning() {
  const queryClient = useQueryClient();

  const { data: planningItems = [], isLoading } = useQuery({
    queryKey: ["planning"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("planning")
        .select(`
          id,
          batch_id,
          planned_start_date,
          planned_end_date,
          required_operators,
          priority,
          notes,
          batches (
            id,
            code,
            medication_name
          )
        `)
        .order('priority', { ascending: true });

      if (error) throw error;
      return data as unknown as PlanningItem[];
    }
  });

  const addPlanning = useMutation({
    mutationFn: async (newPlanning: Omit<PlanningItem, "id" | "batches">) => {
      const { data, error } = await supabase
        .from("planning")
        .insert([newPlanning])
        .select(`
          id, 
          batch_id, 
          planned_start_date, 
          planned_end_date, 
          required_operators, 
          priority, 
          notes
        `)
        .single();

      if (error) throw error;
      return data as PlanningItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planning"] });
    }
  });

  const updatePlanning = useMutation({
    mutationFn: async ({ id, ...planning }: Partial<PlanningItem> & { id: string }) => {
      const { data, error } = await supabase
        .from("planning")
        .update(planning)
        .eq("id", id)
        .select(`
          id, 
          batch_id, 
          planned_start_date, 
          planned_end_date, 
          required_operators, 
          priority, 
          notes
        `)
        .single();

      if (error) throw error;
      return data as PlanningItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planning"] });
    }
  });

  const deletePlanning = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("planning")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planning"] });
    }
  });

  return {
    planningItems,
    isLoading,
    addPlanning,
    updatePlanning,
    deletePlanning
  };
}
