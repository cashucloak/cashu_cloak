import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { payLightningInvoice } from '../services/api';

const PayLightningInvoiceScreen: React.FC = () => {
  const [invoice, setInvoice] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await payLightningInvoice(invoice);
      setResult(JSON.stringify(data));
    } catch (err: any) {
      setError(err.message || 'Failed to pay invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Pay Lightning Invoice</Text>
        <TextInput
          style={styles.input}
          placeholder="Paste Lightning invoice"
          value={invoice}
          onChangeText={setInvoice}
        />
        <TouchableOpacity style={styles.button} onPress={handlePay} disabled={loading || !invoice}>
          <Text style={styles.buttonText}>Pay</Text>
        </TouchableOpacity>
        {loading && <ActivityIndicator size="large" color="#007AFF" />}
        {error && <Text style={styles.error}>{error}</Text>}
        {result && <Text style={styles.success}>{result}</Text>}
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
  },
});

export default PayLightningInvoiceScreen; 