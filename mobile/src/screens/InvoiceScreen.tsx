import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getBalance, sendCashu, payLightningInvoice, createLightningInvoice } from '../services/api';

type Tab = 'send' | 'receive';

const InvoiceScreen: React.FC = () => {
  // Send state
  const [sendAmount, setSendAmount] = useState('');
  const [sendToken, setSendToken] = useState<string | null>(null);
  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [mints, setMints] = useState<any[]>([]);
  const [selectedMint, setSelectedMint] = useState<string | null>(null);
  const [mintLoading, setMintLoading] = useState(true);

  // Receive state
  const [lightningInvoice, setLightningInvoice] = useState('');
  const [receiveResult, setReceiveResult] = useState<string | null>(null);
  const [receiveLoading, setReceiveLoading] = useState(false);
  const [receiveError, setReceiveError] = useState<string | null>(null);
  const [receiveAmount, setReceiveAmount] = useState('');

  // Active tab
  const [activeTab, setActiveTab] = useState<Tab>('send');

  useEffect(() => {
    if (activeTab === 'send') {
      fetchMints();
    }
  }, [activeTab]);

  const fetchMints = async () => {
    setMintLoading(true);
    try {
      const data = await getBalance();
      if (data.mints) {
        const mintList = Object.entries(data.mints).map(([url, info]: any) => ({
          url,
          ...info,
        }));
        setMints(mintList);
        // Default to mint with largest balance
        if (mintList.length > 0) {
          const largest = mintList.reduce((a, b) => (a.available > b.available ? a : b));
          setSelectedMint(largest.url);
        }
      } else {
        setMints([]);
        setSelectedMint(null);
      }
    } catch (err) {
      setMints([]);
      setSelectedMint(null);
    } finally {
      setMintLoading(false);
    }
  };

  const handleSend = async () => {
    setSendLoading(true);
    setSendError(null);
    setSendToken(null);
    try {
      const data = await sendCashu(Number(sendAmount), '', selectedMint || undefined);
      setSendToken(data.token || JSON.stringify(data));
    } catch (err: any) {
      setSendError(err.message || 'Failed to send token');
    } finally {
      setSendLoading(false);
    }
  };

  const handleReceive = async () => {
    setReceiveLoading(true);
    setReceiveError(null);
    setReceiveResult(null);
    try {
      const data = await payLightningInvoice(lightningInvoice);
      setReceiveResult(JSON.stringify(data));
      setLightningInvoice('');
    } catch (err: any) {
      setReceiveError(err.message || 'Failed to process invoice');
    } finally {
      setReceiveLoading(false);
    }
  };

  const handleGenerateInvoice = async () => {
    setReceiveLoading(true);
    setReceiveError(null);
    setReceiveResult(null);
    try {
      const data = await createLightningInvoice(Number(receiveAmount), selectedMint || undefined);
      setReceiveResult(data.invoice || JSON.stringify(data));
    } catch (err: any) {
      setReceiveError(err.message || 'Failed to generate invoice');
    } finally {
      setReceiveLoading(false);
    }
  };

  const renderSend = () => (
    <View style={styles.tabContent}>
      {mintLoading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : mints.length === 0 ? (
        <Text style={styles.error}>No mints available</Text>
      ) : (
        <>
          <Text style={styles.title}>Send Cashu Token</Text>
          <TextInput
            style={styles.input}
            placeholder="Amount (sats)"
            keyboardType="numeric"
            value={sendAmount}
            onChangeText={setSendAmount}
          />
          {mints.length > 1 && (
            <View style={styles.pickerWrapper}>
              <Text style={styles.pickerLabel}>Select Mint:</Text>
              <Picker
                selectedValue={selectedMint}
                style={styles.picker}
                onValueChange={setSelectedMint}
              >
                {mints.map((mint) => (
                  <Picker.Item
                    key={mint.url}
                    label={`${mint.url} (Balance: ${mint.available} sat)`}
                    value={mint.url}
                  />
                ))}
              </Picker>
            </View>
          )}
          {mints.length === 1 && (
            <Text style={styles.pickerLabel}>
              Mint: {mints[0].url} (Balance: {mints[0].available} sat)
            </Text>
          )}
          <TouchableOpacity
            style={styles.button}
            onPress={handleSend}
            disabled={sendLoading || !sendAmount || !selectedMint}
          >
            <Text style={styles.buttonText}>Send</Text>
          </TouchableOpacity>
          {sendLoading && <ActivityIndicator size="large" color="#007AFF" />}
          {sendError && <Text style={styles.error}>{sendError}</Text>}
          {sendToken && (
            <View style={styles.tokenBox}>
              <Text style={styles.tokenLabel}>Token:</Text>
              <Text selectable style={styles.token}>{sendToken}</Text>
            </View>
          )}
        </>
      )}
    </View>
  );

  const renderReceive = () => (
    <View style={styles.tabContent}>
      <TextInput
        style={styles.input}
        placeholder="Amount (sats)"
        keyboardType="numeric"
        value={receiveAmount}
        onChangeText={setReceiveAmount}
      />
      {mints.length > 1 && (
        <Picker
          selectedValue={selectedMint}
          onValueChange={setSelectedMint}
          style={styles.input}
        >
          {mints.map((mint) => (
            <Picker.Item key={mint.url} label={mint.url} value={mint.url} />
          ))}
        </Picker>
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={handleGenerateInvoice}
        disabled={receiveLoading || !receiveAmount}
      >
        <Text style={styles.buttonText}>Generate Invoice</Text>
      </TouchableOpacity>
      {/* ...rest of your code */}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabBar}>
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
  headerTitle: {
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
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
  invoiceInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
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
  invoice: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
  },
  error: {
    color: 'red',
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  picker: {
    flex: 1,
  },
  tokenBox: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  tokenLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  token: {
    fontSize: 16,
    color: '#333',
  },
});

export default InvoiceScreen; 