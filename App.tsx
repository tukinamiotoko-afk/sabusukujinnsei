import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ExpensesProvider } from './src/context/ExpensesContext';
import HomeScreen from './src/screens/HomeScreen';
import CalendarScreen from './src/screens/CalendarScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <ExpensesProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarActiveTintColor: '#6C63FF',
              tabBarInactiveTintColor: '#A0AEC0',
              tabBarStyle: {
                backgroundColor: '#fff',
                borderTopColor: '#EDF2F7',
                borderTopWidth: 1,
                height: 60,
                paddingBottom: 8,
              },
              tabBarLabelStyle: {
                fontSize: 11,
                fontWeight: '600',
              },
              tabBarIcon: ({ focused, color, size }) => {
                let iconName: string;
                if (route.name === '一覧') {
                  iconName = focused ? 'list' : 'list-outline';
                } else {
                  iconName = focused ? 'calendar' : 'calendar-outline';
                }
                return <Ionicons name={iconName as never} size={size} color={color} />;
              },
            })}
          >
            <Tab.Screen name="一覧" component={HomeScreen} />
            <Tab.Screen name="カレンダー" component={CalendarScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </ExpensesProvider>
    </SafeAreaProvider>
  );
}
