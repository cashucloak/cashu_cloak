import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sendCashu } from '../services/api';

const SendCashuScreen: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const data = await sendCashu(Number(amount), recipient);
      setSuccess(`Sent ${amount} sats to ${recipient}. Token: ${data.token || JSON.stringify(data)}`);
    } catch (err: any) {
      setError(err.message || 'Failed to send sats');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Send Cashu</Text>
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
        <TouchableOpacity style={styles.button} onPress={handleSend} disabled={loading || !amount || !recipient}>
          <Text style={styles.buttonText}>Send</Text>
        </TouchableOpacity>
        {loading && <ActivityIndicator size="large" color="#007AFF" />}
        {error && <Text style={styles.error}>{error}</Text>}
        {success && <Text style={styles.success}>{success}</Text>}
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

export default SendCashuScreen; 