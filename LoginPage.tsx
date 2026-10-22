import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { UserRole } from '../../types';
import { DEMO_USERS } from '../../api/mockData';
import { isMockMode } from '../../api/client';
import { Lock, Phone, ArrowLeft, Globe, ShieldCheck } from 'lucide-react';

interface LoginPageProps {
  onOpenPublicTracking: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onOpenPublicTracking }) => {
  const { login, switchRole } = useAuth();
  const { showToast } = useToast();

  const [phoneOrEmail, setPhoneOrEmail] = useState('01000000002');
  const [password, setPassword] = useState('password123');
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login({
        phoneOrEmail,
        password,
        selectedRole
      });
      showToast('تم تسجيل الدخول بنجاح! مرحباً بك في توصيلة', 'success');
    } catch (err: any) {
      showToast(err.message || 'بيانات الدخول غير صحيحة', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    setSelectedRole(role);
    const demo = DEMO_USERS[role];
    setPhoneOrEmail(demo.phone);
    switchRole(role);
    showToast(`تم الدخول الفوري بصلاحية: ${demo.name} (${role})`, 'success');
  };

  return (
    <div className="min-h-screen bg-[#f0f3f8] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-arabic text-navy">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-twsela-teal to-twsela-blue text-white flex items-center justify-center font-bold text-2xl mx-auto shadow-lg">
          ت
        </div>
        <h2 className="text-2xl font-extrabold text-navy tracking-tight">منصة توصيلة (Twsela)</h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          النظام المتكامل لإدارة الشحن والعمليات اللوجستية وإدارة المندوبين والمستودعات
        </p>

        {isMockMode() && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>نظام تجريبي مفعّل — جاهز للعرض والتقييم</span>
          </div>
        )}
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-slate-200/80 space-y-6">
          {/* Quick Demo Switchers */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-400">تسجيل الدخول السريع (اختر الدور):</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {[
                { role: 'ADMIN' as UserRole, label: 'مدير عمليات', color: 'border-blue-300 bg-blue-50/50' },
                { role: 'MERCHANT' as UserRole, label: 'تاجر متجر', color: 'border-emerald-300 bg-emerald-50/50' },
                { role: 'COURIER' as UserRole, label: 'سائق مندوب', color: 'border-amber-300 bg-amber-50/50' },
                { role: 'WAREHOUSE' as UserRole, label: 'طاقم مستودع', color: 'border-purple-300 bg-purple-50/50' },
                { role: 'OWNER' as UserRole, label: 'مالك المنصة', color: 'border-slate-300 bg-slate-50/50' }
              ].map(item => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => handleQuickLogin(item.role)}
                  className={`p-2 rounded-xl border text-center font-bold text-xs transition hover:scale-105 ${item.color}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-slate-400">أو إدخال البيانات</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">رقم الهاتف أو البريد الإلكتروني</label>
              <div className="relative">
                <Phone className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={phoneOrEmail}
                  onChange={e => setPhoneOrEmail(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 rounded-lg border border-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-twsela-blue/20"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-twsela-blue/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-navy hover:bg-navy-light text-white font-bold text-xs transition shadow-md disabled:opacity-50"
            >
              {isSubmitting ? 'جاري التحقق...' : 'تسجيل الدخول'}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={onOpenPublicTracking}
              className="flex items-center gap-1.5 text-twsela-blue font-bold hover:underline"
            >
              <Globe className="w-4 h-4" />
              <span>بوابة تتبع الشحنات العامة</span>
            </button>

            <span className="text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>JWT & RBAC</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
