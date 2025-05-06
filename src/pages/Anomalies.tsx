import React, { useState } from 'react';
import { useAnomalies, useUpdateAnomalyStatus, useMonthlyAnomalyStats, exportAnomaliesExcel, exportAnomaliesPDF } from '@/hooks/useAnomalies';
import { useBatches } from '@/hooks/useBatches';
import { useOperators } from '@/hooks/useOperators';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Package,
  User,
  Calendar,
  FileText,
  AlertCircle,
  Plus,
  FileSpreadsheet,
  Download,
  Eye,
  Edit
} from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Anomaly, AnomalyStatus } from '@/types';
import MonthlyAnomalyStats from '@/components/anomalies/MonthlyAnomalyStats';
import AnomalyModal from '@/components/anomalies/AnomalyModal';
import AnomalyDetails from '@/components/anomalies/AnomalyDetails';
import EditAnomalyModal from '@/components/anomalies/EditAnomalyModal';

const Anomalies = () => {
  const [statusFilter, setStatusFilter] = useState<AnomalyStatus | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
  const [activeTab, setActiveTab] = useState('list');
  const [anomalyModalOpen, setAnomalyModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Période actuelle (mois en cours)
  const currentPeriod = {
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  };

  const { data: anomalies = [], isLoading } = useAnomalies(undefined, statusFilter);
  const { mutateAsync: updateAnomalyStatus, isPending: isUpdating } = useUpdateAnomalyStatus();
  const { data: batches = [] } = useBatches();
  const { data: operators = [] } = useOperators();

  // Filtrer les anomalies en fonction du terme de recherche
  const filteredAnomalies = anomalies.filter((anomaly: any) => {
    const searchString = searchTerm.toLowerCase();
    return (
      (anomaly.batches?.code || '').toLowerCase().includes(searchString) ||
      (anomaly.batches?.medication_name || '').toLowerCase().includes(searchString) ||
      (anomaly.operators?.name || '').toLowerCase().includes(searchString) ||
      (anomaly.type || '').toLowerCase().includes(searchString) ||
      (anomaly.deviation_number || '').toLowerCase().includes(searchString) ||
      (anomaly.description || '').toLowerCase().includes(searchString)
    );
  });

  // Fonction pour obtenir la couleur du badge en fonction du statut
  const getStatusColor = (status: AnomalyStatus) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    }
  };

  // Fonction pour obtenir la couleur du badge en fonction de la sévérité
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'low':
      default:
        return 'bg-green-100 text-green-800 hover:bg-green-200';
    }
  };

  // Fonction pour obtenir le texte du statut
  const getStatusText = (status: AnomalyStatus) => {
    switch (status) {
      case 'resolved':
        return 'Résolue';
      case 'in-progress':
        return 'En cours';
      case 'pending':
      default:
        return 'En attente';
    }
  };

  // Fonction pour obtenir le texte de la sévérité
  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'Critique';
      case 'high':
        return 'Élevée';
      case 'medium':
        return 'Moyenne';
      case 'low':
      default:
        return 'Faible';
    }
  };

  // Fonction pour obtenir le texte du type d'anomalie
  const getAnomalyTypeText = (type: string) => {
    switch (type) {
      case 'damaged_box':
        return 'Boîte abîmée';
      case 'empty_case':
        return 'Étuis vides';
      case 'missing_from_original':
        return 'Manque dans un colis d\'origine';
      case 'other':
      default:
        return 'Autre anomalie';
    }
  };



  // Fonction pour ouvrir le modal de détails d'une anomalie
  const openDetailsModal = (anomaly: Anomaly) => {
    setSelectedAnomaly(anomaly);
    setDetailsModalOpen(true);
  };

  // Fonction pour ouvrir le modal d'édition d'une anomalie
  const openEditModal = (anomaly: Anomaly) => {
    setSelectedAnomaly(anomaly);
    setEditModalOpen(true);
    setDetailsModalOpen(false); // Fermer le modal de détails s'il est ouvert
  };

  // Fonction pour ouvrir le modal d'ajout d'anomalie
  const openAnomalyModal = () => {
    setAnomalyModalOpen(true);
  };

  // Fonction pour exporter toutes les anomalies en Excel
  const handleExportAllExcel = async () => {
    try {
      if (anomalies.length === 0) {
        toast({ description: "Aucune anomalie à exporter", variant: "destructive" });
        return;
      }

      await exportAnomaliesExcel(anomalies);
      toast({ description: "Export Excel réussi" });
    } catch (error) {
      toast({ description: "Erreur lors de l'export Excel", variant: "destructive" });
    }
  };

  // Fonction pour exporter toutes les anomalies en PDF
  const handleExportAllPDF = async () => {
    try {
      if (anomalies.length === 0) {
        toast({ description: "Aucune anomalie à exporter", variant: "destructive" });
        return;
      }

      await exportAnomaliesPDF(anomalies);
      toast({ description: "Export PDF réussi" });
    } catch (error) {
      toast({ description: "Erreur lors de l'export PDF", variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Suivi des anomalies</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportAllExcel}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span className="hidden md:inline">Export Excel</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportAllPDF}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden md:inline">Export PDF</span>
          </Button>
          <Button
            onClick={openAnomalyModal}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nouvelle anomalie</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="list">Liste des anomalies</TabsTrigger>
          <TabsTrigger value="stats">Statistiques mensuelles</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-0">
          {/* Filtres et recherche */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Rechercher par lot, médicament, opérateur, type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-pharma-blue-dark border-pharma-blue-dark text-white"
              />
            </div>
            <div className="w-full md:w-64">
              <Select
                value={statusFilter || 'all'}
                onValueChange={(value) => setStatusFilter(value === 'all' ? undefined : value as AnomalyStatus)}
              >
                <SelectTrigger className="bg-pharma-blue-dark border-pharma-blue-dark text-white">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="in-progress">En cours</SelectItem>
                  <SelectItem value="resolved">Résolues</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-pharma-blue-dark border-pharma-blue-dark text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total des anomalies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{anomalies.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-pharma-blue-dark border-pharma-blue-dark text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {anomalies.filter((a: any) => a.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-pharma-blue-dark border-pharma-blue-dark text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {anomalies.filter((a: any) => a.status === 'in-progress').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-pharma-blue-dark border-pharma-blue-dark text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Résolues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {anomalies.filter((a: any) => a.status === 'resolved').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des anomalies */}
      {isLoading ? (
        <div className="text-center py-8 text-white">Chargement des anomalies...</div>
      ) : filteredAnomalies.length === 0 ? (
        <div className="text-center py-8 text-white">
          Aucune anomalie trouvée
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnomalies.map((anomaly: any) => (
            <div key={anomaly.id} className="relative group">
              {/* Indicateur visuel de statut */}
              <div
                className={`absolute top-0 left-0 w-1.5 h-full ${
                  anomaly.status === 'pending' ? 'bg-yellow-500' :
                  anomaly.status === 'in-progress' ? 'bg-blue-500' :
                  'bg-green-500'
                } rounded-l-lg`}
              />

              <Card className="bg-pharma-blue-dark border-2 border-pharma-blue-light/30 text-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 hover:border-pharma-blue-light/50 pl-2">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        {anomaly.batches?.code || 'Lot inconnu'}
                      </CardTitle>
                      <CardDescription className="text-pharma-text-light">
                        {anomaly.batches?.medication_name || 'Médicament inconnu'}
                      </CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(anomaly.status)} shadow-sm`}>
                      {getStatusText(anomaly.status)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Section Type d'anomalie */}
                  <div className="bg-pharma-blue-light/10 p-2 rounded-md">
                    <div className="flex items-center text-sm text-white">
                      <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                      <span className="font-medium">{getAnomalyTypeText(anomaly.type)}</span>
                    </div>
                  </div>

                  {/* Section Quantités */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-pharma-blue-light/10 p-2 rounded-md">
                      <div className="text-xs text-pharma-text-light mb-1">Quantité affectée</div>
                      <div className="flex items-center text-sm text-white">
                        <Package className="h-4 w-4 mr-2 text-pharma-accent-blue" />
                        <span className="font-medium">{anomaly.quantity}</span>
                      </div>
                    </div>

                    <div className="bg-pharma-blue-light/10 p-2 rounded-md">
                      <div className="text-xs text-pharma-text-light mb-1">Quantité restante</div>
                      <div className="flex items-center text-sm text-white">
                        <Package className="h-4 w-4 mr-2 text-pharma-accent-blue" />
                        <span className="font-medium">{anomaly.remaining_quantity || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Informations complémentaires */}
                  <div className="space-y-2">
                    {anomaly.deviation_number && (
                      <div className="flex items-center text-sm text-pharma-text-light">
                        <FileText className="h-4 w-4 mr-2" />
                        <span>Déviation: {anomaly.deviation_number}</span>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-pharma-text-light">
                      <User className="h-4 w-4 mr-2" />
                      <span>Opérateur: {anomaly.operators?.name || 'Inconnu'}</span>
                    </div>

                    <div className="flex items-center text-sm text-pharma-text-light">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Détectée le: {format(parseISO(anomaly.detection_date), 'dd/MM/yyyy')}</span>
                    </div>
                  </div>

                  {/* Checklist résumée */}
                  <div className="bg-pharma-blue-light/10 p-2 rounded-md">
                    <div className="text-xs text-pharma-text-light mb-1">Actions effectuées</div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div className={`flex items-center ${anomaly.sap_declared ? 'text-green-400' : 'text-pharma-text-light'}`}>
                        {anomaly.sap_declared ? '✓' : '✗'} SAP
                      </div>
                      <div className={`flex items-center ${anomaly.deviation_created ? 'text-green-400' : 'text-pharma-text-light'}`}>
                        {anomaly.deviation_created ? '✓' : '✗'} Déviation
                      </div>
                      <div className={`flex items-center ${anomaly.moved_to_hold ? 'text-green-400' : 'text-pharma-text-light'}`}>
                        {anomaly.moved_to_hold ? '✓' : '✗'} Zone HOLD
                      </div>
                      <div className={`flex items-center ${anomaly.pf_manager_informed ? 'text-green-400' : 'text-pharma-text-light'}`}>
                        {anomaly.pf_manager_informed ? '✓' : '✗'} PF informé
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-0 flex justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDetailsModal(anomaly)}
                    className="flex items-center gap-1 hover:bg-pharma-blue-light/20"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Détails</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(anomaly)}
                    className="flex items-center gap-1 border-pharma-blue-light/50 hover:bg-pharma-blue-light/20"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Modifier</span>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Modal de détails d'anomalie */}
      {selectedAnomaly && (
        <AnomalyDetails
          anomaly={selectedAnomaly}
          open={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          onEdit={() => openEditModal(selectedAnomaly)}
        />
      )}

      {/* Modal d'édition d'anomalie */}
      {selectedAnomaly && (
        <EditAnomalyModal
          anomaly={selectedAnomaly}
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
        />
      )}
        </TabsContent>

        <TabsContent value="stats" className="mt-0">
          <MonthlyAnomalyStats />
        </TabsContent>
      </Tabs>

      {/* Modal pour ajouter une nouvelle anomalie */}
      <AnomalyModal
        open={anomalyModalOpen}
        onClose={() => setAnomalyModalOpen(false)}
      />
    </div>
  );
};

export default Anomalies;
