
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ProgressDonutProps {
  value: number;
  colors?: {
    background: string;
    fill: string;
  };
  size?: 'sm' | 'md' | 'lg';
}

const ProgressDonut = ({ 
  value, 
  colors = { background: '#2A3042', fill: '#0EA5E9' },
  size = 'md'
}: ProgressDonutProps) => {
  const data = [
    { name: 'Progress', value: value },
    { name: 'Remaining', value: 100 - value }
  ];
  
  // Determine size based on prop
  const getSize = () => {
    switch(size) {
      case 'sm': return 80;
      case 'lg': return 160;
      case 'md':
      default: return 120;
    }
  };
  
  const sizeValue = getSize();
  
  return (
    <div className="flex items-center justify-center" style={{ height: sizeValue, width: sizeValue }}>
      <div className="relative w-full h-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={sizeValue * 0.7 / 2}
              outerRadius={sizeValue * 0.9 / 2}
              paddingAngle={0}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              stroke="none"
            >
              <Cell fill={colors.fill} />
              <Cell fill={colors.background} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold" style={{ fontSize: sizeValue * 0.25 }}>
            {value}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProgressDonut;
