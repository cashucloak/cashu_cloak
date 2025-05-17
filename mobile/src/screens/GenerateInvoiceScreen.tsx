import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSteganography } from '../hooks/useSteganography';
import { createLightningInvoice, checkInvoiceStatus } from '../services/api';
import { useNavigation } from '@react-navigation/native';

const TARGET_MINT = 'https://8333.space:3338';

const GenerateInvoiceScreen = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageType, setSelectedImageType] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const { loading, hideToken } = useSteganography();
  const navigation = useNavigation<any>();

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
  }, []);

  const handleGenerateInvoice = async () => {
    if (!selectedImage || !amount) return;
    try {
      const data = await createLightningInvoice(Number(amount), TARGET_MINT);
      const invoice = data.payment_request || data.invoice || JSON.stringify(data);
      await hideToken(invoice, selectedImage);
      Alert.alert('Success!', 'Invoice generated and hidden in the image.', [
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
});

export default GenerateInvoiceScreen;
