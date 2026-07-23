# sabusukujinnsei — アーキテクチャ概要

## プロジェクト概要

**アプリ名**: サブスクじんせい  
**技術スタック**: Expo SDK 54 / React Native 0.81.5 / TypeScript  
**ターゲット**: Android (Google Play) / iOS  
**マネタイズ**: RevenueCat（月額 + 買い切り）

---

## 画面構成（Bottom Tab Navigator）

```
App.tsx
├── OnboardingScreen（初回のみ、ナビゲーター外）
└── TabNavigator（returning users）
    ├── 一覧 → HomeScreen.tsx
    ├── カレンダー → CalendarScreen.tsx
    ├── グラフ → ChartScreen.tsx
    ├── 一括削除 → SimulatorScreen.tsx
    └── 設定 → SettingsScreen.tsx
```

**Provider 順（外→内）:**
```
SafeAreaProvider
  ProProvider
    CustomCategoriesProvider
      ExpensesProvider
        SettingsProvider
          NavigationContainer
            TabNavigator
          PaywallScreen（Modal、常時マウント）
```

---

## 各スクリーン

### HomeScreen.tsx（約2874行）
アプリのメイン。ほぼ全機能がここに集約されている。

- スワイプ削除 / キャンセルURL表示（subscription のみ）
- 段階的入場アニメーション（translateY のみ、opacity なし）
- ExpenseModal：テンプレート vs カスタム追加
  - テンプレートブラウザ: category → subscription-subcat → service → plan（4段階）
  - カスタムフォーム：名前、金額、カテゴリ、支払周期、支払日
- 支払周期チップ: 1週間 / 2週間 / 3週間 / 4週間 / 1年
- カードに年/月サイクルバッジ表示（cyclePill）
- StaggerItem: opacity フェードのみ（ちかちか防止）

### CalendarScreen.tsx
月別カレンダー。支払日を表示。左右スワイプで月移動。

### ChartScreen.tsx
SVGドーナツグラフ（react-native-svg）で月額コストを可視化。  
フィルタ: 全て / サブスク / 固定費。

### SimulatorScreen.tsx（「一括削除」タブ）
チェックボックスで不要サービスを選択 → 削減額リアルタイム表示 → 退会ステップ案内 → 一括削除。

### SettingsScreen.tsx
通知設定（有効/無効、対象、タイミング）。通知スケジューリングを変更ごとに再実行。

### OnboardingScreen.tsx
5スライドのオンボーディング。最後に通知許可を求め、許可された場合は `notif_auto_enabled=true` をAsyncStorageに保存。

### PaywallScreen.tsx
Modal（常時マウント）。RevenueCatから月額・買い切りプランを取得。Expo Goではモック使用。

### AddEditScreen.tsx / DetailScreen.tsx
**レガシー**。`RootStackParamList` を使うが、App.tsx の TabNavigator には接続されていない。現在は使用されていない。

---

## Context / State 管理

### ExpensesContext.tsx
- `expenses: Expense[]` を in-memory で管理（**AsyncStorage 永続化なし** ← 要注意）
- ドメインロジックも同居: `monthlyEq`, `cycleDisplay`, `isPaymentOnDate`
- `Expense` 型: `customCategoryLabel?`, `customCycleDays?` を含む拡張版

### ProContext.tsx
- RevenueCat ラッパー
- `FREE_LIMIT = 5`
- `isPro`, `paywallVisible`, `monthlyPackage`, `lifetimePackage`
- Expo Go では `¥200/月`, `¥900/買い切り` のモック
- `lifetime` パッケージ: `current.lifetime ?? availablePackages.find(p => p.packageType === 'LIFETIME')` でフォールバック

### SettingsContext.tsx
- `NotificationSettings { enabled, target, daysBefore: number[] }`
- AsyncStorage key: `@notification_settings`
- 起動時に `notif_auto_enabled` も読み込み、許可済みなら自動オン

### CustomCategoriesContext.tsx
- ユーザー定義カテゴリ（AsyncStorage: `@custom_categories_v1`）
- 表示順（AsyncStorage: `@category_order_v1`）

---

## データ層（二重構造）

| 層 | 使用ファイル | 永続化 | 状態 |
|---|---|---|---|
| **アクティブ** | ExpensesContext + Home/Calendar/Chart/SimulatorScreen | なし（in-memory） | 現用 |
| **レガシー** | src/utils/storage.ts + AddEditScreen + DetailScreen | AsyncStorage `@fixed_expenses` | 未使用 |

> **重要**: アクティブな expenses データはアプリ再起動で消える。将来的には ExpensesContext に AsyncStorage 永続化を追加する必要がある。

---

## ユーティリティ

| ファイル | 役割 |
|---|---|
| `src/utils/notifications.ts` | expo-notifications ラッパー。許可リクエスト、スケジューリング（60日間、09:00） |
| `src/utils/storage.ts` | レガシー AsyncStorage CRUD |
| `src/utils/calculations.ts` | レガシー計算・フォーマット関数 |
| `src/data/templates.ts` | テンプレートDB、キャンセルURL/ステップ（100+サービス） |
| `src/constants/index.ts` | レガシー定数（COLORS, CYCLE_LABELS 等） |
| `src/types/index.ts` | レガシー型定義（RootStackParamList 等） |

---

## ビルド / デプロイ

- **EAS Build**: フリーティア枯渇のため現在WSLローカルビルドで代替
- **ローカルビルド手順** (WSL):
  ```bash
  cd ~/sabusukujinnsei/android
  ./gradlew bundleRelease
  ```
  - 署名キー: `~/@hanatare__sabusukujinnsei.jks`
  - キーエイリアス: `586f9657299a03b720311ee5963a9d85`
  - `gradle.properties` に `MYAPP_UPLOAD_*` を設定
  - `expo prebuild --clean` 後は `build.gradle` の signing config を手動で復元
- **versionCode**: 現在12（Google Play内部テスト）
- **ブランチ**: `claude/fixed-expenses-app-uNQFm`

---

## 既知の問題 / 技術的負債

1. **ExpensesContext に永続化がない** → 再起動でデータが消える（要確認・修正）
2. **HomeScreen が巨大すぎる**（2874行）→ 分割を検討
3. **AddEditScreen / DetailScreen がデッドコード**
4. **型定義が二重**（src/types vs ExpensesContext 内のインライン型）
5. **expo prebuild がsigning configを上書きする** → ビルド前にバックアップが必要
