import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  AlertTriangle,
  Package,
  User,
  Calendar,
  FileText,
  CheckSquare,
  XSquare,
  Edit,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Anomaly } from '@/types';

interface AnomalyDetailsProps {
  anomaly: Anomaly & {
    batches?: {
      code: string;
      medication_name: string;
    };
    operators?: {
      name: string;
    };
  };
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
}

const AnomalyDetails = ({ anomaly, open, onClose, onEdit }: AnomalyDetailsProps) => {
  // Fonction pour obtenir le texte du type d'anomalie
  const getAnomalyTypeText = (type: string): string => {
    switch (type) {
      case 'damaged_box': return 'Boîte abîmée';
      case 'empty_case': return 'Étuis vides';
      case 'missing_from_original': return 'Manque dans un colis d\'origine';
      case 'other': default: return 'Autre anomalie';
    }
  };

  // Fonction pour obtenir le texte du statut
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'in-progress': return 'En cours';
      case 'resolved': return 'Résolue';
      default: return status;
    }
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'in-progress': return 'bg-blue-500';
      case 'resolved': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string): string => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy HH:mm', { locale: fr });
    } catch (error) {
      return 'Date invalide';
    }
  };

  // Fonction pour afficher un élément de la checklist
  const ChecklistItem = ({ checked, label }: { checked: boolean; label: string }) => (
    <div className="flex items-center space-x-2 text-sm">
      {checked ? (
        <CheckSquare className="h-4 w-4 text-green-500" />
      ) : (
        <XSquare className="h-4 w-4 text-red-500" />
      )}
      <span className={checked ? 'text-white' : 'text-pharma-text-light'}>{label}</span>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-pharma-blue-dark border-pharma-blue-dark text-white">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center justify-between">
            <span>Détails de l'anomalie</span>
            <Badge className={getStatusColor(anomaly.status)}>
              {getStatusText(anomaly.status)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-pharma-text-light text-sm">Lot</h3>
              <p className="text-white text-lg font-semibold">{anomaly.batches?.code || 'Non spécifié'}</p>
              <p className="text-pharma-text-light text-sm">{anomaly.batches?.medication_name || 'Médicament non spécifié'}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-pharma-text-light text-sm">Type d'anomalie</h3>
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
                <span className="text-white">{getAnomalyTypeText(anomaly.type)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Quantités */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-pharma-blue-light/30 p-3 rounded-md">
              <h3 className="text-pharma-text-light text-sm mb-1">Quantité affectée</h3>
              <p className="text-white text-xl font-semibold">{anomaly.quantity}</p>
            </div>
            
            <div className="bg-pharma-blue-light/30 p-3 rounded-md">
              <h3 className="text-pharma-text-light text-sm mb-1">Quantité restante</h3>
              <p className="text-white text-xl font-semibold">{anomaly.remaining_quantity || 'Non spécifié'}</p>
            </div>
            
            <div className="bg-pharma-blue-light/30 p-3 rounded-md">
              <h3 className="text-pharma-text-light text-sm mb-1">Quantité finale</h3>
              <p className="text-white text-xl font-semibold">
                {anomaly.remaining_quantity !== undefined 
                  ? anomaly.quantity + anomaly.remaining_quantity 
                  : 'Non calculée'}
              </p>
            </div>
          </div>

          <Separator />

          {/* Informations complémentaires */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-pharma-text-light text-sm mb-2">Détails</h3>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <User className="h-4 w-4 mr-2 text-pharma-text-light" />
                  <span className="text-pharma-text-light mr-1">Opérateur:</span>
                  <span className="text-white">{anomaly.operators?.name || 'Non spécifié'}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-pharma-text-light" />
                  <span className="text-pharma-text-light mr-1">Détectée le:</span>
                  <span className="text-white">{formatDate(anomaly.detection_date)}</span>
                </div>
                
                {anomaly.deviation_number && (
                  <div className="flex items-center text-sm">
                    <FileText className="h-4 w-4 mr-2 text-pharma-text-light" />
                    <span className="text-pharma-text-light mr-1">N° de déviation:</span>
                    <span className="text-white">{anomaly.deviation_number}</span>
                  </div>
                )}
                
                {anomaly.status === 'resolved' && anomaly.resolution_date && (
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-pharma-text-light" />
                    <span className="text-pharma-text-light mr-1">Résolue le:</span>
                    <span className="text-white">{formatDate(anomaly.resolution_date)}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-pharma-text-light text-sm mb-2">Actions effectuées</h3>
              
              <div className="space-y-2">
                <ChecklistItem 
                  checked={anomaly.sap_declared} 
                  label="Déclaration dans SAP de la quantité affectée" 
                />
                
                <ChecklistItem 
                  checked={anomaly.deviation_created} 
                  label="Déclaration d'une déviation" 
                />
                
                <ChecklistItem 
                  checked={anomaly.moved_to_hold} 
                  label="Écarté dans la zone HOLD" 
                />
                
                <ChecklistItem 
                  checked={anomaly.pf_manager_informed} 
                  label="Responsable PF informé" 
                />
                
                <ChecklistItem 
                  checked={anomaly.qa_informed} 
                  label="AQ informé" 
                />
              </div>
            </div>
          </div>

          {/* Description et notes */}
          <div className="space-y-3">
            {anomaly.description && (
              <div>
                <h3 className="text-pharma-text-light text-sm mb-1">Description</h3>
                <p className="text-white bg-pharma-blue-light/20 p-2 rounded-md">{anomaly.description}</p>
              </div>
            )}
            
            {anomaly.resolution_notes && (
              <div>
                <h3 className="text-pharma-text-light text-sm mb-1">Notes de résolution</h3>
                <p className="text-white bg-pharma-blue-light/20 p-2 rounded-md">{anomaly.resolution_notes}</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <Button onClick={onEdit} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            <span>Modifier</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AnomalyDetails;
