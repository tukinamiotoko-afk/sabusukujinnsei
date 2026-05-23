import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import * as SI from 'simple-icons';

// ─── キーワード → simple-icons エクスポート名のマッピング ─────────────────────
// 先に並んだものが優先される（長いキーワードを先に）

const KEYWORD_MAP: [string, string][] = [
  // 動画配信
  ['Netflix',       'siNetflix'],
  ['YouTube',       'siYoutube'],
  ['Disney',        'siDisneyplus'],
  ['DAZN',          'siDazn'],
  ['Twitch',        'siTwitch'],
  ['Vimeo',         'siVimeo'],
  ['HBO',           'siHbomax'],
  ['niconico',      'siNiconico'],
  // 音楽
  ['Spotify',       'siSpotify'],
  ['Apple Music',   'siApple'],
  ['Apple TV',      'siApple'],
  ['Apple Arcade',  'siApple'],
  ['Apple One',     'siApple'],
  ['iCloud',        'siApple'],
  ['Apple',         'siApple'],
  ['Google One',    'siGoogledrive'],
  ['YouTube Music', 'siYoutube'],
  // ゲーム
  ['PlayStation',   'siPlaystation'],
  ['Epic Games',    'siEpicgames'],
  ['Steam',         'siSteam'],
  ['Ubisoft',       'siUbisoft'],
  ['EA Play',       'siEa'],
  // SNS・コミュニティ
  ['Discord',       'siDiscord'],
  ['Twitch',        'siTwitch'],
  ['pixiv',         'siPixiv'],
  ['Rakuten',       'siRakuten'],
  ['楽天',           'siRakuten'],
  // ストレージ・生産性
  ['Dropbox',       'siDropbox'],
  ['Notion',        'siNotion'],
  ['Figma',         'siFigma'],
  ['Trello',        'siTrello'],
  ['Miro',          'siMiro'],
  ['ClickUp',       'siClickup'],
  ['Asana',         'siAsana'],
  ['Zoom',          'siZoom'],
  ['Jira',          'siJira'],
  ['Confluence',    'siConfluence'],
  // 開発
  ['GitHub',        'siGithub'],
  ['GitLab',        'siGitlab'],
  ['Vercel',        'siVercel'],
  ['Linear',        'siLinear'],
  // AI・執筆
  ['Claude',        'siClaude'],
  ['Cursor',        'siCursor'],
  ['Windsurf',      'siWindsurf'],
  ['Grammarly',     'siGrammarly'],
  ['ElevenLabs',    'siElevenlabs'],
  ['DeepL',         'siDeepl'],
  // VPN
  ['NordVPN',       'siNordvpn'],
  ['ExpressVPN',    'siExpressvpn'],
  ['ProtonVPN',     'siProtonvpn'],
  ['Mullvad',       'siMullvad'],
  // マーケ
  ['Buffer',        'siBuffer'],
  ['Hootsuite',     'siHootsuite'],
  ['Semrush',       'siSemrush'],
  // セキュリティ
  ['1Password',     'si1password'],
  ['Bitwarden',     'siBitwarden'],
  ['LastPass',      'siLastpass'],
];

interface SimpleIcon {
  title: string;
  slug: string;
  hex: string;
  path: string;
}

function lookupIcon(name: string): SimpleIcon | null {
  for (const [keyword, exportName] of KEYWORD_MAP) {
    if (name.includes(keyword)) {
      const icon = (SI as Record<string, SimpleIcon>)[exportName];
      if (icon) return icon;
    }
  }
  return null;
}

// ─── ServiceIcon コンポーネント（テンプレート一覧用・大） ─────────────────────

interface Props {
  name: string;
  size?: number;
}

export default function ServiceIcon({ name, size = 40 }: Props) {
  const icon = lookupIcon(name);
  if (!icon) return null;

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

// ─── ServiceIconMini（カレンダーグリッド用・小） ──────────────────────────────

interface MiniProps {
  name: string;
  size?: number;
}

export function ServiceIconMini({ name, size = 16 }: MiniProps) {
  const icon = lookupIcon(name);
  if (!icon) return null;

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

export function hasServiceIcon(name: string): boolean {
  return lookupIcon(name) !== null;
}
