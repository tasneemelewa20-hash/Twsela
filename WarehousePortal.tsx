import React, { useState, useEffect } from 'react';
import { WarehouseBin, Manifest } from '../../types';
import { fetchWarehouseBins, assignBinToPackage, fetchManifests, dispatchManifest } from '../../api/warehouse';
import { useToast } from '../../context/ToastContext';
import { BinMapGrid } from '../../components/warehouse/BinMapGrid';
import { KpiCard } from '../../components/common/KpiCard';
import {
  Inbox,
  QrCode,
  Grid,
  FileText,
  Truck,
  CheckCircle2,
  Printer,
  Search,
  Check,
  Package
} from 'lucide-react';

interface WarehousePortalProps {
  activeTab: string;
  onNavigateTab: (tab: string) => void;
}

export const WarehousePortal: React.FC<WarehousePortalProps> = ({ activeTab, onNavigateTab }) => {
  const { showToast } = useToast();
  const [bins, setBins] = useState<WarehouseBin[]>([]);
  const [manifests, setManifests] = useState<Manifest[]>([]);
  const [selectedBin, setSelectedBin] = useState<WarehouseBin | null>(null);

  // Scan & Intake state
  const [barcodeInput, setBarcodeInput] = useState('TW-7702');
  const [targetBinKey, setTargetBinKey] = useState('A4');
  const [measuredWeight, setMeasuredWeight] = useState(0.8);

  const loadData = async () => {
    try {
      const [bList, mList] = await Promise.all([
        fetchWarehouseBins(),
        fetchManifests()
      ]);
      setBins(bList);
      setManifests(mList);
    } catch (_) {
      showToast('خطأ أثناء تحميل بيانات المستودع', 'error');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssignBin = async (code = barcodeInput, binKey = targetBinKey) => {
    if (!code.trim() || !binKey.trim()) {
      showToast('يرجى تحديد كود الطرد ورقم الصينية', 'error');
      return;
    }
    try {
      const res = await assignBinToPackage(code, binKey, measuredWeight);
      showToast(`تم استلام الطرد وتخصيص الصينية ${binKey} بنجاح ✓`, 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'فشل تخصيص الصينية', 'error');
    }
  };

  const handleDispatch = async (manifestId: string) => {
    try {
      const res = await dispatchManifest(manifestId);
      showToast(res.message, 'success');
      loadData();
    } catch (_) {
      showToast('خطأ أثناء إطلاق بيان الشحن', 'error');
    }
  };

  const usedBinsCount = bins.filter(b => b.status === 'used').length;
  const freeBinsCount = bins.filter(b => b.status === 'free').length;
  const heldBinsCount = bins.filter(b => b.status === 'held').length;
  const capacityPercent = Math.round((usedBinsCount / (bins.length || 60)) * 100);

  return (
    <div className="space-y-6">
      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <>
          <div className="bg-gradient-to-r from-navy via-twsela-blue to-twsela-purple text-white rounded-2xl p-6 shadow-md">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-300">مستودع الفرز والتوزيع الرئيسي</span>
                <h2 className="text-2xl font-bold tracking-tight mt-1">Hub 01 — القاهرة المركزي</h2>
                <p className="text-xs text-slate-300 mt-1">وردية الصباح جارية · 48 طرد وارد اليوم</p>
              </div>
              <div className="flex items-center gap-4 bg-white/10 p-3 rounded-xl border border-white/10">
                <div className="text-center">
                  <div className="text-2xl font-bold font-mono text-twsela-gold">{capacityPercent}%</div>
                  <div className="text-[10px] text-slate-300">الطاقة المستخدمة</div>
                </div>
                <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-twsela-gold rounded-full" style={{ width: `${capacityPercent}%` }} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-white/10 text-center">
              <div className="bg-white/10 rounded-xl p-2.5">
                <div className="text-lg font-bold font-mono text-twsela-teal">48</div>
                <div className="text-[10px] text-slate-300">وارد اليوم</div>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5">
                <div className="text-lg font-bold font-mono">{usedBinsCount}</div>
                <div className="text-[10px] text-slate-300">صواني مشغولة</div>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5">
                <div className="text-lg font-bold font-mono text-emerald-400">{freeBinsCount}</div>
                <div className="text-[10px] text-slate-300">صواني شاغرة</div>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5">
                <div className="text-lg font-bold font-mono">3</div>
                <div className="text-[10px] text-slate-300">مركبات شحن</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Intake list */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-navy flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-twsela-blue" />
                  <span>آخر الطرود الواردة بانتظار الفرز</span>
                </h3>
                <button
                  onClick={() => onNavigateTab('intake')}
                  className="text-xs text-twsela-blue font-bold hover:underline"
                >
                  عرض الكل
                </button>
              </div>

              <div className="space-y-2">
                {[
                  { code: 'TW-7701', merchant: 'متجر الأناقة', weight: '1.2 كجم', bin: 'A3', status: 'تم الفرز' },
                  { code: 'TW-7702', merchant: 'تك ستور', weight: '0.8 كجم', bin: 'A4', status: 'جاهز للتخصيص' },
                  { code: 'TW-7703', merchant: 'بوتيك ريم', weight: '2.1 كجم', bin: 'B5', status: 'تم الفرز' },
                  { code: 'TW-7704', merchant: 'فريش ماركت', weight: '3.5 كجم', bin: 'C1', status: 'جاهز للتخصيص' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-twsela-blue">{item.code}</span>
                      <span className="font-semibold text-navy">{item.merchant}</span>
                      <span className="text-slate-400 font-mono">{item.weight}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-twsela-blue">
                        الصينية {item.bin}
                      </span>
                      <button
                        onClick={() => handleAssignBin(item.code, item.bin)}
                        className="px-2 py-1 rounded bg-twsela-teal text-navy font-bold text-[11px]"
                      >
                        تأكيد
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Manifests mini card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-navy flex items-center gap-2">
                  <Truck className="w-4 h-4 text-twsela-teal" />
                  <span>بيانات شحن المركبات</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">{manifests.length} سيارات</span>
              </div>

              <div className="space-y-3">
                {manifests.map(m => (
                  <div key={m.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50 space-y-2 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-navy">{m.vehiclePlate}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] ${
                          m.status === 'DISPATCHED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {m.status === 'DISPATCHED' ? 'انطلقت في المسار' : 'جارٍ التحميل'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      السائق: <b>{m.courierName}</b> · {m.loadedShipments}/{m.totalShipments} طرد
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-twsela-blue rounded-full"
                        style={{ width: `${(m.loadedShipments / m.totalShipments) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── INTAKE & SCAN TAB ── */}
      {(activeTab === 'intake' || activeTab === 'scan') && (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-navy flex items-center gap-2">
              <QrCode className="w-5 h-5 text-twsela-teal" />
              <span>استلام الطرد وتخصيص صينية التخزين الفوري</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              امسح باركود الشحنة مع قياس الوزن الفعلي لحفظها على الرف المخصص
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">رقم الباركود / التتبع</label>
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={e => setBarcodeInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-base font-bold text-twsela-blue focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">الوزن الفعلي بالميزان (كجم)</label>
                <input
                  type="number"
                  step="0.1"
                  value={measuredWeight}
                  onChange={e => setMeasuredWeight(parseFloat(e.target.value) || 0.8)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-base font-bold text-navy focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">الصينية المقترحة (Aisle / Bin Slot)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={targetBinKey}
                  onChange={e => setTargetBinKey(e.target.value.toUpperCase())}
                  className="w-32 px-3 py-2 rounded-lg border border-slate-200 font-mono text-base font-bold text-emerald-600 focus:outline-none text-center"
                />
                <button
                  type="button"
                  onClick={() => {
                    const free = bins.find(b => b.status === 'free');
                    if (free) {
                      setTargetBinKey(free.key);
                      showToast(`تم اقتراح الصينية الشاغرة: ${free.key}`, 'info');
                    }
                  }}
                  className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 font-medium text-xs text-slate-700"
                >
                  اقتراح صينية شاغرة
                </button>
              </div>
            </div>

            <button
              onClick={() => handleAssignBin()}
              className="w-full py-3 rounded-xl bg-navy hover:bg-navy-light text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm"
            >
              <Check className="w-4 h-4 text-twsela-teal" />
              <span>تسجيل الاستلام وتأكيد التخزين في الصينية</span>
            </button>
          </div>
        </div>
      )}

      {/* ── BIN MAP TAB ── */}
      {activeTab === 'binmap' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-navy flex items-center gap-2">
                <Grid className="w-5 h-5 text-twsela-blue" />
                <span>خريطة صواني وأرفف المستودع التفاعلية (Aisles A-F)</span>
              </h3>
              <p className="text-xs text-slate-400">
                إجمالي 60 صينية تخزين · اضغط على أي صينية لعرض بيانات الطرد الشاغل
              </p>
            </div>
            <button
              onClick={() => showToast('تم تصدير مخطط الصواني بصيغة PDF', 'success')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-navy"
            >
              <Printer className="w-4 h-4 text-twsela-blue" />
              <span>طباعة المخطط</span>
            </button>
          </div>

          <BinMapGrid
            bins={bins}
            selectedBinKey={selectedBin?.key}
            onSelectBin={bin => setSelectedBin(bin)}
          />
        </div>
      )}

      {/* ── MANIFEST & DISPATCH TAB ── */}
      {(activeTab === 'manifest' || activeTab === 'dispatch') && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {manifests.map(m => (
              <div key={m.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-twsela-blue">{m.manifestNumber}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      m.status === 'DISPATCHED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-blue-50 text-twsela-blue border border-blue-200'
                    }`}
                  >
                    {m.status === 'DISPATCHED' ? 'تم الإطلاق' : 'قيد التحميل'}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-navy">{m.vehiclePlate}</h4>
                  <p className="text-xs text-slate-500">المندوب المسؤول: <b>{m.courierName}</b></p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">عدد الشحنات:</span>
                    <span className="font-bold text-navy">{m.loadedShipments}/{m.totalShipments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">إجمالي COD:</span>
                    <span className="font-bold text-emerald-600">{m.totalCodEgp.toLocaleString()} EGP</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={() => showToast(`تمت طباعة بوليصة وبيان شحن ${m.manifestNumber} بنجاح ✓`, 'success')}
                    className="flex-1 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>طباعة</span>
                  </button>
                  {m.status !== 'DISPATCHED' && (
                    <button
                      onClick={() => handleDispatch(m.id)}
                      className="flex-1 py-2 rounded-lg bg-navy hover:bg-navy-light text-white font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5 text-twsela-teal" />
                      <span>إطلاق المركبة</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
