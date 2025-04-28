
import React, { useState, useEffect } from "react";
import { useUpdateBatch } from "@/hooks/useBatches";
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
import { Batch, BatchStatusType } from "@/types";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface EditBatchModalProps {
  open: boolean;
  onClose: () => void;
  batch: Batch;
}

export default function EditBatchModal({ open, onClose, batch }: EditBatchModalProps) {
  const [form, setForm] = useState({
    code: "",
    medicationName: "",
    totalBoxes: "",
    processedBoxes: "",
    receivedDate: null as Date | null,
    expectedCompletionDate: null as Date | null,
    status: "pending" as BatchStatusType
  });

  const { mutateAsync, isPending } = useUpdateBatch();

  // Initialize form with batch data
  useEffect(() => {
    if (batch) {
      setForm({
        code: batch.code || "",
        medicationName: batch.medicationName || "",
        totalBoxes: String(batch.totalBoxes || 0),
        processedBoxes: String(batch.processedBoxes || 0),
        receivedDate: batch.receivedDate ? new Date(batch.receivedDate) : null,
        expectedCompletionDate: batch.expectedCompletionDate ? new Date(batch.expectedCompletionDate) : null,
        status: batch.status || "pending"
      });
    }
  }, [batch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleStatusChange = (value: BatchStatusType) => {
    setForm({ ...form, status: value });
  };

  const handleDateChange = (field: 'receivedDate' | 'expectedCompletionDate', date: Date | null) => {
    setForm({ ...form, [field]: date });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await mutateAsync({
        id: batch.id,
        code: form.code,
        medicationName: form.medicationName,
        totalBoxes: Number(form.totalBoxes),
        processedBoxes: Number(form.processedBoxes),
        receivedDate: form.receivedDate ? format(form.receivedDate, 'yyyy-MM-dd') : '',
        expectedCompletionDate: form.expectedCompletionDate ? format(form.expectedCompletionDate, 'yyyy-MM-dd') : '',
        status: form.status
      });
      
      toast({ description: "Lot mis à jour avec succès !" });
      onClose();
    } catch (err: any) {
      toast({ 
        description: "Erreur lors de la mise à jour du lot : " + err.message,
        variant: "destructive" 
      });
    }
  };

  return (
    <Modal open={open} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Modifier le lot</ModalTitle>
          <ModalDescription>
            Modifier les informations du lot {batch?.code}
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
              <Label htmlFor="processedBoxes">Boîtes traitées</Label>
              <Input id="processedBoxes" name="processedBoxes" type="number" placeholder="Boîtes traitées" required min={0} max={form.totalBoxes} value={form.processedBoxes} onChange={handleChange} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="receivedDate">Date de réception</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="receivedDate"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.receivedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.receivedDate ? format(form.receivedDate, 'dd/MM/yyyy') : <span>Sélectionner une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.receivedDate || undefined}
                    onSelect={(date) => handleDateChange('receivedDate', date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expectedCompletionDate">Date de fin prévue</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="expectedCompletionDate"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.expectedCompletionDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.expectedCompletionDate ? format(form.expectedCompletionDate, 'dd/MM/yyyy') : <span>Sélectionner une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.expectedCompletionDate || undefined}
                    onSelect={(date) => handleDateChange('expectedCompletionDate', date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select 
                onValueChange={(value: BatchStatusType) => handleStatusChange(value)} 
                defaultValue={form.status}
                value={form.status}
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
            <Button type="submit" disabled={isPending}>Enregistrer</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
