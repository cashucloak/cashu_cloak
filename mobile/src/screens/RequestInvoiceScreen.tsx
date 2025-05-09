import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createLightningInvoice } from '../services/api';

const RequestInvoiceScreen: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [invoice, setInvoice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequest = async () => {
    setLoading(true);
    setError(null);
    setInvoice(null);
    try {
      const data = await createLightningInvoice(Number(amount));
      setInvoice(data.payment_request || data.invoice || JSON.stringify(data));
    } catch (err: any) {
      setError(err.message || 'Failed to generate invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Request Cashu Invoice</Text>
        <TextInput
          style={styles.input}
          placeholder="Amount (sats)"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        <TouchableOpacity style={styles.button} onPress={handleRequest} disabled={loading || !amount}>
          <Text style={styles.buttonText}>Generate Invoice</Text>
        </TouchableOpacity>
        {loading && <ActivityIndicator size="large" color="#007AFF" />}
        {error && <Text style={styles.error}>{error}</Text>}
        {invoice && <Text style={styles.invoice}>{invoice}</Text>}
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
    marginBottom: 20,
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
  },
});

export default RequestInvoiceScreen; 