
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { Assignment } from "@/types";
import { Box } from "lucide-react";

interface AssignmentFormProps {
  form: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
  isPending: boolean;
  maxAvailableBoxes: number;
  batches: any[];
  operators: any[];
  onClose: () => void;
  setShowAnomalyForm?: (show: boolean) => void;
}

const AssignmentForm = ({
  form,
  handleChange,
  handleSubmit,
  isEditing,
  isPending,
  maxAvailableBoxes,
  batches,
  operators,
  onClose,
  setShowAnomalyForm
}: AssignmentFormProps) => {
  const isFormValid = () => {
    return (
      form.batchId &&
      form.operatorId &&
      form.assignedBoxes > 0 &&
      form.startTime &&
      form.expectedEndTime
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="py-4">
        {/* Disposition en grille avec 2 colonnes pour les écrans moyens et grands */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {/* Colonne 1 - Informations principales */}
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="batchId">Lot</Label>
              <select
                id="batchId"
                name="batchId"
                className="bg-background border rounded px-3 py-2"
                value={form.batchId}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner un lot</option>
                {batches.map((batch: any) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.code} - {batch.medication_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="operatorId">Opérateur</Label>
              <select
                id="operatorId"
                name="operatorId"
                className="bg-background border rounded px-3 py-2"
                value={form.operatorId}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner un opérateur</option>
                {operators.map((operator: any) => (
                  <option key={operator.id} value={operator.id}>
                    {operator.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="assignedBoxes">
                  Boîtes à assigner
                  {form.batchId && <span className="text-xs text-muted-foreground ml-2">
                    (Disponible: {maxAvailableBoxes})
                  </span>}
                </Label>
                <Input
                  id="assignedBoxes"
                  name="assignedBoxes"
                  type="number"
                  min={1}
                  max={maxAvailableBoxes}
                  value={form.assignedBoxes}
                  onChange={handleChange}
                  required
                />
              </div>

              {isEditing ? (
                <div className="grid gap-2">
                  <Label htmlFor="processedBoxes">Boîtes traitées</Label>
                  <Input
                    id="processedBoxes"
                    name="processedBoxes"
                    type="number"
                    min={0}
                    max={form.assignedBoxes}
                    value={form.processedBoxes}
                    onChange={handleChange}
                  />
                </div>
              ) : (
                <div className="hidden md:block"></div> // Espace vide pour maintenir l'alignement
              )}
            </div>

            {isEditing && (
              <div className="grid gap-2">
                <Label htmlFor="status">Statut (automatique)</Label>
                <div className="bg-background border rounded px-3 py-2 text-muted-foreground">
                  {form.status === "pending" && "En attente"}
                  {form.status === "in-progress" && "En cours"}
                  {form.status === "completed" && "Terminé"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Le statut est déterminé automatiquement en fonction des quantités assignées et traitées.
                </p>
              </div>
            )}
          </div>

          {/* Colonne 2 - Dates */}
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="startTime">Date de début</Label>
              <Input
                id="startTime"
                name="startTime"
                type="datetime-local"
                value={form.startTime ? new Date(form.startTime).toISOString().slice(0, 16) : ""}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="expectedEndTime">Fin prévue</Label>
              <Input
                id="expectedEndTime"
                name="expectedEndTime"
                type="datetime-local"
                value={form.expectedEndTime ? new Date(form.expectedEndTime).toISOString().slice(0, 16) : ""}
                onChange={handleChange}
                required
              />
            </div>

            {isEditing && (
              <div className="grid gap-2">
                <Label htmlFor="endTime">Date de fin réelle</Label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="datetime-local"
                  value={form.endTime ? new Date(form.endTime).toISOString().slice(0, 16) : ""}
                  onChange={handleChange}
                />
              </div>
            )}


          </div>
        </div>
      </div>

      <DialogFooter className="mt-4 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit" disabled={!isFormValid() || isPending}>
          {isEditing ? "Mettre à jour" : "Créer"}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default AssignmentForm;
