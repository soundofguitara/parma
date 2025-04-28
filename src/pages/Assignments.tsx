
import React, { useState } from "react";
import { useAssignments } from "@/hooks/useAssignments";
import { useOperators } from "@/hooks/useOperators";
import { useBatches } from "@/hooks/useBatches";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useDeleteAssignment } from "@/hooks/useAssignmentMutations";
import AssignmentModal from "@/components/modal/AssignmentModal";
import ProgressDonut from "@/components/dashboard/ProgressDonut";

const statusLabels: Record<string, string> = {
  "pending": "En attente",
  "in-progress": "En cours",
  "completed": "Terminé"
};

function formatDate(datetime: string | null) {
  if (!datetime) return "-";
  return new Date(datetime).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

const Assignments = () => {
  const { data: assignments = [], isLoading, error } = useAssignments();
  const { data: operators = [] } = useOperators();
  const { data: batches = [] } = useBatches();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState<any | null>(null);

  const { mutateAsync: deleteAssignment } = useDeleteAssignment();

  const filteredAssignments = assignments.filter((a: any) => {
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    const matchesSearch =
      a.operator_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.batch_id?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleEdit = (assignment: any) => {
    setCurrentAssignment(assignment);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette affectation ?")) {
      try {
        await deleteAssignment(id);
        toast({
          description: "Affectation supprimée avec succès",
        });
      } catch (err: any) {
        toast({
          variant: "destructive",
          description: `Erreur: ${err.message}`,
        });
      }
    }
  };

  const handleAddNew = () => {
    setCurrentAssignment(null);
    setModalOpen(true);
  };

  // Fonction utilitaire pour retrouver les infos lot à partir de batch_id
  const getBatchInfo = (batchId: string) => {
    const batch = batches.find((b: any) => b.id === batchId);
    if (!batch) return { code: batchId, medication_name: "" };
    return {
      code: batch.code,
      medication_name: batch.medication_name || batch.medicationName || "", // deux conventions possibles
    };
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Affectations</h1>
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <Plus size={18} />
          <span>Nouvelle affectation</span>
        </Button>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher par opérateur ou lot..."
            className="pl-10 pr-4 py-2 w-full rounded-lg bg-pharma-blue-light text-white border-none focus:outline-none focus:ring-2 focus:ring-pharma-accent-blue"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="bg-pharma-blue-light text-white rounded-lg px-4 py-2 border-none focus:outline-none focus:ring-2 focus:ring-pharma-accent-blue"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="in-progress">En cours</option>
          <option value="completed">Terminé</option>
        </select>
      </div>

      {/* Table d'affectations */}
      <div className="bg-pharma-blue-light rounded-lg p-4 shadow">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {/* Affichage Lot (code + désignation produit) */}
                <TableHead>Lot</TableHead>
                <TableHead>Opérateur</TableHead>
                <TableHead>Boîtes assignées</TableHead>
                <TableHead>Boîtes traitées</TableHead>
                <TableHead>Progression</TableHead>
                <TableHead>Début</TableHead>
                <TableHead>Fin prévue</TableHead>
                <TableHead>Fin</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-pharma-text-light">Chargement...</TableCell>
                </TableRow>
              ) : filteredAssignments.length > 0 ? (
                filteredAssignments.map((a: any) => {
                  const progress = a.assigned_boxes > 0 
                    ? Math.round((a.processed_boxes / a.assigned_boxes) * 100)
                    : 0;
                  const batchInfo = getBatchInfo(a.batch_id);
                  return (
                    <TableRow key={a.id}>
                      <TableCell>
                        <div>
                          <div className="font-semibold text-white">{batchInfo.code}</div>
                          <div className="text-xs text-pharma-text-muted">{batchInfo.medication_name}</div>
                        </div>
                      </TableCell>
                      <TableCell>{a.operator_name || a.operator_id}</TableCell>
                      <TableCell>{a.assigned_boxes}</TableCell>
                      <TableCell>{a.processed_boxes}</TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          <ProgressDonut value={progress} size="sm" />
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(a.start_time)}</TableCell>
                      <TableCell>{formatDate(a.expected_end_time)}</TableCell>
                      <TableCell>{a.end_time ? formatDate(a.end_time) : <span className="opacity-50">—</span>}</TableCell>
                      <TableCell>
                        <span className={
                          "px-2 py-1 rounded text-xs font-semibold " +
                          (a.status === "completed"
                            ? "bg-green-600 text-white"
                            : a.status === "in-progress"
                            ? "bg-yellow-500 text-white"
                            : "bg-gray-400 text-white"
                          )
                        }>
                          {statusLabels[a.status] ?? a.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(a)}>
                          <Edit size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)}>
                          <Trash size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-pharma-text-light">
                    Aucune affectation à afficher.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal pour ajouter/modifier */}
      <AssignmentModal 
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        assignment={currentAssignment}
        operators={operators}
        batches={batches}
      />
    </div>
  );
};

export default Assignments;
