
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useOperators } from '@/hooks/useOperators';
import { useAssignments } from '@/hooks/useAssignments';
import { Calendar, Clock, Download, TrendingUp, Users } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import TrendLine from '@/components/dashboard/TrendLine';

const Performance = () => {
  const { data: operators = [] } = useOperators();
  const { data: assignments = [] } = useAssignments();
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  
  // Calcul des statistiques de performance
  const totalBoxesProcessed = assignments.reduce((sum, a) => sum + (a.processed_boxes || 0), 0);
  const totalTimeSpentMinutes = assignments.reduce((sum, a) => {
    if (!a.start_time) return sum;
    const start = new Date(a.start_time);
    const end = a.end_time ? new Date(a.end_time) : new Date();
    return sum + (end.getTime() - start.getTime()) / (1000 * 60);
  }, 0);
  
  const avgBoxesPerHour = totalTimeSpentMinutes > 0 
    ? Math.round((totalBoxesProcessed / totalTimeSpentMinutes) * 60)
    : 0;
  
  const topOperator = [...operators].sort((a, b) => b.efficiency - a.efficiency)[0];
    
  // Données pour les graphiques
  const efficiencyData = operators.map(op => ({
    name: op.name.split(' ')[0],
    efficiency: op.efficiency,
    fill: `hsl(${120 + Math.random() * 80}, 70%, 60%)`,
  }));

  // Données de tendance sur la période
  const trendData = [
    { date: '01/04', boxes: 480 },
    { date: '02/04', boxes: 502 },
    { date: '03/04', boxes: 510 },
    { date: '04/04', boxes: 498 },
    { date: '05/04', boxes: 520 },
    { date: '08/04', boxes: 530 },
    { date: '09/04', boxes: 510 },
    { date: '10/04', boxes: 540 },
    { date: '11/04', boxes: 550 },
    { date: '12/04', boxes: 560 },
    { date: '15/04', boxes: 570 },
    { date: '16/04', boxes: 585 },
    { date: '17/04', boxes: 590 },
    { date: '18/04', boxes: 600 },
    { date: '19/04', boxes: 610 },
  ];
  
  // Données de répartition des lots par opérateur
  const operatorBoxShare = operators.map(op => ({
    name: op.name.split(' ')[0],
    value: op.totalBoxesProcessed,
    fill: `hsl(${200 + Math.random() * 150}, 70%, 50%)`
  }));
  
  // Données d'efficicacité par jour de la semaine
  const weekdayEfficiency = [
    { day: 'Lun', value: 93 },
    { day: 'Mar', value: 95 },
    { day: 'Mer', value: 90 },
    { day: 'Jeu', value: 92 },
    { day: 'Ven', value: 88 },
  ];

  const handleExportData = () => {
    toast({
      title: "Export des données",
      description: "Les données de performance ont été exportées avec succès.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Performance des opérateurs</h1>
        <div className="flex gap-2">
          <Button 
            variant={view === 'daily' ? 'default' : 'outline'} 
            onClick={() => setView('daily')}
            className={view !== 'daily' ? "text-pharma-text-light" : ""}
          >
            Jour
          </Button>
          <Button 
            variant={view === 'weekly' ? 'default' : 'outline'} 
            onClick={() => setView('weekly')}
            className={view !== 'weekly' ? "text-pharma-text-light" : ""}
          >
            Semaine
          </Button>
          <Button 
            variant={view === 'monthly' ? 'default' : 'outline'} 
            onClick={() => setView('monthly')}
            className={view !== 'monthly' ? "text-pharma-text-light" : ""}
          >
            Mois
          </Button>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Boîtes traitées" 
          value={totalBoxesProcessed.toLocaleString()} 
          icon={<Users size={20} />}
          trend={{ value: 12, isPositive: true, label: "vs. période précédente" }}
        />
        
        <StatCard 
          title="Vitesse moyenne" 
          value={`${avgBoxesPerHour} boîtes/h`} 
          icon={<TrendingUp size={20} />}
          trend={{ value: 5, isPositive: true }}
        />
        
        <StatCard 
          title="Opérateur top" 
          value={topOperator ? topOperator.name : 'N/A'} 
          secondaryValue={topOperator ? `${topOperator.efficiency}% efficacité` : ''}
          icon={<Users size={20} />}
        />
        
        <StatCard 
          title="Temps total" 
          value={`${Math.round(totalTimeSpentMinutes / 60)}h`}
          icon={<Clock size={20} />}
          chart={<TrendLine data={[{ value: 90 }, { value: 85 }, { value: 90 }, { value: 92 }, { value: 95 }]} color="#0EA5E9" />}
        />
      </div>

      {/* Graphiques de performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique de tendance */}
        <div className="bg-pharma-blue-light rounded-lg p-4">
          <h3 className="text-white text-lg font-medium mb-4">Tendance de productivité</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#94A3B8' }}
                  axisLine={{ stroke: '#2A3042' }}
                />
                <YAxis 
                  tick={{ fill: '#94A3B8' }}
                  axisLine={{ stroke: '#2A3042' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1F2C',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                  }}
                  formatter={(value: any) => [`${value} boîtes`]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="boxes" 
                  stroke="#22C55E" 
                  strokeWidth={2}
                  dot={{ fill: '#22C55E', r: 4 }}
                  activeDot={{ r: 6, fill: '#22C55E' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graphique de répartition par opérateur */}
        <div className="bg-pharma-blue-light rounded-lg p-4">
          <h3 className="text-white text-lg font-medium mb-4">Répartition des boîtes par opérateur</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={operatorBoxShare}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {operatorBoxShare.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1A1F2C',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                  }}
                  formatter={(value: any) => [`${value.toLocaleString()} boîtes`]}
                  labelFormatter={(label) => `Opérateur: ${label}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Graphiques de performance secondaires */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Efficacité par opérateur */}
        <div className="bg-pharma-blue-light rounded-lg p-4">
          <h3 className="text-white text-lg font-medium mb-4">Efficacité par opérateur</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={efficiencyData}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#94A3B8' }}
                  axisLine={{ stroke: '#2A3042' }}
                />
                <YAxis 
                  tick={{ fill: '#94A3B8' }}
                  axisLine={{ stroke: '#2A3042' }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1F2C',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                  }}
                  formatter={(value: any) => [`${value}%`]}
                  labelFormatter={(label) => `Opérateur: ${label}`}
                />
                <Bar dataKey="efficiency" radius={[4, 4, 0, 0]}>
                  {efficiencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Efficacité par jour */}
        <div className="bg-pharma-blue-light rounded-lg p-4">
          <h3 className="text-white text-lg font-medium mb-4">Efficacité par jour</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekdayEfficiency}>
                <XAxis 
                  dataKey="day" 
                  tick={{ fill: '#94A3B8' }}
                  axisLine={{ stroke: '#2A3042' }}
                />
                <YAxis 
                  tick={{ fill: '#94A3B8' }}
                  axisLine={{ stroke: '#2A3042' }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1F2C',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                  }}
                  formatter={(value: any) => [`${value}%`]}
                  labelFormatter={(label) => `Jour: ${label}`}
                />
                <Bar dataKey="value" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bouton d'exportation */}
      <div className="flex justify-end">
        <Button onClick={handleExportData} className="flex items-center gap-2">
          <Download size={16} />
          Exporter les données
        </Button>
      </div>
    </div>
  );
};

export default Performance;
