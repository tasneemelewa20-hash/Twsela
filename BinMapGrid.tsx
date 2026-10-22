import React, { useState } from 'react';
import { WarehouseBin } from '../../types';

interface BinMapGridProps {
  bins: WarehouseBin[];
  onSelectBin?: (bin: WarehouseBin) => void;
  selectedBinKey?: string;
}

export const BinMapGrid: React.FC<BinMapGridProps> = ({ bins, onSelectBin, selectedBinKey }) => {
  const [hoveredBin, setHoveredBin] = useState<WarehouseBin | null>(null);

  const aisles = ['A', 'B', 'C', 'D', 'E', 'F'];

  const getStatusStyles = (status: WarehouseBin['status']) => {
    switch (status) {
      case 'free':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100';
      case 'used':
        return 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100 font-bold';
      case 'held':
        return 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100';
      case 'broken':
        return 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed';
    }
  };

  const getStatusLabelAr = (status: WarehouseBin['status']) => {
    switch (status) {
      case 'free': return 'شاغرة (فارغة)';
      case 'used': return 'مشغولة (يوجد طرد)';
      case 'held': return 'محجوزة لوارد';
      case 'broken': return 'معطلة / صيانة';
    }
  };

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" />
          <span className="text-slate-600">فارغة</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-100 border border-blue-300" />
          <span className="text-slate-600">مشغولة</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />
          <span className="text-slate-600">محجوزة</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-slate-200 border border-slate-300" />
          <span className="text-slate-600">معطلة</span>
        </div>
      </div>

      {/* Grid by Aisles */}
      <div className="space-y-3">
        {aisles.map(aisle => {
          const aisleBins = bins.filter(b => b.aisle === aisle);
          return (
            <div key={aisle} className="flex items-center gap-3">
              <div className="w-16 shrink-0 text-left pl-2 font-mono text-xs font-bold text-slate-500">
                Aisle {aisle}
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 flex-1">
                {aisleBins.map(bin => {
                  const isSelected = selectedBinKey === bin.key;
                  return (
                    <button
                      key={bin.key}
                      onClick={() => onSelectBin && onSelectBin(bin)}
                      onMouseEnter={() => setHoveredBin(bin)}
                      onMouseLeave={() => setHoveredBin(null)}
                      className={`h-9 rounded-lg border text-xs font-mono transition-all flex items-center justify-center relative ${getStatusStyles(
                        bin.status
                      )} ${isSelected ? 'ring-2 ring-twsela-blue scale-105 z-10 shadow-sm' : ''}`}
                    >
                      {bin.key}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail bar */}
      <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-between min-h-[46px]">
        {hoveredBin ? (
          <div className="flex items-center gap-3">
            <span className="font-bold text-navy font-mono text-sm">{hoveredBin.key}</span>
            <span>الحالة: <b className="text-navy">{getStatusLabelAr(hoveredBin.status)}</b></span>
            {hoveredBin.occupiedShipmentId && (
              <span>الشحنة: <b className="font-mono text-twsela-blue">{hoveredBin.occupiedShipmentId}</b></span>
            )}
            {hoveredBin.weightKg && <span>الوزن: <b>{hoveredBin.weightKg} كجم</b></span>}
          </div>
        ) : (
          <span className="text-slate-400">مرر مؤشر الماوس أو انقر فوق أي صينية لعرض تفاصيلها</span>
        )}
      </div>
    </div>
  );
};
