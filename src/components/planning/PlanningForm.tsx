
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";
import { Batch } from "@/types";

interface PlanningFormProps {
  onSubmit: (e: React.FormEvent) => void;
  form: {
    batchId: string;
    plannedStartDate: string;
    plannedEndDate: string;
    actualStartDate?: string;
    actualEndDate?: string;
    requiredOperators: number;
    assignedOperators?: number;
    priority: number;
    progress?: number;
    status?: string;
    notes: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  batches: Batch[];
  onCancel: () => void;
  isEditing: boolean;
  isSubmitting?: boolean;
}

export const PlanningForm = ({
  onSubmit,
  form,
  handleChange,
  batches,
  onCancel,
  isEditing,
  isSubmitting = false
}: PlanningFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="batchId">Lot</Label>
        <Select
          value={form.batchId}
          onValueChange={(value) => handleChange({ target: { name: 'batchId', value } } as any)}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un lot" />
          </SelectTrigger>
          <SelectContent>
            {batches?.length > 0 ? (
              batches.map((batch) => (
                <SelectItem key={batch.id} value={batch.id}>
                  {`${batch.code} - ${batch.medicationName || ''}`}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="" disabled>
                Aucun lot disponible pour planification
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        {!isEditing && batches?.length === 0 && (
          <p className="text-xs text-yellow-500 mt-1">
            Tous les lots sont déjà planifiés ou terminés. Veuillez ajouter un nouveau lot.
          </p>
        )}
        {!isEditing && batches?.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            Seuls les lots non planifiés et non terminés sont disponibles.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="plannedStartDate">Date de début prévue</Label>
          <Input
            type="date"
            id="plannedStartDate"
            name="plannedStartDate"
            value={form.plannedStartDate}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="plannedEndDate">Date de fin prévue</Label>
          <Input
            type="date"
            id="plannedEndDate"
            name="plannedEndDate"
            value={form.plannedEndDate}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {isEditing && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="actualStartDate">Date de début réelle</Label>
            <Input
              type="date"
              id="actualStartDate"
              name="actualStartDate"
              value={form.actualStartDate || ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="actualEndDate">Date de fin réelle</Label>
            <Input
              type="date"
              id="actualEndDate"
              name="actualEndDate"
              value={form.actualEndDate || ''}
              onChange={handleChange}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="requiredOperators">Opérateurs requis</Label>
          <Input
            type="number"
            id="requiredOperators"
            name="requiredOperators"
            min={1}
            value={form.requiredOperators}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="priority">Priorité</Label>
          <Select
            value={form.priority.toString()}
            onValueChange={(value) => handleChange({ target: { name: 'priority', value } } as any)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner la priorité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Haute</SelectItem>
              <SelectItem value="2">Moyenne</SelectItem>
              <SelectItem value="3">Basse</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isEditing && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="assignedOperators">Opérateurs assignés</Label>
            <Input
              type="number"
              id="assignedOperators"
              name="assignedOperators"
              min={0}
              value={form.assignedOperators || 0}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="progress">Progression (%)</Label>
            <Input
              type="number"
              id="progress"
              name="progress"
              min={0}
              max={100}
              value={form.progress || 0}
              onChange={handleChange}
              disabled
            />
          </div>
        </div>
      )}

      {isEditing && (
        <div>
          <Label htmlFor="status">Statut</Label>
          <Select
            value={form.status || 'planned'}
            onValueChange={(value) => handleChange({ target: { name: 'status', value } } as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner le statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planned">Planifié</SelectItem>
              <SelectItem value="in-progress">En cours</SelectItem>
              <SelectItem value="completed">Terminé</SelectItem>
              <SelectItem value="delayed">En retard</SelectItem>
              <SelectItem value="cancelled">Annulé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Ajouter des notes ou instructions spécifiques..."
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "En cours..." : isEditing ? "Mettre à jour" : "Créer"}
        </Button>
      </DialogFooter>
    </form>
  );
};
