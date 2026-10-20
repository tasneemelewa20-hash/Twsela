import React, { useState, useEffect } from 'react';
import { ShipmentDTO, WalletSummary } from '../../types';
import { fetchShipments, createShipment, CreateShipmentPayload } from '../../api/shipments';
import { fetchWallet, requestPayout } from '../../api/finance';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';
import { KpiCard } from '../../components/common/KpiCard';
import { Modal } from '../../components/common/Modal';
import {
  Package,
  Plus,
  Wallet,
  Settings,
  Upload,
  Download,
  CheckCircle2,
  Clock,
  Eye,
  Key,
  Globe,
  Copy
} from 'lucide-react';

interface MerchantPortalProps {
  activeTab: string;
}

export const MerchantPortal: React.FC<MerchantPortalProps> = ({ activeTab }) => {
  const { showToast } = useToast();
  const [shipments, setShipments] = useState<ShipmentDTO[]>([]);
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [selectedShipment, setSelectedShipment] = useState<ShipmentDTO | null>(null);
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<CreateShipmentPayload>({
    recipientName: '',
    recipientPhone: '',
    destinationAddress: '',
    destinationZone: 'القاهرة',
    packageWeightKg: 1.0,
    codAmountEgp: 250,
    serviceType: 'STANDARD_24H',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Payout Form State
  const [payoutAmount, setPayoutAmount] = useState<number>(3000);
  const [bankName, setBankName] = useState<string>('البنك الأهلي المصري');
  const [accountNumber, setAccountNumber] = useState<string>('EG1200030001000000000123456');

  const loadData = async () => {
    try {
      const [sList, wData] = await Promise.all([
        fetchShipments({ merchantId: 3 }),
        fetchWallet()
      ]);
      setShipments(sList);
      setWallet(wData);
    } catch (_) {
      showToast('خطأ أثناء تحميل بيانات التاجر', 'error');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.recipientName.trim()) {
      showToast('يرجى إدخال اسم المستلم', 'error');
      return;
    }
    if (!formData.recipientPhone.trim() || formData.recipientPhone.length < 10) {
      showToast('يرجى إدخال رقم هاتف صحيح (مثال: 01012345678)', 'error');
      return;
    }
    if (!formData.destinationAddress.trim()) {
      showToast('يرجى إدخال العنوان بالتفصيل', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const newShipment = await createShipment(formData);
      setShipments(prev => [newShipment, ...prev]);
      showToast(`تم إنشاء الشحنة بنجاح برقم تتبع: ${newShipment.trackingNumber}`, 'success');
      // Reset form
      setFormData({
        recipientName: '',
        recipientPhone: '',
        destinationAddress: '',
        destinationZone: 'القاهرة',
        packageWeightKg: 1.0,
        codAmountEgp: 0,
        serviceType: 'STANDARD_24H',
        notes: ''
      });
    } catch (err: any) {
      showToast(err.message || 'فشل إنشاء الشحنة', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutAmount || payoutAmount <= 0) {
      showToast('يرجى إدخال مبلغ سحب صحيح', 'error');
      return;
    }
    try {
      const resp = await requestPayout(payoutAmount, bankName, accountNumber);
      showToast(resp.message, 'success');
      setPayoutModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'فشل تقديم طلب السحب', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* ── DASHBOARD TAB ── */}
      {activeTab === 'dashboard' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="إجمالي شحنات المتجر"
              value={shipments.length}
              change="+14% هذا الشهر"
              isPositive={true}
              accentColor="#1a70d8"
              icon={<Package className="w-4 h-4 text-twsela-blue" />}
            />
            <KpiCard
              title="رصيد المحفظة المتاح"
              value={`${wallet?.currentBalanceEgp.toLocaleString() || '12,400'} EGP`}
              change="جاهز للتحويل البنكي"
              isPositive={true}
              accentColor="#00c48c"
              icon={<Wallet className="w-4 h-4 text-twsela-teal" />}
            />
            <KpiCard
              title="COD قيد التحصيل"
              value={`${wallet?.pendingCodEgp.toLocaleString() || '3,850'} EGP`}
              change="مع المندوبين"
              accentColor="#f5a623"
              icon={<Clock className="w-4 h-4 text-twsela-gold" />}
            />
            <KpiCard
              title="معدل نجاح التسليم"
              value="96.4%"
              change="أعلى من متوسط المنصة"
              isPositive={true}
              accentColor="#7c3aed"
              icon={<CheckCircle2 className="w-4 h-4 text-twsela-purple" />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-navy">آخر الشحنات المنشأة</h3>
                <span className="text-xs text-slate-400">متجر الأناقة (Elegance Store)</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-medium">
                      <th className="pb-3 pr-2">رقم التتبع</th>
                      <th className="pb-3">المستلم</th>
                      <th className="pb-3">المنطقة</th>
                      <th className="pb-3">مبلغ COD</th>
                      <th className="pb-3">الحالة</th>
                      <th className="pb-3 pl-2">عرض</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {shipments.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 pr-2 font-mono font-bold text-twsela-blue">{s.trackingNumber}</td>
                        <td className="py-3 font-medium text-navy">{s.recipientName}</td>
                        <td className="py-3 text-slate-500">{s.destinationZone}</td>
                        <td className="py-3 font-mono font-bold text-emerald-600">
                          {s.codAmountEgp ? `${s.codAmountEgp} EGP` : '—'}
                        </td>
                        <td className="py-3"><Badge status={s.status} /></td>
                        <td className="py-3 pl-2">
                          <button
                            onClick={() => setSelectedShipment(s)}
                            className="p-1 rounded text-slate-400 hover:text-twsela-blue"
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

            {/* Wallet quick card */}
            <div className="bg-gradient-to-br from-navy via-navy to-twsela-blue text-white rounded-2xl p-6 shadow-md flex flex-col justify-between">
              <div>
                <span className="text-xs text-slate-300">محفظة المتجر الرقمية</span>
                <div className="text-3xl font-bold font-mono mt-2 mb-1">
                  {wallet?.currentBalanceEgp.toLocaleString()} EGP
                </div>
                <p className="text-xs text-slate-300">
                  إجمالي التحصيلات الناجحة منذ الانضمام: <b>{wallet?.lifetimeEarningsEgp.toLocaleString()} EGP</b>
                </p>
              </div>

              <div className="space-y-3 mt-6">
                <button
                  onClick={() => setPayoutModalOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-twsela-teal text-navy font-bold text-xs hover:bg-emerald-400 transition shadow-sm"
                >
                  طلب سحب أرباح للبنك
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── CREATE SHIPMENT TAB ── */}
      {activeTab === 'new-shipment' && (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-navy flex items-center gap-2">
              <Plus className="w-5 h-5 text-twsela-teal" />
              <span>إنشاء شحنة جديدة للعميل</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              سيتم إنشاء بوليصة الشحن وتوليد كود التتبع والباركود تلقائياً
            </p>
          </div>

          <form onSubmit={handleCreateShipment} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">اسم المستلم كاملًا *</label>
                <input
                  type="text"
                  required
                  value={formData.recipientName}
                  onChange={e => setFormData({ ...formData, recipientName: e.target.value })}
                  placeholder="محمد أحمد إبراهيم"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-twsela-blue/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">رقم هاتف المستلم *</label>
                <input
                  type="tel"
                  required
                  value={formData.recipientPhone}
                  onChange={e => setFormData({ ...formData, recipientPhone: e.target.value })}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-twsela-blue/20"
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
                placeholder="اسم الشارع، رقم العمارة، رقم الشقة، علامة مميزة"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-twsela-blue/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">المنطقة / المحافظة</label>
                <select
                  value={formData.destinationZone}
                  onChange={e => setFormData({ ...formData, destinationZone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none"
                >
                  <option value="القاهرة">القاهرة الكبرى</option>
                  <option value="الجيزة">الجيزة</option>
                  <option value="المعادي">المعادي</option>
                  <option value="مصر الجديدة">مصر الجديدة</option>
                  <option value="الإسكندرية">الإسكندرية</option>
                  <option value="الدلتا">محافظات الدلتا</option>
                  <option value="الصعيد">الصعيد</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">الوزن التقديري (كجم)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={formData.packageWeightKg}
                  onChange={e => setFormData({ ...formData, packageWeightKg: parseFloat(e.target.value) || 1.0 })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">مبلغ التحصيل (COD EGP)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.codAmountEgp}
                  onChange={e => setFormData({ ...formData, codAmountEgp: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono font-bold text-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">نوع خدمة الشحن</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'STANDARD_24H', label: 'توصيل خلال 24 ساعة', badge: 'عادي' },
                  { id: 'EXPRESS_48H', label: 'شحن اقتصادي 48 ساعة', badge: 'اقتصادي' },
                  { id: 'SAME_DAY', label: 'توصيل في نفس اليوم', badge: 'سريع VIP' }
                ].map(srv => (
                  <label
                    key={srv.id}
                    className={`flex flex-col p-3 rounded-xl border cursor-pointer transition ${
                      formData.serviceType === srv.id
                        ? 'border-twsela-blue bg-blue-50/50 text-twsela-blue'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="serviceType"
                      value={srv.id}
                      checked={formData.serviceType === srv.id}
                      onChange={() => setFormData({ ...formData, serviceType: srv.id as any })}
                      className="sr-only"
                    />
                    <span className="font-bold text-xs">{srv.label}</span>
                    <span className="text-[10px] text-slate-400 mt-1">{srv.badge}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">ملاحظات للمندوب (اختياري)</label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                placeholder="مثلاً: الاتصال قبل الوصول بنصف ساعة، الباب مفتوح..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-navy hover:bg-navy-light text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm disabled:opacity-50"
              >
                <Plus className="w-4 h-4 text-twsela-teal" />
                <span>{isSubmitting ? 'جاري الإنشاء والتحقق...' : 'تأكيد وإنشاء بوليصة الشحنة'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── MY SHIPMENTS TAB ── */}
      {activeTab === 'shipments' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-navy">شحنات المتجر المسجلة</h3>
            <span className="text-xs text-slate-400 font-mono">{shipments.length} شحنة</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-medium">
                  <th className="pb-3 pr-2">رقم التتبع</th>
                  <th className="pb-3">المستلم</th>
                  <th className="pb-3">الهاتف</th>
                  <th className="pb-3">الوجهة</th>
                  <th className="pb-3">الوزن</th>
                  <th className="pb-3">COD المطلوب</th>
                  <th className="pb-3">الحالة</th>
                  <th className="pb-3 pl-2">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shipments.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 pr-2 font-mono font-bold text-twsela-blue">{s.trackingNumber}</td>
                    <td className="py-3 font-semibold text-navy">{s.recipientName}</td>
                    <td className="py-3 font-mono text-slate-500">{s.recipientPhone}</td>
                    <td className="py-3 text-slate-600">{s.destinationZone}</td>
                    <td className="py-3 font-mono text-slate-500">{s.packageWeightKg} كجم</td>
                    <td className="py-3 font-mono font-bold text-emerald-600">
                      {s.codAmountEgp ? `${s.codAmountEgp} EGP` : '—'}
                    </td>
                    <td className="py-3"><Badge status={s.status} /></td>
                    <td className="py-3 pl-2">
                      <button
                        onClick={() => setSelectedShipment(s)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-navy font-medium text-[11px] transition"
                      >
                        تتبع
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── BULK UPLOAD TAB ── */}
      {activeTab === 'bulk-upload' && (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-navy flex items-center gap-2">
              <Upload className="w-5 h-5 text-twsela-blue" />
              <span>الرفع الجماعي للشحنات (Excel / CSV)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              يمكنك رفع مئات الشحنات بنقرة واحدة عبر نموذج الإكسيل الرسمي
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="font-bold text-xs text-navy">نموذج الإكسيل الرسمي (Template)</div>
              <div className="text-[11px] text-slate-500">يتضمن أعمدة: المستلم، الهاتف، العنوان، المحافظة، COD</div>
            </div>
            <button
              onClick={() => showToast('جاري تنزيل ملف twsela_bulk_template.xlsx', 'success')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-navy transition shadow-sm"
            >
              <Download className="w-4 h-4 text-twsela-teal" />
              <span>تحميل النموذج</span>
            </button>
          </div>

          <div
            onClick={() => showToast('تم اختيار الملف ومعالجة 12 شحنة بنجاح ✓', 'success')}
            className="border-2 border-dashed border-slate-300 hover:border-twsela-blue rounded-2xl p-8 text-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition space-y-3"
          >
            <div className="w-12 h-12 rounded-full bg-twsela-blue/10 text-twsela-blue mx-auto flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-navy">انقر هنا أو اسحب ملف Excel / CSV</div>
              <div className="text-xs text-slate-400 mt-1">يدعم ملفات .xlsx و .csv حتى حجم 15 ميجابايت</div>
            </div>
          </div>
        </div>
      )}

      {/* ── WALLET TAB ── */}
      {activeTab === 'wallet' && wallet && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard
              title="الرصيد المتاح للسحب"
              value={`${wallet.currentBalanceEgp.toLocaleString()} EGP`}
              accentColor="#00c48c"
              isPositive={true}
            />
            <KpiCard
              title="مبالغ COD قيد التسليم"
              value={`${wallet.pendingCodEgp.toLocaleString()} EGP`}
              accentColor="#f5a623"
            />
            <KpiCard
              title="إجمالي الأرباح التاريخية"
              value={`${wallet.lifetimeEarningsEgp.toLocaleString()} EGP`}
              accentColor="#1a70d8"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-navy flex items-center gap-2">
                <Wallet className="w-4 h-4 text-twsela-teal" />
                <span>سجل معاملات المحفظة والتحويلات</span>
              </h3>
              <button
                onClick={() => setPayoutModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-navy hover:bg-navy-light text-white text-xs font-bold transition shadow-sm"
              >
                طلب سحب أرباح
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-medium">
                    <th className="pb-3 pr-2">رقم المعاملة</th>
                    <th className="pb-3">النوع</th>
                    <th className="pb-3">الوصف</th>
                    <th className="pb-3">المبلغ</th>
                    <th className="pb-3">التاريخ</th>
                    <th className="pb-3 pl-2">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {wallet.transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 pr-2 font-mono font-bold text-slate-500">{tx.referenceCode}</td>
                      <td className="py-3 font-semibold text-navy">{tx.typeLabelAr}</td>
                      <td className="py-3 text-slate-600">{tx.description}</td>
                      <td
                        className={`py-3 font-mono font-bold ${
                          tx.amountEgp > 0 ? 'text-emerald-600' : 'text-slate-800'
                        }`}
                      >
                        {tx.amountEgp > 0 ? `+${tx.amountEgp}` : tx.amountEgp} EGP
                      </td>
                      <td className="py-3 text-slate-400 font-mono">{tx.timestamp}</td>
                      <td className="py-3 pl-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            tx.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {tx.status === 'COMPLETED' ? 'مكتمل' : 'معلق'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── INTEGRATIONS TAB ── */}
      {activeTab === 'integrations' && (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-navy flex items-center gap-2">
              <Key className="w-5 h-5 text-twsela-blue" />
              <span>مفاتيح الربط البرمجي (API Credentials)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              استخدم هذه المفاتيح لربط متجرك الإلكتروني على Shopify أو WooCommerce أو منصتك الخاصة
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Public Merchant Key</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value="tws_pk_live_8492048209420842094"
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-mono text-slate-600 text-xs"
                />
                <button
                  onClick={() => showToast('تم نسخ المفتاح العام للحافظة', 'success')}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Secret API Key</label>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  readOnly
                  value="tws_sk_live_secret_key_hidden_token_demo"
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-mono text-slate-600 text-xs"
                />
                <button
                  onClick={() => showToast('تم توليد مفتاح جديد بنجاح', 'success')}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold hover:bg-slate-50"
                >
                  إعادة توليد
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="font-bold text-navy mb-2 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-twsela-teal" />
                <span>رابط إشعارات الويب (Webhook URL)</span>
              </h4>
              <input
                type="url"
                defaultValue="https://elegancestore.com/api/twsela-webhook"
                placeholder="https://yourstore.com/api/webhook"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-xs focus:outline-none"
              />
              <button
                onClick={() => showToast('تم حفظ رابط الويب هوك بنجاح', 'success')}
                className="mt-3 px-4 py-2 rounded-xl bg-navy text-white text-xs font-bold hover:bg-navy-light transition"
              >
                حفظ الإعدادات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PAYOUT REQUEST MODAL ── */}
      <Modal
        isOpen={payoutModalOpen}
        onClose={() => setPayoutModalOpen(false)}
        title="طلب تحويل أرباح لحسابك البنكي"
        maxWidth="md"
      >
        <form onSubmit={handleRequestPayout} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">المبلغ المطلوب سحبه (EGP)</label>
            <input
              type="number"
              min="100"
              max={wallet?.currentBalanceEgp || 12400}
              value={payoutAmount}
              onChange={e => setPayoutAmount(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-base font-bold text-navy focus:outline-none"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              الرصيد المتاح: {wallet?.currentBalanceEgp.toLocaleString()} EGP
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">اسم البنك</label>
            <select
              value={bankName}
              onChange={e => setBankName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
            >
              <option>البنك الأهلي المصري (NBE)</option>
              <option>بنك مصر (Banque Misr)</option>
              <option>البنك التجاري الدولي (CIB)</option>
              <option>بنك قطر الوطني (QNB)</option>
              <option>محفظة فودافون كاش / إنستاباي</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">رقم الحساب / الآيبان (IBAN)</label>
            <input
              type="text"
              required
              value={accountNumber}
              onChange={e => setAccountNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-xs focus:outline-none"
            />
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-twsela-teal text-navy font-bold text-xs hover:bg-emerald-400 transition"
            >
              تأكيد طلب السحب
            </button>
            <button
              type="button"
              onClick={() => setPayoutModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
            >
              إلغاء
            </button>
          </div>
        </form>
      </Modal>

      {/* ── TIMELINE MODAL ── */}
      {selectedShipment && (
        <Modal
          isOpen={!!selectedShipment}
          onClose={() => setSelectedShipment(null)}
          title={`تتبع الشحنة ${selectedShipment.trackingNumber}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 block text-[11px]">المستلم:</span>
                <span className="font-bold text-navy">{selectedShipment.recipientName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">الحالة الحالية:</span>
                <Badge status={selectedShipment.status} />
              </div>
            </div>

            <div className="space-y-3 border-r-2 border-twsela-blue pr-3 mr-1">
              {selectedShipment.timeline.map((ev, idx) => (
                <div key={idx} className="relative">
                  <span className="absolute -right-[19px] top-1 w-2.5 h-2.5 rounded-full bg-twsela-blue ring-4 ring-white" />
                  <div className="font-bold text-navy">{ev.statusLabelAr}</div>
                  <div className="text-[11px] text-slate-400">{ev.timestamp} · {ev.location}</div>
                  {ev.notes && <div className="text-[11px] text-slate-600">{ev.notes}</div>}
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedShipment(null)}
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-navy font-bold text-xs transition"
            >
              إغلاق
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
