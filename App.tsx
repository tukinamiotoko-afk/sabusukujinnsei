import React from 'react';
import { enableScreens } from 'react-native-screens';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ExpensesProvider } from './src/context/ExpensesContext';
import { SettingsProvider } from './src/context/SettingsContext';
import SettingsScreen from './src/screens/SettingsScreen';

enableScreens();
import HomeScreen from './src/screens/HomeScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import SimulatorScreen from './src/screens/SimulatorScreen';
import ChartScreen from './src/screens/ChartScreen';

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
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <ExpensesProvider>
        <SettingsProvider>
          <NavigationContainer>
            <TabNavigator />
          </NavigationContainer>
        </SettingsProvider>
      </ExpensesProvider>
    </SafeAreaProvider>
  );
}
