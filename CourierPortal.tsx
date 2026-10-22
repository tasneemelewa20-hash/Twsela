import React, { useState, useEffect } from 'react';
import { DeliveryStop, ProofOfDeliveryRequest, FailedAttemptRequest } from '../../types';
import { fetchCourierRoute, submitProofOfDelivery, reportFailedAttempt, handoverCodToCashier } from '../../api/couriers';
import { useToast } from '../../context/ToastContext';
import { SignatureCanvas } from '../../components/courier/SignatureCanvas';
import { Modal } from '../../components/common/Modal';
import {
  CheckCircle2,
  Clock,
  Phone,
  Navigation,
  QrCode,
  AlertTriangle,
  Camera,
  FileSignature,
  MessageSquare,
  Wallet,
  Star,
  Search,
  Check
} from 'lucide-react';

interface CourierPortalProps {
  activeTab: string;
  onNavigateTab: (tab: string) => void;
}

export const CourierPortal: React.FC<CourierPortalProps> = ({ activeTab, onNavigateTab }) => {
  const { showToast } = useToast();
  const [stops, setStops] = useState<DeliveryStop[]>([]);
  const [shiftHours, setShiftHours] = useState('07:24:12');

  // PoD State
  const [podMethod, setPodMethod] = useState<'SIGNATURE' | 'PHOTO' | 'OTP'>('SIGNATURE');
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [collectedCod, setCollectedCod] = useState(250);
  const [podNotes, setPodNotes] = useState('');

  // Failed Attempt State
  const [failReason, setFailReason] = useState<FailedAttemptRequest['reason']>('NO_ANSWER');
  const [failNotes, setFailNotes] = useState('');

  // Scan state
  const [manualCode, setManualCode] = useState('');
  const [scannedResult, setScannedResult] = useState<DeliveryStop | null>(null);

  // COD Handover State
  const [handoverAmount, setHandoverAmount] = useState(350);
  const [cashierName, setCashierName] = useState('أحمد الطيب — المستودع الرئيسي');

  const loadRoute = async () => {
    try {
      const data = await fetchCourierRoute();
      setStops(data);
    } catch (_) {
      showToast('خطأ أثناء تحميل مسار اليوم', 'error');
    }
  };

  useEffect(() => {
    loadRoute();
  }, []);

  const currentStop = stops.find(s => s.isCurrent) || stops[1] || stops[0];
  const completedStops = stops.filter(s => s.isCompleted).length;
  const totalStops = stops.length || 15;

  const handleConfirmDelivery = async () => {
    if (!currentStop) return;

    if (podMethod === 'SIGNATURE' && !signatureData) {
      showToast('يرجى أخذ توقيع المستلم على الشاشة أولاً', 'error');
      return;
    }
    if (podMethod === 'OTP' && otpCode.length < 4) {
      showToast('يرجى إدخال رمز التحقق (OTP) المكون من 4 أرقام', 'error');
      return;
    }

    try {
      const req: ProofOfDeliveryRequest = {
        shipmentId: currentStop.shipment.id,
        podType: podMethod,
        signatureData: signatureData || undefined,
        photoUrl: photoTaken ? 'https://twsela.com/uploads/pod-photo-demo.jpg' : undefined,
        otpCode: otpCode || undefined,
        codCollectedEgp: collectedCod,
        recipientNotes: podNotes
      };
      const res = await submitProofOfDelivery(req);
      showToast(res.message, 'success');
      loadRoute();
      onNavigateTab('shift');
    } catch (err: any) {
      showToast(err.message || 'فشل تأكيد التسليم', 'error');
    }
  };

  const handleReportFailed = async () => {
    if (!currentStop) return;

    const reasonLabels = {
      CUSTOMER_UNAVAILABLE: 'العميل غير متواجد',
      NO_ANSWER: 'لا يرد على الهاتف',
      REFUSED_COD: 'رفض الاستلام / رفض سداد COD',
      WRONG_ADDRESS: 'العنوان غير صحيح',
      POSTPONED_BY_CUSTOMER: 'طلب تأجيل الموعد',
      OTHER: 'سبب آخر'
    };

    try {
      const req: FailedAttemptRequest = {
        shipmentId: currentStop.shipment.id,
        reason: failReason,
        reasonLabelAr: reasonLabels[failReason] || failReason,
        notes: failNotes
      };
      const res = await reportFailedAttempt(req);
      showToast(res.message, 'error');
      loadRoute();
      onNavigateTab('route');
    } catch (err: any) {
      showToast(err.message || 'فشل تسجيل المحاولة', 'error');
    }
  };

  const handleSimulateScan = () => {
    const target = stops.find(s => !s.isCompleted) || stops[0];
    setScannedResult(target);
    showToast(`تم مسح الباركود بنجاح: ${target.shipment.trackingNumber}`, 'success');
  };

  const handleManualSearch = () => {
    if (!manualCode.trim()) {
      showToast('أدخل رقم التتبع', 'error');
      return;
    }
    const found = stops.find(s => s.shipment.trackingNumber.toLowerCase() === manualCode.toLowerCase().trim());
    if (found) {
      setScannedResult(found);
      showToast(`تم العثور على الشحنة ${found.shipment.trackingNumber}`, 'success');
    } else {
      showToast(`لم يتم العثور على شحنة بالرقم ${manualCode}`, 'error');
    }
  };

  const handleCodHandover = async () => {
    try {
      const res = await handoverCodToCashier(handoverAmount, cashierName);
      showToast(res.message, 'success');
      onNavigateTab('shift');
    } catch (_) {
      showToast('خطأ أثناء تسجيل تسليم النقدية', 'error');
    }
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* ── SHIFT TAB ── */}
      {activeTab === 'shift' && (
        <div className="space-y-4">
          {/* Shift Hero Banner */}
          <div className="bg-gradient-to-br from-navy via-[#0c2d54] to-twsela-blue text-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-300">ساعات الوردية الجارية</span>
                <div className="text-3xl lg:text-4xl font-bold font-mono tracking-wider mt-1 mb-1">
                  {shiftHours}
                </div>
                <div className="text-xs text-slate-300">بدأت 08:30 · تنتهي 16:30 · منطقة المعادي</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-300 mb-1">تقدم التسليم</div>
                <div className="w-16 h-16 rounded-full border-4 border-twsela-teal/30 border-t-twsela-teal flex items-center justify-center font-bold font-mono text-base">
                  {completedStops}/{totalStops}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mt-5 pt-4 border-t border-white/10 text-center">
              <div className="bg-white/10 rounded-xl p-2.5">
                <div className="text-lg font-bold font-mono text-twsela-teal">{completedStops}</div>
                <div className="text-[10px] text-slate-300">مُسلَّم</div>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5">
                <div className="text-lg font-bold font-mono">{totalStops - completedStops}</div>
                <div className="text-[10px] text-slate-300">متبقي</div>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5">
                <div className="text-lg font-bold font-mono text-twsela-gold">350</div>
                <div className="text-[10px] text-slate-300">COD محصَّل</div>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5">
                <div className="text-lg font-bold font-mono">⭐ 4.9</div>
                <div className="text-[10px] text-slate-300">التقييم</div>
              </div>
            </div>
          </div>

          {/* Current Stop Spotlight Card */}
          {currentStop && (
            <div className="bg-white rounded-2xl border-2 border-twsela-blue/30 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-twsela-blue text-white flex items-center justify-center font-bold font-mono text-xs">
                    {currentStop.stopNumber}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-navy">الوقفة الحالية التالية</h3>
                    <p className="text-[11px] text-slate-400">الوصول المتوقع: {currentStop.eta}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-twsela-blue border border-blue-200">
                  الآن (المحطة النشطة)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[11px]">رقم التتبع:</span>
                  <span className="font-mono font-bold text-twsela-blue">{currentStop.shipment.trackingNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">اسم المستلم:</span>
                  <span className="font-bold text-navy">{currentStop.shipment.recipientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">مبلغ التحصيل (COD):</span>
                  <span className="font-bold font-mono text-emerald-600 text-sm">
                    {currentStop.shipment.codAmountEgp} EGP
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-slate-400 block text-[11px]">العنوان:</span>
                  <span className="font-medium text-navy">{currentStop.shipment.destinationAddress}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <button
                  onClick={() => onNavigateTab('deliver')}
                  className="py-2.5 px-3 rounded-xl bg-twsela-teal hover:bg-emerald-400 text-navy font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تسجيل تسليم</span>
                </button>
                <button
                  onClick={() => onNavigateTab('fail')}
                  className="py-2.5 px-3 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>محاولة فاشلة</span>
                </button>
                <button
                  onClick={() => showToast(`جاري الاتصال بـ ${currentStop.shipment.recipientPhone}...`, 'info')}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Phone className="w-4 h-4 text-twsela-blue" />
                  <span>اتصال هاتفي</span>
                </button>
                <button
                  onClick={() => showToast('جاري فتح توجيه خرائط Google Navigation GPS...', 'info')}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Navigation className="w-4 h-4 text-twsela-blue" />
                  <span>توجيه GPS</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ROUTE TAB ── */}
      {activeTab === 'route' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-navy">مسار التسليم اليومي المحسَّن</h3>
              <p className="text-xs text-slate-400">87 كم إجمالي المسار · خوارزمية التوزيع الذكي</p>
            </div>
            <button
              onClick={() => showToast('تمت إعادة حساب وتحسين المسار بالذكاء الاصطناعي بنجاح ✓', 'success')}
              className="px-3 py-1.5 rounded-lg bg-navy hover:bg-navy-light text-white text-xs font-bold transition shadow-sm"
            >
              إعادة تحسين المسار
            </button>
          </div>

          <div className="space-y-3 relative before:absolute before:right-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
            {stops.map(stop => (
              <div
                key={stop.stopNumber}
                className={`relative flex items-start gap-4 p-3 rounded-xl border transition ${
                  stop.isCurrent
                    ? 'border-twsela-blue bg-blue-50/40 shadow-sm'
                    : stop.isCompleted
                    ? 'border-slate-100 bg-slate-50/60 opacity-80'
                    : 'border-slate-100 bg-white hover:bg-slate-50/50'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center font-bold font-mono text-xs z-10 ${
                    stop.isCompleted
                      ? 'bg-emerald-500 text-white'
                      : stop.isCurrent
                      ? 'bg-twsela-blue text-white ring-4 ring-blue-100'
                      : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {stop.isCompleted ? <Check className="w-4 h-4" /> : stop.stopNumber}
                </div>

                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-navy text-sm">{stop.shipment.destinationAddress}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        stop.isCompleted
                          ? 'bg-emerald-50 text-emerald-700'
                          : stop.isCurrent
                          ? 'bg-blue-50 text-twsela-blue'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {stop.isCompleted ? 'تم التسليم' : stop.isCurrent ? 'المحطة الحالية' : 'قادم'}
                    </span>
                  </div>
                  <div className="text-slate-500 mt-1 flex flex-wrap items-center gap-3 font-mono">
                    <span className="font-bold text-twsela-blue">{stop.shipment.trackingNumber}</span>
                    <span>المستلم: {stop.shipment.recipientName}</span>
                    <span className="text-emerald-600 font-bold">COD: {stop.shipment.codAmountEgp} EGP</span>
                    <span className="text-slate-400">ETA: {stop.eta}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── BARCODE SCAN TAB ── */}
      {activeTab === 'scan' && (
        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-navy flex items-center gap-2">
              <QrCode className="w-5 h-5 text-twsela-blue" />
              <span>ماسح الباركود و QR الميداني</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              امسح رمز الشحنة لتسجيل الاستلام أو بدء إثبات التسليم فوراً
            </p>
          </div>

          <div
            onClick={handleSimulateScan}
            className="border-2 border-dashed border-twsela-blue/50 rounded-2xl p-10 text-center cursor-pointer bg-blue-50/20 hover:bg-blue-50/40 transition space-y-3"
          >
            <div className="w-16 h-16 rounded-full bg-twsela-blue/10 text-twsela-blue mx-auto flex items-center justify-center animate-pulse">
              <QrCode className="w-8 h-8" />
            </div>
            <div>
              <div className="text-sm font-bold text-navy">انقر لتفعيل الكاميرا وقراءة الكود</div>
              <div className="text-xs text-slate-400 mt-1">يدعم كاميرات الهواتف الذكية وأجهزة قارئ الباركود اليدوية</div>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={e => setManualCode(e.target.value)}
              placeholder="أو أدخل رقم التتبع يدوياً (مثال: TW-9902)"
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-twsela-blue/20"
            />
            <button
              onClick={handleManualSearch}
              className="px-4 py-2 rounded-xl bg-navy text-white text-xs font-bold hover:bg-navy-light transition flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              <span>بحث</span>
            </button>
          </div>

          {scannedResult && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-twsela-blue">{scannedResult.shipment.trackingNumber}</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-twsela-blue">
                  تم التعرف على الشحنة
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>المستلم: <b>{scannedResult.shipment.recipientName}</b></div>
                <div>COD: <b className="text-emerald-600">{scannedResult.shipment.codAmountEgp} EGP</b></div>
                <div className="col-span-2 text-slate-500">العنوان: {scannedResult.shipment.destinationAddress}</div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => onNavigateTab('deliver')}
                  className="flex-1 py-2 rounded-lg bg-twsela-teal text-navy font-bold text-xs"
                >
                  بدء تسجيل التسليم (PoD)
                </button>
                <button
                  onClick={() => onNavigateTab('fail')}
                  className="px-3 py-2 rounded-lg border border-rose-200 text-rose-600 font-bold text-xs"
                >
                  محاولة فاشلة
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── DELIVER / PROOF OF DELIVERY TAB ── */}
      {activeTab === 'deliver' && (
        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-navy flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-twsela-teal" />
              <span>إثبات التسليم الرقمي (Proof of Delivery)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              الشحنة: <b className="font-mono text-twsela-blue">{currentStop?.shipment.trackingNumber}</b> — {currentStop?.shipment.recipientName}
            </p>
          </div>

          {/* PoD Method Tabs */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'SIGNATURE', label: 'توقيع العميل', icon: <FileSignature className="w-4 h-4" /> },
              { id: 'PHOTO', label: 'صورة التسليم', icon: <Camera className="w-4 h-4" /> },
              { id: 'OTP', label: 'رمز OTP', icon: <MessageSquare className="w-4 h-4" /> }
            ].map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setPodMethod(m.id as any)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition ${
                  podMethod === m.id
                    ? 'border-twsela-blue bg-blue-50/50 text-twsela-blue'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {m.icon}
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          {/* Method Content */}
          {podMethod === 'SIGNATURE' && (
            <SignatureCanvas onSignatureChange={setSignatureData} />
          )}

          {podMethod === 'PHOTO' && (
            <div
              onClick={() => {
                setPhotoTaken(true);
                showToast('تم التقاط وحفظ صورة التسليم بنجاح ✓', 'success');
              }}
              className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer bg-slate-50/50 hover:bg-slate-100 transition space-y-2"
            >
              <Camera className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-xs font-bold text-navy">
                {photoTaken ? '✓ تم التقاط صورة التسليم بنجاح' : 'انقر لالتقاط صورة الطرد عند باب المستلم'}
              </div>
              <div className="text-[11px] text-slate-400">يتم إرفاق إحداثيات GPS تلقائياً مع الصورة</div>
            </div>
          )}

          {podMethod === 'OTP' && (
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center justify-between">
                <span>إرسال كود التحقق لهاتف العميل:</span>
                <span className="font-mono font-bold text-navy">{currentStop?.shipment.recipientPhone}</span>
              </div>
              <button
                type="button"
                onClick={() => showToast('تم إرسال كود التحقق OTP بنجاح عبر الرسائل القصيرة (Twilio SMS)', 'info')}
                className="w-full py-2 rounded-lg bg-navy text-white font-bold"
              >
                إرسال كود SMS
              </button>
              <div>
                <label className="block text-slate-500 mb-1">أدخل الكود المستلم من العميل (4 أرقام):</label>
                <input
                  type="text"
                  maxLength={4}
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value)}
                  placeholder="••••"
                  className="w-full text-center tracking-[12px] text-xl font-mono py-2 rounded-lg border border-slate-200 bg-white"
                />
              </div>
            </div>
          )}

          {/* COD Collection Confirmation */}
          <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">مبلغ COD المحصَّل نقدياً (EGP) *</label>
              <input
                type="number"
                value={collectedCod}
                onChange={e => setCollectedCod(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-base font-bold text-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">ملاحظات التسليم (اختياري)</label>
              <input
                type="text"
                value={podNotes}
                onChange={e => setPodNotes(e.target.value)}
                placeholder="مثلاً: استلم في مكتب الاستقبال..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleConfirmDelivery}
              className="w-full py-3 rounded-xl bg-twsela-teal hover:bg-emerald-400 text-navy font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>تأكيد التسليم وحفظ إثبات PoD</span>
            </button>
          </div>
        </div>
      )}

      {/* ── FAILED ATTEMPT TAB ── */}
      {activeTab === 'fail' && (
        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-rose-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>تسجيل محاولة تسليم فاشلة</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              الشحنة: <b className="font-mono text-twsela-blue">{currentStop?.shipment.trackingNumber}</b>
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-2">سبب عدم إتمام التسليم:</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'CUSTOMER_UNAVAILABLE', label: 'العميل غير متواجد' },
                  { id: 'NO_ANSWER', label: 'لا يرد على الهاتف' },
                  { id: 'REFUSED_COD', label: 'رفض دفع مبلغ COD' },
                  { id: 'WRONG_ADDRESS', label: 'عنوان خاطئ / غير واضح' },
                  { id: 'POSTPONED_BY_CUSTOMER', label: 'طلب تأجيل الموعد' },
                  { id: 'OTHER', label: 'سبب آخر' }
                ].map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setFailReason(r.id as any)}
                    className={`p-3 rounded-xl border text-right font-medium transition ${
                      failReason === r.id
                        ? 'border-rose-400 bg-rose-50/50 text-rose-800 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">تفاصيل وملاحظات إضافية:</label>
              <textarea
                rows={3}
                value={failNotes}
                onChange={e => setFailNotes(e.target.value)}
                placeholder="اشرح موقف المندوب بالتفصيل..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleReportFailed}
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-sm"
            >
              تسجيل المحاولة وتحديث حالة الشحنة
            </button>
          </div>
        </div>
      )}

      {/* ── COD HANDOVER TAB ── */}
      {activeTab === 'cod' && (
        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-navy flex items-center gap-2">
              <Wallet className="w-5 h-5 text-twsela-teal" />
              <span>تسليم مبالغ COD لمحاسب المستودع</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              تسوية العهدة النقدية بنهاية الوردية وتسليم النقدية المحصلة
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center space-y-1">
            <div className="text-xs text-emerald-700">إجمالي المبالغ المحصلة في عهدتك اليوم</div>
            <div className="text-3xl font-bold font-mono text-emerald-800">350 EGP</div>
            <div className="text-[11px] text-emerald-600">من أصل 2,840 EGP مستهدفة</div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">المبلغ المُسلَّم نقدياً (EGP)</label>
              <input
                type="number"
                value={handoverAmount}
                onChange={e => setHandoverAmount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-base font-bold text-navy focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">اسم المحاسب المستلم</label>
              <select
                value={cashierName}
                onChange={e => setCashierName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option>أحمد الطيب — المستودع الرئيسي</option>
                <option>محمود كمال — خزينة Hub 01</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleCodHandover}
              className="w-full py-2.5 rounded-xl bg-navy hover:bg-navy-light text-white font-bold text-xs transition shadow-sm"
            >
              تأكيد تسليم المبلغ واستلام إيصال العهدة
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
