
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
import { useUniqueMedicationNames, useAddMedication } from "@/hooks/useMedications";

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
    status: "pending" as BatchStatusType,
    newMedicationName: "" // Pour saisir un nouveau médicament
  });
  const [showNewMedicationInput, setShowNewMedicationInput] = useState(false);
  const { mutateAsync, isPending } = useAddBatch();
  const { data: medicationNames = [], isLoading: isLoadingMedications } = useUniqueMedicationNames();
  const { mutateAsync: addMedication } = useAddMedication();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleStatusChange = (value: BatchStatusType) => {
    setForm({ ...form, status: value });
  };

  const handleMedicationChange = (value: string) => {
    if (value === "new") {
      setShowNewMedicationInput(true);
    } else {
      setForm({ ...form, medicationName: value });
      setShowNewMedicationInput(false);
    }
  };

  const handleAddNewMedication = async () => {
    if (!form.newMedicationName.trim()) {
      toast({ description: "Veuillez saisir un nom de médicament", variant: "destructive" });
      return;
    }

    try {
      await addMedication(form.newMedicationName.trim());
      setForm({ ...form, medicationName: form.newMedicationName.trim(), newMedicationName: "" });
      setShowNewMedicationInput(false);
      toast({ description: "Nouveau médicament ajouté à la liste" });
    } catch (err: any) {
      toast({ description: "Erreur lors de l'ajout du médicament : " + err.message, variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Si l'utilisateur est en train de saisir un nouveau médicament, on l'ajoute d'abord
    if (showNewMedicationInput && form.newMedicationName.trim()) {
      try {
        await addMedication(form.newMedicationName.trim());
        setForm({ ...form, medicationName: form.newMedicationName.trim(), newMedicationName: "" });
      } catch (err: any) {
        toast({ description: "Erreur lors de l'ajout du médicament : " + err.message, variant: "destructive" });
        return;
      }
    }

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
        status: "pending" as BatchStatusType,
        newMedicationName: ""
      });
      setShowNewMedicationInput(false);
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
              {!showNewMedicationInput ? (
                <Select
                  value={form.medicationName}
                  onValueChange={handleMedicationChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un médicament" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingMedications ? (
                      <SelectItem value="" disabled>Chargement...</SelectItem>
                    ) : (
                      <>
                        {medicationNames.map((name: string) => (
                          <SelectItem key={name} value={name}>
                            {name}
                          </SelectItem>
                        ))}
                        <SelectItem value="new" className="text-pharma-accent-blue font-semibold">
                          + Ajouter un nouveau médicament
                        </SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex gap-2">
                  <Input
                    id="newMedicationName"
                    name="newMedicationName"
                    placeholder="Nom du nouveau médicament"
                    value={form.newMedicationName}
                    onChange={handleChange}
                    autoFocus
                  />
                  <Button
                    type="button"
                    onClick={handleAddNewMedication}
                    size="sm"
                  >
                    Ajouter
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowNewMedicationInput(false)}
                    variant="outline"
                    size="sm"
                  >
                    Annuler
                  </Button>
                </div>
              )}
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
