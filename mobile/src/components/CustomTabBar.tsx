import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../theme';
import { getBalance } from '../services/api';

const TARGET_MINT = 'https://8333.space:3338';

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const data = await getBalance();
      if (data.mints && data.mints[TARGET_MINT]) {
        setCurrentBalance(data.mints[TARGET_MINT].available || 0);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = typeof options.tabBarLabel === 'string' 
            ? options.tabBarLabel 
            : options.title || route.name;
          const isFocused = state.index === index;

          const icon = options.tabBarIcon?.({ 
            color: isFocused ? theme.colors.primary : theme.colors.textSecondary,
            size: 24,
            focused: isFocused
          });

          return (
            <React.Fragment key={route.key}>
              <TouchableOpacity
                onPress={() => {
                  if (route.name === 'HomeTab') {
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'HomeTab' }],
                    });
                  } else {
                    navigation.navigate(route.name);
                  }
                }}
                style={styles.tab}
              >
                {icon}
                <Text style={[
                  styles.tabLabel,
                  { color: isFocused ? theme.colors.primary : theme.colors.textSecondary }
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
              {index === 0 && (
                <TouchableOpacity 
                  style={styles.balanceContainer} 
                  onPress={fetchBalance}
                  disabled={loading}
                >
                  <Text style={styles.balanceLabel}>Balance</Text>
                  {loading ? (
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                  ) : (
                    <Text style={styles.balanceAmount}>{currentBalance} sats</Text>
                  )}
                </TouchableOpacity>
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingBottom: 20,
    paddingTop: 10,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  balanceContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  balanceLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
});

export default CustomTabBar; 