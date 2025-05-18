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
import { getBalance, sendCashu, receiveCashuToken } from '../services/api';
import { useIsFocused } from '@react-navigation/native';

const TARGET_MINT = 'https://8333.space:3338';

type Tab = 'balance' | 'send' | 'invoice' | 'receive';

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
  // Balance state
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  // Send state
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // Active tab
  const [activeTab, setActiveTab] = useState<Tab>('balance');

  const [selectedMint, setSelectedMint] = useState<string>(TARGET_MINT);

  // Receive state
  const [receiveToken, setReceiveToken] = useState('');
  const [receiveResult, setReceiveResult] = useState<string | null>(null);
  const [receiveLoading, setReceiveLoading] = useState(false);
  const [receiveError, setReceiveError] = useState<string | null>(null);

  const isFocused = useIsFocused();

  // Fetch balance on mount and when returning to balance tab
  useEffect(() => {
    if (activeTab === 'balance') {
      fetchBalance();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'invoice') {
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

  const handleSend = async () => {
    setSendLoading(true);
    setSendError(null);
    setSendSuccess(null);
    try {
      const data = await sendCashu(Number(amount), recipient, selectedMint || undefined);
      setSendSuccess(`Sent ${amount} sats to ${recipient}. Token: ${data.token || JSON.stringify(data)}`);
      setAmount('');
      setRecipient('');
      await fetchBalance();
    } catch (err: any) {
      setSendError(err.message || 'Failed to send sats');
    } finally {
      setSendLoading(false);
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

  const renderSend = () => (
    <View style={styles.tabContent}>
      <TextInput
        style={styles.input}
        placeholder="Amount (sats)"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      <TextInput
        style={styles.input}
        placeholder="Recipient (pubkey or address)"
        value={recipient}
        onChangeText={setRecipient}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleSend}
        disabled={sendLoading || !amount || !recipient}
      >
        <Text style={styles.buttonText}>Send</Text>
      </TouchableOpacity>
      {sendLoading && <ActivityIndicator size="large" color="#007AFF" />}
      {sendError && <Text style={styles.error}>{sendError}</Text>}
      {sendSuccess && <Text style={styles.success}>{sendSuccess}</Text>}
    </View>
  );

  const renderReceive = () => (
    <View style={styles.tabContent}>      
      <Text style={styles.titleWithMargin}>Redeem Cashu Token</Text>
      <TextInput
        style={[styles.input, styles.invoiceInput]}
        placeholder="Paste Cashu token here"
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
          style={[styles.tab, activeTab === 'send' && styles.activeTab]}
          onPress={() => setActiveTab('send')}
        >
          <Text style={[styles.tabText, activeTab === 'send' && styles.activeTabText]}>
            Send
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
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'balance' && renderBalance()}
        {activeTab === 'send' && renderSend()}
        {activeTab === 'receive' && renderReceive()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  balance: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    fontSize: 18,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  success: {
    marginTop: 20,
    fontSize: 16,
    color: 'green',
    backgroundColor: '#e0ffe0',
    padding: 10,
    borderRadius: 8,
  },
  error: {
    color: 'red',
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  tokenBox: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  tokenLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  token: {
    fontSize: 16,
    color: '#666',
  },
  invoiceInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  invoice: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  titleWithMargin: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default WalletScreen; 