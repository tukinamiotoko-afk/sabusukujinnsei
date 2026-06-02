import { Category, Cycle } from '../context/ExpensesContext';

export interface TemplateItem {
  name: string;        // 登録時のサービス名
  planName?: string;   // プラン一覧に表示する短いラベル
  group?: string;      // 同一グループのサービスをまとめるキー
  subcat?: string;     // サブスクのサブカテゴリキー
  amount?: number;
  yearlyAmount?: number; // 年額（月額と同時表示）
  cycle?: Cycle;
  currency?: 'USD';    // 未設定は円
}

export interface SubcatConfig {
  label: string;
  icon: string;
  color: string;
}

export const SUBSCRIPTION_SUBCATS: Record<string, SubcatConfig> = {
  entertainment: { label: 'エンタメ',     icon: 'film-outline',             color: '#E53E3E' },
  music:         { label: '音楽',         icon: 'musical-notes-outline',    color: '#D69E2E' },
  game:          { label: 'ゲーム',       icon: 'game-controller-outline',  color: '#38A169' },
  ai:            { label: 'AI',           icon: 'sparkles-outline',         color: '#805AD5' },
  work:          { label: '仕事・ツール', icon: 'briefcase-outline',        color: '#3182CE' },
  creator:       { label: 'クリエイター', icon: 'color-palette-outline',    color: '#D53F8C' },
  reading:       { label: '読書・学習',   icon: 'book-outline',             color: '#744210' },
  other:         { label: 'その他',       icon: 'apps-outline',             color: '#718096' },
};

