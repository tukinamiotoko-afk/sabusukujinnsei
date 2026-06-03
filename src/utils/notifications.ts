import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { type Expense } from '../context/ExpensesContext';
import { type NotificationSettings } from '../context/SettingsContext';
import { isPaymentOnDate } from '../context/ExpensesContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'デフォルト',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleExpenseNotifications(
  expenses: Expense[],
  settings: NotificationSettings,
): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!settings.enabled) return;

  const filtered = expenses.filter(e => {
    if (settings.target === 'subscription') return e.category === 'subscription';
    if (settings.target === 'fixed') return e.category !== 'subscription';
    return true;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Schedule for next 60 days × each daysBefore value
  for (let offset = 0; offset < 60; offset++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() + offset);

    const hits = filtered.filter(e => isPaymentOnDate(e, checkDate));
    if (hits.length === 0) continue;

    const names = hits.map(e => e.name).join('、');
    const total = hits.reduce((s, e) => s + e.amount, 0);

    for (const d of settings.daysBefore) {
      const notifyDate = new Date(checkDate);
      notifyDate.setDate(checkDate.getDate() - d);
      notifyDate.setHours(9, 0, 0, 0);

      if (notifyDate <= new Date()) continue;

      const label = d === 0 ? '本日' : `${d}日前`;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `💳 ${label}の支払い`,
          body: `${names}  合計 ¥${Math.round(total).toLocaleString('ja-JP')}`,
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: notifyDate },
      });
    }
  }
}
