import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getBalance } from '../services/api';

const TARGET_MINT = 'https://8333.space:3338';

const BalanceScreen: React.FC = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [pending, setPending] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getBalance();
        if (data.mints && data.mints[TARGET_MINT]) {
          setBalance(data.mints[TARGET_MINT].available);
          setPending(data.mints[TARGET_MINT].balance - data.mints[TARGET_MINT].available);
        } else {
          setBalance(0);
          setPending(0);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch balance');
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Cashu Balance</Text>
        <Text style={styles.mint}>{TARGET_MINT}</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <>
            <Text style={styles.balance}>{balance} sat</Text>
            <Text style={styles.pending}>Pending: {pending} sat</Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  mint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  balance: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  pending: {
    fontSize: 16,
    color: '#FFA500',
    marginTop: 10,
  },
  error: {
    color: 'red',
    marginTop: 20,
    fontSize: 16,
  },
});

export default BalanceScreen; 