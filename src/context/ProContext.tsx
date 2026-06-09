import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL, PurchasesPackage } from 'react-native-purchases';
import type { CustomerInfo } from 'react-native-purchases';

export const FREE_LIMIT = 5;

const RC_API_KEY_ANDROID = 'goog_qbcvEHtHIsnsRMoeCzgmzgyZIPU';
const RC_API_KEY_IOS     = '';  // iOS実装時に設定
export const RC_ENTITLEMENT = 'pro';

export type PurchaseType = 'monthly' | 'lifetime';

interface ProContextType {
  isPro: boolean;
  isLoading: boolean;
  paywallVisible: boolean;
  monthlyPackage: PurchasesPackage | null;
  lifetimePackage: PurchasesPackage | null;
  openPaywall: () => void;
  closePaywall: () => void;
  purchase: (pkg: PurchasesPackage) => Promise<void>;
  restorePurchases: () => Promise<void>;
}

const ProContext = createContext<ProContextType>({
  isPro: false, isLoading: true, paywallVisible: false,
  monthlyPackage: null, lifetimePackage: null,
  openPaywall: () => {}, closePaywall: () => {},
  purchase: async () => {}, restorePurchases: async () => {},
});

export function ProProvider({ children }: { children: React.ReactNode }) {
  const [isPro, setIsPro]                   = useState(false);
  const [isLoading, setIsLoading]           = useState(true);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [monthlyPackage, setMonthlyPackage] = useState<PurchasesPackage | null>(null);
  const [lifetimePackage, setLifetimePackage] = useState<PurchasesPackage | null>(null);

  useEffect(() => {
    const apiKey = Platform.OS === 'ios' ? RC_API_KEY_IOS : RC_API_KEY_ANDROID;
    if (!apiKey) { setIsLoading(false); return; }

    Purchases.setLogLevel(LOG_LEVEL.ERROR);
    Purchases.configure({ apiKey });

    Purchases.getCustomerInfo().then(info => {
      setIsPro(info.entitlements.active[RC_ENTITLEMENT] !== undefined);
    }).catch(() => {}).finally(() => setIsLoading(false));

    Purchases.getOfferings().then(offerings => {
      const current = offerings.current;
      if (!current) return;
      setMonthlyPackage(current.monthly ?? null);
      setLifetimePackage(current.lifetime ?? null);
    }).catch(() => {});

    const removeListener = Purchases.addCustomerInfoUpdateListener((info: CustomerInfo) => {
      setIsPro(info.entitlements.active[RC_ENTITLEMENT] !== undefined);
    });

    return () => { removeListener(); };
  }, []);

  const purchase = async (pkg: PurchasesPackage) => {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    setIsPro(customerInfo.entitlements.active[RC_ENTITLEMENT] !== undefined);
    setPaywallVisible(false);
  };

  const restorePurchases = async () => {
    const info = await Purchases.restorePurchases();
    setIsPro(info.entitlements.active[RC_ENTITLEMENT] !== undefined);
  };

  return (
    <ProContext.Provider value={{
      isPro, isLoading, paywallVisible,
      monthlyPackage, lifetimePackage,
      openPaywall:  () => setPaywallVisible(true),
      closePaywall: () => setPaywallVisible(false),
      purchase, restorePurchases,
    }}>
      {children}
    </ProContext.Provider>
  );
}

export const usePro = () => useContext(ProContext);
