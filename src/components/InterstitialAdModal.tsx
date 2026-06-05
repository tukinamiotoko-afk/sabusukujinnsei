import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import {
  useInterstitialAd,
  TestIds,
} from 'react-native-google-mobile-ads';

const ANDROID_AD_UNIT = 'ca-app-pub-6253728869800176/4548972878';
const IOS_AD_UNIT     = 'ca-app-pub-6253728869800176/7067325008';

const AD_UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : Platform.OS === 'ios' ? IOS_AD_UNIT : ANDROID_AD_UNIT;

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function InterstitialAdModal({ visible, onClose }: Props) {
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
