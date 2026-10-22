import React from 'react';
import { ShipmentStatus } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'green' | 'blue' | 'amber' | 'red' | 'gray' | 'purple' | 'teal';
  status?: ShipmentStatus;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant, status, size = 'md' }) => {
  let colorClass = 'bg-slate-100 text-slate-700 border-slate-200';
  let label = children;

  if (status) {
    switch (status) {
      case 'DELIVERED':
        colorClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
        label = label || 'مُسلَّم';
        break;
      case 'OUT_FOR_DELIVERY':
        colorClass = 'bg-blue-50 text-blue-800 border-blue-200';
        label = label || 'في الطريق';
        break;
      case 'SORTED':
      case 'RECEIVED_AT_WAREHOUSE':
        colorClass = 'bg-purple-50 text-purple-800 border-purple-200';
        label = label || (status === 'SORTED' ? 'تم الفرز' : 'في المستودع');
        break;
      case 'ASSIGNED_TO_COURIER':
      case 'ASSIGNED_TO_WAREHOUSE':
        colorClass = 'bg-sky-50 text-sky-800 border-sky-200';
        label = label || 'مُعيَّن';
        break;
      case 'CREATED':
        colorClass = 'bg-amber-50 text-amber-800 border-amber-200';
        label = label || 'قيد الانتظار';
        break;
      case 'DELIVERY_FAILED':
      case 'RETURN_REQUESTED':
      case 'RETURNED_TO_WAREHOUSE':
      case 'CANCELLED':
        colorClass = 'bg-rose-50 text-rose-800 border-rose-200';
        label = label || (status === 'DELIVERY_FAILED' ? 'فاشل' : 'مُعاد');
        break;
    }
  } else if (variant) {
    switch (variant) {
      case 'green':
      case 'teal':
        colorClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
        break;
      case 'blue':
        colorClass = 'bg-blue-50 text-blue-800 border-blue-200';
        break;
      case 'amber':
        colorClass = 'bg-amber-50 text-amber-800 border-amber-200';
        break;
      case 'red':
        colorClass = 'bg-rose-50 text-rose-800 border-rose-200';
        break;
      case 'purple':
        colorClass = 'bg-purple-50 text-purple-800 border-purple-200';
        break;
      case 'gray':
      default:
        colorClass = 'bg-slate-100 text-slate-700 border-slate-200';
        break;
    }
  }

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border tracking-tight transition-colors ${sizeClass} ${colorClass}`}
    >
      {label}
    </span>
  );
};
