import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  Platform,
  Alert,
  KeyboardAvoidingView,
  Animated,
  Dimensions,
} from 'react-native';

const SCREEN_W = Dimensions.get('window').width;
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
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
import { TEMPLATES, type TemplateItem } from '../data/templates';
import ServiceIcon, { hasServiceIcon } from '../components/ServiceIcon';

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

function ExpenseCard({ expense, onEdit, onDelete }: {
  expense: Expense; onEdit: () => void; onDelete: () => void;
}) {
  const { label, color, icon } = CAT[expense.category];
  const days = daysUntil(expense.nextDate);
  const overdue = days < 0;
  const soon    = days >= 0 && days <= 7;

  return (
    <TouchableOpacity style={s.card} onPress={onEdit} activeOpacity={0.75}>
      {hasServiceIcon(expense.name)
        ? <View style={{ marginRight: 12 }}><ServiceIcon name={expense.name} size={46} /></View>
        : <View style={[s.cardIcon, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon as never} size={22} color={color} />
          </View>
      }
      <View style={s.cardBody}>
        <View style={s.cardRow}>
          <View style={[s.catBadge, { backgroundColor: color + '18' }]}>
            <Text style={[s.catBadgeText, { color }]}>{label}</Text>
          </View>
          <Text style={s.cycleBadge}>{cycleDisplay(expense.cycle, expense.customCycleDays)}</Text>
        </View>
        <Text style={s.cardName} numberOfLines={1}>{expense.name}</Text>
        <Text style={[s.cardDate, overdue && s.textRed, soon && !overdue && s.textOrange]}>
          {fmtDate(expense.nextDate)}
          {'  '}
          {overdue ? `(${Math.abs(days)}日超過)` : days === 0 ? '(今日)' : days <= 7 ? `(あと${days}日)` : ''}
        </Text>
        {expense.memo ? <Text style={s.cardMemo} numberOfLines={1}>{expense.memo}</Text> : null}
      </View>
      <View style={s.cardRight}>
        <Text style={s.cardAmount}>{yen(expense.amount)}</Text>
        <TouchableOpacity onPress={onDelete} hitSlop={8} style={s.deleteBtn}>
          <Ionicons name="trash-outline" size={16} color="#FC5A5A" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
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

function TemplateBrowser({ onDirectAdd }: {
  onDirectAdd: (cat: Category, item: TemplateItem) => void;
}) {
  const [search, setSearch]         = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activeGroup, setActiveGroup]       = useState<string | null>(null);

  const searchResults = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.trim().toLowerCase();
    const hits: { cat: Category; item: TemplateItem }[] = [];
    for (const cat of CATEGORIES) {
      for (const item of TEMPLATES[cat]) {
        if (item.name.toLowerCase().includes(q)) {
          hits.push({ cat, item });
        }
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
          ) : (
            searchResults!.map(({ cat, item }, i) => {
              const { color, icon } = CAT[cat];
              if (item.yearlyAmount !== undefined) {
                return (
                  <View key={i} style={s.tmplItem}>
                    <TmplIcon name={item.name} color={color} icon={icon} />
                    <Text style={[s.tmplItemName, { flex: 1 }]} numberOfLines={1}>{item.name}</Text>
                    <BillingButtons item={item} cat={cat} onDirectAdd={onDirectAdd} />
                  </View>
                );
              }
              return (
                <TouchableOpacity key={i} style={s.tmplItem}
                  onPress={() => onDirectAdd(cat, item)}
                  activeOpacity={0.7}>
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
                  <Ionicons name="add-circle-outline" size={22} color="#374151" />
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </View>
    );
  }

  // Level 3: プラン一覧
  if (activeGroup !== null && activeCategory !== null) {
    const { label, color, icon } = CAT[activeCategory];
    const plans = TEMPLATES[activeCategory].filter(i => i.group === activeGroup);
    return (
      <View style={{ flex: 1 }}>
        {renderSearchBar(false)}
        <TouchableOpacity style={s.tmplBack} onPress={() => setActiveGroup(null)}>
          <Ionicons name="chevron-back" size={18} color="#374151" />
          <View style={[s.tmplBackIcon, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon as never} size={14} color={color} />
          </View>
          <Text style={s.tmplBackLabel}>{activeGroup}</Text>
        </TouchableOpacity>
        <ScrollView keyboardShouldPersistTaps="handled">
          {plans.map((item, i) => {
            const planLabel = item.planName ?? item.name;
            if (item.yearlyAmount !== undefined) {
              return (
                <View key={i} style={s.tmplItem}>
                  <TmplIcon name={item.name} color={color} icon={icon} />
                  <Text style={[s.tmplItemName, { flex: 1 }]} numberOfLines={1}>{planLabel}</Text>
                  <BillingButtons item={item} cat={activeCategory} onDirectAdd={onDirectAdd} />
                </View>
              );
            }
            return (
              <TouchableOpacity key={i} style={s.tmplItem}
                onPress={() => onDirectAdd(activeCategory, item)}
                activeOpacity={0.7}>
                <TmplIcon name={item.name} color={color} icon={icon} />
                <View style={{ flex: 1 }}>
                  <Text style={s.tmplItemName}>{planLabel}</Text>
                  {item.amount !== undefined && (
                    <Text style={s.tmplItemMeta}>{yen(item.amount)}/月</Text>
                  )}
                </View>
                <Ionicons name="add-circle-outline" size={22} color="#374151" />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  // Level 2: サービス一覧
  if (activeCategory !== null) {
    const { label, color, icon } = CAT[activeCategory];
    const entries = buildServiceEntries(TEMPLATES[activeCategory]);
    return (
      <View style={{ flex: 1 }}>
        {renderSearchBar(false)}
        <TouchableOpacity style={s.tmplBack} onPress={() => { setActiveCategory(null); setActiveGroup(null); }}>
          <Ionicons name="chevron-back" size={18} color="#374151" />
          <View style={[s.tmplBackIcon, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon as never} size={14} color={color} />
          </View>
          <Text style={s.tmplBackLabel}>{label}</Text>
        </TouchableOpacity>
        <ScrollView keyboardShouldPersistTaps="handled">
          {entries.map((entry, i) => {
            if (entry.type === 'group') {
              return (
                <TouchableOpacity key={i} style={s.tmplItem} onPress={() => setActiveGroup(entry.key)} activeOpacity={0.7}>
                  <TmplIcon name={entry.key} color={color} icon={icon} />
                  <Text style={[s.tmplItemName, { flex: 1 }]} numberOfLines={1}>{entry.key}</Text>
                  <View style={s.planBadge}>
                    <Text style={s.planBadgeText}>{entry.items.length}プラン</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#CBD5E0" />
                </TouchableOpacity>
              );
            }
            const item = entry.item;
            if (item.yearlyAmount !== undefined) {
              return (
                <View key={i} style={s.tmplItem}>
                  <TmplIcon name={item.name} color={color} icon={icon} />
                  <Text style={[s.tmplItemName, { flex: 1 }]} numberOfLines={1}>{item.name}</Text>
                  <BillingButtons item={item} cat={activeCategory} onDirectAdd={onDirectAdd} />
                </View>
              );
            }
            return (
              <TouchableOpacity key={i} style={s.tmplItem}
                onPress={() => onDirectAdd(activeCategory, item)}
                activeOpacity={0.7}>
                <TmplIcon name={item.name} color={color} icon={icon} />
                <View style={{ flex: 1 }}>
                  <Text style={s.tmplItemName}>{item.name}</Text>
                  {item.cycle && <Text style={s.tmplItemMeta}>{CYCLE_LABEL[item.cycle]}</Text>}
                </View>
                {item.amount !== undefined && (
                  <Text style={s.tmplItemAmount}>
                    {item.currency === 'USD' ? `$${item.amount}` : yen(item.amount)}
                  </Text>
                )}
                <Ionicons name="add-circle-outline" size={22} color="#374151" />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  // Level 1: カテゴリグリッド
  return (
    <View style={{ flex: 1 }}>
      {renderSearchBar(false)}
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.tmplCatGrid}>
        {CATEGORIES.map(cat => {
          const { label, color, icon } = CAT[cat];
          const count = TEMPLATES[cat].length;
          return (
            <TouchableOpacity
              key={cat}
              style={s.tmplCatCard}
              onPress={() => { setActiveCategory(cat); setActiveGroup(null); }}
              activeOpacity={0.75}
            >
              <View style={[s.tmplCatIcon, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon as never} size={26} color={color} />
              </View>
              <Text style={s.tmplCatLabel}>{label}</Text>
              <Text style={s.tmplCatCount}>{count}件</Text>
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
            <Ionicons name="calendar-outline" size={15} color="#374151" />
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
            <Ionicons name="calendar-outline" size={18} color="#374151" />
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
  const [tab, setTab]           = useState<'template' | 'custom'>('template');
  const [showDate, setShowDate] = useState(false);
  const [catPanel, setCatPanel] = useState(false);
  const [payPanel, setPayPanel] = useState(false);
  const [dayInput, setDayInput] = useState('');
  const slideAnim               = useRef(new Animated.Value(SCREEN_W)).current;
  const paySlideAnim            = useRef(new Animated.Value(SCREEN_W)).current;

  // クイック追加パネル
  const [quickItem, setQuickItem] = useState<{
    cat: Category; item: TemplateItem;
    step: 'day' | 'amount' | 'payment';
    tempAmount: string; tempCycle: Cycle; tempDay: string; tempCustomDays: string;
  } | null>(null);
  const quickSlideAnim = useRef(new Animated.Value(SCREEN_W)).current;

  const openQuickPanel = (cat: Category, item: TemplateItem) => {
    const hasYenAmount = item.amount !== undefined && item.currency !== 'USD';
    const isMonthly    = !item.cycle || item.cycle === 'monthly';
    const step = hasYenAmount && isMonthly ? 'day'
               : hasYenAmount              ? 'payment'
               :                             'amount';
    setQuickItem({
      cat, item, step,
      tempAmount:     hasYenAmount ? String(item.amount) : '',
      tempCycle:      item.cycle ?? 'monthly',
      tempDay:        String(new Date().getDate()),
      tempCustomDays: '',
    });
    Animated.timing(quickSlideAnim, { toValue: 0, duration: 280, useNativeDriver: true }).start();
  };

  const closeQuickPanel = () => {
    Animated.timing(quickSlideAnim, { toValue: SCREEN_W, duration: 220, useNativeDriver: true })
      .start(() => setQuickItem(null));
  };

  const handleQuickConfirm = () => {
    if (!quickItem) return;
    const { cat, item, step, tempAmount, tempCycle, tempDay, tempCustomDays } = quickItem;

    // 金額入力ステップ → 支払周期ステップへ
    if (step === 'amount') {
      const n = parseInt(tempAmount, 10);
      if (!tempAmount || isNaN(n) || n <= 0) {
        Alert.alert('入力エラー', '正しい金額を入力してください');
        return;
      }
      setQuickItem(q => q && ({ ...q, step: 'payment' }));
      return;
    }

    const amount = parseInt(tempAmount, 10);
    const cycle  = step === 'day' ? (item.cycle ?? 'monthly') : tempCycle;

    const today = new Date(); today.setHours(0, 0, 0, 0);
    let nextDate: Date = today;
    if (cycle === 'monthly') {
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
      customCycleDays: cycle === 'custom' ? (parseInt(tempCustomDays, 10) || undefined) : undefined,
      nextDate:        nextDate.toISOString(),
      memo:            '',
    };
    onQuickAdd(exp);
    closeQuickPanel();
  };

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
    if (form.cycle === 'monthly') setDayInput(String(form.nextDate.getDate()));
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
      setForm(f => ({ ...f, cycle: 'monthly', nextDate: new Date(y, m, n) }));
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
              <TemplateBrowser onDirectAdd={openQuickPanel} />
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
              { backgroundColor: '#F5F6FA', transform: [{ translateX: slideAnim }] },
            ]}
          >
            <View style={s.catPanelHeader}>
              <TouchableOpacity style={s.catPanelBackBtn} onPress={closeCatPanel} activeOpacity={0.7}>
                <Ionicons name="chevron-back" size={22} color="#374151" />
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
                    {sel && <Ionicons name="checkmark" size={18} color="#374151" />}
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
              { backgroundColor: '#F5F6FA', transform: [{ translateX: quickSlideAnim }] },
            ]}
          >
            <View style={s.catPanelHeader}>
              <TouchableOpacity style={s.catPanelBackBtn} onPress={closeQuickPanel} activeOpacity={0.7}>
                <Ionicons name="chevron-back" size={22} color="#374151" />
              </TouchableOpacity>
              <Text style={s.catPanelTitle}>
                {quickItem.step === 'amount' ? '金額を入力' : quickItem.step === 'payment' ? '支払い周期' : '支払日を確認'}
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
                    {' / '}{quickItem.step === 'day' ? '月' : CYCLE_LABEL[quickItem.tempCycle]}
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
              <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.qaPanelBody}>
                <Text style={s.qaDayPrompt}>支払い周期</Text>
                <View style={s.payPanelCycleList}>
                  {CYCLES.map(cycle => {
                    const sel = quickItem.tempCycle === cycle;
                    return (
                      <TouchableOpacity
                        key={cycle}
                        style={[s.cycleRow, { paddingHorizontal: 14 }, sel && s.cycleRowSelected]}
                        onPress={() => setQuickItem(q => q && ({ ...q, tempCycle: cycle }))}
                        activeOpacity={0.7}
                      >
                        <Text style={[s.cycleRowText, sel && s.cycleRowTextSel]}>{CYCLE_LABEL[cycle]}</Text>
                        {sel && <Ionicons name="checkmark" size={16} color="#374151" />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {quickItem.tempCycle === 'monthly' && (
                  <>
                    <View style={s.dayPanelDivider} />
                    <Text style={[s.qaDayPrompt, { marginBottom: 12 }]}>毎月の支払日</Text>
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
                      />
                      <Text style={s.qaDayLabel}>日払い</Text>
                    </View>
                  </>
                )}
                {quickItem.tempCycle === 'custom' && (
                  <>
                    <View style={s.dayPanelDivider} />
                    <Text style={[s.qaDayPrompt, { marginBottom: 12 }]}>間隔（日数）</Text>
                    <View style={s.qaDayRow}>
                      <TextInput
                        style={[s.qaDayInput, { width: 110 }]}
                        value={quickItem.tempCustomDays}
                        onChangeText={v => setQuickItem(q => q && ({ ...q, tempCustomDays: v.replace(/[^0-9]/g, '') }))}
                        placeholder="30"
                        placeholderTextColor="#CBD5E0"
                        keyboardType="number-pad"
                      />
                      <Text style={s.qaDayLabel}>日ごと</Text>
                    </View>
                  </>
                )}
                <TouchableOpacity style={[s.qaBtn, { marginTop: 20 }]} onPress={handleQuickConfirm} activeOpacity={0.85}>
                  <Text style={s.qaBtnText}>登録する</Text>
                </TouchableOpacity>
              </ScrollView>
            )}

            {/* ── step: day（毎月払いサブスク） ── */}
            {quickItem.step === 'day' && (
              <View style={s.qaPanelBody}>
                <Text style={s.qaDayPrompt}>毎月の支払日</Text>
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

        {/* 支払スライドパネル */}
        {payPanel && (
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: '#F5F6FA', transform: [{ translateX: paySlideAnim }] },
            ]}
          >
            <View style={s.catPanelHeader}>
              <TouchableOpacity style={s.catPanelBackBtn} onPress={closePayPanel} activeOpacity={0.7}>
                <Ionicons name="chevron-back" size={22} color="#374151" />
              </TouchableOpacity>
              <Text style={s.catPanelTitle}>支払周期と支払日</Text>
              <View style={{ width: 44 }} />
            </View>
            <View style={s.payPanelContent}>

              {/* 毎月の支払日 */}
              <Text style={s.dayPanelSection}>毎月の支払日</Text>
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
              <View style={s.dayPanel}>
                <View style={s.dayRow}>
                  <TextInput
                    style={[s.dayNumInput, { width: 110 }]}
                    value={form.customCycleDays}
                    onChangeText={v => setForm(f => ({
                      ...f,
                      customCycleDays: v.replace(/[^0-9]/g, ''),
                      cycle: 'custom',
                    }))}
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

  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm]     = useState<FormState>(blankForm());

  const monthlyTotal = expenses.reduce(
    (sum, e) => sum + monthlyEq(e.amount, e.cycle, e.customCycleDays), 0
  );
  const annualTotal = monthlyTotal * 12;

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
      Animated.sequence([
        Animated.delay(400),
        Animated.timing(animVal, {
          toValue: monthlyTotalRef.current,
          duration: 900,
          useNativeDriver: false,
        }),
      ]).start();
    }, [])
  );

  // 金額が変わった時: ディレイ後に増減アニメーション
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    Animated.sequence([
      Animated.delay(250),
      Animated.timing(animVal, {
        toValue: monthlyTotal,
        duration: 500,
        useNativeDriver: false,
      }),
    ]).start();
  }, [monthlyTotal]);

  const sorted = [...expenses].sort(
    (a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime()
  );

  const openAdd = () => {
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
  };

  const handleQuickAdd = (exp: Expense) => {
    setExpenses(prev => [...prev, exp]);
    setModalVisible(false);
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
        colors={['#4B5563', '#374151', '#1F2937']}
        style={[s.header, { paddingTop: insets.top + 12 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={s.summaryNew}>
          <Text style={s.summaryMonthLabel}>月額見込み</Text>
          <Text style={s.summaryMonthVal}>{yen(dispMonthly)}</Text>
          <View style={s.summaryFootRow}>
            <Text style={s.summaryAnnualTxt}>年間 {yen(dispAnnual)}</Text>
            <View style={s.summaryDot} />
            <Text style={s.summaryCountTxt}>{expenses.length}件登録</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={s.listHeader}>
        <Text style={s.listTitle}>登録一覧</Text>
        <Text style={s.listCount}>{expenses.length}件</Text>
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
            />
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={[s.fab, { bottom: insets.bottom + 24 }]}
        onPress={openAdd}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={['#4B5563', '#374151']}
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
    </View>
  );
}

// ─── スタイル ─────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root:              { flex: 1, backgroundColor: '#F5F6FA' },
  header:            { paddingHorizontal: 20, paddingBottom: 24 },
  appTitle:          { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  appSub:            { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2, marginBottom: 16 },
  summaryNew:        { marginTop: 12 },
  summaryMonthLabel: { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '600', letterSpacing: 0.5, marginBottom: 4 },
  summaryMonthVal:   { fontSize: 46, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  summaryFootRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  summaryAnnualTxt:  { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  summaryDot:        { width: 3, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.4)' },
  summaryCountTxt:   { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },
  nextBox:           { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  nextLabel:         { fontSize: 11, fontWeight: '700', color: '#A0AEC0', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  nextRow:           { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nextDot:           { width: 8, height: 8, borderRadius: 4 },
  nextName:          { flex: 1, fontSize: 15, fontWeight: '700', color: '#1A202C' },
  nextDate:          { fontSize: 13, color: '#718096' },
  nextAmount:        { fontSize: 15, fontWeight: '800', color: '#374151', marginLeft: 8 },
  listHeader:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  listTitle:         { fontSize: 16, fontWeight: '700', color: '#1A202C' },
  listCount:         { fontSize: 13, color: '#A0AEC0' },
  list:              { flex: 1 },
  listContent:       { paddingHorizontal: 16, gap: 8 },
  card:              { backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  cardIcon:          { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardBody:          { flex: 1, gap: 3 },
  cardRow:           { flexDirection: 'row', alignItems: 'center', gap: 6 },
  catBadge:          { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  catBadgeText:      { fontSize: 11, fontWeight: '700' },
  cycleBadge:        { fontSize: 11, color: '#A0AEC0', fontWeight: '500' },
  cardName:          { fontSize: 15, fontWeight: '700', color: '#1A202C' },
  cardDate:          { fontSize: 12, color: '#718096' },
  cardMemo:          { fontSize: 11, color: '#A0AEC0' },
  cardRight:         { alignItems: 'flex-end', gap: 6, marginLeft: 8 },
  cardAmount:        { fontSize: 16, fontWeight: '800', color: '#1A202C' },
  deleteBtn:         { padding: 4 },
  textRed:           { color: '#FC5A5A' },
  textOrange:        { color: '#FF8C42' },
  empty:             { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyTitle:        { fontSize: 16, fontWeight: '600', color: '#CBD5E0' },
  emptySub:          { fontSize: 13, color: '#CBD5E0' },
  fab:               { position: 'absolute', right: 22, borderRadius: 30, shadowColor: '#374151', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  fabInner:          { width: 58, height: 58, borderRadius: 29, justifyContent: 'center', alignItems: 'center' },
  fabText:           { fontSize: 28, color: '#fff', lineHeight: 32, fontWeight: '400' },

  // モーダル共通
  modalRoot:         { flex: 1, backgroundColor: '#F5F6FA' },
  modalHeader:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  modalBtn:          { minWidth: 64 },
  modalBtnCancel:    { fontSize: 16, color: '#718096' },
  modalTitle:        { fontSize: 17, fontWeight: '700', color: '#1A202C' },
  modalBtnSave:      { fontSize: 16, fontWeight: '700', color: '#374151', textAlign: 'right' },

  // タブバー
  tabBar:            { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  tabBtn:            { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive:      { borderBottomColor: '#374151' },
  tabBtnText:        { fontSize: 14, fontWeight: '600', color: '#A0AEC0' },
  tabBtnTextActive:  { color: '#374151' },

  // テンプレートブラウザ
  searchWrap:        { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 12, borderRadius: 12, borderWidth: 1, borderColor: '#EDF2F7', paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  searchIcon:        { marginRight: 2 },
  searchInput:       { flex: 1, fontSize: 15, color: '#1A202C', padding: 0 },
  tmplCatGrid:       { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10, paddingBottom: 20 },
  tmplCatCard:       { width: '47%', backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  tmplCatIcon:       { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  tmplCatLabel:      { fontSize: 14, fontWeight: '700', color: '#1A202C' },
  tmplCatCount:      { fontSize: 12, color: '#A0AEC0' },
  tmplBack:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 8, borderBottomWidth: 1, borderBottomColor: '#EDF2F7', backgroundColor: '#fff' },
  tmplBackIcon:      { width: 24, height: 24, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  tmplBackLabel:     { fontSize: 15, fontWeight: '700', color: '#1A202C' },
  tmplItem:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F7FAFC', backgroundColor: '#fff', gap: 12 },
  tmplItemIcon:      { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  tmplItemName:      { fontSize: 15, fontWeight: '600', color: '#1A202C' },
  tmplItemMeta:      { fontSize: 12, color: '#A0AEC0', marginTop: 2 },
  tmplItemAmount:    { fontSize: 14, fontWeight: '700', color: '#374151', marginRight: 4 },
  tmplEmpty:         { alignItems: 'center', paddingVertical: 48, gap: 8 },
  tmplEmptyText:     { fontSize: 15, color: '#718096', fontWeight: '600' },
  tmplEmptySubText:  { fontSize: 13, color: '#A0AEC0' },

  // プランバッジ
  planBadge:           { backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, marginRight: 4 },
  planBadgeText:       { fontSize: 11, fontWeight: '700', color: '#374151' },

  // 月払い / 年払いボタン
  billingBtns:         { flexDirection: 'row', gap: 5 },
  billingBtn:          { alignItems: 'center', backgroundColor: '#F7F8FC', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 5, borderWidth: 1, borderColor: '#E2E8F0', minWidth: 62 },
  billingBtnYearly:    { backgroundColor: '#F3F4F6', borderColor: '#D1D5DB' },
  billingBtnLabel:     { fontSize: 10, fontWeight: '600', color: '#718096', marginBottom: 1 },
  billingBtnLabelYearly: { color: '#374151' },
  billingBtnAmount:    { fontSize: 12, fontWeight: '700', color: '#1A202C' },
  billingBtnAmountYearly: { color: '#374151' },

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
  catPanelRowTextSel:   { color: '#374151', fontWeight: '700' },

  // クイック追加パネル
  qaServiceRow:     { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  qaServiceName:    { fontSize: 17, fontWeight: '800', color: '#1A202C' },
  qaServiceAmt:     { fontSize: 14, fontWeight: '600', color: '#374151', marginTop: 2 },
  qaPanelBody:      { alignItems: 'center', paddingHorizontal: 28, paddingTop: 32, gap: 16 },
  qaPanelIcon:      { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  qaDayPrompt:      { fontSize: 12, fontWeight: '700', color: '#A0AEC0', textTransform: 'uppercase', letterSpacing: 0.5, alignSelf: 'flex-start' },
  qaDayRow:         { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qaDayLabel:       { fontSize: 18, fontWeight: '600', color: '#4A5568' },
  qaDayInput:       { fontSize: 38, fontWeight: '800', color: '#374151', textAlign: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, paddingVertical: 10, width: 110, borderWidth: 2, borderColor: '#D1D5DB' },
  qaAmountRow:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 14, borderWidth: 2, borderColor: '#D1D5DB', paddingLeft: 16, overflow: 'hidden', width: '100%' },
  qaAmountSign:     { fontSize: 28, fontWeight: '700', color: '#4A5568' },
  qaAmountInput:    { flex: 1, fontSize: 36, fontWeight: '800', color: '#374151', paddingVertical: 12, paddingLeft: 6 },
  qaBtn:            { backgroundColor: '#374151', borderRadius: 14, paddingVertical: 16, marginTop: 4, alignItems: 'center', width: '100%' },
  qaBtnText:        { fontSize: 17, fontWeight: '700', color: '#fff' },

  // 支払スライドパネル
  payPanelContent:    { padding: 16, paddingBottom: 40 },
  payPanelCycleList:  { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#EDF2F7' },

  // 支払日パネル
  dayPanel:           { backgroundColor: '#F3F4F6', borderRadius: 12, padding: 14, marginBottom: 6 },
  dayPanelSection:    { fontSize: 12, fontWeight: '700', color: '#718096', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  dayPanelDivider:    { height: 1, backgroundColor: '#D1D5DB', marginVertical: 12 },
  dayRow:             { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dayRowLabel:        { fontSize: 16, fontWeight: '600', color: '#4A5568' },
  dayNumInput:        { fontSize: 28, fontWeight: '800', color: '#374151', textAlign: 'center', backgroundColor: '#fff', borderRadius: 10, paddingVertical: 8, width: 80 },
  cycleRow:           { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, paddingHorizontal: 4, borderRadius: 8, gap: 8 },
  cycleRowSelected:   { backgroundColor: 'rgba(55,65,81,0.08)' },
  cycleRowText:       { flex: 1, fontSize: 15, color: '#CBD5E0', fontWeight: '400' },
  cycleRowTextSel:    { color: '#374151', fontWeight: '700' },

  dateSelector:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dateSelectorText:  { fontSize: 16, color: '#1A202C' },
  dateConfirm:       { alignItems: 'flex-end', paddingRight: 4, paddingVertical: 8, marginTop: -8, marginBottom: 8 },
  dateConfirmText:   { fontSize: 16, color: '#374151', fontWeight: '700' },
});
