import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../theme';
import CustomTabBar from '../components/CustomTabBar';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import GenerateInvoiceScreen from '../screens/GenerateInvoiceScreen';
import RevealInvoiceScreen from '../screens/RevealInvoiceScreen';
import WalletScreen from '../screens/WalletScreen';
import SendCashuScreen from '../screens/SendCashuScreen';
import DescriptionScreen from '../screens/DescriptionScreen';
import ProcessScreen from '../screens/ProcessScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import CloakScreen from '../screens/CloakScreen';

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

const MainStack = createNativeStackNavigator();
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
    <HomeStack.Screen name="Cloak" component={CloakScreen} />
  </HomeStack.Navigator>
);

// Ensure MaterialIcons is properly loaded
MaterialIcons.loadFont().catch(error => {
  console.warn('Failed to load MaterialIcons font', error);
});

const TabNavigator = () => (
  <Tab.Navigator
    initialRouteName="HomeTab"
    tabBar={props => <CustomTabBar {...props} />}
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName = 'home';
        if (route.name === 'HomeTab') iconName = 'home';
        else if (route.name === 'Wallet') iconName = 'account-balance-wallet';
        else if (route.name === 'Invoices') iconName = 'receipt';
        return <MaterialIcons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.textSecondary,
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
      <MainStack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <MainStack.Screen name="Welcome" component={WelcomeScreen} />
        <MainStack.Screen name="Description" component={DescriptionScreen} />
        <MainStack.Screen name="Process" component={ProcessScreen} />
        <MainStack.Screen name="Wallet" component={WalletScreen} />
        <MainStack.Screen name="MainApp" component={TabNavigator} />
      </MainStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 