import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  ScrollView, Alert, Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePro, FREE_LIMIT, type PurchaseType } from '../context/ProContext';

const FEATURES = [
  { label: '登録件数',      free: `最大${FREE_LIMIT}件`, pro: '無制限' },
  { label: '広告表示',      free: 'あり',                pro: 'なし' },
  { label: 'すべての機能',  free: '基本機能のみ',        pro: 'フル利用可能' },
];

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const { paywallVisible, closePaywall, purchase, restorePurchases, isPro } = usePro();
  const [selectedPlan, setSelectedPlan] = useState<PurchaseType>('monthly');
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      await purchase(selectedPlan);
    } catch {
      Alert.alert('エラー', '購入処理に失敗しました。再度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    try {
      await restorePurchases();
      Alert.alert('完了', '購入情報を復元しました。');
    } catch {
      Alert.alert('エラー', '復元に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={paywallVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={closePaywall}
    >
      <View style={[c.root, { paddingTop: insets.top }]}>
        {/* 閉じるボタン */}
        <TouchableOpacity style={c.closeBtn} onPress={closePaywall} hitSlop={12}>
          <Ionicons name="close" size={22} color="#64748B" />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={[c.scroll, { paddingBottom: insets.bottom + 32 }]} showsVerticalScrollIndicator={false}>
          {/* ヘッダー */}
          <View style={c.hero}>
            <View style={c.crownWrap}>
              <Ionicons name="star" size={40} color="#475569" />
            </View>
            <Text style={c.heroTitle}>プロプランにアップグレード</Text>
            <Text style={c.heroSub}>広告なし・登録無制限で、すべての機能をフル活用</Text>
          </View>

          {/* 機能比較 */}
          <View style={c.table}>
            <View style={c.tableHeader}>
              <View style={c.tableColLabel} />
              <View style={c.tableCol}><Text style={c.tableHeadTxt}>無料</Text></View>
              <View style={[c.tableCol, c.tableColPro]}><Text style={[c.tableHeadTxt, c.tableHeadPro]}>プロ</Text></View>
            </View>
            {FEATURES.map((f, i) => (
              <View key={i} style={[c.tableRow, i % 2 === 1 && c.tableRowAlt]}>
                <View style={c.tableColLabel}><Text style={c.tableLabel}>{f.label}</Text></View>
                <View style={c.tableCol}><Text style={c.tableFreeTxt}>{f.free}</Text></View>
                <View style={[c.tableCol, c.tableColPro]}>
                  <Text style={c.tableProTxt}>{f.pro}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* プラン選択 */}
          <View style={c.plans}>
            <TouchableOpacity
              style={[c.planCard, selectedPlan === 'monthly' && c.planCardSel]}
              onPress={() => setSelectedPlan('monthly')}
              activeOpacity={0.8}
            >
              <View style={c.planLeft}>
                <Text style={[c.planName, selectedPlan === 'monthly' && c.planNameSel]}>月額プラン</Text>
                <Text style={[c.planNote, selectedPlan === 'monthly' && c.planNoteSel]}>いつでも解約可能</Text>
              </View>
              <View style={c.planRight}>
                <Text style={[c.planPrice, selectedPlan === 'monthly' && c.planPriceSel]}>¥200</Text>
                <Text style={[c.planPer, selectedPlan === 'monthly' && c.planPerSel]}>/月</Text>
              </View>
              {selectedPlan === 'monthly' && (
                <View style={c.planCheck}><Ionicons name="checkmark-circle" size={22} color="#475569" /></View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[c.planCard, selectedPlan === 'lifetime' && c.planCardSel]}
              onPress={() => setSelectedPlan('lifetime')}
              activeOpacity={0.8}
            >
              <View style={[c.badgeWrap]}>
                <Text style={c.badge}>お得</Text>
              </View>
              <View style={c.planLeft}>
                <Text style={[c.planName, selectedPlan === 'lifetime' && c.planNameSel]}>買い切り</Text>
                <Text style={[c.planNote, selectedPlan === 'lifetime' && c.planNoteSel]}>一度払えば永久にプロ</Text>
              </View>
              <View style={c.planRight}>
                <Text style={[c.planPrice, selectedPlan === 'lifetime' && c.planPriceSel]}>¥800</Text>
                <Text style={[c.planPer, selectedPlan === 'lifetime' && c.planPerSel]}>買い切り</Text>
              </View>
              {selectedPlan === 'lifetime' && (
                <View style={c.planCheck}><Ionicons name="checkmark-circle" size={22} color="#475569" /></View>
              )}
            </TouchableOpacity>
          </View>

          {/* 購入ボタン */}
          <TouchableOpacity
            style={[c.buyBtn, loading && c.buyBtnDisabled]}
            onPress={handlePurchase}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={c.buyTxt}>
                  {selectedPlan === 'monthly' ? '¥200/月 で始める' : '¥800 で購入する'}
                </Text>
            }
          </TouchableOpacity>

          <TouchableOpacity style={c.restoreBtn} onPress={handleRestore} disabled={loading}>
            <Text style={c.restoreTxt}>購入を復元する</Text>
          </TouchableOpacity>

          <Text style={c.legal}>
            購入は Apple ID / Google アカウントに請求されます。{'\n'}
            月額プランは次の更新日の24時間前までに解約すると自動更新が停止します。
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const c = StyleSheet.create({
  root:         { flex: 1, backgroundColor: '#fff' },
  closeBtn:     { position: 'absolute', top: 16, right: 16, zIndex: 10, width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  scroll:       { paddingHorizontal: 20, paddingTop: 20 },

  hero:         { alignItems: 'center', paddingVertical: 24 },
  crownWrap:    { width: 80, height: 80, borderRadius: 24, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  heroTitle:    { fontSize: 22, fontWeight: '800', color: '#1A202C', textAlign: 'center', marginBottom: 8 },
  heroSub:      { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 21 },

  table:        { borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#EDF2F7', marginBottom: 24 },
  tableHeader:  { flexDirection: 'row', backgroundColor: '#F8FAFC', paddingVertical: 10 },
  tableRow:     { flexDirection: 'row', paddingVertical: 12 },
  tableRowAlt:  { backgroundColor: '#FAFBFC' },
  tableColLabel:{ flex: 2, paddingLeft: 14 },
  tableCol:     { flex: 1.5, alignItems: 'center' },
  tableColPro:  { backgroundColor: 'rgba(71,85,105,0.05)' },
  tableHeadTxt: { fontSize: 12, fontWeight: '700', color: '#94A3B8' },
  tableHeadPro: { color: '#475569' },
  tableLabel:   { fontSize: 13, fontWeight: '600', color: '#1A202C' },
  tableFreeTxt: { fontSize: 12, color: '#94A3B8', textAlign: 'center' },
  tableProTxt:  { fontSize: 12, fontWeight: '700', color: '#475569', textAlign: 'center' },

  plans:        { gap: 10, marginBottom: 20 },
  planCard:     { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 2, borderColor: '#EDF2F7', padding: 16, backgroundColor: '#FAFBFC' },
  planCardSel:  { borderColor: '#475569', backgroundColor: '#fff' },
  planLeft:     { flex: 1, gap: 3 },
  planName:     { fontSize: 15, fontWeight: '700', color: '#64748B' },
  planNameSel:  { color: '#1A202C' },
  planNote:     { fontSize: 11, color: '#A0AEC0' },
  planNoteSel:  { color: '#64748B' },
  planRight:    { flexDirection: 'row', alignItems: 'baseline', gap: 2, marginRight: 28 },
  planPrice:    { fontSize: 22, fontWeight: '800', color: '#94A3B8' },
  planPriceSel: { color: '#1A202C' },
  planPer:      { fontSize: 11, color: '#A0AEC0' },
  planPerSel:   { color: '#64748B' },
  planCheck:    { position: 'absolute', right: 12 },
  badgeWrap:    { position: 'absolute', top: -1, left: 14 },
  badge:        { fontSize: 10, fontWeight: '800', color: '#fff', backgroundColor: '#475569', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },

  buyBtn:       { backgroundColor: '#475569', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  buyBtnDisabled: { opacity: 0.6 },
  buyTxt:       { fontSize: 16, fontWeight: '800', color: '#fff' },
  restoreBtn:   { alignItems: 'center', paddingVertical: 10, marginBottom: 16 },
  restoreTxt:   { fontSize: 13, color: '#94A3B8', fontWeight: '600' },
  legal:        { fontSize: 10, color: '#CBD5E0', textAlign: 'center', lineHeight: 16 },
});
