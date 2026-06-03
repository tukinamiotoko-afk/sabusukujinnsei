import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── 設定 ─────────────────────────────────────────────────────────────────────
export const FREE_LIMIT = 5; // 無料ユーザーの登録上限
const STORAGE_KEY = 'pro_status_v2';

// ─── RevenueCat への差し替えポイント ──────────────────────────────────────────
// import Purchases, { LOG_LEVEL } from 'react-native-purchases';
// Purchases.configure({ apiKey: Platform.OS === 'ios' ? 'appl_XXXXX' : 'goog_XXXXX' });
// export const RC_MONTHLY_ID  = 'pro_monthly_200';
// export const RC_LIFETIME_ID = 'pro_lifetime_800';

export type PurchaseType = 'monthly' | 'lifetime';

interface ProContextType {
  isPro: boolean;
  isLoading: boolean;
  paywallVisible: boolean;
  openPaywall: () => void;
  closePaywall: () => void;
  purchase: (type: PurchaseType) => Promise<void>;
  restorePurchases: () => Promise<void>;
}

const ProContext = createContext<ProContextType>({
  isPro: false, isLoading: true, paywallVisible: false,
  openPaywall: () => {}, closePaywall: () => {},
  purchase: async () => {}, restorePurchases: async () => {},
});

export function ProProvider({ children }: { children: React.ReactNode }) {
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paywallVisible, setPaywallVisible] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(v => {
      if (v === 'true') setIsPro(true);
      setIsLoading(false);
    });
  }, []);

  const purchase = async (type: PurchaseType) => {
    // ── RevenueCat 実装時はここを置き換える ──────────────────────────────────
    // const offerings = await Purchases.getOfferings();
    // const pkg = type === 'monthly'
    //   ? offerings.current?.monthly
    //   : offerings.current?.lifetime;
    // if (!pkg) throw new Error('Package not found');
    // await Purchases.purchasePackage(pkg);
    // ─────────────────────────────────────────────────────────────────────────
    await AsyncStorage.setItem(STORAGE_KEY, 'true'); // スタブ
    setIsPro(true);
    setPaywallVisible(false);
  };

  const restorePurchases = async () => {
    // ── RevenueCat 実装時はここを置き換える ──────────────────────────────────
    // const info = await Purchases.restorePurchases();
    // setIsPro(info.entitlements.active['pro'] !== undefined);
    // ─────────────────────────────────────────────────────────────────────────
    const v = await AsyncStorage.getItem(STORAGE_KEY);
    setIsPro(v === 'true');
  };

  return (
    <ProContext.Provider value={{
      isPro, isLoading, paywallVisible,
      openPaywall:  () => setPaywallVisible(true),
      closePaywall: () => setPaywallVisible(false),
      purchase, restorePurchases,
    }}>
      {children}
    </ProContext.Provider>
  );
}

export const usePro = () => useContext(ProContext);
