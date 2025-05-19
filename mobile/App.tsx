/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar, useColorScheme } from 'react-native';
import { theme } from './src/theme';

function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <SafeAreaProvider style={{ backgroundColor: theme.colors.background }}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={theme.colors.background}
        />
        <AppNavigator />
      </SafeAreaProvider>
    </Provider>
  );
}

export default App;
