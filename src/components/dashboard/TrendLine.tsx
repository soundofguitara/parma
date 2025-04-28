
import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface TrendLineProps {
  data: Array<{ value: number }>;
  color?: string;
}

const TrendLine = ({ data, color = '#0EA5E9' }: TrendLineProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={color} 
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TrendLine;
