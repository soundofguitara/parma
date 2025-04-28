
import React, { useState } from "react";
import { useAddBatch } from "@/hooks/useBatches";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog as Modal, 
  DialogContent as ModalContent, 
  DialogHeader as ModalHeader, 
  DialogTitle as ModalTitle,
  DialogDescription as ModalDescription,
  DialogFooter as ModalFooter 
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BatchStatusType } from "@/types";

interface AddBatchModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddBatchModal({ open, onClose }: AddBatchModalProps) {
  const [form, setForm] = useState({
    code: "",
    medicationName: "",
    totalBoxes: "",
    receivedDate: "",
    expectedCompletionDate: "",
    status: "pending" as BatchStatusType
  });
  const { mutateAsync, isPending } = useAddBatch();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleStatusChange = (value: BatchStatusType) => {
    setForm({ ...form, status: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mutateAsync({
        code: form.code,
        medicationName: form.medicationName,
        totalBoxes: Number(form.totalBoxes),
        receivedDate: form.receivedDate,
        expectedCompletionDate: form.expectedCompletionDate,
        status: form.status
      });
      toast({ description: "Lot ajouté avec succès !" });
      onClose();
      setForm({
        code: "",
        medicationName: "",
        totalBoxes: "",
        receivedDate: "",
        expectedCompletionDate: "",
        status: "pending" as BatchStatusType
      });
    } catch (err: any) {
      toast({ description: "Erreur lors de l'ajout du lot : " + err.message, variant: "destructive" });
    }
  };

  return (
    <Modal open={open} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Ajouter un lot</ModalTitle>
          <ModalDescription>
            Ajoutez un nouveau lot de médicaments à traiter
          </ModalDescription>
        </ModalHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-2">
            <div className="space-y-2">
              <Label htmlFor="code">Code du lot</Label>
              <Input id="code" name="code" placeholder="Code lot" required value={form.code} onChange={handleChange} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="medicationName">Nom du médicament</Label>
              <Input id="medicationName" name="medicationName" placeholder="Nom du médicament" required value={form.medicationName} onChange={handleChange} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="totalBoxes">Quantité totale</Label>
              <Input id="totalBoxes" name="totalBoxes" type="number" placeholder="Quantité totale" required min={1} value={form.totalBoxes} onChange={handleChange} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="receivedDate">Date de réception</Label>
              <Input id="receivedDate" name="receivedDate" type="date" placeholder="Date de réception" required value={form.receivedDate} onChange={handleChange} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expectedCompletionDate">Date de fin prévue</Label>
              <Input id="expectedCompletionDate" name="expectedCompletionDate" type="date" placeholder="Date de fin prévue" required value={form.expectedCompletionDate} onChange={handleChange} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Statut initial</Label>
              <Select 
                onValueChange={(value: BatchStatusType) => handleStatusChange(value)} 
                defaultValue={form.status}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="in-progress">En cours</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                  <SelectItem value="delayed">En retard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <ModalFooter>
            <Button type="button" onClick={onClose} variant="outline">Annuler</Button>
            <Button type="submit" disabled={isPending}>Ajouter</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
