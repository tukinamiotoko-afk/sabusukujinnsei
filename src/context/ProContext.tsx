import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import type { PurchasesPackage, CustomerInfo } from 'react-native-purchases';

// Expo Go では executionEnvironment === 'storeClient'
const IS_EXPO_GO = Constants.executionEnvironment === 'storeClient';

// Expo Go では require 自体をスキップ（JSロードは成功するがネイティブが動かない）
let RCPurchases: any = null;
let RC_LOG_LEVEL: any = null;
if (!IS_EXPO_GO) {
  try {
    const pkg = require('react-native-purchases');
    RCPurchases = pkg.default;
    RC_LOG_LEVEL = pkg.LOG_LEVEL;
  } catch {}
}

const IS_MOCK = IS_EXPO_GO || RCPurchases === null;

export const FREE_LIMIT = 5;

const RC_API_KEY_ANDROID = 'goog_qbcvEHtHIsnsRMoeCzgmzgyZIPU';
const RC_API_KEY_IOS     = '';
export const RC_ENTITLEMENT = 'pro';

export type PurchaseType = 'monthly' | 'lifetime';

const MOCK_MONTHLY: PurchasesPackage = {
  product: { priceString: '¥200', price: 200 } as any,
  packageType: 'MONTHLY',
} as any;

const MOCK_LIFETIME: PurchasesPackage = {
  product: { priceString: '¥900', price: 900 } as any,
  packageType: 'LIFETIME',
} as any;

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
  const [isPro, setIsPro]                     = useState(false);
  const [isLoading, setIsLoading]             = useState(true);
  const [paywallVisible, setPaywallVisible]   = useState(false);
  const [monthlyPackage, setMonthlyPackage]   = useState<PurchasesPackage | null>(null);
  const [lifetimePackage, setLifetimePackage] = useState<PurchasesPackage | null>(null);

  useEffect(() => {
    if (IS_MOCK) {
      setMonthlyPackage(MOCK_MONTHLY);
      setLifetimePackage(MOCK_LIFETIME);
      setIsLoading(false);
      return;
    }

    const apiKey = Platform.OS === 'ios' ? RC_API_KEY_IOS : RC_API_KEY_ANDROID;
    if (!apiKey) { setIsLoading(false); return; }

    RCPurchases.setLogLevel(RC_LOG_LEVEL.ERROR);
    RCPurchases.configure({ apiKey });

    RCPurchases.getCustomerInfo().then((info: CustomerInfo) => {
      setIsPro(info.entitlements.active[RC_ENTITLEMENT] !== undefined);
    }).catch(() => {}).finally(() => setIsLoading(false));

    RCPurchases.getOfferings().then((offerings: any) => {
      const current = offerings.current;
      if (!current) return;
      setMonthlyPackage(current.monthly ?? null);
      const lifetime = current.lifetime
        ?? current.availablePackages?.find((p: any) =>
            p.packageType === 'LIFETIME' ||
            p.product?.productIdentifier === 'pro_lifetime'
          )
        ?? null;
      setLifetimePackage(lifetime);
    }).catch(() => {});

    const removeListener = RCPurchases.addCustomerInfoUpdateListener((info: CustomerInfo) => {
      setIsPro(info.entitlements.active[RC_ENTITLEMENT] !== undefined);
    });

    return () => { removeListener(); };
  }, []);

  const purchase = async (pkg: PurchasesPackage) => {
    if (IS_MOCK) {
      setIsPro(true);
      setPaywallVisible(false);
      return;
    }
    const { customerInfo } = await RCPurchases.purchasePackage(pkg);
    setIsPro(customerInfo.entitlements.active[RC_ENTITLEMENT] !== undefined);
    setPaywallVisible(false);
  };

  const restorePurchases = async () => {
    if (IS_MOCK) {
      setIsPro(false);
      return;
    }
    const info = await RCPurchases.restorePurchases();
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
