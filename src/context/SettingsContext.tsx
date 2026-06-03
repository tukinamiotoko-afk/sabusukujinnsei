import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type NotifyTarget = 'all' | 'subscription' | 'fixed';
export interface NotificationSettings {
  enabled: boolean;
  target: NotifyTarget;
  daysBefore: number[];
}

const DEFAULT: NotificationSettings = {
  enabled: false,
  target: 'all',
  daysBefore: [1],
};

const KEY = '@notification_settings';

interface SettingsContextType {
  notifSettings: NotificationSettings;
  setNotifSettings: (s: NotificationSettings) => void;
}

const SettingsContext = createContext<SettingsContextType>({
  notifSettings: DEFAULT,
  setNotifSettings: () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [notifSettings, setNotifSettingsState] = useState<NotificationSettings>(DEFAULT);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(json => {
      if (!json) return;
      const parsed = JSON.parse(json);
      // migrate: daysBefore was a single number in older versions
      if (typeof parsed.daysBefore === 'number') {
        parsed.daysBefore = [parsed.daysBefore];
      }
      setNotifSettingsState({ ...DEFAULT, ...parsed });
    });
  }, []);

  const setNotifSettings = (s: NotificationSettings) => {
    setNotifSettingsState(s);
    AsyncStorage.setItem(KEY, JSON.stringify(s));
  };

  return (
    <SettingsContext.Provider value={{ notifSettings, setNotifSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
