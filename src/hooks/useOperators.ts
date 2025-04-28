
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Operator } from "@/types";

export function useOperators() {
  return useQuery({
    queryKey: ["operators"],
    queryFn: async () => {
      // Récupérer les opérateurs avec leurs statistiques
      const { data: operators, error: operatorsError } = await supabase
        .from("operators")
        .select("*")
        .order("name");
      
      if (operatorsError) throw operatorsError;

      // Récupérer les affectations pour calculer les performances
      const { data: assignments, error: assignmentsError } = await supabase
        .from("assignments")
        .select("*");
      
      if (assignmentsError) throw assignmentsError;

      // Calculer les performances pour chaque opérateur
      const operatorsWithStats = operators.map((operator: any) => {
        const operatorAssignments = assignments.filter(
          (a: any) => a.operator_id === operator.id
        );

        const totalBoxesProcessed = operatorAssignments.reduce(
          (sum: number, a: any) => sum + (a.processed_boxes || 0), 
          0
        );

        const totalTimeSpentMinutes = operatorAssignments.reduce((sum: number, a: any) => {
          if (!a.start_time) return sum;
          const start = new Date(a.start_time);
          const end = a.end_time ? new Date(a.end_time) : new Date();
          return sum + (end.getTime() - start.getTime()) / (1000 * 60);
        }, 0);

        // Calculer la productivité (boîtes par heure)
        const productivity = totalTimeSpentMinutes > 0 
          ? Math.round((totalBoxesProcessed / totalTimeSpentMinutes) * 60)
          : 0;

        // Calculer l'efficacité
        const totalAssignments = operatorAssignments.length;
        const completedOnTime = operatorAssignments.filter(
          (a: any) => a.status === 'completed' && 
          (!a.expected_end_time || new Date(a.end_time) <= new Date(a.expected_end_time))
        ).length;

        const efficiency = totalAssignments > 0
          ? Math.round((completedOnTime / totalAssignments) * 100)
          : 0;

        return {
          ...operator,
          productivity,
          totalBoxesProcessed,
          totalTimeSpent: Math.round(totalTimeSpentMinutes),
          efficiency,
          totalAssignments,
          completedOnTime
        };
      });

      return operatorsWithStats || [];
    },
  });
}

export function useAddOperator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newOperator: { name: string }) => {
      const { data, error } = await supabase
        .from("operators")
        .insert([{ 
          name: newOperator.name,
          total_boxes_processed: 0,
          total_time_spent: 0
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operators"] });
    },
  });
}

export function useUpdateOperator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (operator: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from("operators")
        .update({ name: operator.name })
        .eq("id", operator.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operators"] });
    },
  });
}

export function useDeleteOperator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // Supprimer d'abord toutes les affectations liées à cet opérateur
      const { error: assignmentsError } = await supabase
        .from("assignments")
        .delete()
        .eq("operator_id", id);
      
      if (assignmentsError) throw assignmentsError;
      
      // Ensuite, supprimer l'opérateur
      const { error } = await supabase
        .from("operators")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operators"] });
    },
  });
}
