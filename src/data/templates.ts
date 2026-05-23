import { Category, Cycle } from '../context/ExpensesContext';

export interface TemplateItem {
  name: string;
  amount?: number;
  cycle?: Cycle;
  currency?: 'USD'; // 未設定は円
}

export const TEMPLATES: Record<Category, TemplateItem[]> = {
  subscription: [
    // ── Netflix ───────────────────────────────────────────────────────
    { name: 'Netflix（広告つきスタンダード）', amount: 890,   cycle: 'monthly' },
    { name: 'Netflix（スタンダード）',         amount: 1590,  cycle: 'monthly' },
    { name: 'Netflix（プレミアム）',           amount: 2290,  cycle: 'monthly' },

    // ── Amazon ────────────────────────────────────────────────────────
    { name: 'Amazon Prime（月額）',           amount: 600,   cycle: 'monthly' },
    { name: 'Amazon Prime（年額）',           amount: 5900,  cycle: 'yearly'  },
    { name: 'Amazon Music Unlimited（個人）', amount: 1080,  cycle: 'monthly' },
    { name: 'Amazon Music Unlimited（プライム会員）', amount: 580, cycle: 'monthly' },
    { name: 'Amazon Music Unlimited（ファミリー）',   amount: 1680, cycle: 'monthly' },
    { name: 'Kindle Unlimited',              amount: 980,   cycle: 'monthly' },
    { name: 'Audible',                       amount: 1500,  cycle: 'monthly' },

    // ── YouTube / Google ──────────────────────────────────────────────
    { name: 'YouTube Premium（個人）',        amount: 1280,  cycle: 'monthly' },
    { name: 'YouTube Premium（個人・年額）',  amount: 12800, cycle: 'yearly'  },
    { name: 'YouTube Premium（ファミリー）',  amount: 2280,  cycle: 'monthly' },
    { name: 'YouTube Premium（学生）',        amount: 780,   cycle: 'monthly' },
    { name: 'YouTube Music（個人）',          amount: 980,   cycle: 'monthly' },
    { name: 'YouTube Music（ファミリー）',    amount: 1480,  cycle: 'monthly' },
    { name: 'YouTube Music（学生）',          amount: 580,   cycle: 'monthly' },
    { name: 'Google One（100GB）',            amount: 250,   cycle: 'monthly' },
    { name: 'Google One（200GB）',            amount: 380,   cycle: 'monthly' },
    { name: 'Google One（2TB）',              amount: 1300,  cycle: 'monthly' },

    // ── Apple ─────────────────────────────────────────────────────────
    { name: 'Apple Music（個人）',            amount: 1080,  cycle: 'monthly' },
    { name: 'Apple Music（ファミリー）',      amount: 1680,  cycle: 'monthly' },
    { name: 'Apple Music（学生）',            amount: 580,   cycle: 'monthly' },
    { name: 'Apple TV+',                     amount: 900,   cycle: 'monthly' },
    { name: 'Apple Arcade',                  amount: 600,   cycle: 'monthly' },
    { name: 'Apple One（個人）',              amount: 1400,  cycle: 'monthly' },
    { name: 'Apple One（ファミリー）',        amount: 2100,  cycle: 'monthly' },
    { name: 'iCloud+（50GB）',               amount: 150,   cycle: 'monthly' },
    { name: 'iCloud+（200GB）',              amount: 450,   cycle: 'monthly' },
    { name: 'iCloud+（2TB）',               amount: 1500,  cycle: 'monthly' },

    // ── Spotify ───────────────────────────────────────────────────────
    { name: 'Spotify（Standard）',           amount: 1080,  cycle: 'monthly' },
    { name: 'Spotify（Duo）',               amount: 1480,  cycle: 'monthly' },
    { name: 'Spotify（Family）',            amount: 1880,  cycle: 'monthly' },
    { name: 'Spotify（Student）',           amount: 580,   cycle: 'monthly' },

    // ── Disney+ ───────────────────────────────────────────────────────
    { name: 'Disney+（スタンダード）',        amount: 1140,  cycle: 'monthly' },
    { name: 'Disney+（スタンダード・年額）',  amount: 12500, cycle: 'yearly'  },
    { name: 'Disney+（プレミアム）',          amount: 1520,  cycle: 'monthly' },
    { name: 'Disney+（プレミアム・年額）',    amount: 16700, cycle: 'yearly'  },

    // ── 動画（国内）──────────────────────────────────────────────────
    { name: 'U-NEXT',                        amount: 2189,  cycle: 'monthly' },
    { name: 'Hulu',                          amount: 1026,  cycle: 'monthly' },
    { name: 'ABEMA プレミアム',              amount: 960,   cycle: 'monthly' },
    { name: 'Lemino',                        amount: 990,   cycle: 'monthly' },
    { name: 'FODプレミアム',                 amount: 976,   cycle: 'monthly' },
    { name: 'WOWOW',                         amount: 2530,  cycle: 'monthly' },
    { name: 'Niconico プレミアム',           amount: 550,   cycle: 'monthly' },
    { name: 'dアニメストア',                 amount: 550,   cycle: 'monthly' },
    { name: 'Telasa',                        amount: 618,   cycle: 'monthly' },
    { name: 'J SPORTS',                      amount: 2750,  cycle: 'monthly' },
    { name: 'NHKオンデマンド 見放題パック',  amount: 990,   cycle: 'monthly' },
    { name: 'バンダイチャンネル',             amount: 990,   cycle: 'monthly' },
    { name: '東映アニメオン',                amount: 960,   cycle: 'monthly' },
    { name: 'auスマートパスプレミアム',       amount: 600,   cycle: 'monthly' },
    { name: 'milplus',                       amount: 1078,  cycle: 'monthly' },
    { name: '楽天TV パ・リーグ Special',     amount: 1000,  cycle: 'monthly' },
    { name: 'DAZN（Standard・月間）',        amount: 4200,  cycle: 'monthly' },
    { name: 'DAZN（Standard・年間一括）',    amount: 32000, cycle: 'yearly'  },

    // ── 音楽（国内）──────────────────────────────────────────────────
    { name: 'LINE MUSIC（個人）',            amount: 980,   cycle: 'monthly' },
    { name: 'LINE MUSIC（ファミリー）',      amount: 1480,  cycle: 'monthly' },
    { name: 'LINE MUSIC（学生）',            amount: 480,   cycle: 'monthly' },
    { name: 'AWA Standard',                  amount: 960,   cycle: 'monthly' },
    { name: 'AWA Lite',                      amount: 480,   cycle: 'monthly' },
    { name: 'Rakuten Music',                 amount: 578,   cycle: 'monthly' },

    // ── 音楽（海外・USD）─────────────────────────────────────────────
    { name: 'Tidal（Individual）',           amount: 11,    cycle: 'monthly', currency: 'USD' },
    { name: 'Tidal（HiFi Plus）',            amount: 20,    cycle: 'monthly', currency: 'USD' },
    { name: 'Deezer（Premium）',             amount: 11,    cycle: 'monthly', currency: 'USD' },

    // ── ゲーム ────────────────────────────────────────────────────────
    { name: 'PlayStation Plus Essential（月額）', amount: 850,   cycle: 'monthly' },
    { name: 'PlayStation Plus Essential（年額）', amount: 5143,  cycle: 'yearly'  },
    { name: 'PlayStation Plus Extra（月額）',     amount: 1300,  cycle: 'monthly' },
    { name: 'PlayStation Plus Extra（年額）',     amount: 8600,  cycle: 'yearly'  },
    { name: 'PlayStation Plus Premium（月額）',   amount: 1550,  cycle: 'monthly' },
    { name: 'PlayStation Plus Premium（年額）',   amount: 10250, cycle: 'yearly'  },
    { name: 'Nintendo Switch Online 個人',         amount: 2400,  cycle: 'yearly'  },
    { name: 'Nintendo Switch Online ファミリー',   amount: 4500,  cycle: 'yearly'  },
    { name: 'Nintendo Switch Online+追加パック 個人',     amount: 5143,  cycle: 'yearly' },
    { name: 'Nintendo Switch Online+追加パック ファミリー', amount: 9000, cycle: 'yearly' },
    { name: 'Xbox Game Pass Core',                amount: 850,   cycle: 'monthly' },
    { name: 'Xbox Game Pass Standard',            amount: 1210,  cycle: 'monthly' },
    { name: 'Xbox Game Pass Ultimate',            amount: 1460,  cycle: 'monthly' },
    { name: 'Apple Arcade',                       amount: 600,   cycle: 'monthly' },

    // ── 読み放題・ニュース ────────────────────────────────────────────
    { name: 'dマガジン',                     amount: 580,   cycle: 'monthly' },
    { name: '楽天マガジン',                  amount: 418,   cycle: 'monthly' },
    { name: 'NewsPicks プレミアム',          amount: 1500,  cycle: 'monthly' },
    { name: '日本経済新聞 デジタル',         amount: 4277,  cycle: 'monthly' },

    // ── Adobe ─────────────────────────────────────────────────────────
    { name: 'Adobe Creative Cloud 個人',          amount: 6480,  cycle: 'monthly' },
    { name: 'Adobe Creative Cloud 個人（年額）',  amount: 72336, cycle: 'yearly'  },
    { name: 'Adobe Photoshop 単体',              amount: 3280,  cycle: 'monthly' },
    { name: 'Adobe Premiere Pro 単体',           amount: 3280,  cycle: 'monthly' },
    { name: 'Adobe After Effects 単体',          amount: 3280,  cycle: 'monthly' },
    { name: 'Adobe Illustrator 単体',            amount: 3280,  cycle: 'monthly' },
    { name: 'Adobe InDesign 単体',              amount: 3280,  cycle: 'monthly' },
    { name: 'Adobe Premiere Pro + After Effects', amount: 5060, cycle: 'monthly' },
    { name: 'Adobe Lightroom',                   amount: 1180,  cycle: 'monthly' },
    { name: 'Adobe Lightroom + Photoshop',       amount: 1880,  cycle: 'monthly' },
    { name: 'Adobe Acrobat Pro',                 amount: 1518,  cycle: 'monthly' },
    { name: 'Adobe Express Premium',             amount: 1380,  cycle: 'monthly' },
    { name: 'Adobe Stock（10点/月）',             amount: 4378,  cycle: 'monthly' },
    { name: 'Adobe Substance 3D Collection',     amount: 5030,  cycle: 'monthly' },

    // ── Microsoft ─────────────────────────────────────────────────────
    { name: 'Microsoft 365 Personal',       amount: 1284,  cycle: 'monthly' },
    { name: 'Microsoft 365 Family',         amount: 1850,  cycle: 'monthly' },
    { name: 'Microsoft 365 Personal（年額）', amount: 12984, cycle: 'yearly' },
    { name: 'Microsoft 365 Family（年額）',  amount: 18400, cycle: 'yearly' },

    // ── ストレージ・ファイル共有（USD）───────────────────────────────
    { name: 'Dropbox Plus（月額）',          amount: 12,    cycle: 'monthly', currency: 'USD' },
    { name: 'Dropbox Plus（年額）',          amount: 120,   cycle: 'yearly',  currency: 'USD' },
    { name: 'Dropbox Essentials（月額）',    amount: 20,    cycle: 'monthly', currency: 'USD' },

    // ── AI チャット・アシスタント ─────────────────────────────────────
    { name: 'ChatGPT Plus',                      amount: 3000,  cycle: 'monthly' },
    { name: 'ChatGPT Pro',                       amount: 30000, cycle: 'monthly' },
    { name: 'Claude Pro',                        amount: 3000,  cycle: 'monthly' },
    { name: 'Claude Max（5倍）',                 amount: 100,   cycle: 'monthly', currency: 'USD' },
    { name: 'Claude Max（20倍）',                amount: 200,   cycle: 'monthly', currency: 'USD' },
    { name: 'Microsoft Copilot Pro',             amount: 3200,  cycle: 'monthly' },
    { name: 'Google One AI Premium（Gemini）',   amount: 2900,  cycle: 'monthly' },
    { name: 'Perplexity Pro（月額）',            amount: 20,    cycle: 'monthly', currency: 'USD' },
    { name: 'Perplexity Pro（年額）',            amount: 200,   cycle: 'yearly',  currency: 'USD' },
    { name: 'You.com Pro',                       amount: 20,    cycle: 'monthly', currency: 'USD' },
    { name: 'Grok（X Premium付き）',             amount: 980,   cycle: 'monthly' },

    // ── AI 画像生成 ───────────────────────────────────────────────────
    { name: 'Midjourney Basic',                  amount: 10,    cycle: 'monthly', currency: 'USD' },
    { name: 'Midjourney Standard',               amount: 30,    cycle: 'monthly', currency: 'USD' },
    { name: 'Midjourney Pro',                    amount: 60,    cycle: 'monthly', currency: 'USD' },
    { name: 'Midjourney Mega',                   amount: 120,   cycle: 'monthly', currency: 'USD' },
    { name: 'Leonardo AI Apprentice',            amount: 10,    cycle: 'monthly', currency: 'USD' },
    { name: 'Leonardo AI Artisan',               amount: 24,    cycle: 'monthly', currency: 'USD' },
    { name: 'Leonardo AI Maestro',               amount: 48,    cycle: 'monthly', currency: 'USD' },
    { name: 'Ideogram Pro（月額）',               amount: 20,    cycle: 'monthly', currency: 'USD' },
    { name: 'Ideogram Pro（年額）',               amount: 192,   cycle: 'yearly',  currency: 'USD' },
    { name: 'Playground AI Pro',                 amount: 15,    cycle: 'monthly', currency: 'USD' },
    { name: 'Krea AI（月額）',                   amount: 24,    cycle: 'monthly', currency: 'USD' },
    { name: 'Magnific AI（月額）',               amount: 39,    cycle: 'monthly', currency: 'USD' },
    { name: 'NovelAI Tablet',                    amount: 10,    cycle: 'monthly', currency: 'USD' },
    { name: 'NovelAI Scroll',                    amount: 15,    cycle: 'monthly', currency: 'USD' },
    { name: 'NovelAI Opus',                      amount: 25,    cycle: 'monthly', currency: 'USD' },
    { name: 'Stable Diffusion（DreamStudio）',   amount: 10,    cycle: 'monthly', currency: 'USD' },

    // ── AI コーディング ───────────────────────────────────────────────
    { name: 'GitHub Copilot Individual',         amount: 10,    cycle: 'monthly', currency: 'USD' },
    { name: 'GitHub Copilot Individual（年額）', amount: 100,   cycle: 'yearly',  currency: 'USD' },
    { name: 'Cursor Pro（月額）',                amount: 20,    cycle: 'monthly', currency: 'USD' },
    { name: 'Cursor Pro（年額）',                amount: 192,   cycle: 'yearly',  currency: 'USD' },
    { name: 'Windsurf Pro（月額）',              amount: 15,    cycle: 'monthly', currency: 'USD' },
    { name: 'Tabnine Pro',                       amount: 12,    cycle: 'monthly', currency: 'USD' },
    { name: 'Replit Core（月額）',               amount: 20,    cycle: 'monthly', currency: 'USD' },
    { name: 'JetBrains AI Assistant',            amount: 10,    cycle: 'monthly', currency: 'USD' },
    { name: 'Amazon CodeWhisperer Pro',          amount: 19,    cycle: 'monthly', currency: 'USD' },
    { name: 'Bolt.new（月額）',                  amount: 20,    cycle: 'monthly', currency: 'USD' },
    { name: 'v0 by Vercel（月額）',              amount: 20,    cycle: 'monthly', currency: 'USD' },

    // ── AI 音声・音楽生成 ─────────────────────────────────────────────
    { name: 'ElevenLabs Starter',                amount: 5,     cycle: 'monthly', currency: 'USD' },
    { name: 'ElevenLabs Creator',                amount: 22,    cycle: 'monthly', currency: 'USD' },
    { name: 'ElevenLabs Pro',                    amount: 99,    cycle: 'monthly', currency: 'USD' },
    { name: 'Murf AI Basic',                     amount: 29,    cycle: 'monthly', currency: 'USD' },
    { name: 'Suno Pro（月額）',                  amount: 10,    cycle: 'monthly', currency: 'USD' },
    { name: 'Suno Pro（年額）',                  amount: 96,    cycle: 'yearly',  currency: 'USD' },
    { name: 'Udio Standard（月額）',             amount: 10,    cycle: 'monthly', currency: 'USD' },
    { name: 'Boomy Standard',                    amount: 10,    cycle: 'monthly', currency: 'USD' },

    // ── AI ライティング ───────────────────────────────────────────────
    { name: 'Grammarly Premium（月額）',         amount: 30,    cycle: 'monthly', currency: 'USD' },
    { name: 'Grammarly Premium（年額）',         amount: 144,   cycle: 'yearly',  currency: 'USD' },
    { name: 'Jasper（月額）',                    amount: 49,    cycle: 'monthly', currency: 'USD' },
    { name: 'Jasper（年額）',                    amount: 468,   cycle: 'yearly',  currency: 'USD' },
    { name: 'Copy.ai Pro（月額）',               amount: 49,    cycle: 'monthly', currency: 'USD' },
    { name: 'Writesonic（月額）',                amount: 20,    cycle: 'monthly', currency: 'USD' },
    { name: 'QuillBot Premium（月額）',          amount: 10,    cycle: 'monthly', currency: 'USD' },
    { name: 'QuillBot Premium（年額）',          amount: 80,    cycle: 'yearly',  currency: 'USD' },

    // ── AI 翻訳 ───────────────────────────────────────────────────────
    { name: 'DeepL Pro Starter',                 amount: 1200,  cycle: 'monthly' },
    { name: 'DeepL Pro Advanced',                amount: 2500,  cycle: 'monthly' },
    { name: 'DeepL Pro Ultimate',                amount: 6500,  cycle: 'monthly' },

    // ── AI 議事録・ミーティング ───────────────────────────────────────
    { name: 'Otter.ai Pro（月額）',              amount: 17,    cycle: 'monthly', currency: 'USD' },
    { name: 'Otter.ai Pro（年額）',              amount: 120,   cycle: 'yearly',  currency: 'USD' },
    { name: 'Fireflies.ai Pro（月額）',          amount: 18,    cycle: 'monthly', currency: 'USD' },
    { name: 'Fathom Premium',                    amount: 19,    cycle: 'monthly', currency: 'USD' },

    // ── AI 3D・その他生成 ─────────────────────────────────────────────
    { name: 'Meshy AI Pro（月額）',              amount: 20,    cycle: 'monthly', currency: 'USD' },
    { name: 'Luma AI Standard（月額）',          amount: 30,    cycle: 'monthly', currency: 'USD' },
    { name: 'D-ID Lite（月額）',                 amount: 6,     cycle: 'monthly', currency: 'USD' },

    // ── 既存（プロジェクト管理系）────────────────────────────────────
    { name: 'Notion Plus（月額）',               amount: 16,    cycle: 'monthly', currency: 'USD' },
    { name: 'Notion Plus（年額）',               amount: 96,    cycle: 'yearly',  currency: 'USD' },
    { name: 'Figma Starter',                     amount: 0,     cycle: 'monthly', currency: 'USD' },
    { name: 'Figma Professional',                amount: 15,    cycle: 'monthly', currency: 'USD' },

    // ── VPN（USD）────────────────────────────────────────────────────
    { name: 'NordVPN Standard（月額）',      amount: 13,    cycle: 'monthly', currency: 'USD' },
    { name: 'NordVPN Standard（年額一括）',  amount: 60,    cycle: 'yearly',  currency: 'USD' },
    { name: 'ExpressVPN（月額）',            amount: 13,    cycle: 'monthly', currency: 'USD' },
    { name: 'ExpressVPN（年額一括）',        amount: 100,   cycle: 'yearly',  currency: 'USD' },
    { name: 'ProtonVPN Plus（月額）',        amount: 10,    cycle: 'monthly', currency: 'USD' },
    { name: 'ProtonVPN Plus（年額一括）',    amount: 72,    cycle: 'yearly',  currency: 'USD' },
    { name: 'Mullvad VPN',                  amount: 6,     cycle: 'monthly', currency: 'USD' },

    // ── SNS・コミュニティ ─────────────────────────────────────────────
    { name: 'X Premium（Web）',             amount: 980,   cycle: 'monthly' },
    { name: 'X Premium（iOS/Android）',     amount: 1380,  cycle: 'monthly' },
    { name: 'X Premium+（Web）',            amount: 2980,  cycle: 'monthly' },
    { name: 'Reddit Premium',               amount: 6,     cycle: 'monthly', currency: 'USD' },
    { name: 'LinkedIn Premium Career',      amount: 40,    cycle: 'monthly', currency: 'USD' },

    // ── フィットネス・ウェルネス（USD）───────────────────────────────
    { name: 'Calm（月額）',                  amount: 15,    cycle: 'monthly', currency: 'USD' },
    { name: 'Calm（年額一括）',              amount: 70,    cycle: 'yearly',  currency: 'USD' },
    { name: 'Headspace（月額）',             amount: 13,    cycle: 'monthly', currency: 'USD' },
    { name: 'Headspace（年額一括）',         amount: 70,    cycle: 'yearly',  currency: 'USD' },
    { name: 'Peloton App',                  amount: 13,    cycle: 'monthly', currency: 'USD' },

    // ── 学習（USD）───────────────────────────────────────────────────
    { name: 'Duolingo Plus（月額）',         amount: 7,     cycle: 'monthly', currency: 'USD' },
    { name: 'Duolingo Plus（年額）',         amount: 80,    cycle: 'yearly',  currency: 'USD' },
    { name: 'MasterClass（年額）',           amount: 120,   cycle: 'yearly',  currency: 'USD' },
    { name: 'Coursera Plus（月額）',         amount: 59,    cycle: 'monthly', currency: 'USD' },
    { name: 'Coursera Plus（年額）',         amount: 399,   cycle: 'yearly',  currency: 'USD' },
    { name: 'Rosetta Stone（月額）',         amount: 14,    cycle: 'monthly', currency: 'USD' },
    { name: 'Rosetta Stone（年額）',         amount: 96,    cycle: 'yearly',  currency: 'USD' },
    { name: 'Babbel（月額）',               amount: 14,    cycle: 'monthly', currency: 'USD' },
    { name: 'Babbel（年額）',               amount: 84,    cycle: 'yearly',  currency: 'USD' },
    { name: 'Skillshare（年額）',            amount: 168,   cycle: 'yearly',  currency: 'USD' },
    { name: 'LinkedIn Learning（月額）',     amount: 40,    cycle: 'monthly', currency: 'USD' },
    { name: 'LinkedIn Learning（年額）',     amount: 240,   cycle: 'yearly',  currency: 'USD' },

    // ── 動画（海外・USD）─────────────────────────────────────────────
    { name: 'Crunchyroll Fan',              amount: 8,     cycle: 'monthly', currency: 'USD' },
    { name: 'Crunchyroll Mega Fan',         amount: 10,    cycle: 'monthly', currency: 'USD' },
    { name: 'Crunchyroll Ultimate Fan',     amount: 15,    cycle: 'monthly', currency: 'USD' },
    { name: 'HIDIVE',                       amount: 5,     cycle: 'monthly', currency: 'USD' },
    { name: 'Max（月額）',                  amount: 10,    cycle: 'monthly', currency: 'USD' },
    { name: 'Max（年額一括）',              amount: 100,   cycle: 'yearly',  currency: 'USD' },
    { name: 'Paramount+（月額）',           amount: 8,     cycle: 'monthly', currency: 'USD' },
    { name: 'Paramount+ with SHOWTIME',     amount: 13,    cycle: 'monthly', currency: 'USD' },
    { name: 'ESPN+（月額）',                amount: 11,    cycle: 'monthly', currency: 'USD' },
    { name: 'Peacock Premium（月額）',      amount: 8,     cycle: 'monthly', currency: 'USD' },
    { name: 'Discovery+（月額）',           amount: 5,     cycle: 'monthly', currency: 'USD' },
    { name: 'CuriosityStream（年額）',      amount: 36,    cycle: 'yearly',  currency: 'USD' },
    { name: 'BritBox（月額）',              amount: 9,     cycle: 'monthly', currency: 'USD' },
    { name: 'AMC+（月額）',                 amount: 9,     cycle: 'monthly', currency: 'USD' },
    { name: 'Acorn TV（月額）',             amount: 8,     cycle: 'monthly', currency: 'USD' },
    { name: 'Shudder（月額）',              amount: 7,     cycle: 'monthly', currency: 'USD' },
    { name: 'Mubi（月額）',                 amount: 14,    cycle: 'monthly', currency: 'USD' },
    // ライブTV（USD）
    { name: 'YouTube TV',                   amount: 73,    cycle: 'monthly', currency: 'USD' },
    { name: 'Hulu + Live TV',               amount: 83,    cycle: 'monthly', currency: 'USD' },
    { name: 'Sling TV Orange',              amount: 40,    cycle: 'monthly', currency: 'USD' },
    { name: 'Sling TV Blue',                amount: 40,    cycle: 'monthly', currency: 'USD' },
    { name: 'Fubo TV Pro',                  amount: 80,    cycle: 'monthly', currency: 'USD' },
    { name: 'Philo',                        amount: 25,    cycle: 'monthly', currency: 'USD' },

    // ── ゲーム（追加）────────────────────────────────────────────────
    { name: 'EA Play（月額）',              amount: 530,   cycle: 'monthly' },
    { name: 'EA Play（年額）',              amount: 3600,  cycle: 'yearly'  },
    { name: 'EA Play Pro（月額・PC）',      amount: 15,    cycle: 'monthly', currency: 'USD' },
    { name: 'Ubisoft+（月額）',             amount: 18,    cycle: 'monthly', currency: 'USD' },
    { name: 'Google Play Pass',            amount: 600,   cycle: 'monthly' },
    { name: 'Humble Bundle Choice',        amount: 12,    cycle: 'monthly', currency: 'USD' },
    { name: 'GeForce NOW Priority',        amount: 10,    cycle: 'monthly', currency: 'USD' },
    { name: 'GeForce NOW Ultimate',        amount: 20,    cycle: 'monthly', currency: 'USD' },

    // ── 音楽（追加・USD）─────────────────────────────────────────────
    { name: 'SoundCloud Go+',              amount: 10,    cycle: 'monthly', currency: 'USD' },

    // ── デザイン・クリエイティブ（USD）───────────────────────────────
    { name: 'Canva Pro（月額）',            amount: 15,    cycle: 'monthly', currency: 'USD' },
    { name: 'Canva Pro（年額）',            amount: 120,   cycle: 'yearly',  currency: 'USD' },
    { name: 'Sketch（月額）',               amount: 10,    cycle: 'monthly', currency: 'USD' },
    { name: 'Sketch（年額）',               amount: 99,    cycle: 'yearly',  currency: 'USD' },
    { name: 'Framer（月額）',               amount: 20,    cycle: 'monthly', currency: 'USD' },

    // ── セキュリティ・パスワード管理（USD）───────────────────────────
    { name: '1Password 個人（月額）',       amount: 3,     cycle: 'monthly', currency: 'USD' },
    { name: '1Password 個人（年額）',       amount: 36,    cycle: 'yearly',  currency: 'USD' },
    { name: '1Password ファミリー（年額）', amount: 60,    cycle: 'yearly',  currency: 'USD' },
    { name: 'LastPass Premium',            amount: 3,     cycle: 'monthly', currency: 'USD' },
    { name: 'Bitwarden Premium',           amount: 10,    cycle: 'yearly',  currency: 'USD' },

    // ── コミュニケーション・会議（USD）───────────────────────────────
    { name: 'Zoom Pro（月額）',             amount: 15,    cycle: 'monthly', currency: 'USD' },
    { name: 'Zoom Pro（年額）',             amount: 150,   cycle: 'yearly',  currency: 'USD' },
    { name: 'Slack Pro（月額・1ユーザー）', amount: 8,     cycle: 'monthly', currency: 'USD' },

    // ── コミュニティ・ゲーマー（USD）─────────────────────────────────
    { name: 'Discord Nitro（月額）',        amount: 10,    cycle: 'monthly', currency: 'USD' },
    { name: 'Discord Nitro（年額）',        amount: 100,   cycle: 'yearly',  currency: 'USD' },
    { name: 'Discord Nitro Basic（月額）',  amount: 3,     cycle: 'monthly', currency: 'USD' },
    { name: 'Twitch Turbo',                amount: 9,     cycle: 'monthly', currency: 'USD' },

    // ── ノート・タスク管理（USD）─────────────────────────────────────
    { name: 'Evernote Personal（月額）',    amount: 15,    cycle: 'monthly', currency: 'USD' },
    { name: 'Evernote Personal（年額）',    amount: 130,   cycle: 'yearly',  currency: 'USD' },
    { name: 'Todoist Pro（月額）',          amount: 5,     cycle: 'monthly', currency: 'USD' },
    { name: 'Todoist Pro（年額）',          amount: 48,    cycle: 'yearly',  currency: 'USD' },
    { name: 'Obsidian Sync（月額）',        amount: 10,    cycle: 'monthly', currency: 'USD' },
    { name: 'Obsidian Sync（年額）',        amount: 96,    cycle: 'yearly',  currency: 'USD' },
    { name: 'Bear（年額）',                amount: 30,    cycle: 'yearly',  currency: 'USD' },
    { name: 'Fantastical Premium（年額）',  amount: 40,    cycle: 'yearly',  currency: 'USD' },

    // ── 動画制作・クリエイター向け（USD）────────────────────────────
    { name: 'Descript Creator（月額）',     amount: 24,    cycle: 'monthly', currency: 'USD' },
    { name: 'Descript Creator（年額）',     amount: 192,   cycle: 'yearly',  currency: 'USD' },
    { name: 'Descript Pro（月額）',         amount: 40,    cycle: 'monthly', currency: 'USD' },
    { name: 'Vimeo Plus（年額）',           amount: 84,    cycle: 'yearly',  currency: 'USD' },
    { name: 'Vimeo Pro（月額）',            amount: 20,    cycle: 'monthly', currency: 'USD' },
    { name: 'Vimeo Pro（年額）',            amount: 240,   cycle: 'yearly',  currency: 'USD' },
    { name: 'Vimeo Business（月額）',       amount: 50,    cycle: 'monthly', currency: 'USD' },
    { name: 'Loom Pro（月額）',             amount: 15,    cycle: 'monthly', currency: 'USD' },
    { name: 'Loom Pro（年額）',             amount: 144,   cycle: 'yearly',  currency: 'USD' },
    { name: 'StreamYard Basic（月額）',     amount: 49,    cycle: 'monthly', currency: 'USD' },
    { name: 'Riverside.fm Standard（月額）', amount: 15,  cycle: 'monthly', currency: 'USD' },
    { name: 'CapCut Pro（月額）',           amount: 10,    cycle: 'monthly', currency: 'USD' },
    { name: 'CapCut Pro（年額）',           amount: 90,    cycle: 'yearly',  currency: 'USD' },
    { name: 'Camtasia（月額）',             amount: 18,    cycle: 'monthly', currency: 'USD' },
    { name: 'Kapwing Pro（月額）',          amount: 16,    cycle: 'monthly', currency: 'USD' },
    { name: 'InVideo AI（月額）',           amount: 25,    cycle: 'monthly', currency: 'USD' },
    { name: 'Pictory AI（月額）',           amount: 23,    cycle: 'monthly', currency: 'USD' },
    // AI動画生成
    { name: 'Runway Gen-3（Standard）',     amount: 15,    cycle: 'monthly', currency: 'USD' },
    { name: 'Runway Gen-3（Pro）',          amount: 35,    cycle: 'monthly', currency: 'USD' },
    { name: 'HeyGen（月額）',               amount: 29,    cycle: 'monthly', currency: 'USD' },
    { name: 'HeyGen（年額）',               amount: 228,   cycle: 'yearly',  currency: 'USD' },
    { name: 'Synthesia Starter（月額）',    amount: 30,    cycle: 'monthly', currency: 'USD' },
    { name: 'Kling AI（月額）',             amount: 10,    cycle: 'monthly', currency: 'USD' },
    { name: 'Pika Pro（月額）',             amount: 8,     cycle: 'monthly', currency: 'USD' },

    // ── 音楽ライセンス・素材（USD）───────────────────────────────────
    { name: 'Epidemic Sound Personal（月額）', amount: 15, cycle: 'monthly', currency: 'USD' },
    { name: 'Epidemic Sound Personal（年額）', amount: 99, cycle: 'yearly',  currency: 'USD' },
    { name: 'Epidemic Sound Commercial（月額）', amount: 49, cycle: 'monthly', currency: 'USD' },
    { name: 'Artlist Personal（年額）',      amount: 199,  cycle: 'yearly',  currency: 'USD' },
    { name: 'Artlist Creator（年額）',       amount: 299,  cycle: 'yearly',  currency: 'USD' },
    { name: 'Musicbed Personal（月額）',     amount: 15,   cycle: 'monthly', currency: 'USD' },
    { name: 'Splice（月額）',               amount: 8,     cycle: 'monthly', currency: 'USD' },
    { name: 'Storyblocks All Access（年額）', amount: 180, cycle: 'yearly',  currency: 'USD' },
    { name: 'Envato Elements（月額）',       amount: 17,   cycle: 'monthly', currency: 'USD' },
    { name: 'Envato Elements（年額）',       amount: 198,  cycle: 'yearly',  currency: 'USD' },
    { name: 'Motion Array（月額）',          amount: 30,   cycle: 'monthly', currency: 'USD' },
    { name: 'Motion Array（年額）',          amount: 120,  cycle: 'yearly',  currency: 'USD' },
    { name: 'Shutterstock（350点/月）',      amount: 49,   cycle: 'monthly', currency: 'USD' },
    { name: 'Getty Images（月額）',          amount: 175,  cycle: 'monthly', currency: 'USD' },

    // ── プロジェクト管理・コラボ（USD）───────────────────────────────
    { name: 'Asana Premium（月額・1ユーザー）', amount: 11, cycle: 'monthly', currency: 'USD' },
    { name: 'Asana Premium（年額・1ユーザー）', amount: 108, cycle: 'yearly', currency: 'USD' },
    { name: 'Monday.com Basic（月額・1ユーザー）', amount: 9, cycle: 'monthly', currency: 'USD' },
    { name: 'ClickUp Unlimited（月額・1ユーザー）', amount: 7, cycle: 'monthly', currency: 'USD' },
    { name: 'Trello Premium（月額・1ユーザー）', amount: 5, cycle: 'monthly', currency: 'USD' },
    { name: 'Miro Team（月額・1ユーザー）',  amount: 8,    cycle: 'monthly', currency: 'USD' },
    { name: 'Basecamp（個人）',             amount: 15,    cycle: 'monthly', currency: 'USD' },
    { name: 'Notion AI（月額追加）',         amount: 10,   cycle: 'monthly', currency: 'USD' },
    { name: 'Typeform Plus（月額）',         amount: 25,   cycle: 'monthly', currency: 'USD' },
    { name: 'Airtable Plus（月額）',         amount: 10,   cycle: 'monthly', currency: 'USD' },

    // ── マーケティング・SEO（USD）────────────────────────────────────
    { name: 'Buffer Essentials（月額）',     amount: 6,    cycle: 'monthly', currency: 'USD' },
    { name: 'Hootsuite Professional（月額）', amount: 99,  cycle: 'monthly', currency: 'USD' },
    { name: 'Mailchimp Essentials（月額）',  amount: 13,   cycle: 'monthly', currency: 'USD' },
    { name: 'Semrush Pro（月額）',           amount: 140,  cycle: 'monthly', currency: 'USD' },
    { name: 'Ahrefs Lite（月額）',           amount: 129,  cycle: 'monthly', currency: 'USD' },

    // ── 会計・経理（JPY）─────────────────────────────────────────────
    { name: 'freee 会計 スターター',         amount: 980,  cycle: 'monthly' },
    { name: 'freee 会計 スタンダード',       amount: 1980, cycle: 'monthly' },
    { name: 'freee 会計 プレミアム',         amount: 3980, cycle: 'monthly' },
    { name: 'マネーフォワード クラウド確定申告 フリー', amount: 990, cycle: 'monthly' },
    { name: 'マネーフォワード クラウド確定申告 パーソナル', amount: 1650, cycle: 'monthly' },
    { name: 'マネーフォワード ME プレミアム', amount: 500, cycle: 'monthly' },

    // ── バックアップ・ストレージ（USD）───────────────────────────────
    { name: 'Backblaze Personal Backup（月額）', amount: 9, cycle: 'monthly', currency: 'USD' },
    { name: 'Backblaze Personal Backup（年額）', amount: 99, cycle: 'yearly', currency: 'USD' },
    { name: 'Box Personal Pro（月額）',      amount: 10,   cycle: 'monthly', currency: 'USD' },

    // ── 開発ツール・クラウド（USD）───────────────────────────────────
    { name: 'GitHub Pro',                  amount: 4,     cycle: 'monthly', currency: 'USD' },
    { name: 'GitLab Premium（月額）',       amount: 29,    cycle: 'monthly', currency: 'USD' },
    { name: 'Vercel Pro（月額）',           amount: 20,    cycle: 'monthly', currency: 'USD' },
    { name: 'Linear（月額）',               amount: 8,     cycle: 'monthly', currency: 'USD' },
    { name: 'Jira（月額・1ユーザー）',      amount: 8,     cycle: 'monthly', currency: 'USD' },

    // ── 日本のアプリ・サービス（JPY）─────────────────────────────────
    { name: 'pixiv Premium（月額）',        amount: 550,   cycle: 'monthly' },
    { name: 'pixiv Premium（年額）',        amount: 6000,  cycle: 'yearly'  },
    { name: '楽天プレミアム',               amount: 550,   cycle: 'monthly' },
    { name: 'LEAN BODY（月額）',            amount: 1628,  cycle: 'monthly' },
    { name: 'LEAN BODY（年額一括）',        amount: 9800,  cycle: 'yearly'  },

    // ── マンガ・電子書籍（JPY）───────────────────────────────────────
    { name: 'コミックシーモア 読み放題Lite',  amount: 780,  cycle: 'monthly' },
    { name: 'コミックシーモア 読み放題フル',  amount: 1480, cycle: 'monthly' },
    { name: 'BookLive! 読み放題',           amount: 836,   cycle: 'monthly' },
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
    { name: '歯科定期検診',  cycle: 'every3months' },
    { name: '内科通院',      cycle: 'monthly'      },
    { name: '眼科通院',      cycle: 'every2months' },
    { name: '皮膚科通院',    cycle: 'monthly'      },
    { name: '整形外科通院',  cycle: 'monthly'      },
    { name: '精神科通院',    cycle: 'monthly'      },
    { name: '婦人科通院',    cycle: 'every3months' },
    { name: '耳鼻科通院',    cycle: 'monthly'      },
  ],
  medicine: [
    { name: '処方薬',            cycle: 'monthly'      },
    { name: '市販薬（常備）',    cycle: 'every2months' },
    { name: 'コンタクトレンズ', cycle: 'every3months' },
    { name: '花粉症薬',          cycle: 'monthly'      },
  ],
  haircut: [
    { name: '散髪（床屋）',  cycle: 'every2months' },
    { name: '美容院',        cycle: 'every2months' },
    { name: 'QBハウス', amount: 1350, cycle: 'every45days' },
    { name: 'ヘアカラー',    cycle: 'every2months' },
    { name: 'ヘッドスパ',    cycle: 'monthly'      },
  ],
  protein: [
    { name: 'プロテイン',     cycle: 'every2months' },
    { name: 'クレアチン',     cycle: 'every3months' },
    { name: 'マルチビタミン', cycle: 'monthly'      },
    { name: 'BCAAサプリ',     cycle: 'every2months' },
    { name: 'EAA',           cycle: 'every2months' },
    { name: 'ジム会費',       cycle: 'monthly'      },
  ],
  other: [
    { name: 'NHK受信料',    amount: 2950,  cycle: 'every2months' },
    { name: '新聞',                         cycle: 'monthly'      },
    { name: '家賃',                         cycle: 'monthly'      },
    { name: '電気代',                       cycle: 'monthly'      },
    { name: 'ガス代',                       cycle: 'monthly'      },
    { name: '水道代',                       cycle: 'every2months' },
    { name: '管理費',                       cycle: 'monthly'      },
    { name: '駐車場代',                     cycle: 'monthly'      },
    { name: '保険料',                       cycle: 'monthly'      },
    { name: '国民年金',     amount: 16980, cycle: 'monthly'      },
    { name: '国民健康保険',                 cycle: 'monthly'      },
  ],
};
