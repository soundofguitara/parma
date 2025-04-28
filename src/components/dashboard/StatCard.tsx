
import React, { ReactNode } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    label?: string;
    isPositive?: boolean;
  };
  className?: string;
  secondaryValue?: string;
  chart?: ReactNode;
}

const StatCard = ({
  title,
  value,
  icon,
  trend,
  className,
  secondaryValue,
  chart
}: StatCardProps) => {
  return (
    <div className={cn('stat-card', className)}>
      <div className="flex justify-between items-start mb-1">
        <h3 className="stat-card-header">{title}</h3>
        {icon && <div className="text-pharma-text-muted">{icon}</div>}
      </div>
      
      <div className="flex justify-between items-end">
        <div>
          <div className="stat-card-value">{value}</div>
          {secondaryValue && (
            <div className="text-sm text-pharma-text-muted mt-1">{secondaryValue}</div>
          )}
          
          {trend && (
            <div 
              className={cn(
                "stat-card-trend", 
                trend.isPositive ? "text-pharma-accent-green" : "text-pharma-accent-red"
              )}
            >
              {trend.isPositive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
              <span className="ml-1">{trend.value}%</span>
              {trend.label && <span className="ml-1 text-pharma-text-muted">{trend.label}</span>}
            </div>
          )}
        </div>
        
        {chart && <div className="w-24 h-16">{chart}</div>}
      </div>
    </div>
  );
};

export default StatCard;
