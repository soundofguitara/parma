import React, { useState } from 'react';
import { useMonthlyAnomalyStats, exportAnomaliesExcel, exportAnomaliesPDF } from '@/hooks/useAnomalies';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, subMonths, addMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, FileText, FileSpreadsheet, BarChart2, PieChart } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Composant pour afficher un graphique simple en barres horizontales
const SimpleBarChart = ({ data, title, colorClass = 'bg-pharma-accent-blue' }: { data: Record<string, number>, title: string, colorClass?: string }) => {
  if (!data || Object.keys(data).length === 0) {
    return <div className="text-center text-pharma-text-light">Aucune donnée disponible</div>;
  }

  // Trouver la valeur maximale pour calculer les pourcentages
  const maxValue = Math.max(...Object.values(data));

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-white">{title}</h3>
      <div className="space-y-2">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-pharma-text-light">{key}</span>
              <span className="text-white">{value}</span>
            </div>
            <div className="h-2 bg-pharma-blue-dark rounded-full overflow-hidden">
              <div
                className={`h-full ${colorClass} rounded-full`}
                style={{ width: `${(value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MonthlyAnomalyStats = () => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const { data: statsData, isLoading } = useMonthlyAnomalyStats(currentMonth);

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    const nextMonth = addMonths(currentMonth, 1);
    if (nextMonth <= new Date()) {
      setCurrentMonth(nextMonth);
    }
  };

  const handleExportExcel = async () => {
    try {
      if (!statsData?.anomalies || statsData.anomalies.length === 0) {
        toast({ description: "Aucune anomalie à exporter", variant: "destructive" });
        return;
      }

      await exportAnomaliesExcel(statsData.anomalies, statsData.period);
      toast({ description: "Export Excel réussi" });
    } catch (error) {
      toast({ description: "Erreur lors de l'export Excel", variant: "destructive" });
    }
  };

  const handleExportPDF = async () => {
    try {
      if (!statsData?.anomalies || statsData.anomalies.length === 0) {
        toast({ description: "Aucune anomalie à exporter", variant: "destructive" });
        return;
      }

      await exportAnomaliesPDF(statsData.anomalies, statsData.period);
      toast({ description: "Export PDF réussi" });
    } catch (error) {
      toast({ description: "Erreur lors de l'export PDF", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-pharma-blue-dark border-pharma-blue-dark">
        <CardContent className="pt-6">
          <div className="text-center text-white">Chargement des statistiques...</div>
        </CardContent>
      </Card>
    );
  }

  const stats = statsData?.stats;
  const period = statsData?.period;

  if (!stats) {
    return (
      <Card className="bg-pharma-blue-dark border-pharma-blue-dark">
        <CardContent className="pt-6">
          <div className="text-center text-white">Aucune statistique disponible</div>
        </CardContent>
      </Card>
    );
  }

  // Formater les données pour l'affichage
  const formattedTypeData: Record<string, number> = {};
  Object.entries(stats.byType).forEach(([key, value]) => {
    switch (key) {
      case 'damaged_box':
        formattedTypeData['Boîte abîmée'] = value;
        break;
      case 'empty_case':
        formattedTypeData['Étuis vides'] = value;
        break;
      case 'missing_from_original':
        formattedTypeData['Manque dans colis'] = value;
        break;
      case 'other':
        formattedTypeData['Autre anomalie'] = value;
        break;
      default:
        formattedTypeData[key] = value;
    }
  });



  const formattedStatusData: Record<string, number> = {};
  Object.entries(stats.byStatus).forEach(([key, value]) => {
    switch (key) {
      case 'pending':
        formattedStatusData['En attente'] = value;
        break;
      case 'in-progress':
        formattedStatusData['En cours'] = value;
        break;
      case 'resolved':
        formattedStatusData['Résolue'] = value;
        break;
      default:
        formattedStatusData[key] = value;
    }
  });

  return (
    <Card className="bg-pharma-blue-dark border-pharma-blue-dark">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white text-lg">Statistiques des anomalies</CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousMonth}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-white font-medium">
            {period?.label || format(currentMonth, 'MMMM yyyy', { locale: fr })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
            className="h-8 w-8 p-0"
            disabled={addMonths(currentMonth, 1) > new Date()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-pharma-blue-light border-pharma-blue-dark text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total des anomalies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAnomalies}</div>
            </CardContent>
          </Card>

          <Card className="bg-pharma-blue-light border-pharma-blue-dark text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Quantité affectée</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalQuantityAffected}</div>
            </CardContent>
          </Card>

          <Card className="bg-pharma-blue-light border-pharma-blue-dark text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Anomalies résolues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.byStatus.resolved || 0}
                <span className="text-sm text-pharma-text-light ml-2">
                  ({Math.round(((stats.byStatus.resolved || 0) / stats.totalAnomalies) * 100) || 0}%)
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-pharma-blue-light border-pharma-blue-dark text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Anomalies en attente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.byStatus.pending || 0}
                <span className="text-sm text-pharma-text-light ml-2">
                  ({Math.round(((stats.byStatus.pending || 0) / stats.totalAnomalies) * 100) || 0}%)
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="types" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="types">Types d'anomalies</TabsTrigger>
            <TabsTrigger value="operators">Par opérateur</TabsTrigger>
          </TabsList>

          <TabsContent value="types" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SimpleBarChart
                data={formattedTypeData}
                title="Répartition par type d'anomalie"
                colorClass="bg-pharma-accent-blue"
              />
              <div className="flex items-center justify-center">
                <BarChart2 className="h-32 w-32 text-pharma-accent-blue opacity-20" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="operators" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SimpleBarChart
                data={stats.byOperator}
                title="Anomalies par opérateur"
                colorClass="bg-pharma-accent-green"
              />
              <div className="flex items-center justify-center">
                <PieChart className="h-32 w-32 text-pharma-accent-green opacity-20" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="status" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SimpleBarChart
                data={formattedStatusData}
                title="Répartition par statut"
                colorClass="bg-pharma-accent-blue"
              />
              <div className="flex items-center justify-center">
                <PieChart className="h-32 w-32 text-pharma-accent-blue opacity-20" />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            disabled={stats.totalAnomalies === 0}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export Excel</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            disabled={stats.totalAnomalies === 0}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            <span>Export PDF</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyAnomalyStats;
