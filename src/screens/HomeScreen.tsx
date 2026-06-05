import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
  StyleSheet,
  Platform,
  Alert,
  KeyboardAvoidingView,
  Animated,
  Easing,
  Dimensions,
  Linking,
  PanResponder,
  BackHandler,
} from 'react-native';

const SCREEN_W = Dimensions.get('window').width;
const TMPL_CARD_W = Math.floor((SCREEN_W - 24 - 16) / 3);
const SWIPE_ACTION_W   = 96;
const SWIPE_THRESHOLD  = 44;
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  useExpenses,
  CAT,
  CYCLE_LABEL,
  CATEGORIES,
  CYCLES,
  cycleDisplay,
  monthlyEq,
  type Category,
  type Cycle,
  type Expense,
} from '../context/ExpensesContext';
import { TEMPLATES, SUBSCRIPTION_SUBCATS, getCancelUrl, getBillingUrl, type TemplateItem } from '../data/templates';
import ServiceIcon, { hasServiceIcon } from '../components/ServiceIcon';
import { usePro, FREE_LIMIT } from '../context/ProContext';
import InterstitialAdModal from '../components/InterstitialAdModal';

// ─── ユーティリティ ──────────────────────────────────────────────────────────

const genId   = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const yen     = (n: number) => `¥${Math.round(n).toLocaleString('ja-JP')}`;
const fmtDate = (iso: string) => {
  try { return format(new Date(iso), 'M月d日(E)', { locale: ja }); }
  catch { return iso; }
};
function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / 86400000);
}

// ─── フォーム型 ──────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  amount: string;
  category: Category;
  cycle: Cycle;
  customCycleDays: string;
  nextDate: Date;
  memo: string;
}

const blankForm = (): FormState => ({
  name:            '',
  amount:          '',
  category:        'subscription',
  cycle:           'monthly',
  customCycleDays: '',
  nextDate:        new Date(),
  memo:            '',
});

// ─── ExpenseCard ─────────────────────────────────────────────────────────────

