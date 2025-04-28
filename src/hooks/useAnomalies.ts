
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Anomaly } from '@/types';

export function useAnomalies(batchId?: string) {
  return useQuery({
    queryKey: ['anomalies', batchId],
    queryFn: async () => {
      const query = supabase
        .from('anomalies')
        .select('*')
        .order('detection_date', { ascending: false });

      if (batchId) {
        query.eq('batch_id', batchId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!batchId
  });
}

export function useAddAnomaly() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (anomaly: Omit<Anomaly, 'id'>) => {
      const { data, error } = await supabase
        .from('anomalies')
        .insert([anomaly])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anomalies'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });
}
