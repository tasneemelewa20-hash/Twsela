import { apiClient, isMockMode, simulateDelay } from './client';
import { WalletSummary } from '../types';
import { INITIAL_WALLET } from './mockData';

const WALLET_STORAGE_KEY = 'twsela_wallet_data';

function getStoredWallet(): WalletSummary {
  const stored = localStorage.getItem(WALLET_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (_) {}
  }
  localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(INITIAL_WALLET));
  return { ...INITIAL_WALLET };
}

function saveStoredWallet(wallet: WalletSummary): void {
  localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(wallet));
}

export async function fetchWallet(): Promise<WalletSummary> {
  if (isMockMode()) {
    await simulateDelay(180);
    return getStoredWallet();
  }
  return apiClient<WalletSummary>('/wallet');
}

export async function requestPayout(amount: number, bankName: string, accountNumber: string): Promise<{ success: boolean; message: string }> {
  if (isMockMode()) {
    await simulateDelay(350);
    const wallet = getStoredWallet();

    if (amount > wallet.currentBalanceEgp) {
      throw { status: 400, message: 'رصيد المحفظة الحالي غير كافٍ لإتمام طلب السحب' };
    }

    wallet.currentBalanceEgp -= amount;
    const nowTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    wallet.transactions.unshift({
      id: Date.now(),
      type: 'DEBIT_PAYOUT',
      typeLabelAr: 'طلب سحب بنكي',
      amountEgp: -amount,
      description: `تحويل إلى ${bankName} (${accountNumber.slice(-4).padStart(accountNumber.length, '*')})`,
      status: 'PENDING',
      timestamp: `اليوم ${nowTime}`,
      referenceCode: `WD-${Math.floor(1000 + Math.random() * 9000)}`
    });

    saveStoredWallet(wallet);
    return {
      success: true,
      message: `تم تقديم طلب سحب بقيمة ${amount} EGP بنجاح، وهو الآن قيد مراجعة الإدارة المالية`
    };
  }

  return apiClient('/wallet/withdraw', {
    method: 'POST',
    body: JSON.stringify({ amount, bankName, accountNumber })
  });
}
