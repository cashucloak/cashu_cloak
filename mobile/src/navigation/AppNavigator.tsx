import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Icon } from 'react-native-elements';
import { theme } from '../theme';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import GenerateInvoiceScreen from '../screens/GenerateInvoiceScreen';
import RevealInvoiceScreen from '../screens/RevealInvoiceScreen';
import WalletScreen from '../screens/WalletScreen';
import SendCashuScreen from '../screens/SendCashuScreen';

// Custom theme that extends the navigation dark theme with our colors
const CashuTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: theme.colors.primary,
    background: theme.colors.background,
    card: theme.colors.card,
    text: theme.colors.text,
    border: theme.colors.border,
    notification: theme.colors.notification,
  },
};

const HomeStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStackScreen = () => (
  <HomeStack.Navigator 
    screenOptions={{ 
      headerShown: false,
      contentStyle: { backgroundColor: theme.colors.background },
      headerStyle: { backgroundColor: theme.colors.card },
      headerTintColor: theme.colors.text,
    }}
  >
    <HomeStack.Screen name="Home" component={HomeScreen} />
    <HomeStack.Screen name="GenerateInvoice" component={GenerateInvoiceScreen} />
    <HomeStack.Screen name="RevealInvoice" component={RevealInvoiceScreen} />
    <HomeStack.Screen name="SendCashu" component={SendCashuScreen} />
  </HomeStack.Navigator>
);

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName = 'home';
        if (route.name === 'HomeTab') iconName = 'home';
        else if (route.name === 'Wallet') iconName = 'account-balance-wallet';
        else if (route.name === 'Invoices') iconName = 'receipt';
        return <Icon name={iconName} type="material" size={size} color={color} />;
      },
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.textSecondary,
      tabBarStyle: {
        backgroundColor: theme.colors.card,
        borderTopColor: theme.colors.border,
      },
      headerStyle: {
        backgroundColor: theme.colors.card,
      },
      headerTintColor: theme.colors.text,
    })}
  >
    <Tab.Screen
      name="HomeTab"
      component={HomeStackScreen}
      options={{ tabBarLabel: 'Home', headerShown: false }}
    />
    <Tab.Screen 
      name="Wallet" 
      component={WalletScreen} 
      options={{ tabBarLabel: 'Wallet', headerShown: false }}
    />
  </Tab.Navigator>
);

const AppNavigator = () => {
  return (
    <NavigationContainer theme={CashuTheme}>
      <TabNavigator />
    </NavigationContainer>
  );
};

export default AppNavigator; 