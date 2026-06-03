import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import * as SI from 'simple-icons';

// ─── Simple Icons マッピング（ライブラリに収録されているもの） ─────────────────
// 長いキーワードを先に書いて優先させる
const KEYWORD_MAP: [string, string][] = [
  // 動画配信
  ['Netflix',        'siNetflix'],
  ['Niconico',       'siNiconico'],
  ['niconico',       'siNiconico'],
  ['Mubi',           'siMubi'],
  // DAZNはブランドカラーがほぼ白(#F8F8F5)のためTEXT_ICON_MAPで処理
  // ['DAZN',        'siDazn'],
  ['Twitch',         'siTwitch'],
  ['Vimeo',          'siVimeo'],
  ['HBO',            'siHbomax'],
  ['Max',            'siHbomax'],
  // 音楽
  ['Spotify',        'siSpotify'],
  ['Apple Music',    'siApple'],
  ['Apple TV',       'siApple'],
  ['Apple Arcade',   'siApple'],
  ['Apple One',      'siApple'],
  ['iCloud',         'siApple'],
  ['Apple',          'siApple'],
  ['LINE MUSIC',     'siLine'],
  ['LINE',           'siLine'],
  ['Audible',        'siAudible'],
  ['Deezer',         'siDeezer'],
  ['Tidal',          'siTidal'],
  ['Soundcloud',     'siSoundcloud'],
  // ゲーム
  ['PlayStation',    'siPlaystation'],
  ['Google Play',    'siGoogleplay'],
  ['Epic Games',     'siEpicgames'],
  ['Steam',          'siSteam'],
  ['Ubisoft',        'siUbisoft'],
  ['Humble',         'siHumblebundle'],
  ['GeForce',        'siNvidia'],
  ['EA Play',        'siEa'],
  ['EA ',            'siEa'],
  // クラウド・生産性
  ['Google One AI',  'siGooglegemini'],
  ['Gemini',         'siGooglegemini'],
  ['Google One',     'siGoogledrive'],
  ['Dropbox',        'siDropbox'],
  ['Box Personal',   'siBox'],
  ['Box ',           'siBox'],
  ['Notion',         'siNotion'],
  ['Figma',          'siFigma'],
  ['Trello',         'siTrello'],
  ['Miro',           'siMiro'],
  ['ClickUp',        'siClickup'],
  ['Asana',          'siAsana'],
  ['Zoom',           'siZoom'],
  ['Jira',           'siJira'],
  ['Confluence',     'siConfluence'],
  // SNS
  ['Discord',        'siDiscord'],
  ['pixiv',          'siPixiv'],
  ['Rakuten Music',  'siRakuten'],
  ['楽天マガジン',    'siRakuten'],
  ['楽天TV',         'siRakuten'],
  ['Rakuten',        'siRakuten'],
  ['楽天',           'siRakuten'],
  ['X Premium',      'siX'],
  ['Grok',           'siX'],
  // 開発
  ['GitHub',         'siGithub'],
  ['GitLab',         'siGitlab'],
  ['Vercel',         'siVercel'],
  ['Linear',         'siLinear'],
  // AI
  ['Claude',         'siClaude'],
  ['Cursor',         'siCursor'],
  ['Windsurf',       'siWindsurf'],
  ['Perplexity',     'siPerplexity'],
  ['Grammarly',      'siGrammarly'],
  ['ElevenLabs',     'siElevenlabs'],
  ['DeepL',          'siDeepl'],
  // VPN
  ['NordVPN',        'siNordvpn'],
  ['ExpressVPN',     'siExpressvpn'],
  ['ProtonVPN',      'siProtonvpn'],
  ['Mullvad',        'siMullvad'],
  // マーケ
  ['Buffer',         'siBuffer'],
  ['Hootsuite',      'siHootsuite'],
  ['Semrush',        'siSemrush'],
  // セキュリティ
  ['1Password',      'si1password'],
  ['Bitwarden',      'siBitwarden'],
  ['LastPass',       'siLastpass'],
  // 教育
  ['DMM',            'siDmm'],
];

// ─── テキストアイコン（オリジナルデザイン・著作権フリー） ──────────────────────
// ブランドカラーの色背景にイニシャルを表示するオリジナルデザイン
// 使用色はパブリックドメイン扱い（色自体は著作権保護の対象外）

interface TextIconDef { text: string; bg: string; fg: string }

