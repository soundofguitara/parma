import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUpdateAnomalyStatus } from '@/hooks/useAnomalies';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Anomaly, AnomalyStatus, AnomalyType } from '@/types';

interface EditAnomalyModalProps {
  open: boolean;
  onClose: () => void;
  anomaly: Anomaly;
}

const EditAnomalyModal = ({ open, onClose, anomaly }: EditAnomalyModalProps) => {
  const [formData, setFormData] = useState({
    type: anomaly.type,
    quantity: anomaly.quantity,
    description: anomaly.description || '',
    deviation_number: anomaly.deviation_number || '',
    status: anomaly.status,
    resolution_notes: anomaly.resolution_notes || '',
    remaining_quantity: anomaly.remaining_quantity || 0,
    sap_declared: anomaly.sap_declared,
    deviation_created: anomaly.deviation_created,
    moved_to_hold: anomaly.moved_to_hold,
    pf_manager_informed: anomaly.pf_manager_informed,
    qa_informed: anomaly.qa_informed,
  });

  const { mutateAsync: updateAnomaly, isPending } = useUpdateAnomalyStatus();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateAnomaly({
        id: anomaly.id,
        status: formData.status as AnomalyStatus,
        resolution_notes: formData.resolution_notes,
        checklist: {
          sap_declared: formData.sap_declared,
          deviation_created: formData.deviation_created,
          moved_to_hold: formData.moved_to_hold,
          pf_manager_informed: formData.pf_manager_informed,
          qa_informed: formData.qa_informed,
          deviation_number: formData.deviation_number,
        },
        type: formData.type as AnomalyType,
        quantity: formData.quantity,
        description: formData.description,
        remaining_quantity: formData.remaining_quantity,
      });
      
      toast({ description: "Anomalie mise à jour avec succès" });
      onClose();
    } catch (err: any) {
      toast({
        variant: "destructive",
        description: `Erreur: ${err.message}`
      });
    }
  };

  const anomalyTypes = [
    { value: 'damaged_box', label: 'Boîte abîmée' },
    { value: 'empty_case', label: 'Étuis vides' },
    { value: 'missing_from_original', label: 'Manque dans un colis d\'origine' },
    { value: 'other', label: 'Autre anomalie' }
  ];

  const statusOptions = [
    { value: 'pending', label: 'En attente' },
    { value: 'in-progress', label: 'En cours' },
    { value: 'resolved', label: 'Résolue' }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-pharma-blue-dark border-pharma-blue-dark text-white">
        <DialogHeader>
          <DialogTitle>Modifier l'anomalie</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colonne 1 */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type d'anomalie</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange('type', value)}
                >
                  <SelectTrigger className="bg-pharma-blue-dark border-pharma-blue-dark text-white">
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {anomalyTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Description détaillée de l'anomalie"
                  className="bg-pharma-blue-dark border-pharma-blue-dark text-white resize-none"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantité affectée</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min={1}
                    value={formData.quantity}
                    onChange={handleNumberChange}
                    className="bg-pharma-blue-dark border-pharma-blue-dark text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="remaining_quantity">Quantité restante</Label>
                  <Input
                    id="remaining_quantity"
                    name="remaining_quantity"
                    type="number"
                    min={0}
                    value={formData.remaining_quantity}
                    onChange={handleNumberChange}
                    className="bg-pharma-blue-dark border-pharma-blue-dark text-white"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger className="bg-pharma-blue-dark border-pharma-blue-dark text-white">
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {formData.status === 'resolved' && (
                <div className="space-y-2">
                  <Label htmlFor="resolution_notes">Notes de résolution</Label>
                  <Textarea
                    id="resolution_notes"
                    name="resolution_notes"
                    value={formData.resolution_notes}
                    onChange={handleChange}
                    placeholder="Notes sur la résolution de l'anomalie"
                    className="bg-pharma-blue-dark border-pharma-blue-dark text-white resize-none"
                    rows={3}
                  />
                </div>
              )}
            </div>
            
            {/* Colonne 2 - Checklist */}
            <div className="space-y-4">
              <div className="bg-pharma-blue-dark/50 border border-pharma-blue-dark rounded-md p-4">
                <h3 className="text-white font-medium mb-3">Actions effectuées</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sap_declared"
                      checked={formData.sap_declared}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange('sap_declared', checked as boolean)
                      }
                    />
                    <Label htmlFor="sap_declared" className="cursor-pointer">
                      Déclaration dans SAP de la quantité affectée
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="deviation_created"
                      checked={formData.deviation_created}
                      onCheckedChange={(checked) => {
                        handleCheckboxChange('deviation_created', checked as boolean);
                        if (!checked) {
                          setFormData(prev => ({ ...prev, deviation_number: '' }));
                        }
                      }}
                    />
                    <Label htmlFor="deviation_created" className="cursor-pointer">
                      Déclaration d'une déviation
                    </Label>
                  </div>
                  
                  {formData.deviation_created && (
                    <div className="ml-6 space-y-2">
                      <Label htmlFor="deviation_number">N° de la déviation</Label>
                      <Input
                        id="deviation_number"
                        name="deviation_number"
                        value={formData.deviation_number}
                        onChange={handleChange}
                        placeholder="Ex: DEV-2025-001"
                        className="bg-pharma-blue-dark border-pharma-blue-dark text-white"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="moved_to_hold"
                      checked={formData.moved_to_hold}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange('moved_to_hold', checked as boolean)
                      }
                    />
                    <Label htmlFor="moved_to_hold" className="cursor-pointer">
                      Écarté dans la zone HOLD
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pf_manager_informed"
                      checked={formData.pf_manager_informed}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange('pf_manager_informed', checked as boolean)
                      }
                    />
                    <Label htmlFor="pf_manager_informed" className="cursor-pointer">
                      Responsable PF informé
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="qa_informed"
                      checked={formData.qa_informed}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange('qa_informed', checked as boolean)
                      }
                    />
                    <Label htmlFor="qa_informed" className="cursor-pointer">
                      AQ informé
                    </Label>
                  </div>
                </div>
              </div>
              
              <div className="bg-pharma-blue-dark/50 border border-pharma-blue-dark rounded-md p-4">
                <h3 className="text-white font-medium mb-2">Informations sur les quantités</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-pharma-text-light">Quantité affectée:</span>
                    <span className="text-white font-medium">{formData.quantity}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-pharma-text-light">Quantité restante:</span>
                    <span className="text-white font-medium">{formData.remaining_quantity}</span>
                  </div>
                  
                  <Separator className="my-1" />
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-pharma-text-light">Quantité finale:</span>
                    <span className="text-white font-medium">
                      {formData.quantity + formData.remaining_quantity}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAnomalyModal;
