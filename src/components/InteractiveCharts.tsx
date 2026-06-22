import React, { useState } from 'react';
import { TrendingUp, UserCheck, Cpu, Database } from 'lucide-react';

// Monthly Recurring Revenue trend mock datasets
const MRR_HISTORY = [
  { month: 'Jan', revenue: 14800, organizations: 3, clientSeats: 82 },
  { month: 'Feb', revenue: 18400, organizations: 4, clientSeats: 96 },
  { month: 'Mar', revenue: 21200, organizations: 4, clientSeats: 112 },
  { month: 'Apr', revenue: 24900, organizations: 5, clientSeats: 145 },
  { month: 'May', revenue: 28500, organizations: 5, clientSeats: 168 },
  { month: 'Jun', revenue: 34200, organizations: 6, clientSeats: 218 },
];

export const FinancialTrendChart: React.FC = () => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const maxValue = 40000;
  const height = 180;
  const width = 500;
  
  // Calculate SVG curve path points
  const points = MRR_HISTORY.map((item, index) => {
    const x = (index / (MRR_HISTORY.length - 1)) * width;
    const y = height - (item.revenue / maxValue) * height + 10;
    return { x, y, ...item };
  });

  const pathD = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') 
    : '';

  // Gradient fill closed path
  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${height + 20} L ${points[0].x} ${height + 20} Z`
    : '';

  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-white">Monthly Contract Value (MRR)</h4>
          <span className="text-xs text-slate-400">Total revenue across all tenants (USD)</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 font-bold px-2 py-1 rounded">
          <TrendingUp size={14} />
          <span>+20.1% QoQ</span>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="relative pt-2">
        <svg viewBox={`0 0 ${width} ${height + 30}`} className="w-full overflow-visible">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.00" />
            </linearGradient>
            <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const h = height * ratio + 10;
            const label = Math.round(maxValue * (1 - ratio));
            return (
              <g key={i} className="opacity-40">
                <line x1="0" y1={h} x2={width} y2={h} stroke="#1e293b" strokeDasharray="4 4" />
                <text x="5" y={h - 4} fill="#64748b" fontSize="10" fontWeight="500" className="font-mono">
                  ${label.toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* Shaded Area */}
          <path d={areaD} fill="url(#chartGradient)" />

          {/* Core Curve */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#strokeGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Nodes */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoverIndex === idx ? '7' : '4.5'}
                fill={hoverIndex === idx ? '#6366f1' : '#a78bfa'}
                stroke="#0f172a"
                strokeWidth="2.5"
                className="transition-all duration-150 cursor-pointer shadow-sm"
                onMouseEnter={() => setHoverIndex(idx)}
                onMouseLeave={() => setHoverIndex(null)}
              />
              <text x={p.x} y={height + 25} fill="#475569" fontSize="11" fontWeight="600" textAnchor="middle">
                {p.month}
              </text>
            </g>
          ))}
        </svg>

        {/* Dynamic Tooltip */}
        {hoverIndex !== null && (
          <div 
            className="absolute bg-slate-950 text-white rounded-lg p-2.5 text-xs shadow-2xl pointer-events-none transition-all duration-200 border border-slate-800"
            style={{
              left: `${(hoverIndex / (MRR_HISTORY.length - 1)) * 84}%`,
              bottom: '50px',
            }}
          >
            <div className="font-bold text-violet-350">{MRR_HISTORY[hoverIndex].month} History</div>
            <div className="flex flex-col gap-0.5 mt-1 font-mono text-slate-300">
              <div>MRR: <span className="text-white font-bold">${MRR_HISTORY[hoverIndex].revenue.toLocaleString()}</span></div>
              <div>Tenants: <span className="text-white">{MRR_HISTORY[hoverIndex].organizations} active</span></div>
              <div>Total Seats: <span className="text-white">{MRR_HISTORY[hoverIndex].clientSeats} licenses</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const SeatMultiTenantChart: React.FC = () => {
  const data = [
    { name: 'SaaSify Inc', seats: 26, color: 'bg-indigo-500', pct: '22%' },
    { name: 'Acme Logistics', seats: 84, color: 'bg-indigo-600', pct: '68%' },
    { name: 'Aura Designs', seats: 8, color: 'bg-emerald-500', pct: '7%' },
    { name: 'Lunar Trial', seats: 4, color: 'bg-amber-500', pct: '3%' },
  ];

  const totalSeats = data.reduce((acc, curr) => acc + curr.seats, 0);

  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg flex flex-col justify-between h-full text-slate-300">
      <div>
        <h4 className="text-sm font-semibold text-white">License Quota Matrix</h4>
        <span className="text-xs text-slate-400">Seat allocations sorted by organization scale</span>
      </div>

      <div className="my-5 space-y-3.5">
        {data.map((item, idx) => {
          const percentage = (item.seats / totalSeats) * 100;
          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${item.color}`} />
                  {item.name}
                </span>
                <span className="text-white text-right font-mono font-bold">
                  {item.seats} seats ({item.pct})
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${item.color}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-[11px] text-slate-400">
        <span>Total Allocated Licenses:</span>
        <span className="font-mono font-bold text-slate-300">{totalSeats} / 500 Capacity</span>
      </div>
    </div>
  );
};

interface UsageGaugeProps {
  currentValue: number;
  maxValue: number;
  metricLabel: string;
  unit: string;
  type: 'API' | 'CPU' | 'STORAGE';
}

export const UsageCircularGauge: React.FC<UsageGaugeProps> = ({ 
  currentValue, 
  maxValue, 
  metricLabel, 
  unit, 
  type 
}) => {
  const percentage = Math.min((currentValue / maxValue) * 100, 100);
  const radius = 50;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorMap = {
    API: { stroke: 'stroke-indigo-500', text: 'text-indigo-400', bg: 'bg-indigo-950/40', icon: Cpu },
    CPU: { stroke: 'stroke-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-950/40', icon: Cpu },
    STORAGE: { stroke: 'stroke-teal-500', text: 'text-teal-400', bg: 'bg-teal-950/40', icon: Database },
  };

  const style = colorMap[type];
  const Icon = style.icon;

  return (
    <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-xl shadow-lg flex items-center justify-between gap-4 text-slate-300">
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase font-bold tracking-wider text-slate-400">{metricLabel}</span>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-xl font-extrabold text-white font-mono">
            {currentValue.toLocaleString()}
          </span>
          <span className="text-xs text-slate-400 font-medium">/ {maxValue.toLocaleString()} {unit}</span>
        </div>
        <span className={`text-[11px] font-bold mt-1 inline-flex items-center gap-1.5 py-0.5 px-2.5 rounded-full border max-w-max ${
          percentage > 90 
            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
            : percentage > 75 
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
              : 'bg-slate-800 text-slate-300 border-slate-700/50'
        }`}>
          {percentage.toFixed(1)}% consumed
          {percentage > 90 && ' - Threshold Alert!'}
        </span>
      </div>

      <div className="relative flex items-center justify-center w-24 h-24">
        <svg className="transform -rotate-90 w-full h-full">
          {/* Background circle */}
          <circle
            className="stroke-slate-800"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Foreground circle */}
          <circle
            className={`transition-all duration-500 ease-out ${style.stroke}`}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <Icon size={18} className={style.text} />
        </div>
      </div>
    </div>
  );
};