const TEXT_ICON_MAP: [string, TextIconDef][] = [
  // 動画配信
  ['Disney',             { text: 'D+',   bg: '#01137A', fg: '#fff' }],
  ['Amazon Prime',       { text: 'a',    bg: '#FF9900', fg: '#131921' }],
  ['Amazon Music',       { text: 'a',    bg: '#FF9900', fg: '#131921' }],
  ['Kindle',             { text: 'K',    bg: '#FF9900', fg: '#131921' }],
  ['Amazon',             { text: 'a',    bg: '#FF9900', fg: '#131921' }],
  ['Hulu',               { text: 'hulu', bg: '#1CE783', fg: '#000' }],
  ['ABEMA',              { text: 'A',    bg: '#0099FF', fg: '#fff' }],
  ['U-NEXT',             { text: 'U-N',  bg: '#0E0E0E', fg: '#fff' }],
  ['Lemino',             { text: 'Le',   bg: '#E5002D', fg: '#fff' }],
  ['FOD',                { text: 'FOD',  bg: '#E8002D', fg: '#fff' }],
  ['WOWOW',              { text: 'W',    bg: '#1A1F71', fg: '#fff' }],
  ['dアニメ',             { text: 'dA',  bg: '#EB5097', fg: '#fff' }],
  ['Telasa',             { text: 'T',    bg: '#8B1A8B', fg: '#fff' }],
  ['J SPORTS',           { text: 'JS',   bg: '#0047BB', fg: '#fff' }],
  ['NHK',                { text: 'NHK',  bg: '#00447C', fg: '#fff' }],
  ['バンダイチャンネル',  { text: 'BC',  bg: '#FF6B35', fg: '#fff' }],
  ['東映',               { text: '東映', bg: '#CC0000', fg: '#fff' }],
  ['auスマート',          { text: 'au',  bg: '#E87722', fg: '#fff' }],
  ['milplus',            { text: 'mil',  bg: '#5A67D8', fg: '#fff' }],
  ['LEAN BODY',          { text: 'LB',   bg: '#FF4500', fg: '#fff' }],
  ['DAZN',               { text: 'DAZN', bg: '#000000', fg: '#F8F8F5' }],
  ['Discovery',          { text: 'D+',   bg: '#0064FF', fg: '#fff' }],
  ['LEAN',               { text: 'LB',   bg: '#FF4500', fg: '#fff' }],
  // 音楽
  ['AWA',                { text: 'AWA',  bg: '#111111', fg: '#fff' }],
  // ゲーム
  ['Nintendo',           { text: 'N',    bg: '#E4000F', fg: '#fff' }],
  ['Xbox',               { text: 'X',    bg: '#107C10', fg: '#fff' }],
  // 仕事
  ['Adobe Creative',     { text: 'Cc',   bg: '#FF0000', fg: '#fff' }],
  ['Adobe Photoshop',    { text: 'Ps',   bg: '#001E36', fg: '#31A8FF' }],
  ['Adobe Illustrator',  { text: 'Ai',   bg: '#330000', fg: '#FF9A00' }],
  ['Adobe Premiere',     { text: 'Pr',   bg: '#00005B', fg: '#9999FF' }],
  ['Adobe After',        { text: 'Ae',   bg: '#00005B', fg: '#9999FF' }],
  ['Adobe InDesign',     { text: 'Id',   bg: '#49021F', fg: '#FF3366' }],
  ['Adobe Lightroom',    { text: 'Lr',   bg: '#001A33', fg: '#31A8FF' }],
  ['Adobe Acrobat',      { text: 'Ac',   bg: '#7E0000', fg: '#fff' }],
  ['Adobe Express',      { text: 'Ex',   bg: '#FF0000', fg: '#fff' }],
  ['Adobe Stock',        { text: 'St',   bg: '#3D3D3D', fg: '#fff' }],
  ['Adobe Substance',    { text: 'Su',   bg: '#3D3D3D', fg: '#fff' }],
  ['Adobe',              { text: 'Ad',   bg: '#FF0000', fg: '#fff' }],
  ['Microsoft 365',      { text: 'M365', bg: '#0078D4', fg: '#fff' }],
  ['Microsoft Copilot',  { text: 'Co',   bg: '#0078D4', fg: '#fff' }],
  ['Microsoft',          { text: 'M',    bg: '#0078D4', fg: '#fff' }],
  ['Backblaze',          { text: 'Bb',   bg: '#CC0000', fg: '#fff' }],
  // AI
  ['ChatGPT',            { text: 'GP',   bg: '#10A37F', fg: '#fff' }],
  ['Midjourney',         { text: 'MJ',   bg: '#1A1A1A', fg: '#fff' }],
  ['Leonardo AI',        { text: 'Leo',  bg: '#6C3FC5', fg: '#fff' }],
  ['You.com',            { text: 'You',  bg: '#6B48FF', fg: '#fff' }],
  // 読書
  ['dマガジン',           { text: 'dM',  bg: '#EB5097', fg: '#fff' }],
  ['NewsPicks',          { text: 'NP',   bg: '#1A1A1A', fg: '#fff' }],
  ['日本経済新聞',        { text: '日経', bg: '#E83018', fg: '#fff' }],
  ['コミックシーモア',    { text: 'CS',  bg: '#FF6600', fg: '#fff' }],
  ['BookLive',           { text: 'B!',   bg: '#1565C0', fg: '#fff' }],
  // 学習
  ['Cambly',             { text: 'C',    bg: '#F6821F', fg: '#fff' }],
];

