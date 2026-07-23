import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  ScrollView, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestNotificationPermission } from '../utils/notifications';

const { width: SW } = Dimensions.get('window');

interface Slide {
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    icon: 'wallet-outline',
    iconColor: '#475569',
    iconBg: '#F1F5F9',
    title: 'サブスク＆固定費を\nかんたん管理',
    body: 'Netflix・Spotify などのサブスクや、\n家賃・保険などの固定費をまとめて管理。\n毎月いくら使っているか一目でわかります。',
  },
  {
    icon: 'add-circle-outline',
    iconColor: '#475569',
    iconBg: '#F1F5F9',
    title: 'テンプレートから\nすぐに登録',
    body: '「＋追加」ボタンを押すと、人気サービスの\nテンプレートが表示されます。\n選んで支払日を入力するだけで完了。',
  },
  {
    icon: 'calendar-outline',
    iconColor: '#475569',
    iconBg: '#F1F5F9',
    title: 'カレンダーで\n支払日を確認',
    body: '「カレンダー」タブでは今月・来月の\n支払いスケジュールを一覧表示。\n支払いの見落としを防げます。',
  },
  {
    icon: 'bar-chart-outline',
    iconColor: '#475569',
    iconBg: '#F1F5F9',
    title: 'グラフで\n支出を見える化',
    body: '「グラフ」タブでは月額費用を\nドーナツグラフで比較。\n何にいくら使っているかが一目瞭然です。',
  },
  {
    icon: 'trash-outline',
    iconColor: '#475569',
    iconBg: '#F1F5F9',
    title: '削減シミュレーターで\n節約を発見',
    body: '「一括削除」タブでは不要なサービスを\nチェックして削除できます。\n削減後の月額も即確認できます。',
  },
];

interface Props {
  onDone: () => void;
}

export default function OnboardingScreen({ onDone }: Props) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const p = Math.round(e.nativeEvent.contentOffset.x / SW);
    setPage(p);
  };

  const handleDone = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      await AsyncStorage.setItem('notif_auto_enabled', 'true');
    }
    onDone();
  };

  const next = () => {
    if (page < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: SW * (page + 1), animated: true });
    } else {
      handleDone();
    }
  };

  const isLast = page === SLIDES.length - 1;

  return (
    <View style={[c.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        scrollEventThrottle={16}
      >
        {SLIDES.map((slide, i) => (
          <View key={i} style={[c.slide, { width: SW }]}>
            <View style={[c.iconWrap, { backgroundColor: slide.iconBg }]}>
              <Ionicons name={slide.icon as never} size={56} color={slide.iconColor} />
            </View>
            <Text style={c.title}>{slide.title}</Text>
            <Text style={c.body}>{slide.body}</Text>
          </View>
        ))}
      </ScrollView>

      {/* ドット */}
      <View style={c.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[c.dot, i === page && c.dotActive]} />
        ))}
      </View>

      {/* ボタン */}
      <View style={c.footer}>
        <TouchableOpacity style={c.skipBtn} onPress={handleDone} activeOpacity={0.6}>
          <Text style={c.skipTxt}>スキップ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[c.nextBtn, isLast && c.nextBtnLast]} onPress={next} activeOpacity={0.85}>
          <Text style={c.nextTxt}>{isLast ? 'はじめる' : '次へ'}</Text>
          {!isLast && <Ionicons name="arrow-forward" size={16} color="#fff" style={{ marginLeft: 4 }} />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const c = StyleSheet.create({
  root:     { flex: 1, backgroundColor: '#fff' },
  slide:    { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingBottom: 40 },
  iconWrap: { width: 120, height: 120, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  title:    { fontSize: 26, fontWeight: '800', color: '#1A202C', textAlign: 'center', lineHeight: 36, marginBottom: 20 },
  body:     { fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 24 },

  dots:     { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
  dot:      { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E2E8F0' },
  dotActive:{ width: 24, backgroundColor: '#475569' },

  footer:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 16 },
  skipBtn:  { paddingVertical: 12, paddingHorizontal: 16 },
  skipTxt:  { fontSize: 14, color: '#A0AEC0', fontWeight: '600' },
  nextBtn:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#475569', borderRadius: 24, paddingVertical: 14, paddingHorizontal: 28 },
  nextBtnLast: { paddingHorizontal: 36 },
  nextTxt:  { fontSize: 15, fontWeight: '800', color: '#fff' },
});
