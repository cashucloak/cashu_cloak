import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getBalance, receiveCashuToken, payLightningInvoice } from '../services/api';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { theme } from '../theme';

const TARGET_MINT = 'https://8333.space:3338';

type Tab = 'balance' | 'send' | 'receive';

type MintData = {
  available: number;
  balance: number;
};

type Mint = {
  url: string;
  available: number;
  balance: number;
};

const WalletScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  // Balance state
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  // Active tab
  const [activeTab, setActiveTab] = useState<Tab>('balance');

  const [selectedMint, setSelectedMint] = useState<string>(TARGET_MINT);

  // Receive state
  const [receiveToken, setReceiveToken] = useState('');
  const [receiveResult, setReceiveResult] = useState<string | null>(null);
  const [receiveLoading, setReceiveLoading] = useState(false);
  const [receiveError, setReceiveError] = useState<string | null>(null);

  // Pay state
  const [payInvoice, setPayInvoice] = useState('');
  const [payLoading, setPayLoading] = useState(false);
  const [payResult, setPayResult] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);

  const isFocused = useIsFocused();

  // Fetch balance on mount and when returning to balance tab
  useEffect(() => {
    if (activeTab === 'balance') {
      fetchBalance();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'send') {
      fetchMints();
    }
  }, [activeTab]);

  useEffect(() => {
    if (isFocused) {
      fetchBalance();
    }
  }, [isFocused]);

  const fetchBalance = async () => {
    try {
      setBalanceLoading(true);
      setBalanceError(null);
      const data = await getBalance();
      console.log('Balance response:', data);
      // Only show the balance for the target mint
      if (data.mints && data.mints[TARGET_MINT]) {
        setBalance(data.mints[TARGET_MINT].available);
      } else {
        setBalance(0);
      }
    } catch (err: any) {
      setBalanceError(err.message || 'Failed to fetch balance');
    } finally {
      setBalanceLoading(false);
    }
  };

  const fetchMints = async () => {
    const data = await getBalance();
    if (data.mints) {
      const mintList = Object.entries(data.mints as Record<string, MintData>).map(([url, data]) => ({
        url,
        available: data.available,
        balance: data.balance
      }));
      if (mintList.length > 0) {
        setSelectedMint(mintList[0].url);
      }
    }
  };

  const handleReceive = async () => {
    setReceiveLoading(true);
    setReceiveError(null);
    setReceiveResult(null);
    try {
      const data = await receiveCashuToken(receiveToken);
      // Get new balance after receiving token
      const balanceData = await getBalance();
      const newBalance = balanceData.mints ? (Object.values(balanceData.mints)[0] as { available: number }).available : 0;
      setReceiveResult(`Token redeemed successfully!\nNew Balance: ${newBalance} sat`);
      setReceiveToken('');
    } catch (err: any) {
      setReceiveError(err.message || 'Failed to redeem token');
    } finally {
      setReceiveLoading(false);
    }
  };

  const handlePayInvoice = async () => {
    setPayLoading(true);
    setPayError(null);
    setPayResult(null);
    try {
      const data = await payLightningInvoice(payInvoice);
      if (data.state === 'paid') {
        setPayResult('Invoice paid successfully!');
        await fetchBalance();
      } else if (data.state === 'pending') {
        setPayResult('Invoice is pending.');
      } else if (data.state === 'unpaid') {
        setPayResult('Invoice is unpaid.');
      } else {
        setPayResult(data.state);
      }
    } catch (err: any) {
      setPayError(err.message || 'Failed to pay invoice');
    } finally {
      setPayLoading(false);
    }
  };

  const renderBalance = () => (
    <View style={styles.tabContent}>
      {balanceLoading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : balanceError ? (
        <Text style={styles.error}>{balanceError}</Text>
      ) : (
        <>
          <Text style={styles.balance}>{balance} sat</Text>
        </>
      )}
      <TouchableOpacity style={styles.button} onPress={fetchBalance}>
        <Text style={styles.buttonText}>Refresh Balance</Text>
      </TouchableOpacity>
    </View>
  );

  const renderReceive = () => (
    <View style={styles.tabContent}>      
      <TextInput
        style={[styles.input, styles.invoiceInput]}
        placeholder="Paste Cashu Token"
        placeholderTextColor={theme.colors.placeholder}
        multiline
        value={receiveToken}
        onChangeText={setReceiveToken}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleReceive}
        disabled={receiveLoading || !receiveToken}
      >
        <Text style={styles.buttonText}>Redeem Token</Text>
      </TouchableOpacity>
      {receiveLoading && <ActivityIndicator size="large" color="#007AFF" />}
      {receiveError && <Text style={styles.error}>{receiveError}</Text>}
      {receiveResult && <Text style={styles.invoice}>{receiveResult}</Text>}
    </View>
  );

  const renderPayInvoice = () => (
    <View style={styles.tabContent}>
      <TextInput
        style={[styles.input, styles.invoiceInput]}
        placeholder="Paste Lightning Invoice"
        placeholderTextColor={theme.colors.placeholder}
        multiline
        value={payInvoice}
        onChangeText={setPayInvoice}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handlePayInvoice}
        disabled={payLoading || !payInvoice}
      >
        <Text style={styles.buttonText}>Pay Invoice</Text>
      </TouchableOpacity>
      {payLoading && <ActivityIndicator size="large" color="#007AFF" />}
      {payError && <Text style={styles.error}>{payError}</Text>}
      {payResult && <Text style={[styles.success, { textAlign: 'center' }]}>{payResult}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'balance' && styles.activeTab]}
          onPress={() => setActiveTab('balance')}
        >
          <Text style={[styles.tabText, activeTab === 'balance' && styles.activeTabText]}>
            Balance
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'receive' && styles.activeTab]}
          onPress={() => setActiveTab('receive')}
        >
          <Text style={[styles.tabText, activeTab === 'receive' && styles.activeTabText]}>
            Receive
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'send' && styles.activeTab]}
          onPress={() => setActiveTab('send')}
        >
          <Text style={[styles.tabText, activeTab === 'send' && styles.activeTabText]}>
            Send
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'balance' && renderBalance()}
        {activeTab === 'receive' && renderReceive()}
        {activeTab === 'send' && renderPayInvoice()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: theme.typography.fontSizes.xlarge,
    fontWeight: 'bold',
    textAlign: 'center',
    color: theme.colors.text,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.m,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: theme.typography.fontSizes.medium,
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabContent: {
    padding: theme.spacing.m,
  },
  balance: {
    fontSize: theme.typography.fontSizes.xxlarge,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.s,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    fontSize: theme.typography.fontSizes.medium,
    backgroundColor: theme.colors.card,
    color: theme.colors.text,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
    marginVertical: theme.spacing.s,
    width: '100%',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  buttonText: {
    color: theme.colors.buttonText,
    fontSize: theme.typography.fontSizes.medium,
    fontWeight: '600',
  },
  success: {
    marginTop: theme.spacing.m,
    fontSize: theme.typography.fontSizes.medium,
    color: theme.colors.success,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
  },
  error: {
    color: theme.colors.error,
    marginTop: theme.spacing.m,
    fontSize: theme.typography.fontSizes.medium,
    textAlign: 'center',
  },
  tokenBox: {
    marginTop: theme.spacing.m,
    padding: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.card,
  },
  tokenLabel: {
    fontSize: theme.typography.fontSizes.small,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.s,
  },
  token: {
    fontSize: theme.typography.fontSizes.medium,
    color: theme.colors.textSecondary,
  },
  invoiceInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  invoice: {
    marginTop: theme.spacing.m,
    fontSize: theme.typography.fontSizes.medium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  titleWithMargin: {
    fontSize: theme.typography.fontSizes.xlarge,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: theme.spacing.m,
    color: theme.colors.text,
  }
});

export default WalletScreen; 