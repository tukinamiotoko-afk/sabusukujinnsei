import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePro } from '../context/ProContext';

// ─── AdMob 差し替えポイント ────────────────────────────────────────────────────
// import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
// const AD_UNIT_ID = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-XXXXX/YYYYY';
// const interstitial = InterstitialAd.createForAdUnitId(AD_UNIT_ID);
// ─────────────────────────────────────────────────────────────────────────────

const SKIP_AFTER = 5; // 秒

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function InterstitialAdModal({ visible, onClose }: Props) {
  const { openPaywall } = usePro();
  const [countdown, setCountdown] = useState(SKIP_AFTER);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      setCountdown(SKIP_AFTER);
      return;
    }
    Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [visible]);

  const handleClose = () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(onClose);
  };

  const handleUpgrade = () => {
    handleClose();
    setTimeout(() => openPaywall(), 200);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[c.overlay, { opacity: fadeAnim }]}>
        {/* スキップボタン */}
        <View style={c.topBar}>
          <Text style={c.adLabel}>広告</Text>
          {countdown === 0 ? (
            <TouchableOpacity style={c.skipBtn} onPress={handleClose} activeOpacity={0.8}>
              <Text style={c.skipTxt}>スキップ</Text>
              <Ionicons name="close" size={14} color="#fff" />
            </TouchableOpacity>
          ) : (
            <View style={c.countdownBadge}>
              <Text style={c.countdownTxt}>{countdown}</Text>
            </View>
          )}
        </View>

        {/* モック広告カード */}
        <View style={c.adCard}>
          <View style={c.adCardInner}>
            <View style={c.adIcon}>
              <Ionicons name="star" size={32} color="#475569" />
            </View>
            <Text style={c.adTitle}>広告を消しませんか？</Text>
            <Text style={c.adBody}>
              プロプランにアップグレードすると{'\n'}
              広告が完全に非表示になります。
            </Text>
            <TouchableOpacity style={c.adUpgradeBtn} onPress={handleUpgrade} activeOpacity={0.85}>
              <Text style={c.adUpgradeTxt}>プロを試す → ¥200/月〜</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 下部 */}
        <View style={c.bottomBar}>
          <Text style={c.bottomTxt}>スポンサー広告</Text>
        </View>
      </Animated.View>
    </Modal>
  );
}

const c = StyleSheet.create({
  overlay:      { flex: 1, backgroundColor: '#000' },
  topBar:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12 },
  adLabel:      { fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: '600', letterSpacing: 1 },
  skipBtn:      { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  skipTxt:      { fontSize: 13, color: '#fff', fontWeight: '700' },
  countdownBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  countdownTxt: { fontSize: 14, fontWeight: '800', color: '#fff' },

  adCard:       { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  adCardInner:  { backgroundColor: '#fff', borderRadius: 24, padding: 28, width: '100%', alignItems: 'center', gap: 12 },
  adIcon:       { width: 72, height: 72, borderRadius: 20, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  adTitle:      { fontSize: 20, fontWeight: '800', color: '#1A202C', textAlign: 'center' },
  adBody:       { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22 },
  adUpgradeBtn: { backgroundColor: '#475569', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28, marginTop: 8, width: '100%', alignItems: 'center' },
  adUpgradeTxt: { fontSize: 15, fontWeight: '800', color: '#fff' },

  bottomBar:    { paddingBottom: 40, paddingHorizontal: 16, alignItems: 'center' },
  bottomTxt:    { fontSize: 11, color: 'rgba(255,255,255,0.3)' },
});
