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
import { getBalance, sendCashu, payLightningInvoice } from '../services/api';
import { useNavigation } from '@react-navigation/native';

const TARGET_MINT = 'https://8333.space:3338';

type Tab = 'balance' | 'send' | 'pay';

const WalletScreen: React.FC = () => {
  // Balance state
  const [balance, setBalance] = useState<number | null>(null);
  const [pending, setPending] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  // Send state
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // Pay state
  const [invoice, setInvoice] = useState('');
  const [payResult, setPayResult] = useState<string | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  // Active tab
  const [activeTab, setActiveTab] = useState<Tab>('balance');

  const navigation = useNavigation();

  // Fetch balance on mount and when returning to balance tab
  useEffect(() => {
    if (activeTab === 'balance') {
      fetchBalance();
    }
  }, [activeTab]);

  const fetchBalance = async () => {
    try {
      setBalanceLoading(true);
      setBalanceError(null);
      const data = await getBalance();
      if (data.mints && data.mints[TARGET_MINT]) {
        setBalance(data.mints[TARGET_MINT].available);
        setPending(data.mints[TARGET_MINT].balance - data.mints[TARGET_MINT].available);
      } else {
        setBalance(0);
        setPending(0);
      }
    } catch (err: any) {
      setBalanceError(err.message || 'Failed to fetch balance');
    } finally {
      setBalanceLoading(false);
    }
  };

  const handleSend = async () => {
    setSendLoading(true);
    setSendError(null);
    setSendSuccess(null);
    try {
      const data = await sendCashu(Number(amount), recipient);
      setSendSuccess(`Sent ${amount} sats to ${recipient}. Token: ${data.token || JSON.stringify(data)}`);
      setAmount('');
      setRecipient('');
      // Refresh balance after sending
      fetchBalance();
    } catch (err: any) {
      setSendError(err.message || 'Failed to send sats');
    } finally {
      setSendLoading(false);
    }
  };

  const handlePay = async () => {
    setPayLoading(true);
    setPayError(null);
    setPayResult(null);
    try {
      const data = await payLightningInvoice(invoice);
      setPayResult(JSON.stringify(data));
      setInvoice('');
      // Refresh balance after paying
      fetchBalance();
    } catch (err: any) {
      setPayError(err.message || 'Failed to pay invoice');
    } finally {
      setPayLoading(false);
    }
  };

  const renderBalance = () => (
    <View style={styles.tabContent}>
      <Text style={styles.mint}>{TARGET_MINT}</Text>
      {balanceLoading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : balanceError ? (
        <Text style={styles.error}>{balanceError}</Text>
      ) : (
        <>
          <Text style={styles.balance}>{balance} sat</Text>
          <Text style={styles.pending}>Pending: {pending} sat</Text>
        </>
      )}
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

  const renderPay = () => (
    <View style={styles.tabContent}>
      <TextInput
        style={styles.input}
        placeholder="Paste Lightning invoice"
        value={invoice}
        onChangeText={setInvoice}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handlePay}
        disabled={payLoading || !invoice}
      >
        <Text style={styles.buttonText}>Pay</Text>
      </TouchableOpacity>
      {payLoading && <ActivityIndicator size="large" color="#007AFF" />}
      {payError && <Text style={styles.error}>{payError}</Text>}
      {payResult && <Text style={styles.success}>{payResult}</Text>}
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
          style={[styles.tab, activeTab === 'pay' && styles.activeTab]}
          onPress={() => setActiveTab('pay')}
        >
          <Text style={[styles.tabText, activeTab === 'pay' && styles.activeTabText]}>
            Pay
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'balance' && renderBalance()}
        {activeTab === 'send' && renderSend()}
        {activeTab === 'pay' && renderPay()}
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
  mint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  balance: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  pending: {
    fontSize: 16,
    color: '#FFA500',
    textAlign: 'center',
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
});

export default WalletScreen; 