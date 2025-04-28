
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { BatchStatusCount } from '@/types';

interface BatchStatusPieProps {
  data: BatchStatusCount;
}

const BatchStatusPie = ({ data }: BatchStatusPieProps) => {
  const chartData = [
    { name: 'En attente', value: data.pending, color: '#94A3B8' },
    { name: 'En cours', value: data.inProgress, color: '#0EA5E9' },
    { name: 'Terminé', value: data.completed, color: '#22C55E' },
    { name: 'En retard', value: data.delayed, color: '#EF4444' },
  ];

  return (
    <div className="bg-pharma-blue-light rounded-lg p-4">
      <h3 className="text-white text-lg font-medium mb-4">Statut des lots</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1A1F2C',
                border: 'none',
                borderRadius: '8px',
                color: '#F8FAFC',
              }}
            />
            <Legend 
              layout="vertical" 
              verticalAlign="middle" 
              align="right"
              formatter={(value, entry, index) => (
                <span style={{ color: '#F8FAFC' }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BatchStatusPie;
