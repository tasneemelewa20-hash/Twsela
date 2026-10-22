import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  accentColor?: string;
  icon?: React.ReactNode;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  change,
  isPositive,
  accentColor = '#1a70d8',
  icon
}) => {
  return (
    <div className="relative overflow-hidden bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div
        className="absolute top-0 right-0 left-0 h-1"
        style={{ backgroundColor: accentColor }}
      />
      <div className="flex items-center justify-between text-slate-500 mb-1.5 text-xs font-medium">
        <span className="flex items-center gap-1.5">{title}</span>
        {icon && <span className="text-slate-400">{icon}</span>}
      </div>
      <div className="text-2xl font-bold tracking-tight text-navy font-mono">
        {value}
      </div>
      {change && (
        <div
          className={`flex items-center gap-1 mt-1 text-[11px] font-medium ${
            isPositive === true
              ? 'text-emerald-600'
              : isPositive === false
              ? 'text-rose-600'
              : 'text-slate-500'
          }`}
        >
          {isPositive === true && <TrendingUp className="w-3.5 h-3.5" />}
          {isPositive === false && <TrendingDown className="w-3.5 h-3.5" />}
          <span>{change}</span>
        </div>
      )}
    </div>
  );
};
