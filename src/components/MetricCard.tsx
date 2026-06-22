import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon?: LucideIcon;
  iconBg?: string;
  iconColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtext,
  trend,
  icon: Icon,
  iconBg = 'bg-slate-50',
  iconColor = 'text-slate-600',
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg p-5 flex flex-col justify-between hover:border-slate-700/80 hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-400/80">{title}</span>
          <h3 className="text-2xl font-bold font-sans text-white mt-1.5">{value}</h3>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg ${iconBg} ${iconColor}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2 mt-4">
        {trend && (
          <span className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
            trend.isPositive 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}>
            {trend.isPositive ? '+' : ''}{trend.value}
          </span>
        )}
        <span className="text-xs text-slate-400 font-medium truncate">{subtext}</span>
      </div>
    </div>
  );
};
