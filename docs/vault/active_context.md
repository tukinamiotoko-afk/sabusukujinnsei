# アクティブコンテキスト

## 最終更新
2026-07-23

## 現在のブランチ
`claude/fixed-expenses-app-uNQFm`

---

## 完了した主な実装（このブランチ）

### UI / UX
- [x] スワイプ時の削除・退会ボタンが透けて見える問題を修正（translateY のみ、opacity なし）
- [x] テンプレートブラウザのアニメーションを opacity フェードのみに変更（ちかちか防止）
- [x] カードにサイクルバッジ（cyclePill）を追加（年/月表示）
- [x] 支払周期チップを HomeScreen に追加（1週間/2週間/3週間/4週間/1年）
- [x] AddEditScreen で支払周期選択時に次回予定日を自動計算

### 機能
- [x] オンボーディング最終スライドで通知許可リクエスト
  - `requestNotificationPermission()` 呼び出し
  - 許可された場合 `notif_auto_enabled=true` を AsyncStorage に保存
- [x] SettingsContext が `notif_auto_enabled` を読み取り、自動オン

### RevenueCat
- [x] `pro_lifetime` パッケージが「読み込み中」になる問題を修正
  - `current.lifetime ?? availablePackages.find(...)` フォールバックを追加

### ビルド
- [x] WSLローカルビルド環境を構築（Android SDK at ~/android-sdk）
- [x] EASキーストアを設定（build.gradle signing config）
- [x] versionCode 12 で内部テスト提出済み

---

## 次にやること

### 優先度高
- [ ] **ExpensesContext に AsyncStorage 永続化を追加**
  - 現在 expenses は in-memory のみ → 再起動でデータが消える
  - `loadExpenses` / `saveExpenses` を ExpensesContext に統合
  - キー: `@expenses_v1`（レガシーの `@fixed_expenses` とは別）

### 優先度中
- [ ] **ローカルビルドスクリプトを整備**
  - `expo prebuild --clean` 後に signing config を自動復元するスクリプト
- [ ] **adaptive-icon.png の確認**
  - `icon.png` がCodexで更新されたため、adaptive-icon.png も再生成が必要かもしれない

### 優先度低
- [ ] HomeScreen の分割（2874行 → 複数コンポーネント）
- [ ] レガシーコード（AddEditScreen, DetailScreen, src/utils/storage.ts）の削除

---

## Obsidian × Claude Code MCP 設定

- vault: `docs/vault/`
- MCP server: `@modelcontextprotocol/server-filesystem` で `docs/vault/` を指定
- 設定ファイル: `.claude/settings.json`

### セッション開始時のプロンプト例
```
docs/vault/active_context.md を読んで、前回の続きから始めてください。
```

### 設計判断を保存する時
```
今決めたことを docs/vault/active_context.md に追記してください。
```

---

## 技術メモ

### ビルドコマンド（WSL）
```bash
# signing config バックアップ → prebuild → 復元 → ビルド
cp android/app/build.gradle android/app/build.gradle.bak
npx expo prebuild --clean
# build.gradle の signing config を手動で復元
cd android && ./gradlew bundleRelease
```

### versionCode の更新
```bash
sed -i 's/versionCode 12/versionCode 13/' android/app/build.gradle
```

### 通知関連のAsyncStorageキー
- `@notification_settings`: NotificationSettings オブジェクト
- `notif_auto_enabled`: "true" | undefined（オンボーディングで通知許可された場合）

### RevenueCat パッケージID
- 月額: `monthly`（または製品ID）
- 買い切り: `pro_lifetime`
