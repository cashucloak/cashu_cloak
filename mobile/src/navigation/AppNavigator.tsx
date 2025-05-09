import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Icon } from 'react-native-elements';

// Import screens (we'll create these next)
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import BalanceScreen from '../screens/BalanceScreen';
import RequestInvoiceScreen from '../screens/RequestInvoiceScreen';
import SendCashuScreen from '../screens/SendCashuScreen';
import PayLightningInvoiceScreen from '../screens/PayLightningInvoiceScreen';
import ReceiveLightningInvoiceScreen from '../screens/ReceiveLightningInvoiceScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'home'; // Default value

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          } else if (route.name === 'Settings') {
            iconName = 'settings';
          } else if (route.name === 'Balance') {
            iconName = 'account-balance-wallet';
          } else if (route.name === 'Request') {
            iconName = 'request-quote';
          } else if (route.name === 'Send') {
            iconName = 'send';
          } else if (route.name === 'Pay') {
            iconName = 'bolt';
          } else if (route.name === 'Receive') {
            iconName = 'call-received';
          }

          return <Icon name={iconName} type="material" size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2089dc',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Balance" component={BalanceScreen} />
      <Tab.Screen name="Request" component={RequestInvoiceScreen} />
      <Tab.Screen name="Send" component={SendCashuScreen} />
      <Tab.Screen name="Pay" component={PayLightningInvoiceScreen} />
      <Tab.Screen name="Receive" component={ReceiveLightningInvoiceScreen} />
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="MainTabs" 
          component={TabNavigator} 
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 