// ─── ルックアップ ─────────────────────────────────────────────────────────────

interface SimpleIcon { title: string; slug: string; hex: string; path: string }

function lookupIcon(name: string): SimpleIcon | null {
  const lower = name.toLowerCase();
  for (const [keyword, exportName] of KEYWORD_MAP) {
    if (lower.includes(keyword.toLowerCase())) {
      const icon = (SI as Record<string, SimpleIcon>)[exportName];
      if (icon) return icon;
    }
  }
  return null;
}

function lookupTextIcon(name: string): TextIconDef | null {
  const lower = name.toLowerCase();
  for (const [keyword, def] of TEXT_ICON_MAP) {
    if (lower.includes(keyword.toLowerCase())) return def;
  }
  return null;
}

export function hasServiceIcon(name: string): boolean {
  return lookupIcon(name) !== null || lookupTextIcon(name) !== null;
}

// ─── ServiceIcon（テンプレート一覧・カード用） ────────────────────────────────

interface Props { name: string; size?: number }

export default function ServiceIcon({ name, size = 40 }: Props) {
  const icon = lookupIcon(name);
  if (icon) {
    const iconSize = size * 0.55;
    const brandColor = '#' + icon.hex;
    return (
      <View style={[styles.container, { width: size, height: size, borderRadius: size * 0.28 }]}>
        <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24">
          <Path d={icon.path} fill={brandColor} />
        </Svg>
      </View>
    );
  }

  const textIcon = lookupTextIcon(name);
  if (textIcon) {
    const len = textIcon.text.replace(/-/g, '').length;
    const fontSize = size * (len <= 1 ? 0.42 : len <= 2 ? 0.33 : len <= 3 ? 0.26 : 0.20);
    return (
      <View style={[styles.container, { width: size, height: size, borderRadius: size * 0.28, backgroundColor: textIcon.bg }]}>
        <Text style={{ fontSize, fontWeight: '900', color: textIcon.fg, includeFontPadding: false }}>
          {textIcon.text}
        </Text>
      </View>
    );
  }

  return null;
}

// ─── ServiceIconMini（カレンダーグリッド用・小） ──────────────────────────────

interface MiniProps { name: string; size?: number }

export function ServiceIconMini({ name, size = 16 }: MiniProps) {
  const icon = lookupIcon(name);
  if (icon) {
    const brandColor = '#' + icon.hex;
    const iconSize = size * 0.8;
    return (
      <View style={[miniStyles.container, { width: size, height: size, borderRadius: size * 0.3 }]}>
        <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24">
          <Path d={icon.path} fill={brandColor} />
        </Svg>
      </View>
    );
  }

  const textIcon = lookupTextIcon(name);
  if (textIcon) {
    const miniText = textIcon.text.slice(0, 2);
    const fontSize = size * (miniText.length <= 1 ? 0.55 : 0.42);
    return (
      <View style={[miniStyles.container, { width: size, height: size, borderRadius: size * 0.3, backgroundColor: textIcon.bg }]}>
        <Text style={{ fontSize, fontWeight: '900', color: textIcon.fg, includeFontPadding: false }}>
          {miniText}
        </Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
});

const miniStyles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
});
