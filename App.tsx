import React, { useEffect, useState } from 'react';
import { enableScreens } from 'react-native-screens';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import mobileAds from 'react-native-google-mobile-ads';
import { ExpensesProvider } from './src/context/ExpensesContext';
import { SettingsProvider } from './src/context/SettingsContext';
import { ProProvider } from './src/context/ProContext';
import SettingsScreen from './src/screens/SettingsScreen';
import PaywallScreen from './src/screens/PaywallScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

enableScreens();
import HomeScreen from './src/screens/HomeScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import SimulatorScreen from './src/screens/SimulatorScreen';
import ChartScreen from './src/screens/ChartScreen';

const ONBOARDING_KEY = 'onboarding_done_v1';

const Tab = createBottomTabNavigator();

function TabNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      backBehavior="none"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#475569',
        tabBarInactiveTintColor: '#A0AEC0',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#EDF2F7',
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;
          if (route.name === '一覧') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'カレンダー') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === '一括削除') {
            iconName = focused ? 'trash' : 'trash-outline';
          } else if (route.name === 'グラフ') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Ionicons name={iconName as never} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="一覧" component={HomeScreen} />
      <Tab.Screen name="カレンダー" component={CalendarScreen} />
      <Tab.Screen name="グラフ" component={ChartScreen} />
      <Tab.Screen name="一括削除" component={SimulatorScreen} />
      <Tab.Screen name="設定" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    mobileAds().initialize().catch(() => {});
    AsyncStorage.getItem(ONBOARDING_KEY).then(v => setOnboardingDone(v === 'true'));
  }, []);

  const finishOnboarding = () => {
    AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setOnboardingDone(true);
  };

  if (onboardingDone === null) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {!onboardingDone ? (
        <OnboardingScreen onDone={finishOnboarding} />
      ) : (
        <ProProvider>
          <ExpensesProvider>
            <SettingsProvider>
              <NavigationContainer>
                <TabNavigator />
              </NavigationContainer>
              <PaywallScreen />
            </SettingsProvider>
          </ExpensesProvider>
        </ProProvider>
      )}
    </SafeAreaProvider>
  );
}
