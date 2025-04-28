
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import { supabase } from "@/lib/supabaseClient";

// Types pour les paramètres du rapport
export interface ReportParams {
  type: 'productivity' | 'batches' | 'operators';
  format: 'excel' | 'pdf';
  dateFrom: Date;
  dateTo: Date;
}

// Fonction générant le rapport à partir de la base de données réelle
const generateReport = async (params: ReportParams): Promise<Blob> => {
  let reportData;
  switch(params.type) {
    case 'productivity': {
      // Extraction des données de productivité par opérateur
      const { data, error } = await supabase
        .from("assignments")
        .select(`operator_id, operator_name, assigned_boxes, processed_boxes, status, start_time, end_time, expected_end_time`)
        .gte('start_time', params.dateFrom.toISOString())
        .lte('end_time', params.dateTo.toISOString());
      if (error) throw error;
      // Regrouper par opérateur
      const productivity = {};
      (data || []).forEach((row: any) => {
        const op = row.operator_name || row.operator_id;
        if (!productivity[op]) productivity[op] = { operator: op, boxes: 0, efficiency: 0, onTimeRate: 0, count: 0 };
        productivity[op].boxes += row.processed_boxes || 0;
        productivity[op].efficiency += row.status === 'completed' ? 1 : 0;
        productivity[op].onTimeRate += (row.status === 'completed' && row.end_time && row.expected_end_time && new Date(row.end_time) <= new Date(row.expected_end_time)) ? 1 : 0;
        productivity[op].count += 1;
      });
      const prodArr = Object.values(productivity).map((p: any) => ({
        operator: p.operator,
        boxes: p.boxes,
        efficiency: p.count ? Math.round((p.efficiency / p.count) * 100) + "%" : "-",
        onTimeRate: p.count ? Math.round((p.onTimeRate / p.count) * 100) + "%" : "-"
      }));
      reportData = {
        title: "Rapport de productivité",
        period: `${params.dateFrom.toLocaleDateString()} - ${params.dateTo.toLocaleDateString()}`,
        data: prodArr
      };
      break;
    }
    case 'batches': {
      try {
        // Extraction des lots traités avec leurs affectations
        const { data: batches, error: batchesError } = await supabase
          .from("batches")
          .select("id, code, medication_name, total_boxes, processed_boxes, status, created_at")
          .gte('created_at', params.dateFrom.toISOString())
          .lte('created_at', params.dateTo.toISOString());
        if (batchesError) throw new Error("Erreur lors de la récupération des lots: " + batchesError.message);
        if (!batches || !Array.isArray(batches)) throw new Error("Aucun lot trouvé ou format inattendu.");
        // On filtre les lots valides (tous les champs essentiels doivent exister)
        const validBatches = batches.filter((b: any) => b && b.id && b.code && b.medication_name && typeof b.total_boxes !== 'undefined' && b.status);
        const batchIds = validBatches.map((b: any) => b.id);
        let assignments = [];
        if (batchIds.length > 0) {
          const { data: assignData, error: assignError } = await supabase
            .from("assignments")
            .select("batch_id, assigned_boxes, processed_boxes")
            .in('batch_id', batchIds);
          if (assignError) throw new Error("Erreur lors de la récupération des affectations: " + assignError.message);
          assignments = Array.isArray(assignData) ? assignData : [];
        }
        let batchArr = [];
        if (validBatches.length > 0) {
          batchArr = validBatches.map((b: any) => {
            const batchAssignments = assignments.filter((a: any) => a.batch_id === b.id);
            const totalAssigned = batchAssignments.reduce((sum, a) => sum + (a.assigned_boxes || 0), 0);
            const totalProcessed = batchAssignments.reduce((sum, a) => sum + (a.processed_boxes || 0), 0);
            const percentProcessed = b.total_boxes && b.total_boxes > 0 ? Math.round((totalProcessed / b.total_boxes) * 100) + "%" : "-";
            return {
              code: b.code || "-",
              medication: b.medication_name || "-",
              totalBoxes: typeof b.total_boxes === 'number' ? b.total_boxes : "-",
              assignedBoxes: totalAssigned,
              processedBoxes: totalProcessed,
              processed: percentProcessed,
              status: b.status || "-"
            };
          });
        } else {
          batchArr = [{ code: "-", medication: "-", totalBoxes: "-", assignedBoxes: "-", processedBoxes: "-", processed: "-", status: "-", message: "Aucun lot trouvé pour la période sélectionnée." }];
        }
        reportData = {
          title: "Rapport des lots",
          period: `${params.dateFrom.toLocaleDateString()} - ${params.dateTo.toLocaleDateString()}`,
          data: batchArr
        };
      } catch (err: any) {
        reportData = {
          title: "Rapport des lots (erreur)",
          period: `${params.dateFrom.toLocaleDateString()} - ${params.dateTo.toLocaleDateString()}`,
          data: [],
          error: err && err.message ? err.message : "Erreur inconnue lors de la génération du rapport des lots."
        };
      }
      break;
    }
    case 'operators': {
      // Extraction des statistiques opérateurs
      const { data, error } = await supabase
        .from("assignments")
        .select(`operator_id, operator_name, processed_boxes`)
        .gte('start_time', params.dateFrom.toISOString())
        .lte('end_time', params.dateTo.toISOString());
      if (error) throw error;
      // Regrouper par opérateur
      const stats = {};
      (data || []).forEach((row: any) => {
        const op = row.operator_name || row.operator_id;
        if (!stats[op]) stats[op] = { name: op, totalAssignments: 0, totalBoxes: 0 };
        stats[op].totalAssignments += 1;
        stats[op].totalBoxes += row.processed_boxes || 0;
      });
      const opArr = Object.values(stats).map((o: any) => ({
        name: o.name,
        totalAssignments: o.totalAssignments,
        totalBoxes: o.totalBoxes,
        avgSpeed: o.totalAssignments ? Math.round(o.totalBoxes / o.totalAssignments) + " boîtes/h" : "-"
      }));
      reportData = {
        title: "Rapport des opérateurs",
        period: `${params.dateFrom.toLocaleDateString()} - ${params.dateTo.toLocaleDateString()}`,
        data: opArr
      };
      break;
    }
    default:
      reportData = { title: "Rapport", data: [] };
  }
  if (params.format === 'excel') {
    const ws = XLSX.utils.json_to_sheet(reportData.data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Données");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    return new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  } else if (params.format === 'pdf') {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(reportData.title, 10, 15);
    doc.setFontSize(10);
    doc.text(`Période : ${reportData.period}`, 10, 25);
    let y = 35;
    const data = reportData.data;
    if (data && data.length > 0) {
      const keys = Object.keys(data[0]);
      doc.setFont(undefined, 'bold');
      doc.text(keys.join(' | '), 10, y);
      doc.setFont(undefined, 'normal');
      y += 8;
      data.forEach((row: any) => {
        doc.text(keys.map(k => String(row[k])).join(' | '), 10, y);
        y += 8;
      });
    } else {
      doc.text("Aucune donnée disponible.", 10, y);
    }
    return doc.output("blob");
  } else {
    return new Blob([
      JSON.stringify(reportData, null, 2)
    ], { type: "application/json" });
  }
}

export function useGenerateReport() {
  return useMutation({
    mutationFn: generateReport,
    onSuccess: (data, variables) => {
      // Créer un URL pour le téléchargement du blob
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      
      // Définir un nom de fichier approprié
      const fileName = `rapport_${variables.type}_${formatDateForFileName(variables.dateFrom)}_${formatDateForFileName(variables.dateTo)}.${variables.format === 'excel' ? 'xlsx' : 'pdf'}`;
      link.setAttribute('download', fileName);
      
      // Simuler un clic pour lancer le téléchargement
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Libérer l'URL créé
      URL.revokeObjectURL(url);
      
      toast({
        title: "Rapport téléchargé avec succès",
        description: `Le rapport a été généré au format ${variables.format === 'excel' ? 'Excel' : 'PDF'}.`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur de génération du rapport",
        description: `Une erreur est survenue: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
      });
    }
  });
}

// Fonction utilitaire pour formater les dates dans les noms de fichiers
function formatDateForFileName(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
