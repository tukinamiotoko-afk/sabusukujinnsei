import { Category, Cycle } from '../context/ExpensesContext';

export interface TemplateItem {
  name: string;
  amount?: number;
  cycle?: Cycle;
}

export const TEMPLATES: Record<Category, TemplateItem[]> = {
  subscription: [
    { name: 'Netflix',          amount: 1590,  cycle: 'monthly' },
    { name: 'Amazon Prime',     amount: 600,   cycle: 'monthly' },
    { name: 'Spotify',          amount: 980,   cycle: 'monthly' },
    { name: 'Disney+',          amount: 990,   cycle: 'monthly' },
    { name: 'YouTube Premium',  amount: 1180,  cycle: 'monthly' },
    { name: 'Apple Music',      amount: 1080,  cycle: 'monthly' },
    { name: 'Hulu',             amount: 1026,  cycle: 'monthly' },
    { name: 'U-NEXT',           amount: 2189,  cycle: 'monthly' },
    { name: 'dアニメストア',     amount: 550,   cycle: 'monthly' },
    { name: 'DAZN',             amount: 4200,  cycle: 'monthly' },
    { name: 'Adobe CC',         amount: 6480,  cycle: 'monthly' },
    { name: 'Microsoft 365',    amount: 1284,  cycle: 'monthly' },
    { name: 'iCloud+',          amount: 130,   cycle: 'monthly' },
    { name: 'Google One',       amount: 250,   cycle: 'monthly' },
    { name: 'ChatGPT Plus',     amount: 3000,  cycle: 'monthly' },
    { name: 'Claude Pro',       amount: 3000,  cycle: 'monthly' },
  ],
  telecom: [
    { name: 'docomo',           cycle: 'monthly' },
    { name: 'au',               cycle: 'monthly' },
    { name: 'SoftBank',         cycle: 'monthly' },
    { name: 'ahamo',            amount: 2970,  cycle: 'monthly' },
    { name: 'povo2.0',          cycle: 'monthly' },
    { name: 'IIJmio',           cycle: 'monthly' },
    { name: '楽天モバイル',      cycle: 'monthly' },
    { name: 'mineo',            cycle: 'monthly' },
    { name: 'UQ mobile',        cycle: 'monthly' },
    { name: 'Y!mobile',         cycle: 'monthly' },
    { name: 'インターネット（光）', cycle: 'monthly' },
    { name: 'WiMAX',            cycle: 'monthly' },
  ],
  hospital: [
    { name: '歯科定期検診',      cycle: 'every3months' },
    { name: '内科通院',          cycle: 'monthly' },
    { name: '眼科通院',          cycle: 'every2months' },
    { name: '皮膚科通院',        cycle: 'monthly' },
    { name: '整形外科通院',      cycle: 'monthly' },
    { name: '精神科通院',        cycle: 'monthly' },
    { name: '婦人科通院',        cycle: 'every3months' },
  ],
  medicine: [
    { name: '処方薬',            cycle: 'monthly' },
    { name: '市販薬（常備）',    cycle: 'every2months' },
    { name: 'コンタクトレンズ', cycle: 'every3months' },
  ],
  haircut: [
    { name: '散髪（床屋）',      cycle: 'every2months' },
    { name: '美容院',            cycle: 'every2months' },
    { name: 'QBハウス',          amount: 1350, cycle: 'every45days' },
    { name: 'ヘアカラー',        cycle: 'every2months' },
  ],
  protein: [
    { name: 'プロテイン',        cycle: 'every2months' },
    { name: 'クレアチン',        cycle: 'every3months' },
    { name: 'マルチビタミン',    cycle: 'monthly' },
    { name: 'BCAAサプリ',        cycle: 'every2months' },
    { name: 'ジム会費',          cycle: 'monthly' },
  ],
  other: [
    { name: 'NHK受信料',         amount: 2950, cycle: 'every2months' },
    { name: '新聞',              cycle: 'monthly' },
    { name: '家賃',              cycle: 'monthly' },
    { name: '電気代',            cycle: 'monthly' },
    { name: 'ガス代',            cycle: 'monthly' },
    { name: '水道代',            cycle: 'every2months' },
    { name: '管理費',            cycle: 'monthly' },
    { name: '駐車場代',          cycle: 'monthly' },
    { name: '保険料',            cycle: 'monthly' },
    { name: '国民年金',          amount: 16980, cycle: 'monthly' },
    { name: '国民健康保険',      cycle: 'monthly' },
  ],
};
