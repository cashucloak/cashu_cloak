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
import { getBalance, sendCashu, payLightningInvoice, createLightningInvoice, checkInvoiceStatus } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

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

  // Receive state (was Pay)
  const [invoice, setInvoice] = useState('');
  const [receiveResult, setReceiveResult] = useState<string | null>(null);
  const [receiveLoading, setReceiveLoading] = useState(false);
  const [receiveError, setReceiveError] = useState<string | null>(null);

  // Active tab
  const [activeTab, setActiveTab] = useState<Tab>('balance');

  // New receive state
  const [receiveAmount, setReceiveAmount] = useState('');
  const [generatedInvoice, setGeneratedInvoice] = useState<string | null>(null);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);

  const [availableMints, setAvailableMints] = useState<Mint[]>([]);
  const [selectedMint, setSelectedMint] = useState<string>(TARGET_MINT);

  // Add state
  const [checkingInvoice, setCheckingInvoice] = useState(false);
  const [invoicePaid, setInvoicePaid] = useState(false);

  const navigation = useNavigation();

  // Fetch balance on mount and when returning to balance tab
  useEffect(() => {
    if (activeTab === 'balance') {
      fetchBalance();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'receive') {
      fetchMints();
    }
  }, [activeTab]);

  const fetchBalance = async () => {
    try {
      setBalanceLoading(true);
      setBalanceError(null);
      const data = await getBalance();
      // Only show the balance for the target mint
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

  const fetchMints = async () => {
    const data = await getBalance();
    if (data.mints) {
      const mintList = Object.entries(data.mints as Record<string, MintData>).map(([url, data]) => ({
        url,
        available: data.available,
        balance: data.balance
      }));
      setAvailableMints(mintList);
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

  const handleReceive = async () => {
    setReceiveLoading(true);
    setReceiveError(null);
    setReceiveResult(null);
    try {
      const data = await payLightningInvoice(invoice);
      setReceiveResult(JSON.stringify(data));
      setInvoice('');
      // Refresh balance after receiving
      fetchBalance();
    } catch (err: any) {
      setReceiveError(err.message || 'Failed to process invoice');
    } finally {
      setReceiveLoading(false);
    }
  };

  const handleGenerateInvoice = async () => {
    setReceiveLoading(true);
    setReceiveError(null);
    setGeneratedInvoice(null);
    setInvoiceId(null);
    setCheckingInvoice(false);
    setInvoicePaid(false);
    try {
      const data = await createLightningInvoice(Number(receiveAmount), selectedMint);
      setGeneratedInvoice(data.payment_request || data.invoice || JSON.stringify(data));
      if (data.quote) setInvoiceId(data.quote);
      setCheckingInvoice(true);
      let pollCount = 0;
      const maxPolls = 60; // 5 minutes if polling every 5 seconds

      const pollInterval = setInterval(async () => {
        pollCount++;
        try {
          // Call your backend to check invoice status
          const status = await checkInvoiceStatus(data.payment_request, selectedMint);
          if (status && status.result === 'SETTLED') {
            clearInterval(pollInterval);
            setCheckingInvoice(false);
            setInvoicePaid(true);
            fetchBalance();
            setReceiveResult('Payment received and tokens claimed successfully!');
          }
        } catch (error) {
          // handle error if needed
        }
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval);
          setCheckingInvoice(false);
        }
      }, 5000);

    } catch (err: any) {
      setReceiveError(err.message || 'Failed to generate invoice');
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
          <Text style={styles.pending}>Pending: {pending} sat</Text>
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

  const renderReceive = () => {
    // Find the selected mint object
    const selectedMintObj = availableMints.find(m => m.url === selectedMint);
    return (
      <View style={styles.tabContent}>

        <View style={styles.mintSelector}>
          <Text style={styles.mintLabel}>Select Mint:</Text>
          <Picker
            selectedValue={selectedMint}
            onValueChange={setSelectedMint}
            style={styles.picker}
          >
            {availableMints.map((mint) => (
              <Picker.Item 
                key={mint.url} 
                label={`${mint.url} (${mint.available} sat)`}
                value={mint.url}
              />
            ))}
          </Picker>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Amount (sats)"
          keyboardType="numeric"
          value={receiveAmount}
          onChangeText={setReceiveAmount}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleGenerateInvoice}
          disabled={receiveLoading || !receiveAmount}
        >
          <Text style={styles.buttonText}>Generate Invoice</Text>
        </TouchableOpacity>

        {receiveLoading && <ActivityIndicator size="large" color="#007AFF" />}
        {receiveError && <Text style={styles.error}>{receiveError}</Text>}
        {generatedInvoice && selectedMintObj && (
          <View style={styles.tokenBox}>
            <Text style={styles.tokenLabel}>Requesting invoice for {receiveAmount} sat.</Text>
            <Text style={styles.tokenLabel}>Pay invoice to mint {selectedMintObj.url} {receiveAmount} sat:</Text>
            <Text style={styles.tokenLabel}>Invoice:</Text>
            <Text selectable style={styles.token}>{generatedInvoice}</Text>
            {invoiceId && (
              <Text style={styles.invoiceCmd}>
                You can use this command to check the invoice: cashu invoice {receiveAmount} --id {invoiceId}
              </Text>
            )}
          </View>
        )}

        {checkingInvoice && (
          <Text style={styles.checkingInvoice}>Checking invoice...</Text>
        )}
        {invoicePaid && (
          <Text style={styles.invoicePaid}>Invoice paid!</Text>
        )}
      </View>
    );
  };

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
  mintSelector: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
  },
  mintLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  selectedMintBox: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedMintLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedMintUrl: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 5,
  },
  selectedMintBalance: {
    fontSize: 14,
    color: '#333',
  },
  picker: {
    width: '100%',
  },
  mintBalances: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  mintBalancesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  mintBalanceItem: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#eee',
  },
  mintBalanceText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  mintUrl: {
    fontSize: 12,
    color: '#666',
  },
  invoiceCmd: {
    marginTop: 10,
    fontSize: 13,
    color: '#555',
    fontStyle: 'italic',
  },
  checkingInvoice: {
    marginTop: 20,
    fontSize: 16,
    color: '#007AFF',
    textAlign: 'center',
  },
  invoicePaid: {
    marginTop: 20,
    fontSize: 16,
    color: 'green',
    textAlign: 'center',
  },
});

export default WalletScreen; 