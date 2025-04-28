
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Performance } from '@/types';

interface PerformanceChartProps {
  data: Performance[];
}

const PerformanceChart = ({ data }: PerformanceChartProps) => {
  const chartData = data.map(item => ({
    name: item.operatorName ? item.operatorName.split(' ')[0] : 'Inconnu', // Add null check and fallback
    speed: item.averageSpeed || 0,
    efficiency: item.efficiency || 0,
  }));

  return (
    <div className="bg-pharma-blue-light rounded-lg p-4">
      <h3 className="text-white text-lg font-medium mb-4">Performance des opérateurs</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <XAxis 
              dataKey="name" 
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
            />
            <Bar 
              name="Vitesse (boîtes/h)" 
              dataKey="speed" 
              fill="#0EA5E9" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              name="Efficacité (%)" 
              dataKey="efficiency" 
              fill="#22C55E" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceChart;
