import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

const ANDROID_AD_UNIT = 'ca-app-pub-6253728869800176/4548972878';
const IOS_AD_UNIT     = 'ca-app-pub-6253728869800176/7067325008';

// react-native-google-mobile-ads は動的 import でネイティブモジュールが
// 存在しない環境（Expo Go 等）でもクラッシュしないようにする
let useInterstitialAd: any = null;
let TestIds: any = null;
try {
  const admob = require('react-native-google-mobile-ads');
  useInterstitialAd = admob.useInterstitialAd;
  TestIds = admob.TestIds;
} catch {}

const AD_UNIT_ID = __DEV__
  ? (TestIds?.INTERSTITIAL ?? 'ca-app-pub-3940256099942544/1033173712')
  : Platform.OS === 'ios' ? IOS_AD_UNIT : ANDROID_AD_UNIT;

interface Props {
  visible: boolean;
  onClose: () => void;
}

function InterstitialAdModalInner({ visible, onClose }: Props) {
  const { isLoaded, isClosed, load, show, error } = useInterstitialAd(AD_UNIT_ID);
  const pendingRef = useRef(false);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!visible) return;
    if (isLoaded) {
      show();
    } else {
      pendingRef.current = true;
      load();
    }
  }, [visible]);

  useEffect(() => {
    if (isLoaded && pendingRef.current) {
      pendingRef.current = false;
      show();
    }
  }, [isLoaded]);

  useEffect(() => {
    if (isClosed) {
      onClose();
      load();
    }
  }, [isClosed]);

  useEffect(() => {
    if (error && visible) {
      pendingRef.current = false;
      onClose();
    }
  }, [error]);

  return null;
}

export default function InterstitialAdModal({ visible, onClose }: Props) {
  if (!useInterstitialAd) {
    // ネイティブモジュールが利用不可の場合はスキップ
    if (visible) { setTimeout(onClose, 0); }
    return null;
  }
  return <InterstitialAdModalInner visible={visible} onClose={onClose} />;
}
