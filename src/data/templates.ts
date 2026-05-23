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
    { name: 'Adobe Creative Cloud 個人',     amount: 6480,  cycle: 'monthly' },
    { name: 'Adobe Photoshop 単体',         amount: 3280,  cycle: 'monthly' },
    { name: 'Adobe Lightroom',              amount: 1180,  cycle: 'monthly' },
    { name: 'Adobe Acrobat Pro',            amount: 1518,  cycle: 'monthly' },
    { name: 'Adobe Express Premium',        amount: 1380,  cycle: 'monthly' },

    // ── Microsoft ─────────────────────────────────────────────────────
    { name: 'Microsoft 365 Personal',       amount: 1284,  cycle: 'monthly' },
    { name: 'Microsoft 365 Family',         amount: 1850,  cycle: 'monthly' },
    { name: 'Microsoft 365 Personal（年額）', amount: 12984, cycle: 'yearly' },
    { name: 'Microsoft 365 Family（年額）',  amount: 18400, cycle: 'yearly' },

    // ── ストレージ・ファイル共有（USD）───────────────────────────────
    { name: 'Dropbox Plus（月額）',          amount: 12,    cycle: 'monthly', currency: 'USD' },
    { name: 'Dropbox Plus（年額）',          amount: 120,   cycle: 'yearly',  currency: 'USD' },
    { name: 'Dropbox Essentials（月額）',    amount: 20,    cycle: 'monthly', currency: 'USD' },

    // ── AI・開発ツール ────────────────────────────────────────────────
    { name: 'ChatGPT Plus',                 amount: 3000,  cycle: 'monthly' },
    { name: 'ChatGPT Pro',                  amount: 30000, cycle: 'monthly' },
    { name: 'Claude Pro',                   amount: 3000,  cycle: 'monthly' },
    { name: 'Claude Max（5倍）',            amount: 100,   cycle: 'monthly', currency: 'USD' },
    { name: 'Claude Max（20倍）',           amount: 200,   cycle: 'monthly', currency: 'USD' },
    { name: 'GitHub Copilot Individual',    amount: 10,    cycle: 'monthly', currency: 'USD' },
    { name: 'GitHub Copilot Individual（年額）', amount: 100, cycle: 'yearly', currency: 'USD' },
    { name: 'Notion Plus（月額）',           amount: 16,    cycle: 'monthly', currency: 'USD' },
    { name: 'Notion Plus（年額）',           amount: 96,    cycle: 'yearly',  currency: 'USD' },
    { name: 'Figma Starter',               amount: 0,     cycle: 'monthly', currency: 'USD' },
    { name: 'Figma Professional',          amount: 15,    cycle: 'monthly', currency: 'USD' },

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
