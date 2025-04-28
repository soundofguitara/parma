
import React, { useState } from "react";
import { useAddOperator } from "@/hooks/useOperators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog as Modal, DialogContent as ModalContent, DialogHeader as ModalHeader, DialogFooter as ModalFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface AddOperatorModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddOperatorModal({ open, onClose }: AddOperatorModalProps) {
  const [name, setName] = useState("");
  const { mutateAsync, isPending } = useAddOperator();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mutateAsync({ name });
      toast({ description: "Opérateur ajouté avec succès !" });
      onClose();
      setName("");
    } catch (err: any) {
      toast({ description: "Erreur lors de l'ajout : " + err.message, variant: "destructive" });
    }
  };

  return (
    <Modal open={open} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader>Ajouter un opérateur</ModalHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-2">
            <Input 
              placeholder="Nom" 
              required 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
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
