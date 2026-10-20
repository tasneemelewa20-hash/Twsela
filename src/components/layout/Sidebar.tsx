import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  LayoutDashboard,
  Package,
  Bike,
  Building2,
  Building,
  QrCode,
  MapPin,
  Route,
  Wallet,
  Settings,
  ShieldCheck,
  FileText,
  LogOut,
  ChevronDown,
  Inbox,
  Grid,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile
}) => {
  const { user, logout, switchRole } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = React.useState(false);

  if (!user) return null;

  // Determine navigation items based on active role
  const getNavItems = () => {
    switch (user.role) {
      case 'ADMIN':
        return [
          { group: 'العمليات', items: [
            { id: 'overview', label: 'نظرة عامة', icon: <LayoutDashboard className="w-4 h-4" /> },
            { id: 'shipments', label: 'الشحنات', badge: '6', icon: <Package className="w-4 h-4" /> },
            { id: 'couriers', label: 'السائقون', icon: <Bike className="w-4 h-4" /> },
            { id: 'routes', label: 'المسارات والتوزيع', icon: <Route className="w-4 h-4" /> },
            { id: 'tracking', label: 'التتبع المباشر', icon: <MapPin className="w-4 h-4" /> },
          ]},
          { group: 'الإدارة', items: [
            { id: 'merchants', label: 'التجار', icon: <Building2 className="w-4 h-4" /> },
            { id: 'warehouses', label: 'المستودعات', icon: <Building className="w-4 h-4" /> },
            { id: 'wallets', label: 'المحافظ والتسويات', badge: '3', icon: <Wallet className="w-4 h-4" /> },
            { id: 'system', label: 'حالة النظام', icon: <Settings className="w-4 h-4" /> },
            { id: 'audit', label: 'سجل الأحداث', icon: <ShieldCheck className="w-4 h-4" /> },
          ]}
        ];

      case 'MERCHANT':
        return [
          { group: 'المتجر', items: [
            { id: 'dashboard', label: 'لوحة التحكم', icon: <LayoutDashboard className="w-4 h-4" /> },
            { id: 'new-shipment', label: 'إنشاء شحنة', icon: <Package className="w-4 h-4" /> },
            { id: 'shipments', label: 'شحناتي', badge: '4', icon: <FileText className="w-4 h-4" /> },
            { id: 'bulk-upload', label: 'رفع جماعي (Excel)', icon: <Inbox className="w-4 h-4" /> },
          ]},
          { group: 'المالية والربط', items: [
            { id: 'wallet', label: 'المحفظة و COD', icon: <Wallet className="w-4 h-4" /> },
            { id: 'integrations', label: 'الربط البرمجي (API)', icon: <Settings className="w-4 h-4" /> },
          ]}
        ];

      case 'COURIER':
        return [
          { group: 'وردية اليوم', items: [
            { id: 'shift', label: 'نظرة الوردية', icon: <LayoutDashboard className="w-4 h-4" /> },
            { id: 'route', label: 'مساري اليوم', badge: '5', icon: <Route className="w-4 h-4" /> },
            { id: 'scan', label: 'مسح الباركود', icon: <QrCode className="w-4 h-4" /> },
          ]},
          { group: 'التسليم والعهد', items: [
            { id: 'deliver', label: 'إثبات التسليم (PoD)', icon: <CheckCircle2 className="w-4 h-4" /> },
            { id: 'fail', label: 'تسجيل محاولة فاشلة', icon: <AlertTriangle className="w-4 h-4" /> },
            { id: 'returns', label: 'المرتجعات', icon: <RotateCcw className="w-4 h-4" /> },
            { id: 'cod', label: 'تسليم COD للمستودع', icon: <Wallet className="w-4 h-4" /> },
          ]}
        ];

      case 'WAREHOUSE':
        return [
          { group: 'عمليات المستودع', items: [
            { id: 'overview', label: 'نظرة عامة', icon: <LayoutDashboard className="w-4 h-4" /> },
            { id: 'intake', label: 'استلام الطرود', badge: '48', icon: <Inbox className="w-4 h-4" /> },
            { id: 'scan', label: 'مسح الباركود', icon: <QrCode className="w-4 h-4" /> },
            { id: 'binmap', label: 'خريطة الصواني', icon: <Grid className="w-4 h-4" /> },
          ]},
          { group: 'الشحن والتوزيع', items: [
            { id: 'manifest', label: 'بيانات الشحن (Manifest)', icon: <FileText className="w-4 h-4" /> },
            { id: 'dispatch', label: 'تحميل المركبات', badge: '3', icon: <Bike className="w-4 h-4" /> },
            { id: 'inventory', label: 'جرد المخزون', icon: <Package className="w-4 h-4" /> },
          ]}
        ];

      case 'OWNER':
        return [
          { group: 'إدارة المنصة', items: [
            { id: 'overview', label: 'لوحة المالك (Owner)', icon: <LayoutDashboard className="w-4 h-4" /> },
            { id: 'tenants', label: 'إدارة التناتات (Tenants)', badge: '5', icon: <Building2 className="w-4 h-4" /> },
            { id: 'subscriptions', label: 'باقات الاشتراك', icon: <Sparkles className="w-4 h-4" /> },
            { id: 'platform-health', label: 'صحة الخوادم', icon: <Settings className="w-4 h-4" /> },
          ]}
        ];

      default:
        return [];
    }
  };

  const navGroups = getNavItems();

  const roleLabels: Record<UserRole, { ar: string; color: string }> = {
    OWNER: { ar: 'مالك المنصة (Owner)', color: '#f5a623' },
    ADMIN: { ar: 'مدير العمليات (Admin)', color: '#00c48c' },
    MERCHANT: { ar: 'بوابة التاجر (Merchant)', color: '#1a70d8' },
    COURIER: { ar: 'مندوب التوصيل (Courier)', color: '#f59e0b' },
    WAREHOUSE: { ar: 'طاقم المستودع (Warehouse)', color: '#7c3aed' }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-navy/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 right-0 z-50 w-64 bg-navy text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpenMobile ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-twsela-teal to-twsela-blue flex items-center justify-center font-bold text-lg text-white shadow-md">
            ت
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>توصيلة</span>
              <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-twsela-teal/20 text-twsela-teal font-mono">
                v1.0
              </span>
            </div>
            <div className="text-[11px] text-slate-400">Courier SaaS Platform</div>
          </div>
        </div>

        {/* Role Quick Switcher */}
        <div className="px-4 py-3 border-b border-white/5 bg-navy-light/40 relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-right transition"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: roleLabels[user.role].color }}
              />
              <span className="text-xs font-medium text-slate-200 truncate">
                {roleLabels[user.role].ar}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {roleMenuOpen && (
            <div className="absolute top-full right-4 left-4 mt-1 bg-navy-dark border border-white/15 rounded-xl shadow-2xl p-1.5 z-50 space-y-1">
              <div className="text-[10px] text-slate-400 px-2.5 py-1">التبديل السريع للأدوار:</div>
              {(['ADMIN', 'MERCHANT', 'COURIER', 'WAREHOUSE', 'OWNER'] as UserRole[]).map(r => (
                <button
                  key={r}
                  onClick={() => {
                    switchRole(r);
                    setRoleMenuOpen(false);
                    onSelectTab(r === 'MERCHANT' ? 'dashboard' : r === 'COURIER' ? 'shift' : 'overview');
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition text-right ${
                    user.role === r
                      ? 'bg-twsela-teal/20 text-twsela-teal font-bold'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: roleLabels[r].color }}
                  />
                  <span>{roleLabels[r].ar}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="px-3 text-[10px] font-semibold text-slate-400 tracking-wider">
                {group.group}
              </div>
              {group.items.map(item => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                      isActive
                        ? 'bg-twsela-blue text-white shadow-sm'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={isActive ? 'text-white' : 'text-slate-400'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-white/10 text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Footer */}
        <div className="p-3 border-t border-white/10 bg-navy-dark/70">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 text-white"
                style={{ backgroundColor: user.avatarColor || '#1358a5' }}
              >
                {user.avatarInitials}
              </div>
              <div className="overflow-hidden text-right">
                <div className="text-xs font-semibold text-white truncate">{user.name}</div>
                <div className="text-[10px] text-slate-400 truncate">
                  {user.zone ? `منطقة ${user.zone}` : user.tenantId}
                </div>
              </div>
            </div>
            <button
              onClick={() => logout()}
              title="تسجيل الخروج"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
