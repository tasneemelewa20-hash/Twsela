import React from 'react';
import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'لا توجد بيانات متاحة',
  description = 'لم يتم العثور على أي عناصر مطابقة في الوقت الحالي.',
  icon,
  action
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
      <div className="p-3 mb-3 rounded-full bg-slate-100 text-slate-400">
        {icon || <PackageOpen className="w-8 h-8" />}
      </div>
      <h4 className="text-sm font-bold text-navy mb-1">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
