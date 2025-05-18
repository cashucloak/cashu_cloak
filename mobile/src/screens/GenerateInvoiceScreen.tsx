import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSteganography } from '../hooks/useSteganography';
import { createLightningInvoice, getBalance, checkInvoiceStatus } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

const TARGET_MINT = 'https://8333.space:3338';

type Mint = {
  url: string;
  available: number;
  balance: number;
};

const GenerateInvoiceScreen = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageType, setSelectedImageType] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const { loading, hideToken } = useSteganography();
  const navigation = useNavigation<any>();
  const [availableMints, setAvailableMints] = useState<Mint[]>([]);
  const [selectedMint, setSelectedMint] = useState<string>(TARGET_MINT);
  const [mintLoading, setMintLoading] = useState(true);

  const pickImage = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', includeBase64: false });
    if (result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri || null);
      setSelectedImageType(result.assets[0].type || 'image/jpeg');
      setSelectedImageName(result.assets[0].fileName || 'image.jpg');
    }
  };

  useEffect(() => {
    pickImage();
    fetchMints();
  }, []);

  const fetchMints = async () => {
    setMintLoading(true);
    try {
      const data = await getBalance();
      if (data.mints) {
        const mintList = Object.entries(data.mints).map(([url, info]: any) => ({
          url,
          ...info,
        }));
        setAvailableMints(mintList);
        if (mintList.length > 0) {
          setSelectedMint(mintList[0].url);
        }
      } else {
        setAvailableMints([]);
        setSelectedMint(TARGET_MINT);
      }
    } finally {
      setMintLoading(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!selectedImage || !amount) return;
    try {
      const data = await createLightningInvoice(Number(amount), selectedMint);
      const invoice = data.payment_request || data.invoice || JSON.stringify(data);
      await hideToken(invoice, selectedImage);

      // Start polling for invoice status
      let pollCount = 0;
      const maxPolls = 60; // 5 minutes if polling every 5 seconds

      const pollInterval = setInterval(async () => {
        pollCount++;
        try {
          const status = await checkInvoiceStatus(invoice, selectedMint);
          if (status && status.result === 'SETTLED') {
            clearInterval(pollInterval);
            Alert.alert('Success!', 'Payment received and tokens claimed successfully!', [
              { text: 'OK', onPress: () => navigation.navigate('Home') }
            ]);
          }
        } catch (error) {
          // Optionally handle error
        }
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval);
        }
      }, 5000);

      // Optionally show a message that invoice is being checked
      Alert.alert('Invoice Generated!', 'Invoice hidden in image. Waiting for payment...', [
        { text: 'OK', onPress: () => navigation.navigate('Home') }
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to generate invoice');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Generate & Hide Invoice</Text>
      {selectedImage && (
        <Image source={{ uri: selectedImage }} style={styles.image} />
      )}
      <TextInput
        style={styles.input}
        placeholder="Input amount (sats) to Invoice"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      {mintLoading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginVertical: 10 }} />
      ) : availableMints.length > 1 ? (
        <Picker
          selectedValue={selectedMint}
          onValueChange={setSelectedMint}
          style={styles.input}
        >
          {availableMints.map((mint) => (
            <Picker.Item key={mint.url} label={mint.url} value={mint.url} />
          ))}
        </Picker>
      ) : null}
      <TouchableOpacity
        style={styles.button}
        onPress={handleGenerateInvoice}
        disabled={loading || !amount || !selectedImage}
      >
        <Text style={styles.buttonText}>Cloak Invoice</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Select Different Image</Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, marginVertical: 10, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  image: { width: 300, height: 300, borderRadius: 10, marginBottom: 20 },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
    textAlign: 'center',
  },
  mintLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
});

export default GenerateInvoiceScreen;
