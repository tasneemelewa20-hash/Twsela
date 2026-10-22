import React, { useState } from 'react';
import { ShipmentDTO } from '../../types';
import { trackPublicShipment } from '../../api/tracking';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';
import {
  Search,
  Package,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Truck
} from 'lucide-react';

interface PublicTrackingPageProps {
  onBackToPortal: () => void;
}

export const PublicTrackingPage: React.FC<PublicTrackingPageProps> = ({ onBackToPortal }) => {
  const { showToast } = useToast();
  const [trackingInput, setTrackingInput] = useState('TW-9901');
  const [isLoading, setIsLoading] = useState(false);
  const [shipment, setShipment] = useState<ShipmentDTO | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!trackingInput.trim()) {
      showToast('يرجى إدخال رقم التتبع', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const data = await trackPublicShipment(trackingInput);
      setShipment(data);
      showToast(`تم العثور على الشحنة ${data.trackingNumber}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'لم يتم العثور على الشحنة', 'error');
      setShipment(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Pre-load demo
  React.useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-arabic text-navy">
      {/* Top Navbar */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-twsela-teal to-twsela-blue flex items-center justify-center font-bold text-base text-white shadow-sm">
            ت
          </div>
          <div>
            <div className="text-sm font-bold text-navy">توصيلة — التتبع المباشر</div>
            <div className="text-[10px] text-slate-400">Public Recipient Tracking</div>
          </div>
        </div>

        <button
          onClick={onBackToPortal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
        >
          <span>العودة للوحة التحكم</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Hero Search Section */}
      <div className="bg-navy text-white py-12 px-4 text-center space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-twsela-teal border border-white/10">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>تتبع آمن ومشفر برقم البوليصة</span>
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">أين شحنتك الآن؟</h1>
        <p className="text-xs text-slate-300 max-w-md mx-auto">
          أدخل رقم التتبع المطبوع على البوليصة أو المستلم في رسالة SMS لمتابعة خط سير الطرد
        </p>

        <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2 pt-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={trackingInput}
              onChange={e => setTrackingInput(e.target.value.toUpperCase())}
              placeholder="مثال: TW-9901"
              className="w-full px-4 py-3 rounded-xl bg-white text-navy font-mono text-sm uppercase placeholder:font-sans placeholder:normal-case font-bold border border-slate-200 focus:outline-none focus:ring-2 focus:ring-twsela-teal"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 rounded-xl bg-twsela-teal text-navy font-bold text-xs hover:bg-emerald-400 transition shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            <span>{isLoading ? 'جاري البحث...' : 'تتبع'}</span>
          </button>
        </form>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-1">
          <span>شحنات للتجربة السريعة:</span>
          {['TW-9901', 'TW-9902', 'TW-9903'].map(code => (
            <button
              key={code}
              type="button"
              onClick={() => {
                setTrackingInput(code);
                trackPublicShipment(code).then(setShipment);
              }}
              className="font-mono text-twsela-teal hover:underline text-xs"
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      {/* Tracking Results Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 -mt-4 space-y-6">
        {shipment ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-md space-y-6 animate-scale-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] text-slate-400">رقم بوليصة الشحن</span>
                <div className="text-xl font-bold font-mono text-twsela-blue">{shipment.trackingNumber}</div>
              </div>
              <div className="text-right sm:text-left">
                <span className="text-[11px] text-slate-400 block mb-1">الحالة الراهنة</span>
                <Badge status={shipment.status} size="md" />
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">التاجر المرسل:</span>
                <span className="font-bold text-navy">{shipment.senderMerchant}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">الوجهة والمحافظة:</span>
                <span className="font-bold text-navy">{shipment.destinationZone}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">مبلغ الدفع عند الاستلام:</span>
                <span className="font-bold font-mono text-emerald-600">
                  {shipment.codAmountEgp ? `${shipment.codAmountEgp} EGP` : 'مدفوع مسبقاً'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">المندوب المسند:</span>
                <span className="font-bold text-navy">{shipment.courierName || 'طاقم توصيلة'}</span>
              </div>
            </div>

            {/* Visual Step Progress */}
            <div className="pt-2">
              <h3 className="text-xs font-bold text-navy mb-4">مراحل الشحنة</h3>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {[
                  { label: 'تم الطلب', done: true },
                  { label: 'في المستودع', done: shipment.status !== 'CREATED' },
                  { label: 'في الطريق', done: shipment.status === 'OUT_FOR_DELIVERY' || shipment.status === 'DELIVERED' },
                  { label: 'تم التسليم', done: shipment.status === 'DELIVERED' }
                ].map((st, sIdx) => (
                  <div key={sIdx} className="space-y-1.5">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        st.done ? 'bg-twsela-teal' : 'bg-slate-200'
                      }`}
                    />
                    <span
                      className={`text-[11px] font-medium block truncate ${
                        st.done ? 'text-navy font-bold' : 'text-slate-400'
                      }`}
                    >
                      {st.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-navy mb-3 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-twsela-blue" />
                <span>سجل خط سير الطرد</span>
              </h3>

              <div className="space-y-4 border-r-2 border-slate-200 pr-4 mr-2">
                {shipment.timeline.map(ev => (
                  <div key={ev.id} className="relative">
                    <span className="absolute -right-[23px] top-1 w-3 h-3 rounded-full bg-twsela-teal ring-4 ring-white" />
                    <div className="text-xs font-bold text-navy">{ev.statusLabelAr}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {ev.timestamp} · {ev.location}
                    </div>
                    {ev.notes && (
                      <div className="text-[11px] text-slate-600 mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        {ev.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-navy">أدخل رقم الشحنة لبدء التتبع</h3>
            <p className="text-xs text-slate-400">ستظهر تفاصيل الشحنة وحالتها الميدانية بمجرد إدخال رقم صحيح</p>
          </div>
        )}
      </main>
    </div>
  );
};
