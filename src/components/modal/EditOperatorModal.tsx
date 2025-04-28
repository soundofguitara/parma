
import React from "react";
import { useUpdateOperator, useDeleteOperator } from "@/hooks/useOperators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog as Modal, DialogContent as ModalContent, DialogHeader as ModalHeader, DialogFooter as ModalFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

interface EditOperatorModalProps {
  open: boolean;
  onClose: () => void;
  operator: {
    id: string;
    name: string;
  };
}

export default function EditOperatorModal({ open, onClose, operator }: EditOperatorModalProps) {
  const [name, setName] = React.useState(operator.name);
  const { mutateAsync: updateOperator, isPending: isUpdating } = useUpdateOperator();
  const { mutateAsync: deleteOperator, isPending: isDeleting } = useDeleteOperator();

  React.useEffect(() => {
    setName(operator.name);
  }, [operator]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateOperator({
        id: operator.id,
        name: name
      });
      toast({ description: "Opérateur modifié avec succès !" });
      onClose();
    } catch (err: any) {
      toast({ description: "Erreur lors de la modification : " + err.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteOperator(operator.id);
      toast({ description: "Opérateur supprimé avec succès !" });
      onClose();
    } catch (err: any) {
      toast({ description: "Erreur lors de la suppression : " + err.message, variant: "destructive" });
    }
  };

  return (
    <Modal open={open} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader>Modifier l'opérateur</ModalHeader>
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" disabled={isDeleting}>
                  Supprimer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. Cela supprimera définitivement l'opérateur
                    et toutes ses affectations.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Supprimer</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isUpdating}>
              Sauvegarder
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
