import React, { useState } from 'react';
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
import { createLightningInvoice, payLightningInvoice } from '../services/api';

type Tab = 'request' | 'receive';

const InvoiceScreen: React.FC = () => {
  // Request state
  const [requestAmount, setRequestAmount] = useState('');
  const [requestInvoice, setRequestInvoice] = useState<string | null>(null);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  // Receive state
  const [lightningInvoice, setLightningInvoice] = useState('');
  const [receiveResult, setReceiveResult] = useState<string | null>(null);
  const [receiveLoading, setReceiveLoading] = useState(false);
  const [receiveError, setReceiveError] = useState<string | null>(null);

  // Active tab
  const [activeTab, setActiveTab] = useState<Tab>('request');

  const handleRequest = async () => {
    setRequestLoading(true);
    setRequestError(null);
    setRequestInvoice(null);
    try {
      const data = await createLightningInvoice(Number(requestAmount));
      setRequestInvoice(data.payment_request || data.invoice || JSON.stringify(data));
    } catch (err: any) {
      setRequestError(err.message || 'Failed to generate invoice');
    } finally {
      setRequestLoading(false);
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

  const renderRequest = () => (
    <View style={styles.tabContent}>
      <Text style={styles.title}>Create Invoice</Text>
      <TextInput
        style={styles.input}
        placeholder="Amount (sats)"
        keyboardType="numeric"
        value={requestAmount}
        onChangeText={setRequestAmount}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleRequest}
        disabled={requestLoading || !requestAmount}
      >
        <Text style={styles.buttonText}>Generate Invoice</Text>
      </TouchableOpacity>
      {requestLoading && <ActivityIndicator size="large" color="#007AFF" />}
      {requestError && <Text style={styles.error}>{requestError}</Text>}
      {requestInvoice && <Text style={styles.invoice}>{requestInvoice}</Text>}
    </View>
  );

  const renderReceive = () => (
    <View style={styles.tabContent}>
      <Text style={styles.title}>Receive Invoice</Text>
      <TextInput
        style={[styles.input, styles.invoiceInput]}
        placeholder="Paste Lightning Invoice (lnbc...)"
        value={lightningInvoice}
        onChangeText={setLightningInvoice}
        multiline
        numberOfLines={3}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleReceive}
        disabled={receiveLoading || !lightningInvoice}
      >
        <Text style={styles.buttonText}>Process Invoice</Text>
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
          style={[styles.tab, activeTab === 'request' && styles.activeTab]}
          onPress={() => setActiveTab('request')}
        >
          <Text style={[styles.tabText, activeTab === 'request' && styles.activeTabText]}>
            Request
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
        {activeTab === 'request' && renderRequest()}
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
});

export default InvoiceScreen; 