export const TEMPLATES: Record<Category, TemplateItem[]> = {
  subscription: [
    // ── Netflix ───────────────────────────────────────────────────────
    { name: 'Netflix（広告つきスタンダード）', planName: '広告つきスタンダード', group: 'Netflix', amount: 890,  cycle: 'monthly' },
    { name: 'Netflix（スタンダード）',         planName: 'スタンダード',         group: 'Netflix', amount: 1590, cycle: 'monthly' },
    { name: 'Netflix（プレミアム）',           planName: 'プレミアム',           group: 'Netflix', amount: 2290, cycle: 'monthly' },

    // ── Amazon ────────────────────────────────────────────────────────
    { name: 'Amazon Prime',                              amount: 600,  yearlyAmount: 5900, cycle: 'monthly' },
    { name: 'Amazon Music Unlimited（個人）',      planName: '個人',       group: 'Amazon Music Unlimited', amount: 1080, cycle: 'monthly' },
    { name: 'Amazon Music Unlimited（プライム会員）', planName: 'プライム会員', group: 'Amazon Music Unlimited', amount: 580,  cycle: 'monthly' },
    { name: 'Amazon Music Unlimited（ファミリー）',  planName: 'ファミリー',  group: 'Amazon Music Unlimited', amount: 1680, cycle: 'monthly' },
    { name: 'Kindle Unlimited',                          amount: 980,  cycle: 'monthly' },
    { name: 'Audible',                                   amount: 1500, cycle: 'monthly' },

    // ── YouTube / Google ──────────────────────────────────────────────
    { name: 'YouTube Premium（個人）',   planName: '個人',       group: 'YouTube Premium', amount: 1280, yearlyAmount: 12800, cycle: 'monthly' },
    { name: 'YouTube Premium（ファミリー）', planName: 'ファミリー', group: 'YouTube Premium', amount: 2280, cycle: 'monthly' },
    { name: 'YouTube Premium（学生）',   planName: '学生',       group: 'YouTube Premium', amount: 780,  cycle: 'monthly' },
    { name: 'YouTube Music（個人）',     planName: '個人',       group: 'YouTube Music',   amount: 980,  cycle: 'monthly' },
    { name: 'YouTube Music（ファミリー）', planName: 'ファミリー', group: 'YouTube Music',   amount: 1480, cycle: 'monthly' },
    { name: 'YouTube Music（学生）',     planName: '学生',       group: 'YouTube Music',   amount: 580,  cycle: 'monthly' },
    { name: 'Google One（100GB）',  planName: '100GB', group: 'Google One', amount: 250,  yearlyAmount: 2600,  cycle: 'monthly' },
    { name: 'Google One（200GB）',  planName: '200GB', group: 'Google One', amount: 380,  yearlyAmount: 3800,  cycle: 'monthly' },
    { name: 'Google One（2TB）',    planName: '2TB',   group: 'Google One', amount: 1300, yearlyAmount: 13000, cycle: 'monthly' },

    // ── Apple ─────────────────────────────────────────────────────────
    { name: 'Apple Music（個人）',   planName: '個人',       group: 'Apple Music', amount: 1080, cycle: 'monthly' },
    { name: 'Apple Music（ファミリー）', planName: 'ファミリー', group: 'Apple Music', amount: 1680, cycle: 'monthly' },
    { name: 'Apple Music（学生）',   planName: '学生',       group: 'Apple Music', amount: 580,  cycle: 'monthly' },
    { name: 'Apple TV+',             amount: 900,  cycle: 'monthly' },
    { name: 'Apple Arcade',          amount: 600,  cycle: 'monthly' },
    { name: 'Apple One（個人）',     planName: '個人',       group: 'Apple One',   amount: 1400, cycle: 'monthly' },
    { name: 'Apple One（ファミリー）', planName: 'ファミリー', group: 'Apple One',   amount: 2100, cycle: 'monthly' },
    { name: 'iCloud+（50GB）',  planName: '50GB',  group: 'iCloud+', amount: 150,  cycle: 'monthly' },
    { name: 'iCloud+（200GB）', planName: '200GB', group: 'iCloud+', amount: 450,  cycle: 'monthly' },
    { name: 'iCloud+（2TB）',   planName: '2TB',   group: 'iCloud+', amount: 1500, cycle: 'monthly' },

    // ── Spotify ───────────────────────────────────────────────────────
    { name: 'Spotify（Standard）', planName: 'Standard', group: 'Spotify', amount: 1080, yearlyAmount: 10800, cycle: 'monthly' },
    { name: 'Spotify（Duo）',      planName: 'Duo',      group: 'Spotify', amount: 1480, cycle: 'monthly' },
    { name: 'Spotify（Family）',   planName: 'Family',   group: 'Spotify', amount: 1880, cycle: 'monthly' },
    { name: 'Spotify（Student）',  planName: 'Student',  group: 'Spotify', amount: 580,  cycle: 'monthly' },

    // ── Disney+ ───────────────────────────────────────────────────────
    { name: 'Disney+（スタンダード）', planName: 'スタンダード', group: 'Disney+', amount: 1140, yearlyAmount: 12500, cycle: 'monthly' },
    { name: 'Disney+（プレミアム）',   planName: 'プレミアム',   group: 'Disney+', amount: 1520, yearlyAmount: 16700, cycle: 'monthly' },

    // ── 動画（国内）──────────────────────────────────────────────────
    { name: 'U-NEXT',                       amount: 2189, cycle: 'monthly' },
    { name: 'Hulu',                         amount: 1026, cycle: 'monthly' },
    { name: 'ABEMA プレミアム',             amount: 960,  cycle: 'monthly' },
    { name: 'Lemino',                       amount: 990,  cycle: 'monthly' },
    { name: 'FODプレミアム',                amount: 976,  cycle: 'monthly' },
    { name: 'WOWOW',                        amount: 2530, cycle: 'monthly' },
    { name: 'Niconico プレミアム',          amount: 550,  cycle: 'monthly' },
    { name: 'dアニメストア',                amount: 550,  cycle: 'monthly' },
    { name: 'Telasa',                       amount: 618,  cycle: 'monthly' },
    { name: 'J SPORTS',                     amount: 2750, cycle: 'monthly' },
    { name: 'NHKオンデマンド 見放題パック', amount: 990,  cycle: 'monthly' },
    { name: 'バンダイチャンネル',            amount: 990,  cycle: 'monthly' },
    { name: '東映アニメオン',               amount: 960,  cycle: 'monthly' },
    { name: 'auスマートパスプレミアム',      amount: 600,  cycle: 'monthly' },
    { name: 'milplus',                      amount: 1078, cycle: 'monthly' },
    { name: '楽天TV パ・リーグ Special',    amount: 1000, cycle: 'monthly' },
    { name: 'DAZN Standard',               amount: 4200, yearlyAmount: 32000, cycle: 'monthly' },

    // ── 音楽（国内）──────────────────────────────────────────────────
    { name: 'LINE MUSIC（個人）',   planName: '個人',       group: 'LINE MUSIC', amount: 980,  yearlyAmount: 9800, cycle: 'monthly' },
    { name: 'LINE MUSIC（ファミリー）', planName: 'ファミリー', group: 'LINE MUSIC', amount: 1480, cycle: 'monthly' },
    { name: 'LINE MUSIC（学生）',   planName: '学生',       group: 'LINE MUSIC', amount: 480,  cycle: 'monthly' },
    { name: 'AWA Standard', planName: 'Standard', group: 'AWA', amount: 960, cycle: 'monthly' },
    { name: 'AWA Lite',     planName: 'Lite',     group: 'AWA', amount: 480, cycle: 'monthly' },
    { name: 'Rakuten Music',        amount: 578,  cycle: 'monthly' },

    // ── 音楽（海外・USD）─────────────────────────────────────────────
    { name: 'Tidal（Individual）', planName: 'Individual', group: 'Tidal', amount: 11, yearlyAmount: 100, cycle: 'monthly', currency: 'USD' },
    { name: 'Tidal（HiFi Plus）',  planName: 'HiFi Plus',  group: 'Tidal', amount: 20, yearlyAmount: 200, cycle: 'monthly', currency: 'USD' },
    { name: 'Deezer Premium',      amount: 11, yearlyAmount: 100, cycle: 'monthly', currency: 'USD' },

    // ── ゲーム ────────────────────────────────────────────────────────
    { name: 'PlayStation Plus Essential', planName: 'Essential', group: 'PlayStation Plus', amount: 850,  yearlyAmount: 5143,  cycle: 'monthly' },
    { name: 'PlayStation Plus Extra',     planName: 'Extra',     group: 'PlayStation Plus', amount: 1300, yearlyAmount: 8600,  cycle: 'monthly' },
    { name: 'PlayStation Plus Premium',   planName: 'Premium',   group: 'PlayStation Plus', amount: 1550, yearlyAmount: 10250, cycle: 'monthly' },
    { name: 'Nintendo Switch Online（個人）',             planName: '個人',          group: 'Nintendo Switch Online', amount: 2400, cycle: 'yearly' },
    { name: 'Nintendo Switch Online（ファミリー）',       planName: 'ファミリー',     group: 'Nintendo Switch Online', amount: 4500, cycle: 'yearly' },
    { name: 'Nintendo Switch Online+追加パック（個人）',  planName: '追加パック 個人', group: 'Nintendo Switch Online', amount: 5143, cycle: 'yearly' },
    { name: 'Nintendo Switch Online+追加パック（ファミリー）', planName: '追加パック ファミリー', group: 'Nintendo Switch Online', amount: 9000, cycle: 'yearly' },
    { name: 'Xbox Game Pass Core',     planName: 'Core',     group: 'Xbox Game Pass', amount: 850,  cycle: 'monthly' },
    { name: 'Xbox Game Pass Standard', planName: 'Standard', group: 'Xbox Game Pass', amount: 1210, cycle: 'monthly' },
    { name: 'Xbox Game Pass Ultimate', planName: 'Ultimate', group: 'Xbox Game Pass', amount: 1460, cycle: 'monthly' },
    { name: 'EA Play',                 amount: 530,  yearlyAmount: 3600, cycle: 'monthly' },
    { name: 'EA Play Pro（PC）',       amount: 15,   cycle: 'monthly', currency: 'USD' },
    { name: 'Ubisoft+',                amount: 18,   cycle: 'monthly', currency: 'USD' },
    { name: 'Google Play Pass',        amount: 600,  cycle: 'monthly' },
    { name: 'Humble Bundle Choice',    amount: 12,   cycle: 'monthly', currency: 'USD' },
    { name: 'GeForce NOW Priority', planName: 'Priority', group: 'GeForce NOW', amount: 10, cycle: 'monthly', currency: 'USD' },
    { name: 'GeForce NOW Ultimate', planName: 'Ultimate', group: 'GeForce NOW', amount: 20, cycle: 'monthly', currency: 'USD' },

    // ── 読み放題・ニュース ────────────────────────────────────────────
    { name: 'dマガジン',              amount: 580,  cycle: 'monthly' },
    { name: '楽天マガジン',           amount: 418,  cycle: 'monthly' },
    { name: 'NewsPicks プレミアム',   amount: 1500, cycle: 'monthly' },
    { name: '日本経済新聞 デジタル',  amount: 4277, cycle: 'monthly' },
    { name: 'コミックシーモア 読み放題Lite', planName: 'Lite', group: 'コミックシーモア', amount: 780,  cycle: 'monthly' },
    { name: 'コミックシーモア 読み放題フル', planName: 'フル', group: 'コミックシーモア', amount: 1480, cycle: 'monthly' },
    { name: 'BookLive! 読み放題',     amount: 836,  cycle: 'monthly' },

    // ── Adobe ─────────────────────────────────────────────────────────
    { name: 'Adobe Creative Cloud 個人',      amount: 6480,  yearlyAmount: 72336, cycle: 'monthly' },
    { name: 'Adobe Photoshop 単体',           amount: 3280,  cycle: 'monthly' },
    { name: 'Adobe Premiere Pro 単体',        amount: 3280,  cycle: 'monthly' },
    { name: 'Adobe After Effects 単体',       amount: 3280,  cycle: 'monthly' },
    { name: 'Adobe Illustrator 単体',         amount: 3280,  cycle: 'monthly' },
    { name: 'Adobe InDesign 単体',            amount: 3280,  cycle: 'monthly' },
    { name: 'Adobe Premiere Pro + After Effects', amount: 5060, cycle: 'monthly' },
    { name: 'Adobe Lightroom',                amount: 1180,  cycle: 'monthly' },
    { name: 'Adobe Lightroom + Photoshop',    amount: 1880,  cycle: 'monthly' },
    { name: 'Adobe Acrobat Pro',              amount: 1518,  cycle: 'monthly' },
    { name: 'Adobe Express Premium',          amount: 1380,  cycle: 'monthly' },
    { name: 'Adobe Stock（10点/月）',          amount: 4378,  cycle: 'monthly' },
    { name: 'Adobe Substance 3D Collection',  amount: 5030,  cycle: 'monthly' },

    // ── Microsoft ─────────────────────────────────────────────────────
    { name: 'Microsoft 365 Personal', planName: 'Personal', group: 'Microsoft 365', amount: 1284, yearlyAmount: 12984, cycle: 'monthly' },
    { name: 'Microsoft 365 Family',   planName: 'Family',   group: 'Microsoft 365', amount: 1850, yearlyAmount: 18400, cycle: 'monthly' },

    // ── ストレージ（USD）─────────────────────────────────────────────
    { name: 'Dropbox Plus',       planName: 'Plus',       group: 'Dropbox', amount: 12, yearlyAmount: 120, cycle: 'monthly', currency: 'USD' },
    { name: 'Dropbox Essentials', planName: 'Essentials', group: 'Dropbox', amount: 20, cycle: 'monthly', currency: 'USD' },
    { name: 'Backblaze Personal Backup', amount: 9, yearlyAmount: 99, cycle: 'monthly', currency: 'USD' },
    { name: 'Box Personal Pro',          amount: 10, cycle: 'monthly', currency: 'USD' },

    // ── AI チャット・アシスタント ─────────────────────────────────────
    { name: 'ChatGPT Plus', planName: 'Plus', group: 'ChatGPT', amount: 3000,  cycle: 'monthly' },
    { name: 'ChatGPT Pro',  planName: 'Pro',  group: 'ChatGPT', amount: 30000, cycle: 'monthly' },
    { name: 'Claude Pro',         planName: 'Pro',     group: 'Claude', amount: 3000, cycle: 'monthly' },
    { name: 'Claude Max（5倍）',  planName: 'Max 5×',  group: 'Claude', amount: 100,  cycle: 'monthly', currency: 'USD' },
    { name: 'Claude Max（20倍）', planName: 'Max 20×', group: 'Claude', amount: 200,  cycle: 'monthly', currency: 'USD' },
    { name: 'Microsoft Copilot Pro',           amount: 3200, cycle: 'monthly' },
    { name: 'Google One AI Premium（Gemini）', amount: 2900, cycle: 'monthly' },
    { name: 'Perplexity Pro',  amount: 20,  yearlyAmount: 200, cycle: 'monthly', currency: 'USD' },
    { name: 'You.com Pro',     amount: 20,  cycle: 'monthly', currency: 'USD' },
    { name: 'Grok（X Premium付き）', amount: 980, cycle: 'monthly' },

    // ── AI 画像生成 ───────────────────────────────────────────────────
    { name: 'Midjourney Basic',    planName: 'Basic',    group: 'Midjourney', amount: 10,  yearlyAmount: 96,   cycle: 'monthly', currency: 'USD' },
    { name: 'Midjourney Standard', planName: 'Standard', group: 'Midjourney', amount: 30,  yearlyAmount: 288,  cycle: 'monthly', currency: 'USD' },
    { name: 'Midjourney Pro',      planName: 'Pro',      group: 'Midjourney', amount: 60,  yearlyAmount: 576,  cycle: 'monthly', currency: 'USD' },
    { name: 'Midjourney Mega',     planName: 'Mega',     group: 'Midjourney', amount: 120, yearlyAmount: 1152, cycle: 'monthly', currency: 'USD' },
    { name: 'Leonardo AI Apprentice', planName: 'Apprentice', group: 'Leonardo AI', amount: 10, cycle: 'monthly', currency: 'USD' },
    { name: 'Leonardo AI Artisan',    planName: 'Artisan',    group: 'Leonardo AI', amount: 24, cycle: 'monthly', currency: 'USD' },
    { name: 'Leonardo AI Maestro',    planName: 'Maestro',    group: 'Leonardo AI', amount: 48, cycle: 'monthly', currency: 'USD' },
    { name: 'Ideogram Pro',      amount: 20, yearlyAmount: 192, cycle: 'monthly', currency: 'USD' },
    { name: 'Playground AI Pro', amount: 15, cycle: 'monthly', currency: 'USD' },
    { name: 'Krea AI',           amount: 24, cycle: 'monthly', currency: 'USD' },
    { name: 'Magnific AI',       amount: 39, cycle: 'monthly', currency: 'USD' },
    { name: 'NovelAI Tablet', planName: 'Tablet', group: 'NovelAI', amount: 10, cycle: 'monthly', currency: 'USD' },
    { name: 'NovelAI Scroll',  planName: 'Scroll',  group: 'NovelAI', amount: 15, cycle: 'monthly', currency: 'USD' },
    { name: 'NovelAI Opus',    planName: 'Opus',    group: 'NovelAI', amount: 25, cycle: 'monthly', currency: 'USD' },
    { name: 'Stable Diffusion（DreamStudio）', amount: 10, cycle: 'monthly', currency: 'USD' },

    // ── AI コーディング ───────────────────────────────────────────────
    { name: 'GitHub Copilot Individual', amount: 10, yearlyAmount: 100, cycle: 'monthly', currency: 'USD' },
    { name: 'Cursor Pro',    amount: 20, yearlyAmount: 192, cycle: 'monthly', currency: 'USD' },
    { name: 'Windsurf Pro',  amount: 15, cycle: 'monthly', currency: 'USD' },
    { name: 'Tabnine Pro',   amount: 12, cycle: 'monthly', currency: 'USD' },
    { name: 'Replit Core',   amount: 20, cycle: 'monthly', currency: 'USD' },
    { name: 'JetBrains AI Assistant',    amount: 10, cycle: 'monthly', currency: 'USD' },
    { name: 'Amazon CodeWhisperer Pro',  amount: 19, cycle: 'monthly', currency: 'USD' },
    { name: 'Bolt.new',      amount: 20, cycle: 'monthly', currency: 'USD' },
    { name: 'v0 by Vercel',  amount: 20, cycle: 'monthly', currency: 'USD' },

    // ── AI 音声・音楽生成 ─────────────────────────────────────────────
    { name: 'ElevenLabs Starter', planName: 'Starter', group: 'ElevenLabs', amount: 5,  cycle: 'monthly', currency: 'USD' },
    { name: 'ElevenLabs Creator', planName: 'Creator', group: 'ElevenLabs', amount: 22, cycle: 'monthly', currency: 'USD' },
    { name: 'ElevenLabs Pro',     planName: 'Pro',     group: 'ElevenLabs', amount: 99, cycle: 'monthly', currency: 'USD' },
    { name: 'Murf AI Basic', amount: 29, cycle: 'monthly', currency: 'USD' },
    { name: 'Suno Pro',      amount: 10, yearlyAmount: 96, cycle: 'monthly', currency: 'USD' },
    { name: 'Udio Standard', amount: 10, cycle: 'monthly', currency: 'USD' },
    { name: 'Boomy Standard', amount: 10, cycle: 'monthly', currency: 'USD' },

    // ── AI ライティング ───────────────────────────────────────────────
    { name: 'Grammarly Premium', amount: 30, yearlyAmount: 144, cycle: 'monthly', currency: 'USD' },
    { name: 'Jasper',            amount: 49, yearlyAmount: 468, cycle: 'monthly', currency: 'USD' },
    { name: 'Copy.ai Pro',       amount: 49, cycle: 'monthly', currency: 'USD' },
    { name: 'Writesonic',        amount: 20, cycle: 'monthly', currency: 'USD' },
    { name: 'QuillBot Premium',  amount: 10, yearlyAmount: 80,  cycle: 'monthly', currency: 'USD' },

    // ── AI 翻訳 ───────────────────────────────────────────────────────
    { name: 'DeepL Pro Starter',   planName: 'Starter',  group: 'DeepL Pro', amount: 1200, cycle: 'monthly' },
    { name: 'DeepL Pro Advanced',  planName: 'Advanced', group: 'DeepL Pro', amount: 2500, cycle: 'monthly' },
    { name: 'DeepL Pro Ultimate',  planName: 'Ultimate', group: 'DeepL Pro', amount: 6500, cycle: 'monthly' },

    // ── AI 議事録・ミーティング ───────────────────────────────────────
    { name: 'Otter.ai Pro',     amount: 17, yearlyAmount: 120, cycle: 'monthly', currency: 'USD' },
    { name: 'Fireflies.ai Pro', amount: 18, cycle: 'monthly', currency: 'USD' },
    { name: 'Fathom Premium',   amount: 19, cycle: 'monthly', currency: 'USD' },

    // ── AI 3D・動画生成 ───────────────────────────────────────────────
    { name: 'Meshy AI Pro',     amount: 20, cycle: 'monthly', currency: 'USD' },
    { name: 'Luma AI Standard', amount: 30, cycle: 'monthly', currency: 'USD' },
    { name: 'D-ID Lite',        amount: 6,  cycle: 'monthly', currency: 'USD' },
    { name: 'Runway Gen-3 Standard', planName: 'Standard', group: 'Runway Gen-3', amount: 15, yearlyAmount: 144, cycle: 'monthly', currency: 'USD' },
    { name: 'Runway Gen-3 Pro',      planName: 'Pro',      group: 'Runway Gen-3', amount: 35, yearlyAmount: 336, cycle: 'monthly', currency: 'USD' },
    { name: 'HeyGen',     amount: 29, yearlyAmount: 228, cycle: 'monthly', currency: 'USD' },
    { name: 'Synthesia Starter', amount: 30, cycle: 'monthly', currency: 'USD' },
    { name: 'Kling AI',   amount: 10, cycle: 'monthly', currency: 'USD' },
    { name: 'Pika Pro',   amount: 8,  cycle: 'monthly', currency: 'USD' },

    // ── ノート・タスク管理（USD）─────────────────────────────────────
    { name: 'Notion Plus',    amount: 16, yearlyAmount: 96,  cycle: 'monthly', currency: 'USD' },
    { name: 'Evernote Personal', amount: 15, yearlyAmount: 130, cycle: 'monthly', currency: 'USD' },
    { name: 'Todoist Pro',    amount: 5,  yearlyAmount: 48,  cycle: 'monthly', currency: 'USD' },
    { name: 'Obsidian Sync',  amount: 10, yearlyAmount: 96,  cycle: 'monthly', currency: 'USD' },
    { name: 'Bear',           amount: 30, cycle: 'yearly', currency: 'USD' },
    { name: 'Fantastical Premium', amount: 40, cycle: 'yearly', currency: 'USD' },

    // ── デザイン・クリエイティブ（USD）───────────────────────────────
    { name: 'Figma Starter',       planName: 'Starter',       group: 'Figma', amount: 0,  cycle: 'monthly', currency: 'USD' },
    { name: 'Figma Professional',  planName: 'Professional',  group: 'Figma', amount: 15, cycle: 'monthly', currency: 'USD' },
    { name: 'Canva Pro',  amount: 15, yearlyAmount: 120, cycle: 'monthly', currency: 'USD' },
    { name: 'Sketch',     amount: 10, yearlyAmount: 99,  cycle: 'monthly', currency: 'USD' },
    { name: 'Framer',     amount: 20, cycle: 'monthly', currency: 'USD' },

    // ── 動画制作・クリエイター（USD）────────────────────────────────
    { name: 'Descript Creator', planName: 'Creator', group: 'Descript', amount: 24, yearlyAmount: 192, cycle: 'monthly', currency: 'USD' },
    { name: 'Descript Pro',     planName: 'Pro',     group: 'Descript', amount: 40, cycle: 'monthly', currency: 'USD' },
    { name: 'Vimeo Plus',     planName: 'Plus',     group: 'Vimeo', amount: 7,  yearlyAmount: 84,  cycle: 'monthly', currency: 'USD' },
    { name: 'Vimeo Pro',      planName: 'Pro',      group: 'Vimeo', amount: 20, yearlyAmount: 240, cycle: 'monthly', currency: 'USD' },
    { name: 'Vimeo Business', planName: 'Business', group: 'Vimeo', amount: 50, cycle: 'monthly', currency: 'USD' },
    { name: 'Loom Pro',          amount: 15, yearlyAmount: 144, cycle: 'monthly', currency: 'USD' },
    { name: 'CapCut Pro',        amount: 10, yearlyAmount: 90,  cycle: 'monthly', currency: 'USD' },
    { name: 'StreamYard Basic',  amount: 49, cycle: 'monthly', currency: 'USD' },
    { name: 'Riverside.fm Standard', amount: 15, cycle: 'monthly', currency: 'USD' },
    { name: 'Camtasia',          amount: 18, cycle: 'monthly', currency: 'USD' },
    { name: 'Kapwing Pro',       amount: 16, cycle: 'monthly', currency: 'USD' },
    { name: 'InVideo AI',        amount: 25, cycle: 'monthly', currency: 'USD' },
    { name: 'Pictory AI',        amount: 23, cycle: 'monthly', currency: 'USD' },

    // ── 音楽ライセンス・素材（USD）───────────────────────────────────
    { name: 'Epidemic Sound Personal',   planName: 'Personal',   group: 'Epidemic Sound', amount: 15, yearlyAmount: 99, cycle: 'monthly', currency: 'USD' },
    { name: 'Epidemic Sound Commercial', planName: 'Commercial', group: 'Epidemic Sound', amount: 49, cycle: 'monthly', currency: 'USD' },
    { name: 'Artlist Personal', planName: 'Personal', group: 'Artlist', amount: 199, cycle: 'yearly', currency: 'USD' },
    { name: 'Artlist Creator',  planName: 'Creator',  group: 'Artlist', amount: 299, cycle: 'yearly', currency: 'USD' },
    { name: 'Musicbed Personal', amount: 15,  cycle: 'monthly', currency: 'USD' },
    { name: 'Splice',            amount: 8,   cycle: 'monthly', currency: 'USD' },
    { name: 'Storyblocks All Access', amount: 180, cycle: 'yearly', currency: 'USD' },
    { name: 'Envato Elements',   amount: 17,  yearlyAmount: 198, cycle: 'monthly', currency: 'USD' },
    { name: 'Motion Array',      amount: 30,  yearlyAmount: 120, cycle: 'monthly', currency: 'USD' },
    { name: 'Shutterstock（350点/月）', amount: 49, cycle: 'monthly', currency: 'USD' },
    { name: 'Getty Images',      amount: 175, cycle: 'monthly', currency: 'USD' },
    { name: 'SoundCloud Go+',    amount: 10,  cycle: 'monthly', currency: 'USD' },

    // ── VPN（USD）────────────────────────────────────────────────────
    { name: 'NordVPN Standard', amount: 13, yearlyAmount: 60, cycle: 'monthly', currency: 'USD' },
    { name: 'ExpressVPN',       amount: 13, yearlyAmount: 100, cycle: 'monthly', currency: 'USD' },
    { name: 'ProtonVPN Plus',   amount: 10, yearlyAmount: 72, cycle: 'monthly', currency: 'USD' },
    { name: 'Mullvad VPN',      amount: 6,  cycle: 'monthly', currency: 'USD' },

    // ── SNS・コミュニティ ─────────────────────────────────────────────
    { name: 'X Premium（Web）',      planName: 'Web',          group: 'X Premium', amount: 980,  yearlyAmount: 9600, cycle: 'monthly' },
    { name: 'X Premium（iOS/Android）', planName: 'iOS/Android', group: 'X Premium', amount: 1380, cycle: 'monthly' },
    { name: 'X Premium+（Web）',     planName: 'Premium+',     group: 'X Premium', amount: 2980, cycle: 'monthly' },
    { name: 'Reddit Premium',        amount: 6,    yearlyAmount: 50, cycle: 'monthly', currency: 'USD' },
    { name: 'LinkedIn Premium Career', amount: 40, cycle: 'monthly', currency: 'USD' },
    { name: 'Twitch Turbo',          amount: 9,    cycle: 'monthly', currency: 'USD' },
    { name: 'Discord Nitro',      planName: 'Nitro',       group: 'Discord', amount: 10, yearlyAmount: 100, cycle: 'monthly', currency: 'USD' },
    { name: 'Discord Nitro Basic', planName: 'Nitro Basic', group: 'Discord', amount: 3,  cycle: 'monthly', currency: 'USD' },

    // ── フィットネス・ウェルネス（USD）───────────────────────────────
    { name: 'Calm',        amount: 15, yearlyAmount: 70, cycle: 'monthly', currency: 'USD' },
    { name: 'Headspace',   amount: 13, yearlyAmount: 70, cycle: 'monthly', currency: 'USD' },
    { name: 'Peloton App', amount: 13, cycle: 'monthly', currency: 'USD' },

    // ── 学習（USD）───────────────────────────────────────────────────
    { name: 'Duolingo Plus',    amount: 7,   yearlyAmount: 80,  cycle: 'monthly', currency: 'USD' },
    { name: 'Coursera Plus',    amount: 59,  yearlyAmount: 399, cycle: 'monthly', currency: 'USD' },
    { name: 'Rosetta Stone',    amount: 14,  yearlyAmount: 96,  cycle: 'monthly', currency: 'USD' },
    { name: 'Babbel',           amount: 14,  yearlyAmount: 84,  cycle: 'monthly', currency: 'USD' },
    { name: 'MasterClass',      amount: 120, cycle: 'yearly', currency: 'USD' },
    { name: 'Skillshare',       amount: 168, cycle: 'yearly', currency: 'USD' },
    { name: 'LinkedIn Learning', amount: 40, yearlyAmount: 240, cycle: 'monthly', currency: 'USD' },

    // ── 動画（海外・USD）─────────────────────────────────────────────
    { name: 'Crunchyroll Fan',          planName: 'Fan',          group: 'Crunchyroll', amount: 8,  yearlyAmount: 80,  cycle: 'monthly', currency: 'USD' },
    { name: 'Crunchyroll Mega Fan',     planName: 'Mega Fan',     group: 'Crunchyroll', amount: 10, yearlyAmount: 100, cycle: 'monthly', currency: 'USD' },
    { name: 'Crunchyroll Ultimate Fan', planName: 'Ultimate Fan', group: 'Crunchyroll', amount: 15, yearlyAmount: 150, cycle: 'monthly', currency: 'USD' },
    { name: 'HIDIVE',                   amount: 5,   cycle: 'monthly', currency: 'USD' },
    { name: 'Max',                      amount: 10,  yearlyAmount: 100, cycle: 'monthly', currency: 'USD' },
    { name: 'Paramount+',               amount: 8,   cycle: 'monthly', currency: 'USD' },
    { name: 'Paramount+ with SHOWTIME', amount: 13,  cycle: 'monthly', currency: 'USD' },
    { name: 'ESPN+',                    amount: 11,  cycle: 'monthly', currency: 'USD' },
    { name: 'Peacock Premium',          amount: 8,   cycle: 'monthly', currency: 'USD' },
    { name: 'Discovery+',               amount: 5,   cycle: 'monthly', currency: 'USD' },
    { name: 'CuriosityStream',          amount: 36,  cycle: 'yearly', currency: 'USD' },
    { name: 'BritBox',                  amount: 9,   cycle: 'monthly', currency: 'USD' },
    { name: 'Mubi',                     amount: 14,  cycle: 'monthly', currency: 'USD' },
    { name: 'YouTube TV',               amount: 73,  cycle: 'monthly', currency: 'USD' },
    { name: 'Hulu + Live TV',           amount: 83,  cycle: 'monthly', currency: 'USD' },

    // ── プロジェクト管理・コラボ（USD）───────────────────────────────
    { name: 'Asana Premium',     amount: 11,  cycle: 'monthly', currency: 'USD' },
    { name: 'Monday.com Basic',  amount: 9,   cycle: 'monthly', currency: 'USD' },
    { name: 'ClickUp Unlimited', amount: 7,   yearlyAmount: 60, cycle: 'monthly', currency: 'USD' },
    { name: 'Trello Premium',    amount: 5,   cycle: 'monthly', currency: 'USD' },
    { name: 'Miro Team',         amount: 8,   cycle: 'monthly', currency: 'USD' },
    { name: 'Basecamp',          amount: 15,  cycle: 'monthly', currency: 'USD' },
    { name: 'Notion AI（月額追加）', amount: 10, cycle: 'monthly', currency: 'USD' },
    { name: 'Typeform Plus',     amount: 25,  cycle: 'monthly', currency: 'USD' },
    { name: 'Airtable Plus',     amount: 10,  cycle: 'monthly', currency: 'USD' },

    // ── コミュニケーション・会議（USD）───────────────────────────────
    { name: 'Zoom Pro',             amount: 15, yearlyAmount: 150, cycle: 'monthly', currency: 'USD' },
    { name: 'Slack Pro（1ユーザー）', amount: 8, cycle: 'monthly', currency: 'USD' },

    // ── マーケティング・SEO（USD）────────────────────────────────────
    { name: 'Buffer Essentials',     amount: 6,   cycle: 'monthly', currency: 'USD' },
    { name: 'Hootsuite Professional', amount: 99, cycle: 'monthly', currency: 'USD' },
    { name: 'Mailchimp Essentials',  amount: 13,  cycle: 'monthly', currency: 'USD' },
    { name: 'Semrush Pro',           amount: 140, cycle: 'monthly', currency: 'USD' },
    { name: 'Ahrefs Lite',           amount: 129, cycle: 'monthly', currency: 'USD' },

    // ── 会計・経理（JPY）─────────────────────────────────────────────
    { name: 'freee 会計 スターター',    planName: 'スターター',  group: 'freee 会計', amount: 980,  cycle: 'monthly' },
    { name: 'freee 会計 スタンダード',  planName: 'スタンダード', group: 'freee 会計', amount: 1980, cycle: 'monthly' },
    { name: 'freee 会計 プレミアム',    planName: 'プレミアム',  group: 'freee 会計', amount: 3980, cycle: 'monthly' },
    { name: 'マネーフォワード クラウド確定申告 フリー',     planName: 'フリー',     group: 'マネーフォワード クラウド', amount: 990,  cycle: 'monthly' },
    { name: 'マネーフォワード クラウド確定申告 パーソナル', planName: 'パーソナル', group: 'マネーフォワード クラウド', amount: 1650, cycle: 'monthly' },
    { name: 'マネーフォワード ME プレミアム', amount: 500, cycle: 'monthly' },

    // ── 開発ツール・クラウド（USD）───────────────────────────────────
    { name: 'GitHub Pro',        amount: 4,  cycle: 'monthly', currency: 'USD' },
    { name: 'GitLab Premium',    amount: 29, cycle: 'monthly', currency: 'USD' },
    { name: 'Vercel Pro',        amount: 20, cycle: 'monthly', currency: 'USD' },
    { name: 'Linear',            amount: 8,  cycle: 'monthly', currency: 'USD' },
    { name: 'Jira（1ユーザー）', amount: 8,  cycle: 'monthly', currency: 'USD' },

    // ── 日本のアプリ・サービス（JPY）─────────────────────────────────
    { name: 'pixiv Premium',  amount: 550,  yearlyAmount: 6000, cycle: 'monthly' },
    { name: '楽天プレミアム', amount: 550,  cycle: 'monthly' },
    { name: 'LEAN BODY',      amount: 1628, yearlyAmount: 9800, cycle: 'monthly' },

    // ── セキュリティ・パスワード管理（USD）───────────────────────────
    { name: '1Password 個人',    planName: '個人',    group: '1Password', amount: 3, yearlyAmount: 36, cycle: 'monthly', currency: 'USD' },
    { name: '1Password ファミリー', planName: 'ファミリー', group: '1Password', amount: 60, cycle: 'yearly', currency: 'USD' },
    { name: 'LastPass Premium', amount: 3,  cycle: 'monthly', currency: 'USD' },
    { name: 'Bitwarden Premium', amount: 10, cycle: 'yearly', currency: 'USD' },
  ],
  telecom: [
    { name: 'docomo',              cycle: 'monthly' },
    { name: 'au',                  cycle: 'monthly' },
    { name: 'SoftBank',            cycle: 'monthly' },
    { name: 'ahamo',  amount: 2970, cycle: 'monthly' },
    { name: 'povo2.0',             cycle: 'monthly' },
    { name: 'IIJmio',             cycle: 'monthly' },
    { name: '楽天モバイル',        cycle: 'monthly' },
    { name: 'mineo',               cycle: 'monthly' },
    { name: 'UQ mobile',           cycle: 'monthly' },
    { name: 'Y!mobile',            cycle: 'monthly' },
    { name: 'インターネット（光）', cycle: 'monthly' },
    { name: 'WiMAX',               cycle: 'monthly' },
    { name: 'Starlink',            amount: 7700, cycle: 'monthly' },
  ],
  hospital: [
    { name: '歯科定期検診',    cycle: 'every3months' },
    { name: '内科通院',        cycle: 'monthly'      },
    { name: '眼科通院',        cycle: 'every2months' },
    { name: '皮膚科通院',      cycle: 'monthly'      },
    { name: '整形外科通院',    cycle: 'monthly'      },
    { name: '精神科通院',      cycle: 'monthly'      },
    { name: '婦人科通院',      cycle: 'every3months' },
    { name: '耳鼻科通院',      cycle: 'monthly'      },
    { name: '処方薬',          cycle: 'monthly'      },
    { name: '市販薬（常備）',  cycle: 'every2months' },
    { name: 'コンタクトレンズ', cycle: 'every3months' },
    { name: '花粉症薬',        cycle: 'monthly'      },
  ],
  haircut: [
    { name: '散髪（床屋）',  cycle: 'every2months' },
    { name: '美容院',        cycle: 'every2months' },
    { name: 'QBハウス', amount: 1350, cycle: 'every45days' },
    { name: 'ヘアカラー',    cycle: 'every2months' },
    { name: 'ヘッドスパ',    cycle: 'monthly'      },
  ],
  healthfood: [
    { name: 'プロテイン',       cycle: 'every2months' },
    { name: 'クレアチン',       cycle: 'every3months' },
    { name: 'マルチビタミン',   cycle: 'monthly'      },
    { name: 'BCAAサプリ',       cycle: 'every2months' },
    { name: 'EAA',             cycle: 'every2months' },
    { name: 'コラーゲン',       cycle: 'monthly'      },
    { name: '葉酸サプリ',       cycle: 'monthly'      },
    { name: 'フィッシュオイル', cycle: 'monthly'      },
    { name: '鉄分サプリ',       cycle: 'monthly'      },
  ],

  // ── 住居費 ────────────────────────────────────────────────────────────────────
  housing: [
    { name: '家賃',                 cycle: 'monthly' },
    { name: '住宅ローン',           cycle: 'monthly' },
    { name: 'マンション管理費',     cycle: 'monthly' },
    { name: '修繕積立金',           cycle: 'monthly' },
    { name: '駐車場代',             cycle: 'monthly' },
    { name: 'バイク・自転車駐輪場代', cycle: 'monthly' },
    { name: '家賃保証料',           cycle: 'yearly'  },
    { name: 'セコム（警備）',       cycle: 'monthly', amount: 3300 },
    { name: 'ALSOK（警備）',        cycle: 'monthly', amount: 2750 },
    { name: 'ハウスクリーニング',   cycle: 'monthly' },
    { name: 'ごみ収集・処理費',     cycle: 'monthly' },
  ],

  // ── 保険 ──────────────────────────────────────────────────────────────────────
  insurance: [
    // ── 生命保険系 ───────────────────────────────────────────────────
    { name: '生命保険（定期）',         cycle: 'monthly' },
    { name: '生命保険（終身）',         cycle: 'monthly' },
    { name: '生命保険（養老）',         cycle: 'monthly' },
    { name: '収入保障保険',             cycle: 'monthly' },
    { name: '変額保険',                 cycle: 'monthly' },
    { name: '外貨建て保険',             cycle: 'monthly' },
    // ── 医療・健康系 ─────────────────────────────────────────────────
    { name: '医療保険',                 cycle: 'monthly' },
    { name: 'がん保険',                 cycle: 'monthly' },
    { name: '三大疾病保険',             cycle: 'monthly' },
    { name: '就業不能保険',             cycle: 'monthly' },
    { name: '所得補償保険',             cycle: 'monthly' },
    { name: '女性疾病保険',             cycle: 'monthly' },
    { name: '歯科保険',                 cycle: 'monthly' },
    { name: '精神疾患・うつ保険',       cycle: 'monthly' },
    { name: '介護保険（民間）',         cycle: 'monthly' },
    // ── 子ども・家族向け ─────────────────────────────────────────────
    { name: '学資保険',                 cycle: 'monthly' },
    { name: '個人年金保険',             cycle: 'monthly' },
    { name: 'こども医療保険',           cycle: 'monthly' },
    { name: 'ペット保険',               cycle: 'monthly' },
    // ── 損害・賠償系 ─────────────────────────────────────────────────
    { name: '個人賠償責任保険',         cycle: 'yearly'  },
    { name: '傷害保険',                 cycle: 'yearly'  },
    { name: '弁護士費用保険',           cycle: 'monthly' },
    // ── 住宅・家財系 ─────────────────────────────────────────────────
    { name: '火災保険',                 cycle: 'yearly'  },
    { name: '地震保険',                 cycle: 'yearly'  },
    { name: '家財保険',                 cycle: 'yearly'  },
    // ── 乗り物系 ────────────────────────────────────────────────────
    { name: '自動車保険',               cycle: 'yearly'  },
    { name: '自動車保険（車両保険あり）', cycle: 'yearly' },
    { name: 'バイク保険',               cycle: 'yearly'  },
    { name: '自転車保険',               cycle: 'yearly'  },
    // ── デバイス・その他 ─────────────────────────────────────────────
    { name: 'スマートフォン保険',       cycle: 'monthly' },
    { name: '家電延長保証',             cycle: 'yearly'  },
    { name: 'ドローン保険',             cycle: 'yearly'  },
    { name: 'スポーツ保険',             cycle: 'yearly'  },
    { name: '海外旅行保険（年間）',     cycle: 'yearly'  },
    // ── 事業・専門職向け ─────────────────────────────────────────────
    { name: '専門職賠償保険（PL保険）', cycle: 'yearly'  },
    { name: '店舗総合保険',             cycle: 'monthly' },
    { name: '業務災害補償保険',         cycle: 'monthly' },
  ],

  // ── ローン・返済 ──────────────────────────────────────────────────────────────
  loan: [
    { name: '奨学金返済（第一種）', cycle: 'monthly' },
    { name: '奨学金返済（第二種）', cycle: 'monthly' },
    { name: '車のローン',           cycle: 'monthly' },
    { name: 'カーリース',           cycle: 'monthly' },
    { name: '教育ローン',           cycle: 'monthly' },
    { name: 'カードローン',         cycle: 'monthly' },
    { name: 'フリーローン',         cycle: 'monthly' },
    { name: '事業ローン',           cycle: 'monthly' },
  ],

  // ── 習い事・ジム ──────────────────────────────────────────────────────────────
  lesson: [
    { name: 'エニタイムフィットネス', cycle: 'monthly', amount: 8800 },
    { name: 'ジム・フィットネスクラブ', cycle: 'monthly' },
    { name: 'ヨガスタジオ',           cycle: 'monthly' },
    { name: 'ピラティス',             cycle: 'monthly' },
    { name: 'ライザップ',             cycle: 'monthly' },
    { name: 'DMM英会話',              cycle: 'monthly', amount: 6480 },
    { name: 'Cambly',                 cycle: 'monthly', amount: 13,   currency: 'USD' },
    { name: 'オンライン英会話',       cycle: 'monthly' },
    { name: '英会話スクール（通学）', cycle: 'monthly' },
    { name: 'GABA（英会話）',         cycle: 'monthly' },
    { name: 'プログラミングスクール', cycle: 'monthly' },
    { name: 'デザインスクール',       cycle: 'monthly' },
    { name: '塾・予備校',             cycle: 'monthly' },
    { name: 'ピアノ教室',             cycle: 'monthly' },
    { name: 'ギター教室',             cycle: 'monthly' },
    { name: 'ドラム教室',             cycle: 'monthly' },
    { name: 'ベース教室',             cycle: 'monthly' },
    { name: 'ボイストレーニング',     cycle: 'monthly' },
    { name: '水泳教室',               cycle: 'monthly' },
    { name: 'テニスクラブ',           cycle: 'monthly' },
    { name: 'ゴルフスクール',         cycle: 'monthly' },
    { name: '格闘技・空手道場',       cycle: 'monthly' },
    { name: 'ダンス教室',             cycle: 'monthly' },
    { name: '料理教室',               cycle: 'monthly' },
    { name: '習字・書道教室',         cycle: 'monthly' },
    { name: 'そろばん教室',           cycle: 'monthly' },
    { name: '絵画教室',               cycle: 'monthly' },
    { name: '陶芸教室',               cycle: 'monthly' },
  ],

  // ── 定期購入・便 ──────────────────────────────────────────────────────────────
  delivery: [
    { name: 'Oisix',                  cycle: 'monthly' },
    { name: 'らでぃっしゅぼーや',     cycle: 'monthly' },
    { name: 'パルシステム',           cycle: 'monthly' },
    { name: 'ヨシケイ',               cycle: 'monthly' },
    { name: 'ナッシュ（冷凍弁当）',   cycle: 'monthly' },
    { name: 'ウォーターサーバー',     cycle: 'monthly' },
    { name: 'サプリメント定期購入',   cycle: 'monthly' },
    { name: 'コーヒー豆定期便',       cycle: 'monthly' },
    { name: 'ワイン頒布会',           cycle: 'monthly' },
    { name: '化粧品定期便',           cycle: 'monthly' },
    { name: 'スキンケア定期購入',     cycle: 'monthly' },
    { name: 'お花の定期便',           cycle: 'monthly' },
    { name: '新聞（日本経済新聞）',   cycle: 'monthly', amount: 4800 },
    { name: '新聞（読売新聞）',       cycle: 'monthly', amount: 4400 },
    { name: '新聞（朝日新聞）',       cycle: 'monthly', amount: 4400 },
    { name: '新聞（毎日新聞）',       cycle: 'monthly', amount: 4300 },
    { name: '雑誌定期購読',           cycle: 'monthly' },
    { name: '食材定期便（その他）',   cycle: 'monthly' },
  ],

  // ── 交通定期 ──────────────────────────────────────────────────────────────────
  transport: [
    { name: '電車通勤定期券（1か月）', cycle: 'monthly'      },
    { name: '電車通勤定期券（3か月）', cycle: 'every3months' },
    { name: '電車通勤定期券（6か月）'                        },
    { name: 'バス定期券（1か月）',     cycle: 'monthly'      },
    { name: 'バス定期券（3か月）',     cycle: 'every3months' },
    { name: '新幹線通勤定期',          cycle: 'monthly'      },
    { name: '高速道路ETC（月額）',     cycle: 'monthly'      },
  ],

  // ── 年会費・会費 ──────────────────────────────────────────────────────────────
  membership: [
    { name: 'クレジットカード年会費（一般）',   cycle: 'yearly' },
    { name: 'クレジットカード年会費（ゴールド）', cycle: 'yearly' },
    { name: 'クレジットカード年会費（プラチナ）', cycle: 'yearly' },
    { name: 'アメックスゴールド',      cycle: 'yearly', amount: 31900 },
    { name: 'アメックスプラチナ',      cycle: 'yearly', amount: 165000 },
    { name: 'ダイナースクラブ',        cycle: 'yearly', amount: 24200 },
    { name: 'ゴルフクラブ年会費',      cycle: 'yearly' },
    { name: 'スポーツジム年会費',      cycle: 'yearly' },
    { name: 'コワーキングスペース',    cycle: 'monthly' },
    { name: 'シェアオフィス',          cycle: 'monthly' },
    { name: '同窓会費',                cycle: 'yearly'  },
    { name: '業界団体・組合費',        cycle: 'yearly'  },
    { name: 'スポーツ団体会費',        cycle: 'yearly'  },
    { name: 'ロータリークラブ会費',    cycle: 'yearly'  },
    { name: '図書館カード',            cycle: 'yearly'  },
    { name: '有料道路パスポート',      cycle: 'yearly'  },
  ],

  // ── 社会保険・公共 ────────────────────────────────────────────────────────────
  social: [
    { name: '国民健康保険',                      cycle: 'monthly'      },
    { name: '国民年金',          amount: 16980,  cycle: 'monthly'      },
    { name: 'NHK受信料（地上+BS・2か月払い）', amount: 4335, cycle: 'every2months' },
    { name: 'NHK受信料（地上のみ・2か月払い）', amount: 2450, cycle: 'every2months' },
    { name: 'NHK受信料（地上+BS・年払い）',   amount: 24185, cycle: 'yearly' },
    { name: 'NHK受信料（地上のみ・年払い）',  amount: 13490, cycle: 'yearly' },
    { name: '住民税（自営業・分割）',            cycle: 'monthly'      },
    { name: '固定資産税（分割）',                cycle: 'monthly'      },
    { name: '社会保険料（フリーランス）',        cycle: 'monthly'      },
  ],

  other: [
    { name: '電気代',  cycle: 'monthly'      },
    { name: 'ガス代',  cycle: 'monthly'      },
    { name: '水道代',  cycle: 'every2months' },
  ],
};
