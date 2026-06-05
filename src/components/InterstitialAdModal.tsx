import { useEffect } from 'react';

interface Props {
  visible: boolean;
  onClose: () => void;
}

// AdMob は現在無効化中。visible になったら即 onClose を呼ぶ。
export default function InterstitialAdModal({ visible, onClose }: Props) {
  useEffect(() => {
    if (visible) {
      const t = setTimeout(onClose, 0);
      return () => clearTimeout(t);
    }
  }, [visible, onClose]);
  return null;
}
