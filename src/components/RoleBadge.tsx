import React from 'react';
import { ShieldAlert, ShieldCheck, Landmark, User } from 'lucide-react';
import { Role } from '../types';

interface RoleBadgeProps {
  role: Role;
  showIcon?: boolean;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, showIcon = true }) => {
  const badgeStyles = {
    SUPER_ADMIN: {
      bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
      label: 'Super Admin',
      icon: ShieldAlert,
    },
    ORG_ADMIN: {
      bg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
      label: 'Org Admin',
      icon: ShieldCheck,
    },
    FINANCE_MANAGER: {
      bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      label: 'Finance Manager',
      icon: Landmark,
    },
    TEAM_MEMBER: {
      bg: 'bg-slate-800 border-slate-700 text-slate-400',
      label: 'Team Member',
      icon: User,
    },
  }[role];

  if (!badgeStyles) return null;

  const IconComponent = badgeStyles.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border ${badgeStyles.bg}`}>
      {showIcon && <IconComponent size={14} className="stroke-[2.5px]" />}
      <span>{badgeStyles.label}</span>
    </span>
  );
};
