import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { isMockMode } from '../../api/client';
import { Search, Bell, Plus, Menu, Globe, RefreshCw } from 'lucide-react';

interface TopbarProps {
  title: string;
  subtitle?: string;
  onOpenMobileMenu?: () => void;
  onOpenNewShipment?: () => void;
  onOpenPublicTracking?: () => void;
  onRefreshData?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  title,
  subtitle,
  onOpenMobileMenu,
  onOpenNewShipment,
  onOpenPublicTracking,
  onRefreshData
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const mockActive = isMockMode();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-6 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 -mr-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="القائمة"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base lg:text-lg font-bold text-navy leading-tight">{title}</h1>
            {mockActive ? (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                وضع تجريبي (Mock Mode)
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                متصل بالخادم (Live Mode)
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 hidden sm:flex items-center gap-2">
            <span>{subtitle || `${user?.name} · الأحد 18 مايو 2025`}</span>
            <span>·</span>
            <span className="font-mono text-slate-400 font-medium">{currentTime}</span>
          </div>
        </div>
      </div>

      {/* Action controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search */}
        <div className="relative hidden md:block w-48 lg:w-64">
          <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="بحث شحنة، مستلم، هاتف…"
            className="w-full pr-9 pl-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-twsela-blue/20 focus:border-twsela-blue transition"
          />
        </div>

        {/* Public Tracking Shortcut */}
        {onOpenPublicTracking && (
          <button
            onClick={onOpenPublicTracking}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition"
          >
            <Globe className="w-3.5 h-3.5 text-twsela-blue" />
            <span className="hidden sm:inline">تتبع شحنة</span>
          </button>
        )}

        {/* Refresh button */}
        {onRefreshData && (
          <button
            onClick={() => {
              onRefreshData();
              showToast('تم تحديث البيانات من الخادم بنجاح', 'success');
            }}
            title="تحديث البيانات"
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        {/* Notification bell */}
        <button
          onClick={() => showToast('لا توجد إشعارات جديدة غير مقروءة', 'info')}
          title="الإشعارات"
          className="relative p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-twsela-gold" />
        </button>

        {/* New Shipment CTA */}
        {onOpenNewShipment && (
          <button
            onClick={onOpenNewShipment}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-navy hover:bg-navy-light text-white text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4 text-twsela-teal" />
            <span>شحنة جديدة</span>
          </button>
        )}
      </div>
    </header>
  );
};
