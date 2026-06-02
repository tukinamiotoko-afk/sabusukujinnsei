import React from 'react';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ExpensesProvider } from './src/context/ExpensesContext';
import HomeScreen from './src/screens/HomeScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import SimulatorScreen from './src/screens/SimulatorScreen';

const Tab = createBottomTabNavigator();

function TabNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#374151',
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
          } else {
            iconName = focused ? 'trash' : 'trash-outline';
          }
          return <Ionicons name={iconName as never} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="一覧" component={HomeScreen} />
      <Tab.Screen name="カレンダー" component={CalendarScreen} />
      <Tab.Screen name="一括削除" component={SimulatorScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <ExpensesProvider>
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      </ExpensesProvider>
    </SafeAreaProvider>
  );
}
