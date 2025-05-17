import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Icon } from 'react-native-elements';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import GenerateInvoiceScreen from '../screens/GenerateInvoiceScreen';
import RevealInvoiceScreen from '../screens/RevealInvoiceScreen';
import WalletScreen from '../screens/WalletScreen';
import InvoiceScreen from '../screens/InvoiceScreen';
import ProfileScreen from '../screens/ProfileScreen';

const HomeStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStackScreen = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="Home" component={HomeScreen} />
    <HomeStack.Screen name="GenerateInvoice" component={GenerateInvoiceScreen} />
    <HomeStack.Screen name="RevealInvoice" component={RevealInvoiceScreen} />
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
        else if (route.name === 'Profile') iconName = 'person';
        else if (route.name === 'Settings') iconName = 'settings';
        return <Icon name={iconName} type="material" size={size} color={color} />;
      },
      tabBarActiveTintColor: '#2089dc',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen
      name="HomeTab"
      component={HomeStackScreen}
      options={{ tabBarLabel: 'Home', headerShown: false }}
    />
    <Tab.Screen name="Wallet" component={WalletScreen} />
    <Tab.Screen name="Invoices" component={InvoiceScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
};

export default AppNavigator; 