function ExpenseCard({ expense, onEdit, onDelete, onCardTap }: {
  expense: Expense; onEdit: () => void; onDelete: () => void; onCardTap: () => void;
}) {
  const { color, icon } = CAT[expense.category];
  const days = daysUntil(expense.nextDate);
  const overdue = days < 0;
  const soon    = days >= 0 && days <= 7;
  const isSubscription = expense.category === 'subscription';

  const translateX = useRef(new Animated.Value(0)).current;
  const openDir    = useRef<'none' | 'left' | 'right'>('none');

  const snapTo = (x: number, dir: 'none' | 'left' | 'right') => {
    openDir.current = dir;
    Animated.spring(translateX, {
      toValue: x, useNativeDriver: true,
      overshootClamping: true, tension: 100, friction: 9,
    }).start();
  };
  const close = () => snapTo(0, 'none');

  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) =>
      Math.abs(g.dx) > Math.abs(g.dy) * 1.5 && Math.abs(g.dx) > 10,
    onPanResponderMove: (_, g) => {
      const base = openDir.current === 'right' ? SWIPE_ACTION_W
                 : openDir.current === 'left'  ? -SWIPE_ACTION_W : 0;
      let x = base + g.dx;
      if (!isSubscription) x = Math.max(0, x);
      translateX.setValue(Math.max(isSubscription ? -SWIPE_ACTION_W : 0, Math.min(SWIPE_ACTION_W, x)));
    },
    onPanResponderRelease: (_, g) => {
      const base = openDir.current === 'right' ? SWIPE_ACTION_W
                 : openDir.current === 'left'  ? -SWIPE_ACTION_W : 0;
      const finalX = Math.max(
        isSubscription ? -SWIPE_ACTION_W : 0,
        Math.min(SWIPE_ACTION_W, base + g.dx)
      );
      if (finalX > SWIPE_THRESHOLD) snapTo(SWIPE_ACTION_W, 'right');
      else if (finalX < -SWIPE_THRESHOLD && isSubscription) snapTo(-SWIPE_ACTION_W, 'left');
      else close();
    },
  })).current;

  const handleCardPress = () => {
    if (openDir.current !== 'none') { close(); return; }
    onCardTap();
  };

  const openCancelUrl = () => {
    const url = getCancelUrl(expense.name)
      ?? `https://www.google.com/search?q=${encodeURIComponent(expense.name + ' 退会方法')}`;
    Linking.openURL(url);
  };

  // スワイプ背景ボタン用（閉じてから実行）
  const handleDelete = () => { close(); setTimeout(() => onDelete(), 220); };
  const handleCancelPage = () => { close(); setTimeout(openCancelUrl, 220); };

  return (
    <View style={s.swipeWrap}>
      {/* 背景アクション: 削除（左側、右スワイプで出現） */}
      <TouchableOpacity style={s.swipeDeleteAction} onPress={handleDelete} activeOpacity={0.85}>
        <Ionicons name="trash-outline" size={22} color="#fff" />
        <Text style={s.swipeActionText}>削除しますか</Text>
      </TouchableOpacity>

      {/* 背景アクション: 退会（右側、左スワイプで出現・サブスクのみ） */}
      {isSubscription && (
        <TouchableOpacity style={s.swipeCancelAction} onPress={handleCancelPage} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={22} color="#fff" />
          <Text style={s.swipeActionText}>退会しますか</Text>
        </TouchableOpacity>
      )}

      {/* スライドするカード */}
      <Animated.View style={{ transform: [{ translateX }] }} {...panResponder.panHandlers}>
        <TouchableOpacity style={s.card} onPress={handleCardPress} activeOpacity={0.75}>
          {hasServiceIcon(expense.name)
            ? <View style={{ marginRight: 12 }}><ServiceIcon name={expense.name} size={46} /></View>
            : <View style={[s.cardIcon, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon as never} size={22} color={color} />
              </View>
          }
          <View style={s.cardBody}>
            <Text style={s.cardName} numberOfLines={1}>{expense.name}</Text>
            <Text style={[s.cardDate, overdue && s.textRed, soon && !overdue && s.textOrange]}>
              {fmtDate(expense.nextDate)}
              {'  '}
              {overdue ? `(${Math.abs(days)}日超過)` : days === 0 ? '(今日)' : days <= 7 ? `(あと${days}日)` : ''}
            </Text>
          </View>
          <View style={s.cardRight}>
            <Text style={s.cardAmount}>{yen(expense.amount)}</Text>
            <Ionicons name="chevron-forward" size={14} color="#CBD5E0" style={{ marginTop: 2 }} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}


// ─── テンプレートブラウザ ─────────────────────────────────────────────────────

type ServiceEntry =
  | { type: 'group'; key: string; items: TemplateItem[] }
  | { type: 'single'; item: TemplateItem };

function buildServiceEntries(items: TemplateItem[]): ServiceEntry[] {
  const entries: ServiceEntry[] = [];
  const seenGroups = new Set<string>();
  const groupMap = new Map<string, TemplateItem[]>();
  for (const item of items) {
    if (item.group) {
      if (!groupMap.has(item.group)) groupMap.set(item.group, []);
      groupMap.get(item.group)!.push(item);
    }
  }
  for (const item of items) {
    if (item.group) {
      if (!seenGroups.has(item.group)) {
        seenGroups.add(item.group);
        entries.push({ type: 'group', key: item.group, items: groupMap.get(item.group)! });
      }
    } else {
      entries.push({ type: 'single', item });
    }
  }
  return entries;
}

function TmplIcon({ name, color, icon }: { name: string; color: string; icon: string }) {
  return hasServiceIcon(name)
    ? <ServiceIcon name={name} size={40} />
    : <View style={[s.tmplItemIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as never} size={18} color={color} />
      </View>;
}

function BillingButtons({ item, cat, onDirectAdd }: {
  item: TemplateItem; cat: Category;
  onDirectAdd: (cat: Category, item: TemplateItem) => void;
}) {
  return (
    <View style={s.billingBtns}>
      {item.amount !== undefined && (
        <TouchableOpacity style={s.billingBtn} onPress={() => onDirectAdd(cat, item)}>
          <Text style={s.billingBtnLabel}>月払い</Text>
          <Text style={s.billingBtnAmount}>{item.currency === 'USD' ? `$${item.amount}` : yen(item.amount)}</Text>
        </TouchableOpacity>
      )}
      {item.yearlyAmount !== undefined && (
        <TouchableOpacity
          style={[s.billingBtn, s.billingBtnYearly]}
          onPress={() => onDirectAdd(cat, { ...item, amount: item.yearlyAmount!, cycle: 'yearly' })}
        >
          <Text style={[s.billingBtnLabel, s.billingBtnLabelYearly]}>年払い</Text>
          <Text style={[s.billingBtnAmount, s.billingBtnAmountYearly]}>{item.currency === 'USD' ? `$${item.yearlyAmount}` : yen(item.yearlyAmount!)}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function TemplateBrowser({
  onDirectAdd,
  onBillingOpen,
  onGroupBillingOpen,
  activeCategory, setActiveCategory,
  activeSubcat, setActiveSubcat,
  activeGroup, setActiveGroup,
}: {
  onDirectAdd: (cat: Category, item: TemplateItem) => void;
  onBillingOpen: (cat: Category, item: TemplateItem) => void;
  onGroupBillingOpen: (cat: Category, plans: TemplateItem[]) => void;
  activeCategory: Category | null; setActiveCategory: (c: Category | null) => void;
  activeSubcat: string | null;     setActiveSubcat:   (s: string | null) => void;
  activeGroup: string | null;      setActiveGroup:    (g: string | null) => void;
}) {
  const [search, setSearch] = useState('');

  const searchResults = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.trim().toLowerCase();
    const hits: { cat: Category; item: TemplateItem }[] = [];
    for (const cat of CATEGORIES) {
      for (const item of TEMPLATES[cat]) {
        if (item.name.toLowerCase().includes(q)) hits.push({ cat, item });
      }
    }
    return hits;
  }, [search]);

  const renderSearchBar = (showClear: boolean) => (
    <View style={s.searchWrap}>
      <Ionicons name="search-outline" size={16} color="#A0AEC0" style={s.searchIcon} />
      <TextInput
        style={s.searchInput}
        value={search}
        onChangeText={setSearch}
        placeholder="サービス名で検索"
        placeholderTextColor="#CBD5E0"
        autoCorrect={false}
      />
      {showClear && (
        <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
          <Ionicons name="close-circle" size={18} color="#A0AEC0" />
        </TouchableOpacity>
      )}
    </View>
  );

  const handleCardTap = (cat: Category, item: TemplateItem) => {
    onBillingOpen(cat, item);
  };

  // 検索中
  if (search.trim()) {
    return (
      <View style={{ flex: 1 }}>
        {renderSearchBar(true)}
        <ScrollView keyboardShouldPersistTaps="handled">
          {searchResults!.length === 0 ? (
            <View style={s.tmplEmpty}>
              <Text style={s.tmplEmptyText}>「{search}」は見つかりませんでした</Text>
              <Text style={s.tmplEmptySubText}>カスタムタブから手動で追加できます</Text>
            </View>
          ) : searchResults!.map(({ cat, item }, i) => {
            const { color, icon } = CAT[cat];
            return (
              <TouchableOpacity key={i} style={s.tmplItem}
                onPress={() => handleCardTap(cat, item)} activeOpacity={0.7}>
                <TmplIcon name={item.name} color={color} icon={icon} />
                <View style={{ flex: 1 }}>
                  <Text style={s.tmplItemName}>{item.name}</Text>
                  <Text style={s.tmplItemMeta}>{CAT[cat].label}</Text>
                </View>
                {item.amount !== undefined && (
                  <Text style={s.tmplItemAmount}>
                    {item.currency === 'USD' ? `$${item.amount}` : yen(item.amount)}
                  </Text>
                )}
                <Ionicons name="add-circle-outline" size={22} color="#475569" />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  const renderGridBilling = (item: TemplateItem) => {
    if (item.yearlyAmount !== undefined) {
      return (
        <View style={s.tmplGridBilling}>
          <Text style={s.tmplGridBillingTxt}>
            月{item.amount !== undefined ? (item.currency === 'USD' ? ` $${item.amount}` : ` ${yen(item.amount)}`) : ''}
          </Text>
          <Text style={[s.tmplGridBillingTxt, s.tmplGridBillingTxtYear]}>
            年{item.currency === 'USD' ? ` $${item.yearlyAmount}` : ` ${yen(item.yearlyAmount)}`}
          </Text>
        </View>
      );
    }
    if (item.amount !== undefined) {
      return (
        <Text style={s.tmplGridAmt}>
          {item.currency === 'USD' ? `$${item.amount}` : yen(item.amount)}
        </Text>
      );
    }
    return null;
  };

  // Level 3: プラン一覧
  if (activeGroup !== null && activeCategory !== null) {
    const { color, icon } = CAT[activeCategory];
    const plans = TEMPLATES[activeCategory].filter(i => i.group === activeGroup);
    return (
      <View style={{ flex: 1 }}>
        {renderSearchBar(false)}
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.tmplGrid}>
          {plans.map((item, i) => {
            const label = item.planName ?? item.name;
            return (
              <TouchableOpacity key={i} style={s.tmplGridCard}
                onPress={() => handleCardTap(activeCategory, item)} activeOpacity={0.75}>
                <View style={[s.tmplGridIcon, { backgroundColor: color + '20' }]}>
                  <Ionicons name={icon as never} size={22} color={color} />
                </View>
                <Text style={s.tmplGridName} numberOfLines={2}>{label}</Text>
                {renderGridBilling(item)}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  // Level 2: サービス一覧
  if (activeCategory !== null && (activeCategory !== 'subscription' || activeSubcat !== null)) {
    const { color, icon } = CAT[activeCategory];
    const src = activeCategory === 'subscription' && activeSubcat !== null
      ? TEMPLATES['subscription'].filter(i => i.subcat === activeSubcat)
      : TEMPLATES[activeCategory];
    const entries = buildServiceEntries(src);
    return (
      <View style={{ flex: 1 }}>
        {renderSearchBar(false)}
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.tmplGrid}>
          {entries.map((entry, i) => {
            if (entry.type === 'group') {
              return (
                <TouchableOpacity key={i} style={s.tmplGridCard}
                  onPress={() => {
                    const hasLocal = entry.items.some(p => (p.amount !== undefined && p.currency !== 'USD') || p.yearlyAmount !== undefined);
                    if (hasLocal && activeCategory) { onGroupBillingOpen(activeCategory, entry.items); }
                    else { setActiveGroup(entry.key); }
                  }} activeOpacity={0.75}>
                  {hasServiceIcon(entry.key)
                    ? <ServiceIcon name={entry.key} size={40} />
                    : <View style={[s.tmplGridIcon, { backgroundColor: color + '20' }]}>
                        <Ionicons name={icon as never} size={22} color={color} />
                      </View>}
                  <Text style={s.tmplGridName} numberOfLines={2}>{entry.key}</Text>
                  <Text style={s.tmplGridMeta}>{entry.items.length}プラン</Text>
                </TouchableOpacity>
              );
            }
            const item = entry.item;
            return (
              <TouchableOpacity key={i} style={s.tmplGridCard}
                onPress={() => handleCardTap(activeCategory, item)} activeOpacity={0.7}>
                {hasServiceIcon(item.name)
                  ? <ServiceIcon name={item.name} size={40} />
                  : <View style={[s.tmplGridIcon, { backgroundColor: color + '20' }]}>
                      <Ionicons name={icon as never} size={22} color={color} />
                    </View>}
                <Text style={s.tmplGridName} numberOfLines={2}>{item.name}</Text>
                {renderGridBilling(item)}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  // Level 1.5: サブスク サブカテゴリ
  if (activeCategory === 'subscription') {
    return (
      <View style={{ flex: 1 }}>
        {renderSearchBar(false)}
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.tmplGrid}>
          {Object.entries(SUBSCRIPTION_SUBCATS).map(([key, cfg]) => {
            const count = TEMPLATES['subscription'].filter(i => i.subcat === key).length;
            return (
              <TouchableOpacity key={key} style={s.tmplGridCard}
                onPress={() => setActiveSubcat(key)} activeOpacity={0.75}>
                <View style={[s.tmplGridIcon, { backgroundColor: cfg.color + '20' }]}>
                  <Ionicons name={cfg.icon as never} size={22} color={cfg.color} />
                </View>
                <Text style={s.tmplGridName}>{cfg.label}</Text>
                <Text style={s.tmplGridMeta}>{count}件</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  // Level 1: カテゴリ
  return (
    <View style={{ flex: 1 }}>
      {renderSearchBar(false)}
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.tmplGrid}>
        {CATEGORIES.map(cat => {
          const { label, color, icon } = CAT[cat];
          const count = TEMPLATES[cat].length;
          return (
            <TouchableOpacity key={cat} style={s.tmplGridCard}
              onPress={() => { setActiveCategory(cat); setActiveSubcat(null); setActiveGroup(null); }}
              activeOpacity={0.75}>
              <View style={[s.tmplGridIcon, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon as never} size={22} color={color} />
              </View>
              <Text style={s.tmplGridName}>{label}</Text>
              <Text style={s.tmplGridMeta}>{count}件</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ─── カスタムフォーム ─────────────────────────────────────────────────────────

function CustomForm({ form, setForm, showDate, setShowDate, onOpenCatPanel, onOpenPayPanel }: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  showDate: boolean;
  setShowDate: (v: boolean) => void;
  onOpenCatPanel: () => void;
  onOpenPayPanel: () => void;
}) {
  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm(f => ({ ...f, [key]: val }));

  const { label: catLabel, color: catColor, icon: catIcon } = CAT[form.category];
  const payDisplay = form.cycle === 'monthly'
    ? `毎月${form.nextDate.getDate()}日`
    : cycleDisplay(form.cycle, form.customCycleDays ? parseInt(form.customCycleDays, 10) : undefined);

  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      <View style={s.modalBody}>

        {/* 名前 */}
        <View style={s.fieldWrap}>
          <Text style={s.fieldLabel}>名前 <Text style={s.required}>*</Text></Text>
          <TextInput
            style={s.textInput}
            value={form.name}
            onChangeText={v => set('name', v)}
            placeholder="例: Netflix、散髪代、薬局"
            placeholderTextColor="#CBD5E0"
            returnKeyType="next"
          />
        </View>

        {/* 金額 */}
        <View style={s.fieldWrap}>
          <Text style={s.fieldLabel}>金額（円） <Text style={s.required}>*</Text></Text>
          <View style={s.amountRow}>
            <Text style={s.yenSign}>¥</Text>
            <TextInput
              style={[s.textInput, { flex: 1, borderWidth: 0, paddingLeft: 4 }]}
              value={form.amount}
              onChangeText={v => set('amount', v.replace(/[^0-9]/g, ''))}
              placeholder="0"
              placeholderTextColor="#CBD5E0"
              keyboardType="number-pad"
              returnKeyType="done"
            />
          </View>
        </View>

        {/* カテゴリ */}
        <View style={s.fieldWrap}>
          <Text style={s.fieldLabel}>カテゴリ</Text>
          <TouchableOpacity
            style={s.dropdownTrigger}
            onPress={onOpenCatPanel}
            activeOpacity={0.75}
          >
            <View style={[s.dropdownTriggerIcon, { backgroundColor: catColor + '20' }]}>
              <Ionicons name={catIcon as never} size={15} color={catColor} />
            </View>
            <Text style={[s.dropdownTriggerText, { color: catColor }]}>{catLabel}</Text>
            <Ionicons name="chevron-forward" size={16} color="#A0AEC0" />
          </TouchableOpacity>
        </View>

        {/* 支払日または支払周期 */}
        <View style={s.fieldWrap}>
          <Text style={s.fieldLabel}>支払日または支払周期</Text>
          <TouchableOpacity
            style={s.dropdownTrigger}
            onPress={onOpenPayPanel}
            activeOpacity={0.75}
          >
            <Ionicons name="calendar-outline" size={15} color="#475569" />
            <Text style={s.dropdownTriggerText}>{payDisplay}</Text>
            <Ionicons name="chevron-forward" size={16} color="#A0AEC0" />
          </TouchableOpacity>
        </View>

        {/* 次回支払日 */}
        <View style={s.fieldWrap}>
          <Text style={s.fieldLabel}>次回支払日</Text>
          <TouchableOpacity
            style={[s.textInput, s.dateSelector]}
            onPress={() => setShowDate(true)}
          >
            <Ionicons name="calendar-outline" size={18} color="#475569" />
            <Text style={s.dateSelectorText}>
              {format(form.nextDate, 'yyyy年M月d日(E)', { locale: ja })}
            </Text>
          </TouchableOpacity>
        </View>

        {showDate && (
          <DateTimePicker
            value={form.nextDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            locale="ja-JP"
            onChange={(_, date) => {
              if (Platform.OS === 'android') setShowDate(false);
              if (date) set('nextDate', date);
            }}
          />
        )}
        {Platform.OS === 'ios' && showDate && (
          <TouchableOpacity style={s.dateConfirm} onPress={() => setShowDate(false)}>
            <Text style={s.dateConfirmText}>完了</Text>
          </TouchableOpacity>
        )}

        {/* メモ */}
        <View style={s.fieldWrap}>
          <Text style={s.fieldLabel}>メモ（任意）</Text>
          <TextInput
            style={[s.textInput, s.memoInput]}
            value={form.memo}
            onChangeText={v => set('memo', v)}
            placeholder="備考など"
            placeholderTextColor="#CBD5E0"
            multiline
            textAlignVertical="top"
          />
        </View>
      </View>
    </ScrollView>
  );
}

// ─── 追加・編集モーダル ───────────────────────────────────────────────────────

function ExpenseModal({
  visible, isEdit, form, setForm, onSave, onClose, onQuickAdd,
}: {
  visible: boolean; isEdit: boolean;
  form: FormState; setForm: React.Dispatch<React.SetStateAction<FormState>>;
  onSave: () => void; onClose: () => void;
  onQuickAdd: (exp: Expense) => void;
}) {
  const { isPro, openPaywall } = usePro();
  const { expenses: allExpenses } = useExpenses();

  const [tab, setTab]           = useState<'template' | 'custom'>('template');
  const [tmplCat, setTmplCat]       = useState<Category | null>(null);
  const [tmplSubcat, setTmplSubcat] = useState<string | null>(null);
  const [tmplGroup, setTmplGroup]   = useState<string | null>(null);
  const [showDate, setShowDate] = useState(false);
  const [catPanel, setCatPanel] = useState(false);
  const [payPanel, setPayPanel] = useState(false);
  const [dayInput, setDayInput] = useState('');
  const slideAnim               = useRef(new Animated.Value(SCREEN_W)).current;
  const paySlideAnim            = useRef(new Animated.Value(SCREEN_W)).current;

  // プラン選択ボトムシート
  const [billingItem, setBillingItem] = useState<{
    cat: Category; item: TemplateItem;
    plan: 'monthly' | 'yearly';
    tempDay: string; tempNextDate: Date;
    tempAmount: string; tempCycleDays: string;
    cycleMode: 'days' | 'date';
    groupPlans?: TemplateItem[];
    selectedPlanIdx: number;
  } | null>(null);
  const billingAnim = useRef(new Animated.Value(500)).current;

  const openBillingSheet = (cat: Category, item: TemplateItem) => {
    if (!isPro && allExpenses.length >= FREE_LIMIT) { openPaywall(); return; }
    const today = new Date(); today.setHours(0, 0, 0, 0);
    setCalViewMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    const billingPlan = (!item.cycle || item.cycle === 'monthly') && (item.amount !== undefined || !item.yearlyAmount) ? 'monthly' : 'yearly';
    setBillingItem({
      cat, item, selectedPlanIdx: 0,
      plan: billingPlan,
      tempDay: '', tempNextDate: today,
      tempAmount: item.amount !== undefined && item.currency !== 'USD' ? String(item.amount) : '',
      tempCycleDays: '', cycleMode: 'date',
    });
    Animated.timing(billingAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
  };

  const openGroupBillingSheet = (cat: Category, plans: TemplateItem[]) => {
    if (!isPro && allExpenses.length >= FREE_LIMIT) { openPaywall(); return; }
    const today = new Date(); today.setHours(0, 0, 0, 0);
    setCalViewMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    const first = plans[0];
    const billingPlan = (!first.cycle || first.cycle === 'monthly') && (first.amount !== undefined || !first.yearlyAmount) ? 'monthly' : 'yearly';
    setBillingItem({
      cat, item: first, groupPlans: plans, selectedPlanIdx: 0,
      plan: billingPlan,
      tempDay: '', tempNextDate: today,
      tempAmount: first.amount !== undefined && first.currency !== 'USD' ? String(first.amount) : '',
      tempCycleDays: '', cycleMode: 'date',
    });
    Animated.timing(billingAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
  };

  const closeBillingSheet = (then?: () => void) => {
    Animated.timing(billingAnim, { toValue: 500, duration: 220, useNativeDriver: true })
      .start(() => { setBillingItem(null); then?.(); });
  };

  const handleBillingConfirm = () => {
    if (!billingItem) return;
    const { cat, item, plan, tempDay, tempNextDate, tempAmount, tempCycleDays, cycleMode } = billingItem;
    const hasBothPlans = item.amount !== undefined && item.cycle !== 'yearly' && item.yearlyAmount !== undefined;
    const isMonthlyMode = (!item.cycle || item.cycle === 'monthly') && (item.amount !== undefined || !item.yearlyAmount);
    const effectivePlan: 'monthly' | 'yearly' = hasBothPlans ? plan : (isMonthlyMode ? 'monthly' : 'yearly');
    const showCycleToggle = effectivePlan === 'yearly' && item.cycle !== 'yearly' && !hasBothPlans;
    const presetAmt = item.currency === 'USD' ? undefined : effectivePlan === 'yearly' ? (item.yearlyAmount ?? item.amount) : item.amount;
    const amount = presetAmt !== undefined ? presetAmt : (parseInt(tempAmount, 10) || 0);
    if (amount <= 0) {
      Alert.alert('入力エラー', '金額を入力してください');
      return;
    }
    const cycleDays = parseInt(tempCycleDays, 10);
    const useCustomCycle = showCycleToggle && cycleMode === 'days' && cycleDays > 0;
    let nextDate: Date;
    if (effectivePlan === 'yearly') {
      if (showCycleToggle && cycleMode === 'days') {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        nextDate = today;
      } else {
        nextDate = tempNextDate;
      }
    } else {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const n = parseInt(tempDay, 10);
      if (n >= 1 && n <= 31) {
        let y = today.getFullYear(), m = today.getMonth();
        const candidate = new Date(y, m, n);
        if (candidate < today) { m++; if (m > 11) { m = 0; y++; } }
        nextDate = new Date(y, m, n);
      } else { nextDate = today; }
    }
    const registeredCycle = hasBothPlans ? plan : useCustomCycle ? 'custom' : (item.cycle ?? 'monthly');
    const exp: Expense = {
      id: genId(), name: item.name, amount, category: cat,
      cycle: registeredCycle,
      customCycleDays: useCustomCycle ? cycleDays : undefined,
      nextDate: nextDate.toISOString(), memo: '',
    };
    closeBillingSheet(() => onQuickAdd(exp));
  };

  // クイック追加パネル
  const [quickItem, setQuickItem] = useState<{
    cat: Category; item: TemplateItem;
    step: 'day' | 'amount' | 'payment' | 'yearlyDate';
    tempAmount: string; tempDay: string; tempCustomDays: string;
    tempNextDate: Date;
  } | null>(null);
  const quickSlideAnim = useRef(new Animated.Value(SCREEN_W)).current;

  // 年間カレンダーボトムシート
  const [calSheet, setCalSheet]     = useState(false);
  const calSheetAnim                = useRef(new Animated.Value(600)).current;
  const [calViewMonth, setCalViewMonth] = useState(() => {
    const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d;
  });

  const openCalSheet = () => {
    setCalSheet(true);
    Animated.timing(calSheetAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
  };

  const closeCalSheet = () => {
    Animated.timing(calSheetAnim, { toValue: 600, duration: 240, useNativeDriver: true })
      .start(() => setCalSheet(false));
  };

  const openQuickPanel = (cat: Category, item: TemplateItem) => {
    const hasYenAmount = item.amount !== undefined && item.currency !== 'USD';
    const isMonthly    = !item.cycle || item.cycle === 'monthly';
    const isYearly     = item.cycle === 'yearly';
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const step = hasYenAmount && isMonthly ? 'day'
               : hasYenAmount && isYearly  ? 'yearlyDate'
               : hasYenAmount              ? 'payment'
               :                             'amount';
    setQuickItem({
      cat, item, step,
      tempAmount:     hasYenAmount ? String(item.amount) : '',
      tempDay:        String(new Date().getDate()),
      tempCustomDays: '',
      tempNextDate:   today,
    });
    const calMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setCalViewMonth(calMonth);
    Animated.timing(quickSlideAnim, { toValue: 0, duration: 280, useNativeDriver: true }).start();
    if (step === 'yearlyDate') setTimeout(openCalSheet, 100);
  };

  const closeQuickPanel = () => {
    if (calSheet) closeCalSheet();
    Animated.timing(quickSlideAnim, { toValue: SCREEN_W, duration: 220, useNativeDriver: true })
      .start(() => setQuickItem(null));
  };

  const handleQuickConfirm = () => {
    if (!quickItem) return;
    const { cat, item, step, tempAmount, tempDay, tempCustomDays, tempNextDate } = quickItem;

    // 金額入力ステップ → 次ステップへ
    if (step === 'amount') {
      const n = parseInt(tempAmount, 10);
      if (!tempAmount || isNaN(n) || n <= 0) {
        Alert.alert('入力エラー', '正しい金額を入力してください');
        return;
      }
      if (item.cycle === 'yearly') {
        setQuickItem(q => q && ({ ...q, step: 'yearlyDate' }));
        openCalSheet();
      } else {
        setQuickItem(q => q && ({ ...q, step: 'payment' }));
      }
      return;
    }

    // 年間支払日ステップ → 登録
    if (step === 'yearlyDate') {
      const amount = parseInt(tempAmount, 10);
      const exp: Expense = {
        id:       genId(),
        name:     item.name,
        amount,
        category: cat,
        cycle:    'yearly',
        nextDate: tempNextDate.toISOString(),
        memo:     '',
      };
      onQuickAdd(exp);
      closeQuickPanel();
      return;
    }

    const amount = parseInt(tempAmount, 10);
    const useCustom = tempCustomDays.length > 0 && parseInt(tempCustomDays, 10) > 0;
    const cycle: Cycle = useCustom ? 'custom' : 'monthly';

    const today = new Date(); today.setHours(0, 0, 0, 0);
    let nextDate: Date = today;
    if (!useCustom) {
      const n = parseInt(tempDay, 10);
      if (n >= 1 && n <= 31) {
        let y = today.getFullYear(), m = today.getMonth();
        const candidate = new Date(y, m, n);
        if (candidate < today) { m++; if (m > 11) { m = 0; y++; } }
        nextDate = new Date(y, m, n);
      }
    }

    const exp: Expense = {
      id:              genId(),
      name:            item.name,
      amount,
      category:        cat,
      cycle,
      customCycleDays: useCustom ? parseInt(tempCustomDays, 10) : undefined,
      nextDate:        nextDate.toISOString(),
      memo:            '',
    };
    onQuickAdd(exp);
    closeQuickPanel();
  };

  const handleTmplBack = () => {
    if (tmplGroup !== null)                                   { setTmplGroup(null); return; }
    if (tmplCat === 'subscription' && tmplSubcat !== null)   { setTmplSubcat(null); return; }
    setTmplCat(null); setTmplSubcat(null); setTmplGroup(null);
  };

  // モーダルを閉じたときにテンプレート階層をリセット
  useEffect(() => {
    if (!visible) { setTmplCat(null); setTmplSubcat(null); setTmplGroup(null); }
  }, [visible]);

  // Android 戻るボタン: パネルを順に閉じる
  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (calSheet)    { closeCalSheet();      return true; }
      if (billingItem) { closeBillingSheet();  return true; }
      if (quickItem)   { closeQuickPanel();    return true; }
      if (catPanel)    { closeCatPanel();      return true; }
      if (payPanel)    { closePayPanel();      return true; }
      if (tmplCat !== null) { handleTmplBack(); return true; }
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, calSheet, billingItem, quickItem, catPanel, payPanel, tmplCat, tmplSubcat, tmplGroup]);

  // 編集時はカスタムタブ固定
  const activeTab = isEdit ? 'custom' : tab;

  const openCatPanel = () => {
    setCatPanel(true);
    Animated.timing(slideAnim, { toValue: 0, duration: 280, useNativeDriver: true }).start();
  };

  const closeCatPanel = () => {
    Animated.timing(slideAnim, { toValue: SCREEN_W, duration: 220, useNativeDriver: true })
      .start(() => setCatPanel(false));
  };

  const openPayPanel = () => {
    setDayInput('');
    setPayPanel(true);
    Animated.timing(paySlideAnim, { toValue: 0, duration: 280, useNativeDriver: true }).start();
  };

  const closePayPanel = () => {
    Animated.timing(paySlideAnim, { toValue: SCREEN_W, duration: 220, useNativeDriver: true })
      .start(() => setPayPanel(false));
  };

  const handleDay = (v: string) => {
    const clean = v.replace(/[^0-9]/g, '').slice(0, 2);
    setDayInput(clean);
    const n = parseInt(clean, 10);
    if (n >= 1 && n <= 31) {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      let y = today.getFullYear(), m = today.getMonth();
      const candidate = new Date(y, m, n);
      if (candidate < today) { m++; if (m > 11) { m = 0; y++; } }
      setForm(f => ({ ...f, cycle: 'monthly', nextDate: new Date(y, m, n), customCycleDays: '' }));
    }
  };

  const handleTemplateSelect = (cat: Category, item: TemplateItem) => {
    setForm(f => ({
      ...f,
      name:     item.name,
      amount:   item.amount ? String(item.amount) : f.amount,
      category: cat,
      cycle:    item.cycle ?? f.cycle,
    }));
    setTab('custom');
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={s.modalRoot}>
          {/* ヘッダ */}
          <View style={s.modalHeader}>
            {activeTab === 'template' && tmplCat !== null ? (
              <>
                <TouchableOpacity onPress={handleTmplBack} style={s.modalBtn}>
                  <Ionicons name="chevron-back" size={24} color="#475569" />
                </TouchableOpacity>
                <Text style={s.modalTitle}>
                  {tmplGroup
                    ?? (tmplCat === 'subscription' && tmplSubcat
                        ? SUBSCRIPTION_SUBCATS[tmplSubcat]?.label
                        : CAT[tmplCat].label)}
                </Text>
                <View style={s.modalBtn} />
              </>
            ) : (
              <>
                <TouchableOpacity onPress={onClose} style={s.modalBtn}>
                  <Text style={s.modalBtnCancel}>キャンセル</Text>
                </TouchableOpacity>
                <Text style={s.modalTitle}>{isEdit ? '支出を編集' : '支出を追加'}</Text>
                {activeTab === 'custom' ? (
                  <TouchableOpacity onPress={onSave} style={s.modalBtn}>
                    <Text style={s.modalBtnSave}>保存</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={s.modalBtn} />
                )}
              </>
            )}
          </View>

          {/* タブ（新規追加時のみ） */}
          {!isEdit && (
            <View style={s.tabBar}>
              <TouchableOpacity
                style={[s.tabBtn, tab === 'template' && s.tabBtnActive]}
                onPress={() => setTab('template')}
              >
                <Text style={[s.tabBtnText, tab === 'template' && s.tabBtnTextActive]}>
                  テンプレート
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.tabBtn, tab === 'custom' && s.tabBtnActive]}
                onPress={() => setTab('custom')}
              >
                <Text style={[s.tabBtnText, tab === 'custom' && s.tabBtnTextActive]}>
                  カスタム
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* コンテンツ */}
          <View style={{ flex: 1 }}>
            {activeTab === 'template' ? (
              <TemplateBrowser
                onDirectAdd={openQuickPanel}
                onBillingOpen={openBillingSheet}
                onGroupBillingOpen={openGroupBillingSheet}
                activeCategory={tmplCat}    setActiveCategory={setTmplCat}
                activeSubcat={tmplSubcat}   setActiveSubcat={setTmplSubcat}
                activeGroup={tmplGroup}     setActiveGroup={setTmplGroup}
              />
            ) : (
              <CustomForm
                form={form}
                setForm={setForm}
                showDate={showDate}
                setShowDate={setShowDate}
                onOpenCatPanel={openCatPanel}
                onOpenPayPanel={openPayPanel}
              />
            )}
          </View>
        </View>

        {/* カテゴリスライドパネル */}
        {catPanel && (
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: '#F8FAFC', transform: [{ translateX: slideAnim }] },
            ]}
          >
            <View style={s.catPanelHeader}>
              <TouchableOpacity style={s.catPanelBackBtn} onPress={closeCatPanel} activeOpacity={0.7}>
                <Ionicons name="chevron-back" size={22} color="#475569" />
              </TouchableOpacity>
              <Text style={s.catPanelTitle}>カテゴリを選択</Text>
              <View style={{ width: 44 }} />
            </View>
            <ScrollView keyboardShouldPersistTaps="handled">
              {CATEGORIES.map(cat => {
                const { label, color, icon } = CAT[cat];
                const sel = form.category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[s.catPanelRow, sel && s.catPanelRowSelected]}
                    onPress={() => {
                      setForm(f => ({ ...f, category: cat }));
                      closeCatPanel();
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={[s.catPanelRowIcon, { backgroundColor: color + '20' }]}>
                      <Ionicons name={icon as never} size={18} color={color} />
                    </View>
                    <Text style={[s.catPanelRowText, sel && s.catPanelRowTextSel]}>{label}</Text>
                    {sel && <Ionicons name="checkmark" size={18} color="#475569" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Animated.View>
        )}

        {/* クイック追加パネル */}
        {quickItem && (
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: '#F8FAFC', transform: [{ translateX: quickSlideAnim }] },
            ]}
          >
            <View style={s.catPanelHeader}>
              <TouchableOpacity style={s.catPanelBackBtn} onPress={closeQuickPanel} activeOpacity={0.7}>
                <Ionicons name="chevron-back" size={22} color="#475569" />
              </TouchableOpacity>
              <Text style={s.catPanelTitle}>
                {quickItem.step === 'amount' ? '金額を入力'
                  : quickItem.step === 'payment' ? '支払い周期'
                  : quickItem.step === 'yearlyDate' ? '支払日を選択'
                  : '支払日を確認'}
              </Text>
              <View style={{ width: 44 }} />
            </View>

            {/* ── サービス情報（共通ヘッダ） ── */}
            <View style={s.qaServiceRow}>
              {hasServiceIcon(quickItem.item.name)
                ? <ServiceIcon name={quickItem.item.name} size={48} />
                : <View style={[s.qaPanelIcon, { backgroundColor: CAT[quickItem.cat].color + '20' }]}>
                    <Ionicons name={CAT[quickItem.cat].icon as never} size={22} color={CAT[quickItem.cat].color} />
                  </View>
              }
              <View style={{ flex: 1 }}>
                <Text style={s.qaServiceName}>{quickItem.item.name}</Text>
                {quickItem.step !== 'amount' && (
                  <Text style={s.qaServiceAmt}>
                    {yen(parseInt(quickItem.tempAmount, 10) || 0)}
                    {' / '}
                    {quickItem.step === 'yearlyDate' ? '年間'
                      : quickItem.tempCustomDays ? `${quickItem.tempCustomDays}日ごと` : '毎月'}
                  </Text>
                )}
              </View>
            </View>

            {/* ── step: amount ── */}
            {quickItem.step === 'amount' && (
              <View style={s.qaPanelBody}>
                <Text style={s.qaDayPrompt}>金額（円）</Text>
                <View style={s.qaAmountRow}>
                  <Text style={s.qaAmountSign}>¥</Text>
                  <TextInput
                    style={s.qaAmountInput}
                    value={quickItem.tempAmount}
                    onChangeText={v => setQuickItem(q => q && ({ ...q, tempAmount: v.replace(/[^0-9]/g, '') }))}
                    placeholder="0"
                    placeholderTextColor="#CBD5E0"
                    keyboardType="number-pad"
                    autoFocus
                  />
                </View>
                <TouchableOpacity style={s.qaBtn} onPress={handleQuickConfirm} activeOpacity={0.85}>
                  <Text style={s.qaBtnText}>次へ　→</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── step: payment ── */}
            {quickItem.step === 'payment' && (
              <View style={s.qaPanelBody}>
                <Text style={s.qaDayPrompt}>毎月の支払日</Text>
                <Text style={[s.inputHint, { alignSelf: 'flex-start', marginBottom: 8 }]}>毎月決まった日に引き落とされる場合</Text>
                <View style={s.qaDayRow}>
                  <Text style={s.qaDayLabel}>毎月</Text>
                  <TextInput
                    style={s.qaDayInput}
                    value={quickItem.tempDay}
                    onChangeText={v => setQuickItem(q => q && ({ ...q, tempDay: v.replace(/[^0-9]/g, '').slice(0, 2), tempCustomDays: '' }))}
                    placeholder="15"
                    placeholderTextColor="#CBD5E0"
                    keyboardType="number-pad"
                    maxLength={2}
                    autoFocus
                  />
                  <Text style={s.qaDayLabel}>日払い</Text>
                </View>
                <View style={[s.dayPanelDivider, { width: '100%' }]} />
                <Text style={s.qaDayPrompt}>支払周期</Text>
                <Text style={[s.inputHint, { alignSelf: 'flex-start', marginBottom: 8 }]}>引き落とし間隔を日数で入力（例: 30・60・90）</Text>
                <View style={s.qaDayRow}>
                  <TextInput
                    style={[s.qaDayInput, { width: 110 }]}
                    value={quickItem.tempCustomDays}
                    onChangeText={v => setQuickItem(q => q && ({ ...q, tempCustomDays: v.replace(/[^0-9]/g, ''), tempDay: '' }))}
                    placeholder="30"
                    placeholderTextColor="#CBD5E0"
                    keyboardType="number-pad"
                  />
                  <Text style={s.qaDayLabel}>日ごと</Text>
                </View>
                <TouchableOpacity style={[s.qaBtn, { marginTop: 8 }]} onPress={handleQuickConfirm} activeOpacity={0.85}>
                  <Text style={s.qaBtnText}>登録する</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── step: yearlyDate（年間払い） ── */}
            {quickItem.step === 'yearlyDate' && (
              <View style={s.qaPanelBody}>
                <Text style={s.qaDayPrompt}>年間の支払日</Text>
                <Text style={[s.inputHint, { alignSelf: 'flex-start', marginBottom: 16 }]}>
                  毎年この日に引き落とされます
                </Text>
                <TouchableOpacity
                  style={s.qaDatePickerRow}
                  onPress={openCalSheet}
                  activeOpacity={0.7}
                >
                  <Ionicons name="calendar-outline" size={20} color="#475569" />
                  <Text style={s.qaDatePickerText}>
                    {format(quickItem.tempNextDate, 'M月d日(E)', { locale: ja })}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="#94A3B8" />
                </TouchableOpacity>
                <TouchableOpacity style={[s.qaBtn, { marginTop: 20 }]} onPress={handleQuickConfirm} activeOpacity={0.85}>
                  <Text style={s.qaBtnText}>登録する</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── step: day（毎月払いサブスク） ── */}
            {quickItem.step === 'day' && (
              <View style={s.qaPanelBody}>
                <Text style={s.qaDayPrompt}>毎月の支払日</Text>
                <Text style={[s.inputHint, { alignSelf: 'flex-start', marginBottom: 8 }]}>毎月同じ日に引き落とされる日付を入力</Text>
                <View style={s.qaDayRow}>
                  <Text style={s.qaDayLabel}>毎月</Text>
                  <TextInput
                    style={s.qaDayInput}
                    value={quickItem.tempDay}
                    onChangeText={v => setQuickItem(q => q && ({ ...q, tempDay: v.replace(/[^0-9]/g, '').slice(0, 2) }))}
                    placeholder="15"
                    placeholderTextColor="#CBD5E0"
                    keyboardType="number-pad"
                    maxLength={2}
                    autoFocus
                  />
                  <Text style={s.qaDayLabel}>日払い</Text>
                </View>
                <TouchableOpacity style={s.qaBtn} onPress={handleQuickConfirm} activeOpacity={0.85}>
                  <Text style={s.qaBtnText}>登録する</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        )}

        {/* プラン選択ボトムシート（calSheetより先に描画→calSheetが上に重なる） */}
        {billingItem && (() => {
          const { cat, item, plan, tempDay, tempNextDate, tempAmount, tempCycleDays, cycleMode, groupPlans, selectedPlanIdx } = billingItem;
          const { color: catColor, icon: catIcon } = CAT[cat];
          const hasBothPlans = item.amount !== undefined && item.cycle !== 'yearly' && item.yearlyAmount !== undefined;
          const isMonthlyMode = (!item.cycle || item.cycle === 'monthly') && (item.amount !== undefined || !item.yearlyAmount);
          const effectivePlan: 'monthly' | 'yearly' = hasBothPlans ? plan : (isMonthlyMode ? 'monthly' : 'yearly');
          const showCycleToggle = effectivePlan === 'yearly' && item.cycle !== 'yearly' && !hasBothPlans;
          const groupName = groupPlans ? (item.group ?? item.name) : item.name;
          const presetAmt = item.currency === 'USD' ? undefined : effectivePlan === 'yearly' ? (item.yearlyAmount ?? item.amount) : item.amount;
          const showAmtInput = presetAmt === undefined;
          return (
            <>
              <TouchableOpacity
                style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.45)' }]}
                onPress={() => closeBillingSheet()}
                activeOpacity={1}
              />
              <Animated.View style={[s.billingSheet, { transform: [{ translateY: billingAnim }] }]}>
                <View style={s.billingSheetHandle} />
                {/* サービスヘッダ */}
                <View style={s.billingSheetHead}>
                  {hasServiceIcon(item.name)
                    ? <ServiceIcon name={item.name} size={44} />
                    : <View style={[s.billingSheetIcon, { backgroundColor: catColor + '20' }]}>
                        <Ionicons name={catIcon as never} size={20} color={catColor} />
                      </View>
                  }
                  <View style={{ flex: 1 }}>
                    <Text style={s.billingSheetName}>{groupName}</Text>
                    {!hasBothPlans && !groupPlans && !showAmtInput && (
                      <Text style={s.billingSheetSinglePrice}>
                        {item.currency === 'USD'
                          ? `$${effectivePlan === 'yearly' ? (item.yearlyAmount ?? item.amount) : item.amount}`
                          : yen(effectivePlan === 'yearly' ? (item.yearlyAmount ?? item.amount ?? 0) : (item.amount ?? 0))}
                        <Text style={s.billingSheetPricePer}>{effectivePlan === 'yearly' ? ' /年' : ' /月'}</Text>
                      </Text>
                    )}
                  </View>
                </View>

                {/* グループ内プラン選択チップ */}
                {groupPlans && groupPlans.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginBottom: 14 }}
                    contentContainerStyle={{ gap: 8, paddingHorizontal: 2, paddingBottom: 4 }}
                  >
                    {groupPlans.map((p, i) => (
                      <TouchableOpacity
                        key={i}
                        style={[s.groupPlanChip, selectedPlanIdx === i && s.groupPlanChipSel]}
                        onPress={() => {
                          const newIsMonthly = (!p.cycle || p.cycle === 'monthly') && (p.amount !== undefined || !p.yearlyAmount);
                          const newPlan: 'monthly' | 'yearly' = newIsMonthly ? 'monthly' : 'yearly';
                          setBillingItem(b => b && ({ ...b, item: p, selectedPlanIdx: i, plan: newPlan, tempAmount: p.amount !== undefined && p.currency !== 'USD' ? String(p.amount) : '', tempCycleDays: '', cycleMode: 'date' }));
                        }}
                        activeOpacity={0.75}
                      >
                        <Text style={[s.groupPlanChipName, selectedPlanIdx === i && s.groupPlanChipNameSel]}>
                          {p.planName ?? p.name}
                        </Text>
                        <Text style={[s.groupPlanChipAmt, selectedPlanIdx === i && s.groupPlanChipAmtSel]}>
                          {p.currency === 'USD' ? `$${p.amount}` : yen(p.amount ?? 0)}
                          <Text style={[s.groupPlanChipPer, selectedPlanIdx === i && s.groupPlanChipPerSel]}>/月</Text>
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}

                {/* 月払い・年払い切り替え（両方ある場合のみ） */}
                {hasBothPlans && (
                  <View style={s.billingPlanPicker}>
                    <TouchableOpacity
                      style={[s.billingPlanOpt, plan === 'monthly' && s.billingPlanOptSel]}
                      onPress={() => setBillingItem(b => b && ({ ...b, plan: 'monthly' }))}
                      activeOpacity={0.75}
                    >
                      <Text style={[s.billingPlanOptLabel, plan === 'monthly' && s.billingPlanOptLabelSel]}>月払い</Text>
                      <Text style={[s.billingPlanOptAmt, plan === 'monthly' && s.billingPlanOptAmtSel]}>
                        {item.currency === 'USD' ? `$${item.amount}` : yen(item.amount!)}
                        <Text style={s.billingPlanOptPer}>/月</Text>
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[s.billingPlanOpt, s.billingPlanOptYear, plan === 'yearly' && s.billingPlanOptYearSel]}
                      onPress={() => setBillingItem(b => b && ({ ...b, plan: 'yearly' }))}
                      activeOpacity={0.75}
                    >
                      <Text style={[s.billingPlanOptLabel, plan === 'yearly' && s.billingPlanOptLabelYearSel]}>年払い</Text>
                      <Text style={[s.billingPlanOptAmt, plan === 'yearly' && s.billingPlanOptAmtYearSel]}>
                        {item.currency === 'USD' ? `$${item.yearlyAmount}` : yen(item.yearlyAmount!)}
                        <Text style={s.billingPlanOptPer}>/年</Text>
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* 金額入力（プリセット価格がない場合） */}
                {showAmtInput && (
                  <View style={s.billingAmtSection}>
                    <Text style={s.qaDayPrompt}>金額（円）</Text>
                    <View style={s.billingAmtRow}>
                      <Text style={s.billingAmtSign}>¥</Text>
                      <TextInput
                        style={s.billingAmtInput}
                        value={tempAmount}
                        onChangeText={v => setBillingItem(b => b && ({ ...b, tempAmount: v.replace(/[^0-9]/g, '') }))}
                        placeholder="0"
                        placeholderTextColor="#CBD5E0"
                        keyboardType="number-pad"
                      />
                    </View>
                  </View>
                )}

                {showCycleToggle ? (
                  /* 支払周期 or 支払日 トグル（非月次・非年次固定費） */
                  <View style={s.billingAmtSection}>
                    <View style={s.cycleModeToggle}>
                      <TouchableOpacity
                        style={[s.cycleModeTab, cycleMode === 'days' && s.cycleModeTabActive]}
                        onPress={() => setBillingItem(b => b && ({ ...b, cycleMode: 'days' }))}
                        activeOpacity={0.8}
                      >
                        <Text style={[s.cycleModeTabTxt, cycleMode === 'days' && s.cycleModeTabTxtActive]}>支払周期</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[s.cycleModeTab, cycleMode === 'date' && s.cycleModeTabActive]}
                        onPress={() => setBillingItem(b => b && ({ ...b, cycleMode: 'date', tempCycleDays: '' }))}
                        activeOpacity={0.8}
                      >
                        <Text style={[s.cycleModeTabTxt, cycleMode === 'date' && s.cycleModeTabTxtActive]}>支払日</Text>
                      </TouchableOpacity>
                    </View>
                    {cycleMode === 'days' ? (
                      <View style={[s.qaDayRow, { marginTop: 12 }]}>
                        <TextInput
                          style={s.qaDayInput}
                          value={tempCycleDays}
                          onChangeText={v => setBillingItem(b => b && ({ ...b, tempCycleDays: v.replace(/[^0-9]/g, '') }))}
                          placeholder=""
                          placeholderTextColor="#CBD5E0"
                          keyboardType="number-pad"
                          maxLength={3}
                          autoFocus
                        />
                        <Text style={s.qaDayLabel}>日ごと</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[s.qaDatePickerRow, { marginTop: 12 }]}
                        onPress={openCalSheet}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="calendar-outline" size={20} color="#475569" />
                        <Text style={s.qaDatePickerText}>{format(tempNextDate, 'M月d日(E)', { locale: ja })}</Text>
                        <Ionicons name="chevron-down" size={16} color="#94A3B8" />
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  /* 通常の支払日 */
                  <View style={s.billingAmtSection}>
                    <View style={s.billingDayLabelRow}>
                      <Text style={s.qaDayPrompt}>支払日</Text>
                      {getBillingUrl(groupName) && (
                        <TouchableOpacity
                          onPress={() => Linking.openURL(getBillingUrl(groupName)!)}
                          activeOpacity={0.7}
                          style={s.billingCheckBtn}
                        >
                          <Ionicons name="open-outline" size={12} color="#475569" />
                          <Text style={s.billingCheckTxt}>支払日を確認する</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    {effectivePlan === 'monthly' ? (
                      <View style={[s.qaDayRow, { marginTop: 10 }]}>
                        <Text style={s.qaDayLabel}>毎月</Text>
                        <TextInput
                          style={s.qaDayInput}
                          value={tempDay}
                          onChangeText={v => setBillingItem(b => b && ({ ...b, tempDay: v.replace(/[^0-9]/g, '').slice(0, 2) }))}
                          placeholder=""
                          placeholderTextColor="#CBD5E0"
                          keyboardType="number-pad"
                          maxLength={2}
                        />
                        <Text style={s.qaDayLabel}>日払い</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[s.qaDatePickerRow, { marginTop: 10 }]}
                        onPress={openCalSheet}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="calendar-outline" size={20} color="#475569" />
                        <Text style={s.qaDatePickerText}>{format(tempNextDate, 'M月d日(E)', { locale: ja })}</Text>
                        <Ionicons name="chevron-down" size={16} color="#94A3B8" />
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* 登録する */}
                <TouchableOpacity style={[s.qaBtn, { marginTop: 20 }]} onPress={handleBillingConfirm} activeOpacity={0.85}>
                  <Text style={s.qaBtnText}>登録する</Text>
                </TouchableOpacity>
              </Animated.View>
            </>
          );
        })()}

        {/* 年間支払日カレンダーシート（billingSheetより後に描画→最前面） */}
        {calSheet && (() => {
          const y = calViewMonth.getFullYear();
          const mo = calViewMonth.getMonth();
          const firstDow = new Date(y, mo, 1).getDay();
          const daysInMonth = new Date(y, mo + 1, 0).getDate();
          const selD = billingItem ? billingItem.tempNextDate : quickItem?.tempNextDate;
          const isSel = (d: number) =>
            selD && selD.getFullYear() === y && selD.getMonth() === mo && selD.getDate() === d;
          const cells: (number | null)[] = [
            ...Array(firstDow).fill(null),
            ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
          ];
          while (cells.length % 7 !== 0) cells.push(null);
          const DOW_LABELS = ['日', '月', '火', '水', '木', '金', '土'];
          return (
            <>
              <TouchableOpacity
                style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.45)' }]}
                onPress={closeCalSheet}
                activeOpacity={1}
              />
              <Animated.View style={[s.calSheet, { transform: [{ translateY: calSheetAnim }] }]}>
                <View style={s.calHandle} />
                <View style={s.calNavRow}>
                  <TouchableOpacity style={s.calNavBtn} onPress={() => setCalViewMonth(new Date(y, mo - 1, 1))} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={22} color="#475569" />
                  </TouchableOpacity>
                  <Text style={s.calNavTitle}>{y}年 {mo + 1}月</Text>
                  <TouchableOpacity style={s.calNavBtn} onPress={() => setCalViewMonth(new Date(y, mo + 1, 1))} activeOpacity={0.7}>
                    <Ionicons name="chevron-forward" size={22} color="#475569" />
                  </TouchableOpacity>
                </View>
                <View style={s.calDowRow}>
                  {DOW_LABELS.map((l, i) => (
                    <Text key={l} style={[s.calDowLabel, i === 0 && s.calDowSun, i === 6 && s.calDowSat]}>{l}</Text>
                  ))}
                </View>
                <View style={s.calGrid}>
                  {cells.map((d, idx) => {
                    const col = idx % 7;
                    const sel = d !== null && isSel(d);
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[s.calCell, sel && s.calCellSel]}
                        onPress={() => {
                          if (!d) return;
                          const today = new Date(); today.setHours(0, 0, 0, 0);
                          const ny = new Date(y, mo, d) < today ? y + 1 : y;
                          const newDate = new Date(ny, mo, d);
                          if (billingItem) { setBillingItem(b => b && ({ ...b, tempNextDate: newDate })); }
                          else { setQuickItem(q => q && ({ ...q, tempNextDate: newDate })); }
                          closeCalSheet();
                        }}
                        activeOpacity={d ? 0.7 : 1}
                        disabled={!d}
                      >
                        {d !== null && (
                          <Text style={[s.calCellText, col === 0 && s.calCellSun, col === 6 && s.calCellSat, sel && s.calCellTextSel]}>
                            {d}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <Text style={s.calTapHint}>日付をタップして確定</Text>
              </Animated.View>
            </>
          );
        })()}

        {/* 支払スライドパネル */}
        {payPanel && (
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: '#F8FAFC', transform: [{ translateX: paySlideAnim }] },
            ]}
          >
            <View style={s.catPanelHeader}>
              <TouchableOpacity style={s.catPanelBackBtn} onPress={closePayPanel} activeOpacity={0.7}>
                <Ionicons name="chevron-back" size={22} color="#475569" />
              </TouchableOpacity>
              <Text style={s.catPanelTitle}>支払周期と支払日</Text>
              <View style={{ width: 44 }} />
            </View>
            <View style={s.payPanelContent}>

              {/* 毎月の支払日 */}
              <Text style={s.dayPanelSection}>毎月の支払日</Text>
              <Text style={s.inputHint}>毎月決まった日に引き落とされる場合に入力</Text>
              <View style={s.dayPanel}>
                <View style={s.dayRow}>
                  <Text style={s.dayRowLabel}>毎月</Text>
                  <TextInput
                    style={s.dayNumInput}
                    value={dayInput}
                    onChangeText={handleDay}
                    placeholder="15"
                    placeholderTextColor="#CBD5E0"
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                  <Text style={s.dayRowLabel}>日払い</Text>
                </View>
              </View>

              <View style={s.dayPanelDivider} />

              {/* 支払周期（日数入力） */}
              <Text style={s.dayPanelSection}>支払周期</Text>
              <Text style={s.inputHint}>引き落とし間隔を日数で入力（例: 30・60・90）</Text>
              <View style={s.dayPanel}>
                <View style={s.dayRow}>
                  <TextInput
                    style={[s.dayNumInput, { width: 110 }]}
                    value={form.customCycleDays}
                    onChangeText={v => {
                      setDayInput('');
                      setForm(f => ({
                        ...f,
                        customCycleDays: v.replace(/[^0-9]/g, ''),
                        cycle: 'custom',
                      }));
                    }}
                    placeholder="30"
                    placeholderTextColor="#CBD5E0"
                    keyboardType="number-pad"
                  />
                  <Text style={s.dayRowLabel}>日ごと</Text>
                </View>
              </View>

              <TouchableOpacity style={[s.qaBtn, { marginTop: 20 }]} onPress={closePayPanel} activeOpacity={0.85}>
                <Text style={s.qaBtnText}>完了</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── HomeScreen ───────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { expenses, setExpenses } = useExpenses();
  const { isPro, openPaywall } = usePro();
  const [adVisible, setAdVisible] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm]     = useState<FormState>(blankForm());
  const [sortKey, setSortKey] = useState<'date' | 'amountDesc' | 'amountAsc' | 'name'>('date');
  const [detailExpense, setDetailExpense] = useState<Expense | null>(null);

  const monthlyTotal = expenses.reduce(
    (sum, e) => sum + monthlyEq(e.amount, e.cycle, e.customCycleDays), 0
  );
  const annualTotal = monthlyTotal * 12;

  const addCountRef = useRef(0); // 広告表示カウンター（2回に1回）

  // カウントアップ/ダウンアニメーション
  const animVal           = useRef(new Animated.Value(0)).current;
  const monthlyTotalRef   = useRef(monthlyTotal);
  monthlyTotalRef.current = monthlyTotal;
  const [dispMonthly, setDispMonthly] = useState(0);
  const [dispAnnual,  setDispAnnual]  = useState(0);

  useEffect(() => {
    const id = animVal.addListener(({ value }) => {
      setDispMonthly(Math.round(value));
      setDispAnnual(Math.round(value * 12));
    });
    return () => animVal.removeListener(id);
  }, []);

  // タブに戻ってきた時: ディレイ後に 0 からカウントアップ
  useFocusEffect(
    useCallback(() => {
      animVal.setValue(0);
      Animated.timing(animVal, {
        toValue: monthlyTotalRef.current,
        duration: 1000,
        easing: Easing.in(Easing.quad),
        useNativeDriver: false,
      }).start();
    }, [])
  );

  // 金額が変わった時: イーズインで増減アニメーション
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    Animated.timing(animVal, {
      toValue: monthlyTotal,
      duration: 600,
      easing: Easing.in(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [monthlyTotal]);

  const sorted = [...expenses].sort((a, b) => {
    if (sortKey === 'amountDesc') return monthlyEq(b.amount, b.cycle, b.customCycleDays) - monthlyEq(a.amount, a.cycle, a.customCycleDays);
    if (sortKey === 'amountAsc')  return monthlyEq(a.amount, a.cycle, a.customCycleDays) - monthlyEq(b.amount, b.cycle, b.customCycleDays);
    if (sortKey === 'name')       return a.name.localeCompare(b.name, 'ja');
    return new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime();
  });

  const openAdd = () => {
    if (!isPro && expenses.length >= FREE_LIMIT) { openPaywall(); return; }
    setEditId(null);
    setForm(blankForm());
    setModalVisible(true);
  };

  const openEdit = (exp: Expense) => {
    setEditId(exp.id);
    setForm({
      name:            exp.name,
      amount:          String(exp.amount),
      category:        exp.category,
      cycle:           exp.cycle,
      customCycleDays: exp.customCycleDays ? String(exp.customCycleDays) : '',
      nextDate:        new Date(exp.nextDate),
      memo:            exp.memo,
    });
    setModalVisible(true);
  };

  const handleSave = () => {
    const amount = parseInt(form.amount, 10);
    if (!form.name.trim()) {
      Alert.alert('入力エラー', '名前を入力してください');
      return;
    }
    if (!form.amount || isNaN(amount) || amount <= 0) {
      Alert.alert('入力エラー', '正しい金額を入力してください');
      return;
    }
    if (form.cycle === 'custom') {
      const days = parseInt(form.customCycleDays, 10);
      if (!form.customCycleDays || isNaN(days) || days <= 0) {
        Alert.alert('入力エラー', '間隔の日数を入力してください');
        return;
      }
    }
    const exp: Expense = {
      id:              editId ?? genId(),
      name:            form.name.trim(),
      amount,
      category:        form.category,
      cycle:           form.cycle,
      customCycleDays: form.cycle === 'custom' ? parseInt(form.customCycleDays, 10) : undefined,
      nextDate:        form.nextDate.toISOString(),
      memo:            form.memo.trim(),
    };
    setExpenses(prev =>
      editId ? prev.map(e => e.id === editId ? exp : e) : [...prev, exp]
    );
    setModalVisible(false);
    if (!editId && !isPro) {
      addCountRef.current += 1;
      if (addCountRef.current % 2 === 0) setAdVisible(true);
    }
  };

  const handleQuickAdd = (exp: Expense) => {
    setExpenses(prev => [...prev, exp]);
    setModalVisible(false);
    if (!isPro) {
      addCountRef.current += 1;
      if (addCountRef.current % 2 === 0) setAdVisible(true);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('削除の確認', 'この項目を削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive',
        onPress: () => setExpenses(prev => prev.filter(e => e.id !== id)) },
    ]);
  };

  return (
    <View style={s.root}>
      <LinearGradient
        colors={['#64748B', '#475569', '#334155']}
        style={[s.header, { paddingTop: insets.top + 12 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={s.summaryNew}>
          <Text style={s.summaryMonthLabel}>月額見込み</Text>
          <Text style={s.summaryMonthVal}>{yen(dispMonthly)}</Text>
          <View style={s.summaryBottomRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={s.summaryCountTxt}>{expenses.length}件登録</Text>
              {!isPro && (
                <TouchableOpacity onPress={openPaywall} activeOpacity={0.8}>
                  <Text style={s.freeRemaining}>
                    無料 {Math.max(0, FREE_LIMIT - expenses.length)}件残り
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={s.summaryAnnualTxt}>年間 {yen(dispAnnual)}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={s.listHeader}>
        <Text style={s.listTitle}>登録一覧</Text>
        <View style={s.sortBtns}>
          {(['date','amountDesc','amountAsc','name'] as const).map(k => (
            <TouchableOpacity key={k} style={[s.sortBtn, sortKey === k && s.sortBtnActive]} onPress={() => setSortKey(k)}>
              <Text style={[s.sortBtnTxt, sortKey === k && s.sortBtnTxtActive]}>
                {k === 'date' ? '日付' : k === 'amountDesc' ? '金額↓' : k === 'amountAsc' ? '金額↑' : '名前'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        style={s.list}
        contentContainerStyle={[s.listContent, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {sorted.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="receipt-outline" size={52} color="#CBD5E0" />
            <Text style={s.emptyTitle}>登録がありません</Text>
            <Text style={s.emptySub}>右下の ＋ ボタンから追加できます</Text>
          </View>
        ) : (
          sorted.map(exp => (
            <ExpenseCard
              key={exp.id}
              expense={exp}
              onEdit={() => openEdit(exp)}
              onDelete={() => handleDelete(exp.id)}
              onCardTap={() => setDetailExpense(exp)}
            />
          ))
        )}
      </ScrollView>

      {/* ── 詳細シート ── */}
      <Modal
        visible={!!detailExpense}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailExpense(null)}
      >
        <Pressable style={s.detailOverlay} onPress={() => setDetailExpense(null)}>
          <Pressable style={[s.detailSheet, { paddingBottom: insets.bottom + 24 }]} onPress={() => {}}>
            {detailExpense && (() => {
              const { color, icon } = CAT[detailExpense.category];
              const days   = daysUntil(detailExpense.nextDate);
              const overdue = days < 0;
              const soon    = days >= 0 && days <= 7;
              const monthly = monthlyEq(detailExpense.amount, detailExpense.cycle, detailExpense.customCycleDays);
              const billingUrl = getBillingUrl(detailExpense.name);
              const cycleLabel = detailExpense.cycle === 'monthly' ? '/月'
                               : detailExpense.cycle === 'yearly'  ? '/年'
                               : detailExpense.cycle === 'custom'  ? `/${detailExpense.customCycleDays}日`
                               : '';
              return (
                <>
                  <View style={s.detailHandle} />
                  {/* ヘッダー: 編集ボタン右上 */}
                  <View style={s.detailTopRow}>
                    <View style={{ flex: 1 }} />
                    <TouchableOpacity
                      style={s.detailEditBtn}
                      onPress={() => { setDetailExpense(null); setTimeout(() => openEdit(detailExpense), 80); }}
                      activeOpacity={0.7}
                    >
                      <Feather name="edit-2" size={13} color="#64748B" />
                      <Text style={s.detailEditTxt}>編集</Text>
                    </TouchableOpacity>
                  </View>

                  {/* サービス名 + 金額 */}
                  <View style={s.detailHead}>
                    {hasServiceIcon(detailExpense.name)
                      ? <ServiceIcon name={detailExpense.name} size={52} />
                      : <View style={[s.detailIcon, { backgroundColor: color + '20' }]}>
                          <Ionicons name={icon as never} size={26} color={color} />
                        </View>
                    }
                    <View style={{ flex: 1 }}>
                      <Text style={s.detailName}>{detailExpense.name}</Text>
                      <View style={s.detailAmountRow}>
                        <Text style={s.detailAmount}>{yen(detailExpense.amount)}</Text>
                        {cycleLabel ? <Text style={s.detailAmountPer}>{cycleLabel}</Text> : null}
                      </View>
                    </View>
                  </View>

                  <View style={s.detailDivider} />

                  {/* 情報行 */}
                  <View style={s.detailRows}>
                    <View style={s.detailRow}>
                      <Text style={s.detailRowLabel}>次の支払日</Text>
                      <View style={s.detailRowValueWrap}>
                        <Text style={[s.detailRowValue, overdue && s.textRed, soon && !overdue && s.textOrange]}>
                          {fmtDate(detailExpense.nextDate)}
                        </Text>
                        {overdue
                          ? <Text style={[s.detailBadge, s.detailBadgeRed]}>{Math.abs(days)}日超過</Text>
                          : days === 0
                            ? <Text style={[s.detailBadge, s.detailBadgeOrange]}>今日</Text>
                            : days <= 7
                              ? <Text style={[s.detailBadge, s.detailBadgeOrange]}>あと{days}日</Text>
                              : null
                        }
                      </View>
                    </View>

                    {detailExpense.cycle !== 'irregular' && (
                      <View style={s.detailRow}>
                        <Text style={s.detailRowLabel}>月額換算</Text>
                        <Text style={s.detailRowValue}>{yen(Math.round(monthly))}/月</Text>
                      </View>
                    )}

                    <View style={s.detailRow}>
                      <Text style={s.detailRowLabel}>カテゴリ</Text>
                      <View style={[s.detailCatBadge, { backgroundColor: color + '20' }]}>
                        <Text style={[s.detailCatTxt, { color }]}>{CAT[detailExpense.category].label}</Text>
                      </View>
                    </View>

                    {detailExpense.memo ? (
                      <View style={s.detailRow}>
                        <Text style={s.detailRowLabel}>メモ</Text>
                        <Text style={[s.detailRowValue, { flex: 1, textAlign: 'right' }]} numberOfLines={2}>{detailExpense.memo}</Text>
                      </View>
                    ) : null}
                  </View>

                  {billingUrl && (
                    <>
                      <View style={s.detailDivider} />
                      <TouchableOpacity
                        style={s.detailBillingBtn}
                        onPress={() => Linking.openURL(billingUrl)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="open-outline" size={14} color="#475569" />
                        <Text style={s.detailBillingTxt}>支払日を確認する</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  <View style={s.detailDivider} />
                  <TouchableOpacity
                    style={s.detailDeleteBtn}
                    onPress={() => { setDetailExpense(null); setTimeout(() => handleDelete(detailExpense.id), 80); }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trash-outline" size={15} color="#FC5A5A" />
                    <Text style={s.detailDeleteTxt}>削除</Text>
                  </TouchableOpacity>
                </>
              );
            })()}
          </Pressable>
        </Pressable>
      </Modal>

      <TouchableOpacity
        style={[s.fab, { bottom: insets.bottom + 24 }]}
        onPress={openAdd}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={['#64748B', '#475569']}
          style={s.fabInner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={s.fabText}>＋</Text>
        </LinearGradient>
      </TouchableOpacity>

      <ExpenseModal
        visible={modalVisible}
        isEdit={!!editId}
        form={form}
        setForm={setForm}
        onSave={handleSave}
        onClose={() => setModalVisible(false)}
        onQuickAdd={handleQuickAdd}
      />
      <InterstitialAdModal visible={adVisible} onClose={() => setAdVisible(false)} />
    </View>
  );
}

// ─── スタイル ─────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root:              { flex: 1, backgroundColor: '#F8FAFC' },
  header:            { paddingHorizontal: 20, paddingBottom: 24 },
  appTitle:          { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  appSub:            { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2, marginBottom: 16 },
  summaryNew:        { marginTop: 12 },
  summaryMonthLabel: { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '600', letterSpacing: 0.5, marginBottom: 4 },
  summaryMainRow:    { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  summaryMonthVal:   { fontSize: 46, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  summaryBottomRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 6 },
  summaryAnnualTxt:  { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  summaryCountTxt:   { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: '500', marginTop: 4 },
  freeRemaining:     { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '700', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginTop: 4 },
  nextBox:           { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  nextLabel:         { fontSize: 11, fontWeight: '700', color: '#A0AEC0', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  nextRow:           { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nextDot:           { width: 8, height: 8, borderRadius: 4 },
  nextName:          { flex: 1, fontSize: 15, fontWeight: '700', color: '#1A202C' },
  nextDate:          { fontSize: 13, color: '#718096' },
  nextAmount:        { fontSize: 15, fontWeight: '800', color: '#475569', marginLeft: 8 },
  listHeader:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  listTitle:         { fontSize: 16, fontWeight: '700', color: '#1A202C' },
  listCount:         { fontSize: 13, color: '#A0AEC0' },
  sortBtns:          { flexDirection: 'row', gap: 4 },
  sortBtn:           { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: '#F1F5F9' },
  sortBtnActive:     { backgroundColor: '#475569' },
  sortBtnTxt:        { fontSize: 11, fontWeight: '600', color: '#64748B' },
  sortBtnTxtActive:  { color: '#fff' },
  list:              { flex: 1 },
  listContent:       { paddingHorizontal: 16, gap: 8 },
  // スワイプカード
  swipeWrap:          { borderRadius: 16, overflow: 'hidden' },
  swipeDeleteAction:  { position: 'absolute', left: 0, top: 0, bottom: 0, width: SWIPE_ACTION_W, backgroundColor: '#FC5A5A', justifyContent: 'center', alignItems: 'center', gap: 5 },
  swipeCancelAction:  { position: 'absolute', right: 0, top: 0, bottom: 0, width: SWIPE_ACTION_W, backgroundColor: '#ED8936', justifyContent: 'center', alignItems: 'center', gap: 5 },
  swipeActionText:    { fontSize: 11, fontWeight: '700', color: '#fff', textAlign: 'center' },

  card:              { backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center' },
  cardIcon:          { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardBody:          { flex: 1, gap: 3 },
  cardRow:           { flexDirection: 'row', alignItems: 'center', gap: 6 },
  catBadge:          { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  catBadgeText:      { fontSize: 11, fontWeight: '700' },
  cycleBadge:        { fontSize: 11, color: '#A0AEC0', fontWeight: '500' },
  cardName:          { fontSize: 15, fontWeight: '700', color: '#1A202C' },
  cardDate:          { fontSize: 12, color: '#718096' },
  cardMemo:          { fontSize: 11, color: '#A0AEC0' },
  cancelBtn:         { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2, alignSelf: 'flex-start' },
  cancelBtnText:     { fontSize: 11, color: '#A0AEC0' },
  cardRight:         { alignItems: 'flex-end', gap: 6, marginLeft: 8 },
  cardAmount:        { fontSize: 16, fontWeight: '800', color: '#1A202C' },
  cardActions:       { flexDirection: 'row', gap: 10, alignItems: 'center' },
  cardActionBtn:     { padding: 2 },
  editIconBtn:       { padding: 2 },
  textRed:           { color: '#FC5A5A' },
  textOrange:        { color: '#FF8C42' },

  // 詳細シート
  detailOverlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  detailSheet:        { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 10 },
  detailHandle:       { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', alignSelf: 'center', marginBottom: 4 },
  detailTopRow:       { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 12 },
  detailEditBtn:      { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#F1F5F9' },
  detailEditTxt:      { fontSize: 13, fontWeight: '600', color: '#64748B' },
  detailHead:         { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18 },
  detailIcon:         { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  detailName:         { fontSize: 17, fontWeight: '800', color: '#1A202C', marginBottom: 4 },
  detailAmountRow:    { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  detailAmount:       { fontSize: 24, fontWeight: '800', color: '#1A202C' },
  detailAmountPer:    { fontSize: 14, color: '#94A3B8', fontWeight: '500' },
  detailDivider:      { height: 1, backgroundColor: '#F1F5F9', marginVertical: 14 },
  detailRows:         { gap: 12 },
  detailRow:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  detailRowLabel:     { fontSize: 13, color: '#94A3B8', fontWeight: '500' },
  detailRowValueWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailRowValue:     { fontSize: 14, fontWeight: '600', color: '#1A202C' },
  detailBadge:        { fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  detailBadgeRed:     { backgroundColor: '#FFF5F5', color: '#FC5A5A' },
  detailBadgeOrange:  { backgroundColor: '#FFFAF0', color: '#FF8C42' },
  detailCatBadge:     { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  detailCatTxt:       { fontSize: 12, fontWeight: '700' },
  detailBillingBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12, backgroundColor: '#F8FAFC' },
  detailBillingTxt:   { fontSize: 14, fontWeight: '600', color: '#475569' },
  detailDeleteBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10 },
  detailDeleteTxt:    { fontSize: 14, fontWeight: '600', color: '#FC5A5A' },
  empty:             { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyTitle:        { fontSize: 16, fontWeight: '600', color: '#CBD5E0' },
  emptySub:          { fontSize: 13, color: '#CBD5E0' },
  fab:               { position: 'absolute', right: 22, borderRadius: 30, shadowColor: '#475569', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  fabInner:          { width: 58, height: 58, borderRadius: 29, justifyContent: 'center', alignItems: 'center' },
  fabText:           { fontSize: 28, color: '#fff', lineHeight: 32, fontWeight: '400' },

  // モーダル共通
  modalRoot:         { flex: 1, backgroundColor: '#F8FAFC' },
  modalHeader:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  modalBtn:          { minWidth: 64 },
  modalBtnCancel:    { fontSize: 16, color: '#718096' },
  modalTitle:        { fontSize: 17, fontWeight: '700', color: '#1A202C' },
  modalBtnSave:      { fontSize: 16, fontWeight: '700', color: '#475569', textAlign: 'right' },

  // タブバー
  tabBar:            { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  tabBtn:            { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive:      { borderBottomColor: '#475569' },
  tabBtnText:        { fontSize: 14, fontWeight: '600', color: '#A0AEC0' },
  tabBtnTextActive:  { color: '#475569' },

  // テンプレートブラウザ
  searchWrap:             { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 12, borderRadius: 12, borderWidth: 1, borderColor: '#EDF2F7', paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  searchIcon:             { marginRight: 2 },
  searchInput:            { flex: 1, fontSize: 15, color: '#1A202C', padding: 0 },
  tmplGrid:               { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 8, paddingBottom: 24 },
  tmplGridCard:           { width: TMPL_CARD_W, backgroundColor: '#fff', borderRadius: 14, padding: 10, alignItems: 'center', gap: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  tmplGridIcon:           { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  tmplGridName:           { fontSize: 11, fontWeight: '600', color: '#1A202C', textAlign: 'center' },
  tmplGridMeta:           { fontSize: 10, color: '#A0AEC0', textAlign: 'center' },
  tmplGridAmt:            { fontSize: 10, fontWeight: '700', color: '#475569', textAlign: 'center' },
  tmplGridBilling:        { width: '100%', gap: 3 },
  tmplGridBillingTxt:     { fontSize: 9, fontWeight: '700', color: '#475569', textAlign: 'center' },
  tmplGridBillingTxtYear: { color: '#D97706' },
  tmplItem:               { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F7FAFC', backgroundColor: '#fff', gap: 12 },
  tmplItemIcon:           { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  tmplItemName:           { fontSize: 15, fontWeight: '600', color: '#1A202C' },
  tmplItemMeta:           { fontSize: 12, color: '#A0AEC0', marginTop: 2 },
  tmplItemAmount:         { fontSize: 14, fontWeight: '700', color: '#475569', marginRight: 4 },
  tmplEmpty:              { alignItems: 'center', paddingVertical: 48, gap: 8 },
  tmplEmptyText:          { fontSize: 15, color: '#718096', fontWeight: '600' },
  tmplEmptySubText:       { fontSize: 13, color: '#A0AEC0' },

  // プランバッジ
  planBadge:           { backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, marginRight: 4 },
  planBadgeText:       { fontSize: 11, fontWeight: '700', color: '#475569' },

  // 月払い / 年払いボタン
  billingBtns:         { flexDirection: 'row', gap: 5 },
  billingBtn:          { alignItems: 'center', backgroundColor: '#F7F8FC', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 5, borderWidth: 1, borderColor: '#E2E8F0', minWidth: 62 },
  billingBtnYearly:    { backgroundColor: '#F3F4F6', borderColor: '#D1D5DB' },
  billingBtnLabel:     { fontSize: 10, fontWeight: '600', color: '#718096', marginBottom: 1 },
  billingBtnLabelYearly: { color: '#475569' },
  billingBtnAmount:    { fontSize: 12, fontWeight: '700', color: '#1A202C' },
  billingBtnAmountYearly: { color: '#475569' },

  // フォーム
  modalBody:         { padding: 16, gap: 4 },
  fieldWrap:         { marginBottom: 16 },
  fieldLabel:        { fontSize: 12, fontWeight: '700', color: '#718096', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  required:          { color: '#FC5A5A' },
  textInput:         { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#EDF2F7', paddingHorizontal: 14, paddingVertical: 13, fontSize: 16, color: '#1A202C' },
  amountRow:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#EDF2F7', paddingLeft: 14 },
  yenSign:           { fontSize: 18, color: '#718096', fontWeight: '600' },
  memoInput:         { minHeight: 80, paddingTop: 13 },
  // カテゴリドロップダウン
  dropdownTrigger:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#EDF2F7', paddingHorizontal: 14, paddingVertical: 13, gap: 10 },
  dropdownTriggerIcon:{ width: 26, height: 26, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  dropdownTriggerText:{ flex: 1, fontSize: 16, color: '#1A202C' },

  // カテゴリスライドパネル
  catPanelHeader:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  catPanelBackBtn:      { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  catPanelTitle:        { fontSize: 17, fontWeight: '700', color: '#1A202C' },
  catPanelRow:          { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F7FAFC', gap: 14 },
  catPanelRowSelected:  { backgroundColor: '#F3F4F6' },
  catPanelRowIcon:      { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  catPanelRowText:      { flex: 1, fontSize: 16, color: '#1A202C', fontWeight: '500' },
  catPanelRowTextSel:   { color: '#475569', fontWeight: '700' },

  // クイック追加パネル
  qaServiceRow:     { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  qaServiceName:    { fontSize: 17, fontWeight: '800', color: '#1A202C' },
  qaServiceAmt:     { fontSize: 14, fontWeight: '600', color: '#475569', marginTop: 2 },
  qaPanelBody:      { alignItems: 'center', paddingHorizontal: 28, paddingTop: 32, gap: 16 },
  qaPanelIcon:      { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  qaDayPrompt:      { fontSize: 12, fontWeight: '700', color: '#A0AEC0', textTransform: 'uppercase', letterSpacing: 0.5, alignSelf: 'flex-start' },
  qaDayRow:         { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qaDayLabel:       { fontSize: 18, fontWeight: '600', color: '#4A5568' },
  qaDayInput:       { fontSize: 38, fontWeight: '800', color: '#475569', textAlign: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, paddingVertical: 10, width: 110, borderWidth: 2, borderColor: '#D1D5DB' },
  qaAmountRow:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 14, borderWidth: 2, borderColor: '#D1D5DB', paddingLeft: 16, overflow: 'hidden', width: '100%' },
  qaAmountSign:     { fontSize: 28, fontWeight: '700', color: '#4A5568' },
  qaAmountInput:    { flex: 1, fontSize: 36, fontWeight: '800', color: '#475569', paddingVertical: 12, paddingLeft: 6 },
  qaBtn:            { backgroundColor: '#475569', borderRadius: 14, paddingVertical: 16, marginTop: 4, alignItems: 'center', width: '100%' },
  qaBtnText:        { fontSize: 17, fontWeight: '700', color: '#fff' },
  qaDatePickerRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F3F4F6', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 18, borderWidth: 2, borderColor: '#D1D5DB', width: '100%' },
  qaDatePickerText: { flex: 1, fontSize: 20, fontWeight: '700', color: '#1A202C' },

  // 年間カレンダーシート
  calSheet:         { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingBottom: 32, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 16 },
  calHandle:        { width: 40, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  calNavRow:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  calNavBtn:        { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  calNavTitle:      { fontSize: 17, fontWeight: '800', color: '#1A202C' },
  calDowRow:        { flexDirection: 'row', marginBottom: 4 },
  calDowLabel:      { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '700', color: '#A0AEC0', paddingVertical: 4 },
  calDowSun:        { color: '#EF4444' },
  calDowSat:        { color: '#3B82F6' },
  calGrid:          { flexDirection: 'row', flexWrap: 'wrap' },
  calCell:          { width: Math.floor((SCREEN_W - 32) / 7), aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 100 },
  calCellSel:       { backgroundColor: '#475569' },
  calCellText:      { fontSize: 15, fontWeight: '600', color: '#1A202C' },
  calCellSun:       { color: '#EF4444' },
  calCellSat:       { color: '#3B82F6' },
  calCellTextSel:   { color: '#fff' },
  calTapHint:       { textAlign: 'center', fontSize: 12, color: '#A0AEC0', marginTop: 10, marginBottom: 4 },

  // プラン選択ボトムシート
  billingSheet:             { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingBottom: 40, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 16 },
  billingSheetHandle:       { width: 40, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', alignSelf: 'center', marginTop: 12, marginBottom: 12 },
  billingSheetHead:         { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, marginBottom: 12 },
  billingSheetIcon:         { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  billingSheetName:         { fontSize: 16, fontWeight: '700', color: '#1A202C' },
  billingSheetSinglePrice:  { fontSize: 14, fontWeight: '600', color: '#475569', marginTop: 3 },
  billingSheetPricePer:     { fontSize: 11, fontWeight: '400', color: '#94A3B8' },
  billingPlanPicker:        { flexDirection: 'row', gap: 10, marginBottom: 16 },
  billingPlanOpt:           { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 14, padding: 14, borderWidth: 2, borderColor: '#EDF2F7', alignItems: 'center', gap: 4 },
  billingPlanOptSel:        { backgroundColor: '#475569', borderColor: '#475569' },
  billingPlanOptYear:       {},
  billingPlanOptYearSel:    { backgroundColor: '#475569', borderColor: '#475569' },
  billingPlanOptLabel:      { fontSize: 11, fontWeight: '700', color: '#64748B' },
  billingPlanOptLabelSel:   { color: '#fff' },
  billingPlanOptLabelYearSel: { color: '#fff' },
  billingPlanOptAmt:        { fontSize: 18, fontWeight: '800', color: '#1A202C' },
  billingPlanOptAmtSel:     { color: '#fff' },
  billingPlanOptAmtYearSel: { color: '#fff' },
  billingPlanOptPer:        { fontSize: 11, fontWeight: '400', color: '#94A3B8' },

  // グループ内プラン選択チップ
  groupPlanChip:        { backgroundColor: '#F1F5F9', borderRadius: 14, paddingVertical: 10, paddingHorizontal: 14, alignItems: 'center', minWidth: 80, borderWidth: 2, borderColor: '#EDF2F7' },
  groupPlanChipSel:     { backgroundColor: '#475569', borderColor: '#475569' },
  groupPlanChipName:    { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 4 },
  groupPlanChipNameSel: { color: '#fff' },
  groupPlanChipAmt:     { fontSize: 13, fontWeight: '800', color: '#1A202C' },
  groupPlanChipAmtSel:  { color: '#fff' },
  groupPlanChipPer:     { fontSize: 10, fontWeight: '400', color: '#94A3B8' },
  groupPlanChipPerSel:  { color: 'rgba(255,255,255,0.6)' },

  // 支払周期/支払日トグル
  cycleModeToggle:      { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 12, padding: 3, gap: 3 },
  cycleModeTab:         { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center' },
  cycleModeTabActive:   { backgroundColor: '#475569', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.12, shadowRadius: 3, elevation: 2 },
  cycleModeTabTxt:      { fontSize: 14, fontWeight: '700', color: '#94A3B8' },
  cycleModeTabTxtActive: { color: '#fff' },

  // 金額入力（ビリングシート内）
  billingAmtSection:    { marginBottom: 16 },
  billingDayLabelRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 0 },
  billingCheckBtn:      { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8, backgroundColor: '#F1F5F9' },
  billingCheckTxt:      { fontSize: 11, fontWeight: '600', color: '#475569' },
  billingAmtRow:        { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 14, borderWidth: 2, borderColor: '#D1D5DB', paddingLeft: 16, overflow: 'hidden', marginTop: 10 },
  billingAmtSign:       { fontSize: 22, fontWeight: '700', color: '#4A5568' },
  billingAmtInput:      { flex: 1, fontSize: 28, fontWeight: '800', color: '#475569', paddingVertical: 10, paddingLeft: 6, paddingRight: 16 },

  // 支払スライドパネル
  payPanelContent:    { padding: 16, paddingBottom: 40 },
  payPanelCycleList:  { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#EDF2F7' },

  inputHint:          { fontSize: 12, color: '#A0AEC0', marginTop: -4, marginBottom: 8 },

  // 支払日パネル
  dayPanel:           { backgroundColor: '#F3F4F6', borderRadius: 12, padding: 14, marginBottom: 6 },
  dayPanelSection:    { fontSize: 12, fontWeight: '700', color: '#718096', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  dayPanelDivider:    { height: 1, backgroundColor: '#D1D5DB', marginVertical: 12 },
  dayRow:             { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dayRowLabel:        { fontSize: 16, fontWeight: '600', color: '#4A5568' },
  dayNumInput:        { fontSize: 28, fontWeight: '800', color: '#475569', textAlign: 'center', backgroundColor: '#fff', borderRadius: 10, paddingVertical: 8, width: 80 },
  cycleRow:           { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, paddingHorizontal: 4, borderRadius: 8, gap: 8 },
  cycleRowSelected:   { backgroundColor: 'rgba(55,65,81,0.08)' },
  cycleRowText:       { flex: 1, fontSize: 15, color: '#CBD5E0', fontWeight: '400' },
  cycleRowTextSel:    { color: '#475569', fontWeight: '700' },

  dateSelector:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dateSelectorText:  { fontSize: 16, color: '#1A202C' },
  dateConfirm:       { alignItems: 'flex-end', paddingRight: 4, paddingVertical: 8, marginTop: -8, marginBottom: 8 },
  dateConfirmText:   { fontSize: 16, color: '#475569', fontWeight: '700' },
});
