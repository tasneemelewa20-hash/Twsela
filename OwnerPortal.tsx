import React, { useState, useEffect } from 'react';
import { Tenant } from '../../types';
import { fetchTenants, createTenant } from '../../api/owner';
import { useToast } from '../../context/ToastContext';
import { KpiCard } from '../../components/common/KpiCard';
import { Modal } from '../../components/common/Modal';
import {
  Building2,
  Plus,
  Sparkles,
  Server,
  DollarSign,
  TrendingUp,
  Check,
  Package,
  Users
} from 'lucide-react';

interface OwnerPortalProps {
  activeTab: string;
}

export const OwnerPortal: React.FC<OwnerPortalProps> = ({ activeTab }) => {
  const { showToast } = useToast();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New Tenant Form
  const [companyNameAr, setCompanyNameAr] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [planTier, setPlanTier] = useState<'BASIC' | 'PRO' | 'ENTERPRISE'>('PRO');

  const loadTenants = async () => {
    try {
      const data = await fetchTenants();
      setTenants(data);
    } catch (_) {
      showToast('خطأ أثناء تحميل بيانات المنصة', 'error');
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyNameAr.trim() || !companyName.trim()) {
      showToast('يرجى كتابة اسم الشركة بالعربية والإنجليزية', 'error');
      return;
    }

    try {
      const newT = await createTenant(companyNameAr, companyName, planTier);
      setTenants(prev => [newT, ...prev]);
      showToast(`تمت إضافة التنانت ${newT.companyNameAr} وتفعيل الاشتراك بنجاح ✓`, 'success');
      setCreateModalOpen(false);
      setCompanyNameAr('');
      setCompanyName('');
    } catch (err: any) {
      showToast(err.message || 'فشل إنشاء التنانت', 'error');
    }
  };

  const totalShipments = tenants.reduce((sum, t) => sum + t.activeShipmentsMonth, 0);

  return (
    <div className="space-y-6">
      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="التناتات والشركات النشطة"
              value={tenants.length}
              change="+2 هذا الشهر"
              isPositive={true}
              accentColor="#07213d"
              icon={<Building2 className="w-4 h-4 text-navy" />}
            />
            <KpiCard
              title="إجمالي شحنات المنصة"
              value={totalShipments}
              change="+18.5% نمو شهري"
              isPositive={true}
              accentColor="#00c48c"
              icon={<Package className="w-4 h-4 text-twsela-teal" />}
            />
            <KpiCard
              title="إيرادات الاشتراكات الشهرية"
              value="42,800 EGP"
              change="+12% ARR"
              isPositive={true}
              accentColor="#f5a623"
              icon={<DollarSign className="w-4 h-4 text-twsela-gold" />}
            />
            <KpiCard
              title="متوسط جاهزية الخوادم"
              value="99.98%"
              change="SLA ممتاز"
              isPositive={true}
              accentColor="#7c3aed"
              icon={<Server className="w-4 h-4 text-twsela-purple" />}
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-navy flex items-center gap-2">
                <Building2 className="w-4 h-4 text-twsela-blue" />
                <span>الشركات والمنصات المشتركة في Twsela Multi-Tenant</span>
              </h3>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy hover:bg-navy-light text-white text-xs font-bold transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 text-twsela-teal" />
                <span>إضافة تنانت جديد</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-medium">
                    <th className="pb-3 pr-2">اسم المتجر / الشركة</th>
                    <th className="pb-3">المعرف البرمجي (Slug)</th>
                    <th className="pb-3">باقة الاشتراك</th>
                    <th className="pb-3">الشحنات الشهرية</th>
                    <th className="pb-3">الحد المسموح (Quota)</th>
                    <th className="pb-3">المستخدمون</th>
                    <th className="pb-3">تاريخ الانضمام</th>
                    <th className="pb-3 pl-2">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tenants.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 pr-2 font-bold text-navy">{t.companyNameAr} ({t.companyName})</td>
                      <td className="py-3 font-mono text-twsela-blue font-semibold">{t.slug}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-twsela-blue/10 text-twsela-blue">
                          {t.planTier}
                        </span>
                      </td>
                      <td className="py-3 font-mono font-bold text-navy">{t.activeShipmentsMonth}</td>
                      <td className="py-3 font-mono text-slate-500">{t.quotaShipmentsMonth}</td>
                      <td className="py-3 font-mono">{t.activeUsers} مستخدمين</td>
                      <td className="py-3 font-mono text-slate-400">{t.joinedAt}</td>
                      <td className="py-3 pl-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {t.status === 'ACTIVE' ? 'نشط' : 'قيد المراجعة'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── TENANTS TAB ── */}
      {activeTab === 'tenants' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-navy">إدارة التناتات وتخصيص الحصص (Tenants & Quotas)</h3>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-navy text-white text-xs font-bold hover:bg-navy-light transition shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-twsela-teal" />
              <span>تنانت جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tenants.map(t => (
              <div key={t.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-navy">{t.companyNameAr}</span>
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-twsela-blue/10 text-twsela-blue">
                    {t.planTier}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono">Slug: {t.slug}</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>استهلاك الشحنات:</span>
                    <span className="font-bold text-navy font-mono">
                      {t.activeShipmentsMonth} / {t.quotaShipmentsMonth}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-twsela-blue rounded-full"
                      style={{ width: `${Math.min(100, (t.activeShipmentsMonth / t.quotaShipmentsMonth) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SUBSCRIPTIONS TAB ── */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h3 className="text-xl font-bold text-navy">باقات اشتراك منصة توصيلة SaaS</h3>
            <p className="text-xs text-slate-500">
              خطط أسعار مرنة مصممة للشركات الناشئة ومتاجر التجارة الإلكترونية ومقدمي الخدمات اللوجستية الكبرى
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Starter (المبتدئين)',
                price: '99 $ / شهر',
                limit: '100 شحنة شهرياً',
                features: ['مستخدم واحد للوحة التحكم', 'تتبع شحنات مباشر', 'تطبيق السائق المحمول', 'دعم عبر البريد الإلكتروني'],
                popular: false
              },
              {
                name: 'Growth (النمو السريع)',
                price: '299 $ / شهر',
                limit: '500 شحنة شهرياً',
                features: ['5 مستخدمين مع RBAC', 'خوارزمية المسارات الذكية', 'رسائل SMS و OTP للعملاء', 'ربط تلقائي Shopify / Salla', 'دعم فني متميز 24/7'],
                popular: true
              },
              {
                name: 'Enterprise (المؤسسات)',
                price: 'مخصص (Custom)',
                limit: 'شحنات غير محدودة',
                features: ['خوادم مخصصة ومستودعات متعددة', 'API مفتوح و Webhooks مخصصة', 'تخصيص الهوية البصرية (White-Label)', 'مدير حساب مالي مخصص'],
                popular: false
              }
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`relative bg-white rounded-2xl border p-6 shadow-sm flex flex-col justify-between ${
                  plan.popular ? 'border-twsela-blue shadow-lg ring-2 ring-twsela-blue/20' : 'border-slate-200'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 right-6 px-3 py-1 rounded-full text-[10px] font-bold bg-twsela-blue text-white shadow-sm">
                    الأكثر طلباً للمتاجر
                  </span>
                )}
                <div>
                  <h4 className="text-base font-bold text-navy">{plan.name}</h4>
                  <div className="text-2xl font-bold font-mono text-navy mt-3 mb-1">{plan.price}</div>
                  <div className="text-xs text-twsela-teal font-bold mb-4">{plan.limit}</div>

                  <div className="space-y-2 border-t border-slate-100 pt-4 text-xs">
                    {plan.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-slate-600">
                        <Check className="w-4 h-4 text-twsela-teal shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => showToast(`تم اختيار باقة ${plan.name}`, 'info')}
                  className={`mt-6 w-full py-2.5 rounded-xl font-bold text-xs transition ${
                    plan.popular
                      ? 'bg-twsela-blue text-white hover:bg-twsela-blue/90 shadow-sm'
                      : 'border border-slate-200 text-navy hover:bg-slate-50'
                  }`}
                >
                  تعديل خطة الاشتراك
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CREATE TENANT MODAL ── */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="إضافة تنانت / متجر جديد لمنظومة Twsela"
        maxWidth="md"
      >
        <form onSubmit={handleCreateTenant} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">اسم المتجر / الشركة بالعربية *</label>
            <input
              type="text"
              required
              value={companyNameAr}
              onChange={e => setCompanyNameAr(e.target.value)}
              placeholder="مثال: متجر النخبة"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Company Name (English) *</label>
            <input
              type="text"
              required
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              placeholder="e.g. Elite Fashion Store"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">باقة الاشتراك المحددة</label>
            <select
              value={planTier}
              onChange={e => setPlanTier(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
            >
              <option value="BASIC">Basic — 100 شحنة شهرياً</option>
              <option value="PRO">Pro — 250 شحنة شهرياً</option>
              <option value="ENTERPRISE">Enterprise — 500+ شحنة</option>
            </select>
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-navy text-white font-bold text-xs hover:bg-navy-light transition"
            >
              إنشاء التنانت وتفعيل الحصة
            </button>
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
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
