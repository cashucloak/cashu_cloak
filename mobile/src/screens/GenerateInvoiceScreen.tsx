import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, StyleSheet, Alert, ActivityIndicator, ScrollView, Modal } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSteganography } from '../hooks/useSteganography';
import { createLightningInvoice, getBalance, checkInvoiceStatus } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import Clipboard from '@react-native-clipboard/clipboard';

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
  const [generatedInvoice, setGeneratedInvoice] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

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
      setGeneratedInvoice(invoice);
      await hideToken(invoice, selectedImage);
      setModalVisible(true);

      // Start polling for invoice status
      let pollCount = 0;
      const maxPolls = 60; // 5 minutes if polling every 5 seconds

      const pollInterval = setInterval(async () => {
        pollCount++;
        try {
          const status = await checkInvoiceStatus(invoice, selectedMint);
          if (status && status.result === 'SETTLED') {
            clearInterval(pollInterval);
            setModalVisible(false);
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
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to generate invoice');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cloak Invoice to Receive</Text>
      {selectedImage && (
        <Image source={{ uri: selectedImage }} style={styles.image} />
      )}
      <TextInput
        style={styles.input}
        placeholder="Input amount (sats) to Receive"
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
        <Text style={styles.buttonText}>Generate & Cloak Invoice</Text>
      </TouchableOpacity>
      <Modal visible={modalVisible} transparent>
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Invoice Generated!</Text>
            <Text style={styles.modalMessage}>Invoice hidden in image. Waiting for payment...</Text>
            <View style={styles.invoiceBox}>
              <Text style={styles.invoiceLabel}>Invoice:</Text>
              <Text selectable style={styles.invoiceText}>{generatedInvoice}</Text>
            </View>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity onPress={() => Clipboard.setString(generatedInvoice || '')}>
                <Text style={styles.flatButtonText}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setModalVisible(false); navigation.navigate('Home'); }}>
                <Text style={styles.flatButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  invoiceBox: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    marginBottom: 10,
    width: '100%',
  },
  invoiceLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  invoiceText: {
    fontSize: 16,
    color: '#333',
  },
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 300,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalMessage: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  flatButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 20,
  },
});

export default GenerateInvoiceScreen;
