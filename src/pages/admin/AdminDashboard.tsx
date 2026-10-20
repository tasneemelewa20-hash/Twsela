import React, { useState, useEffect } from 'react';
import { ShipmentDTO, ShipmentStatus, CourierProfile, Tenant, SystemServiceStatus, AuditLogItem } from '../../types';
import { fetchShipments, updateShipmentStatus } from '../../api/shipments';
import { fetchCouriersList } from '../../api/couriers';
import { fetchTenants } from '../../api/owner';
import { SYSTEM_SERVICES, INITIAL_AUDIT_LOGS } from '../../api/mockData';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';
import { KpiCard } from '../../components/common/KpiCard';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Package,
  CheckCircle2,
  Clock,
  RotateCcw,
  Bike,
  Building2,
  Wallet,
  Settings,
  ShieldCheck,
  Search,
  Eye,
  Check,
  X,
  FileText
} from 'lucide-react';

interface AdminDashboardProps {
  activeTab: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ activeTab }) => {
  const { showToast } = useToast();
  const [shipments, setShipments] = useState<ShipmentDTO[]>([]);
  const [couriers, setCouriers] = useState<CourierProfile[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [services] = useState<SystemServiceStatus[]>(SYSTEM_SERVICES);
  const [auditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);

  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedShipment, setSelectedShipment] = useState<ShipmentDTO | null>(null);

  const [payouts, setPayouts] = useState([
    { id: 1, name: 'متجر الأناقة', type: 'تاجر', amount: 12400, bank: 'بنك مصر ···4521', time: 'اليوم 09:55', status: 'PENDING' },
    { id: 2, name: 'خالد منصور', type: 'سائق', amount: 4200, bank: 'CIB ···7834', time: 'أمس 18:00', status: 'PENDING' },
    { id: 3, name: 'تك ستور', type: 'تاجر', amount: 5800, bank: 'QNB ···2210', time: 'أمس 14:20', status: 'PROCESSING' }
  ]);

  const loadData = async () => {
    try {
      const [sList, cList, tList] = await Promise.all([
        fetchShipments(),
        fetchCouriersList(),
        fetchTenants()
      ]);
      setShipments(sList);
      setCouriers(cList);
      setTenants(tList);
    } catch (_) {
      showToast('خطأ أثناء تحميل البيانات', 'error');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprovePayout = (id: number, amount: number) => {
    setPayouts(prev => prev.map(p => (p.id === id ? { ...p, status: 'COMPLETED' } : p)));
    showToast(`تمت الموافقة على تحويل مبلغ ${amount.toLocaleString()} EGP بنجاح`, 'success');
  };

  const handleRejectPayout = (id: number) => {
    setPayouts(prev => prev.map(p => (p.id === id ? { ...p, status: 'REJECTED' } : p)));
    showToast('تم رفض طلب السحب', 'error');
  };

  const filteredShipments = shipments.filter(s => {
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesQuery = !searchQuery ||
      s.trackingNumber.toLowerCase().includes(q) ||
      s.recipientName.toLowerCase().includes(q) ||
      s.recipientPhone.includes(q) ||
      s.senderMerchant.toLowerCase().includes(q) ||
      s.destinationZone.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  const totalDelivered = shipments.filter(s => s.status === 'DELIVERED').length;
  const totalInTransit = shipments.filter(s => s.status === 'OUT_FOR_DELIVERY').length;
  const totalReturned = shipments.filter(s => s.status === 'RETURNED_TO_WAREHOUSE' || s.status === 'DELIVERY_FAILED').length;
  const totalCodSum = shipments.reduce((sum, s) => sum + (s.codAmountEgp || 0), 0);

  return (
    <div className="space-y-6">
      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="إجمالي الشحنات"
              value={shipments.length}
              change="+8.3% هذا الأسبوع"
              isPositive={true}
              accentColor="#1a70d8"
              icon={<Package className="w-4 h-4 text-twsela-blue-light" />}
            />
            <KpiCard
              title="تم التسليم بنجاح"
              value={totalDelivered}
              change={`${((totalDelivered / (shipments.length || 1)) * 100).toFixed(0)}% نسبة النجاح`}
              isPositive={true}
              accentColor="#00c48c"
              icon={<CheckCircle2 className="w-4 h-4 text-twsela-teal" />}
            />
            <KpiCard
              title="في الطريق للتسليم"
              value={totalInTransit}
              change="مع المندوبين"
              accentColor="#f5a623"
              icon={<Clock className="w-4 h-4 text-twsela-gold" />}
            />
            <KpiCard
              title="إجمالي مبالغ COD"
              value={`${totalCodSum.toLocaleString()} EGP`}
              change="تحصيلات اليوم"
              isPositive={true}
              accentColor="#7c3aed"
              icon={<Wallet className="w-4 h-4 text-twsela-purple" />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Shipments Table */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-navy flex items-center gap-2">
                  <Package className="w-4 h-4 text-twsela-blue" />
                  <span>آخر الشحنات النشطة</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">تحديث فوري</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-medium">
                      <th className="pb-3 pr-2">رقم التتبع</th>
                      <th className="pb-3">التاجر</th>
                      <th className="pb-3">المستلم</th>
                      <th className="pb-3">المنطقة</th>
                      <th className="pb-3">COD</th>
                      <th className="pb-3">الحالة</th>
                      <th className="pb-3 pl-2">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {shipments.slice(0, 6).map(s => (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 pr-2 font-mono font-bold text-twsela-blue">{s.trackingNumber}</td>
                        <td className="py-3 font-medium text-navy">{s.senderMerchant}</td>
                        <td className="py-3 text-slate-600">{s.recipientName}</td>
                        <td className="py-3 text-slate-500">{s.destinationZone}</td>
                        <td className="py-3 font-bold font-mono text-emerald-600">
                          {s.codAmountEgp ? `${s.codAmountEgp} EGP` : '—'}
                        </td>
                        <td className="py-3"><Badge status={s.status} /></td>
                        <td className="py-3 pl-2">
                          <button
                            onClick={() => setSelectedShipment(s)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-twsela-blue hover:bg-slate-100 transition"
                            title="عرض تفاصيل الشحنة"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Couriers Performance column */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-navy flex items-center gap-2">
                  <Bike className="w-4 h-4 text-twsela-teal" />
                  <span>حالة السائقين اليوم</span>
                </h3>
                <span className="text-xs text-slate-500 font-mono">4 نشط</span>
              </div>

              <div className="space-y-3">
                {couriers.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-twsela-blue/10 text-twsela-blue flex items-center justify-center font-bold text-xs">
                        {c.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-navy">{c.name}</div>
                        <div className="text-[11px] text-slate-400">{c.zone} · {c.vehicleType}</div>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold font-mono text-navy">{c.todayDeliveries} تسليم</div>
                      <div className="text-[10px] text-twsela-gold font-bold">⭐ {c.averageRating}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── SHIPMENTS TAB ── */}
      {activeTab === 'shipments' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-navy">إدارة الشحنات الكاملة</h3>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="بحث برقم الشحنة، المستلم…"
                  className="w-full pr-9 pl-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-twsela-blue/20"
                />
              </div>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-navy focus:outline-none"
              >
                <option value="ALL">جميع الحالات</option>
                <option value="CREATED">قيد الانتظار</option>
                <option value="RECEIVED_AT_WAREHOUSE">في المستودع</option>
                <option value="OUT_FOR_DELIVERY">في الطريق</option>
                <option value="DELIVERED">تم التسليم</option>
                <option value="DELIVERY_FAILED">فشل التسليم</option>
                <option value="RETURNED_TO_WAREHOUSE">مُعاد للمستودع</option>
              </select>
            </div>
          </div>

          {filteredShipments.length === 0 ? (
            <EmptyState title="لا توجد شحنات مطابقة" description="جرب تغيير معايير البحث أو الفلترة" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-medium">
                    <th className="pb-3 pr-2">رقم التتبع</th>
                    <th className="pb-3">التاجر</th>
                    <th className="pb-3">المستلم</th>
                    <th className="pb-3">الهاتف</th>
                    <th className="pb-3">المنطقة</th>
                    <th className="pb-3">الوزن</th>
                    <th className="pb-3">مبلغ COD</th>
                    <th className="pb-3">المندوب</th>
                    <th className="pb-3">الحالة</th>
                    <th className="pb-3 pl-2">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredShipments.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 pr-2 font-mono font-bold text-twsela-blue">{s.trackingNumber}</td>
                      <td className="py-3 font-medium text-navy">{s.senderMerchant}</td>
                      <td className="py-3 text-slate-700">{s.recipientName}</td>
                      <td className="py-3 font-mono text-slate-500">{s.recipientPhone}</td>
                      <td className="py-3 text-slate-600">{s.destinationZone}</td>
                      <td className="py-3 font-mono text-slate-500">{s.packageWeightKg} كجم</td>
                      <td className="py-3 font-bold font-mono text-emerald-600">
                        {s.codAmountEgp ? `${s.codAmountEgp} EGP` : '—'}
                      </td>
                      <td className="py-3 text-slate-600">{s.courierName || '—'}</td>
                      <td className="py-3"><Badge status={s.status} /></td>
                      <td className="py-3 pl-2 flex items-center gap-1">
                        <button
                          onClick={() => setSelectedShipment(s)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-twsela-blue hover:text-white transition text-[11px] font-medium"
                        >
                          عرض
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── COURIERS TAB ── */}
      {activeTab === 'couriers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {couriers.map(c => (
              <div key={c.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {c.status === 'ACTIVE' ? 'نشط في الميدان' : c.status === 'BREAK' ? 'في استراحة' : 'Offline'}
                  </span>
                  <span className="text-xs font-mono font-bold text-twsela-gold">⭐ {c.averageRating}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-twsela-blue/10 text-twsela-blue flex items-center justify-center font-bold text-base">
                    {c.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-navy">{c.name}</h4>
                    <p className="text-xs text-slate-500 font-mono">{c.phone}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block">المنطقة</span>
                    <span className="font-semibold text-navy">{c.zone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">المركبة</span>
                    <span className="font-semibold text-navy truncate block">{c.vehicleType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">تسليمات اليوم</span>
                    <span className="font-bold font-mono text-twsela-blue">{c.todayDeliveries}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">COD محصَّل</span>
                    <span className="font-bold font-mono text-emerald-600">{c.todayCodCollectedEgp} EGP</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MERCHANTS TAB ── */}
      {activeTab === 'merchants' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-navy flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="w-4 h-4 text-twsela-blue" />
            <span>سجل التجار المشتركين بالمنصة</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-medium">
                  <th className="pb-3 pr-2">اسم المتجر</th>
                  <th className="pb-3">الباقة</th>
                  <th className="pb-3">شحنات الشهر</th>
                  <th className="pb-3">الحد الأقصى (Quota)</th>
                  <th className="pb-3">نسبة الاستهلاك</th>
                  <th className="pb-3">المستخدمون</th>
                  <th className="pb-3 pl-2">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tenants.map(t => {
                  const percent = Math.min(100, Math.round((t.activeShipmentsMonth / t.quotaShipmentsMonth) * 100));
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 pr-2 font-bold text-navy">{t.companyNameAr} ({t.companyName})</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-twsela-blue/10 text-twsela-blue">
                          {t.planTier}
                        </span>
                      </td>
                      <td className="py-3 font-mono font-bold">{t.activeShipmentsMonth}</td>
                      <td className="py-3 font-mono text-slate-500">{t.quotaShipmentsMonth}</td>
                      <td className="py-3 w-40">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-twsela-blue rounded-full"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] font-bold text-slate-600">{percent}%</span>
                        </div>
                      </td>
                      <td className="py-3 font-mono">{t.activeUsers} مستخدمين</td>
                      <td className="py-3 pl-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                          {t.status === 'ACTIVE' ? 'نشط' : 'قيد المراجعة'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── WALLETS & SETTLEMENTS TAB ── */}
      {activeTab === 'wallets' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard title="إجمالي أرصدة المحافظ" value="84,320 EGP" accentColor="#00c48c" />
            <KpiCard title="طلبات سحب بانتظار الموافقة" value={payouts.filter(p => p.status === 'PENDING').length} accentColor="#f5a623" />
            <KpiCard title="تسويات اليوم المكتملة" value="28,400 EGP" accentColor="#1a70d8" />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-navy border-b border-slate-100 pb-3 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-twsela-teal" />
              <span>طلبات السحب النقدي والتسويات البنكية المعلقة</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-medium">
                    <th className="pb-3 pr-2">المستفيد</th>
                    <th className="pb-3">النوع</th>
                    <th className="pb-3">المبلغ المطلوب</th>
                    <th className="pb-3">الحساب البنكي / IBAN</th>
                    <th className="pb-3">وقت الطلب</th>
                    <th className="pb-3">الحالة</th>
                    <th className="pb-3 pl-2">إجراء المراجعة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payouts.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 pr-2 font-bold text-navy">{p.name}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {p.type}
                        </span>
                      </td>
                      <td className="py-3 font-mono font-bold text-sm text-navy">{p.amount.toLocaleString()} EGP</td>
                      <td className="py-3 font-mono text-slate-500">{p.bank}</td>
                      <td className="py-3 text-slate-500">{p.time}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            p.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700'
                              : p.status === 'REJECTED'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {p.status === 'COMPLETED' ? 'تمت الموافقة' : p.status === 'REJECTED' ? 'مرفوض' : 'قيد المراجعة'}
                        </span>
                      </td>
                      <td className="py-3 pl-2">
                        {p.status === 'PENDING' ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleApprovePayout(p.id, p.amount)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>موافقة</span>
                            </button>
                            <button
                              onClick={() => handleRejectPayout(p.id)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-rose-50 text-rose-600 font-bold text-[11px] transition"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>رفض</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">تمت المعالجة</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── SYSTEM HEALTH TAB ── */}
      {activeTab === 'system' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-navy border-b border-slate-100 pb-3 flex items-center gap-2">
            <Settings className="w-4 h-4 text-twsela-blue" />
            <span>لوحة فحص خوادم Spring Boot وخدمات البنية التحتية</span>
          </h3>

          <div className="space-y-3">
            {services.map((svc, sIdx) => (
              <div key={sIdx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <h4 className="text-xs font-bold text-navy">{svc.name}</h4>
                    <p className="text-[11px] text-slate-500">{svc.details}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-left">
                  <span className="font-mono text-xs text-slate-500">{svc.latencyMs} ms</span>
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100/80 text-emerald-800">
                    نشط (UP)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── AUDIT LOG TAB ── */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-navy border-b border-slate-100 pb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-twsela-purple" />
            <span>سجل الأحداث الأمني (Security Audit Log)</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-medium">
                  <th className="pb-3 pr-2">الوقت</th>
                  <th className="pb-3">الإجراء</th>
                  <th className="pb-3">المستخدم / الفاعل</th>
                  <th className="pb-3">الدور</th>
                  <th className="pb-3">عنوان IP</th>
                  <th className="pb-3 pl-2">النتيجة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 pr-2 text-slate-400">{log.time}</td>
                    <td className="py-3 font-sans font-medium text-navy">{log.action}</td>
                    <td className="py-3 font-sans font-semibold text-slate-700">{log.actor}</td>
                    <td className="py-3 text-slate-500">{log.role}</td>
                    <td className="py-3 text-slate-400">{log.ipAddress}</td>
                    <td className="py-3 pl-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── SHIPMENT DETAIL MODAL ── */}
      {selectedShipment && (
        <Modal
          isOpen={!!selectedShipment}
          onClose={() => setSelectedShipment(null)}
          title={`تفاصيل الشحنة ${selectedShipment.trackingNumber}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[11px]">التاجر المرسل:</span>
                <span className="font-bold text-navy">{selectedShipment.senderMerchant}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">اسم المستلم:</span>
                <span className="font-bold text-navy">{selectedShipment.recipientName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">هاتف المستلم:</span>
                <span className="font-mono text-navy font-bold">{selectedShipment.recipientPhone}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">مبلغ التحصيل (COD):</span>
                <span className="font-bold font-mono text-emerald-600 text-sm">{selectedShipment.codAmountEgp} EGP</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[11px]">العنوان بالتفصيل:</span>
                <span className="font-medium text-navy">{selectedShipment.destinationAddress} ({selectedShipment.destinationZone})</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-navy mb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-twsela-blue" />
                <span>سجل تتبع الشحنة الزمني (Timeline)</span>
              </h4>
              <div className="space-y-2 border-r-2 border-slate-200 pr-3 mr-1">
                {selectedShipment.timeline.map((ev, eIdx) => (
                  <div key={eIdx} className="relative">
                    <span className="absolute -right-[19px] top-1 w-2.5 h-2.5 rounded-full bg-twsela-blue ring-4 ring-white" />
                    <div className="font-bold text-navy">{ev.statusLabelAr}</div>
                    <div className="text-[11px] text-slate-400">{ev.timestamp} · {ev.location} بواسطة {ev.actorName}</div>
                    {ev.notes && <div className="text-[11px] text-slate-600 mt-0.5">{ev.notes}</div>}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedShipment(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-navy font-bold transition"
              >
                إغلاق
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
