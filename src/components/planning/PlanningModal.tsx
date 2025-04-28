
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlanningForm } from "./PlanningForm";

interface PlanningModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  form: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  batches: any[];
  isEditing: boolean;
  isSubmitting?: boolean;
}

export const PlanningModal = ({
  open,
  onClose,
  onSubmit,
  form,
  handleChange,
  batches,
  isEditing,
  isSubmitting = false
}: PlanningModalProps) => {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen && !isSubmitting) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier la planification" : "Nouvelle planification"}
          </DialogTitle>
        </DialogHeader>
        <PlanningForm
          onSubmit={onSubmit}
          form={form}
          handleChange={handleChange}
          batches={batches}
          onCancel={onClose}
          isEditing={isEditing}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};
