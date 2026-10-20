import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { createShipment, CreateShipmentPayload } from '../../api/shipments';
import { Plus } from 'lucide-react';

interface AppShellProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenPublicTracking: () => void;
  onRefreshData?: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentTab,
  onSelectTab,
  onOpenPublicTracking,
  onRefreshData,
  children
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newShipmentModalOpen, setNewShipmentModalOpen] = useState(false);

  // New Shipment State
  const [formData, setFormData] = useState<CreateShipmentPayload>({
    recipientName: '',
    recipientPhone: '',
    destinationAddress: '',
    destinationZone: 'القاهرة',
    packageWeightKg: 1.0,
    codAmountEgp: 300,
    serviceType: 'STANDARD_24H',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.recipientName.trim() || !formData.recipientPhone.trim() || !formData.destinationAddress.trim()) {
      showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const newShipment = await createShipment(formData);
      showToast(`تم إنشاء الشحنة بنجاح برقم: ${newShipment.trackingNumber}`, 'success');
      setNewShipmentModalOpen(false);
      setFormData({
        recipientName: '',
        recipientPhone: '',
        destinationAddress: '',
        destinationZone: 'القاهرة',
        packageWeightKg: 1.0,
        codAmountEgp: 300,
        serviceType: 'STANDARD_24H',
        notes: ''
      });
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      showToast(err.message || 'فشل إنشاء الشحنة', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      overview: 'لوحة التحكم والمؤشرات',
      shipments: 'إدارة الشحنات والعمليات',
      couriers: 'سجل السائقين والأسطول',
      routes: 'المسارات والتوزيع الذكي',
      tracking: 'التتبع المباشر للأسطول',
      merchants: 'سجل التجار المشتركين',
      warehouses: 'مستودعات الفرز والتخزين',
      wallets: 'المحافظ المالية والتسويات',
      system: 'حالة النظام والخوادم',
      audit: 'سجل الأحداث الأمني',
      dashboard: 'لوحة تحكم المتجر',
      'new-shipment': 'إنشاء شحنة جديدة',
      'bulk-upload': 'الرفع الجماعي للشحنات',
      wallet: 'المحفظة وحساب COD',
      integrations: 'الربط البرمجي (API)',
      shift: 'نظرة الوردية الميدانية',
      route: 'مسار التسليم اليومي',
      scan: 'مسح الباركود',
      deliver: 'تسجيل وإثبات التسليم (PoD)',
      fail: 'تسجيل محاولة فاشلة',
      returns: 'الشحنات المرتجعة',
      cod: 'تسليم COD للمستودع',
      intake: 'استلام وفرز الطرود',
      binmap: 'خريطة الصواني التفاعلية',
      manifest: 'بيانات الشحن (Manifest)',
      dispatch: 'تحميل وإطلاق المركبات',
      inventory: 'جرد المخزون',
      tenants: 'إدارة التناتات والشركات',
      subscriptions: 'باقات الاشتراك والفوترة',
      'platform-health': 'صحة منصة Twsela'
    };
    return titles[currentTab] || 'لوحة العمليات';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f3f8] text-navy font-arabic">
      <Sidebar
        currentTab={currentTab}
        onSelectTab={onSelectTab}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          title={getPageTitle()}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenNewShipment={user?.role === 'ADMIN' || user?.role === 'MERCHANT' ? () => setNewShipmentModalOpen(true) : undefined}
          onOpenPublicTracking={onOpenPublicTracking}
          onRefreshData={onRefreshData}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Global New Shipment Modal */}
      <Modal
        isOpen={newShipmentModalOpen}
        onClose={() => setNewShipmentModalOpen(false)}
        title="إنشاء شحنة جديدة"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateShipment} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">اسم المستلم كاملًا *</label>
              <input
                type="text"
                required
                value={formData.recipientName}
                onChange={e => setFormData({ ...formData, recipientName: e.target.value })}
                placeholder="محمد رضا"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">رقم الهاتف *</label>
              <input
                type="tel"
                required
                value={formData.recipientPhone}
                onChange={e => setFormData({ ...formData, recipientPhone: e.target.value })}
                placeholder="01XXXXXXXXX"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">العنوان بالتفصيل *</label>
            <input
              type="text"
              required
              value={formData.destinationAddress}
              onChange={e => setFormData({ ...formData, destinationAddress: e.target.value })}
              placeholder="شارع النصر، المعادي، القاهرة"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">المنطقة</label>
              <select
                value={formData.destinationZone}
                onChange={e => setFormData({ ...formData, destinationZone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="القاهرة">القاهرة</option>
                <option value="المعادي">المعادي</option>
                <option value="مصر الجديدة">مصر الجديدة</option>
                <option value="الجيزة">الجيزة</option>
                <option value="الإسكندرية">الإسكندرية</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">الوزن (كجم)</label>
              <input
                type="number"
                step="0.1"
                value={formData.packageWeightKg}
                onChange={e => setFormData({ ...formData, packageWeightKg: parseFloat(e.target.value) || 1.0 })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">COD (EGP)</label>
              <input
                type="number"
                value={formData.codAmountEgp}
                onChange={e => setFormData({ ...formData, codAmountEgp: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono font-bold text-emerald-600"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-navy text-white font-bold text-xs hover:bg-navy-light transition disabled:opacity-50"
            >
              {isSubmitting ? 'جاري الحفظ...' : 'تأكيد إنشاء الشحنة'}
            </button>
            <button
              type="button"
              onClick={() => setNewShipmentModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
            >
              إلغاء
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
