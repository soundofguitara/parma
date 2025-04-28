
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
    requiredOperators: number;
    priority: number;
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
            {batches?.map((batch) => (
              <SelectItem key={batch.id} value={batch.id}>
                {`${batch.code} - ${batch.medicationName || ''}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="plannedStartDate">Date de début</Label>
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
          <Label htmlFor="plannedEndDate">Date de fin</Label>
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
