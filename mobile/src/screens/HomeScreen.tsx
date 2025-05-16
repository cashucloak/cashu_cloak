import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {launchImageLibrary, Asset} from 'react-native-image-picker';
import { useSteganography } from '../hooks/useSteganography';
import RNFS from 'react-native-fs';
import { NativeModules } from 'react-native';
import CameraRoll from '@react-native-camera-roll/camera-roll';
import { createLightningInvoice, checkInvoiceStatus } from '../services/api';
import Clipboard from '@react-native-clipboard/clipboard';

const TARGET_MINT = 'https://8333.space:3338';

const HomeScreen: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageType, setSelectedImageType] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const { loading, error, result, hideToken, revealToken } = useSteganography();
  const [hiddenImageUri, setHiddenImageUri] = useState<string | null>(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [generatedInvoice, setGeneratedInvoice] = useState<string | null>(null);
  const [checkingInvoice, setCheckingInvoice] = useState(false);
  const [invoicePaid, setInvoicePaid] = useState(false);

  console.log('HomeScreen rendered');

  const pickImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 600,
        maxWidth: 600,
        quality: 1,
      });
      console.log('Image picker result:', result);
      if (result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri || null);
        setSelectedImageType(result.assets[0].type || 'image/jpeg');
        setSelectedImageName(result.assets[0].fileName || 'image.jpg');
      } else {
        console.log('No image selected');
      }
    } catch (err) {
      console.error('Error picking image:', err);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!selectedImage || !amount) return;
    
    setInvoiceLoading(true);
    setInvoiceError(null);
    setGeneratedInvoice(null);
    setCheckingInvoice(false);
    setInvoicePaid(false);
    
    try {
      const data = await createLightningInvoice(Number(amount), TARGET_MINT);
      const invoice = data.payment_request || data.invoice || JSON.stringify(data);
      setGeneratedInvoice(invoice);
      
      // Hide the invoice in the image
      const newImageUri = await hideToken(invoice, selectedImage);
      setHiddenImageUri(newImageUri);
      
      Alert.alert('Success!', 'Invoice generated and hidden in the image.', 
      //   [
      //   // check from here 
      //   { text: 'OK', onPress: () => {
      //     setSelectedImage(null);
      //     setSelectedImageType(null);
      //     setSelectedImageName(null);
      //     setAmount('');
      //     setHiddenImageUri(null);
      //     setInvoiceError(null);
      //     setGeneratedInvoice(null);
      //     setInvoicePaid(false);
      //     setCheckingInvoice(false);
      //   }}
      // ]
    );
      // check above
      
      // Start checking invoice status
      setCheckingInvoice(true);
      let pollCount = 0;
      const maxPolls = 60; // 5 minutes if polling every 5 seconds

      const pollInterval = setInterval(async () => {
        pollCount++;
        try {
          const status = await checkInvoiceStatus(invoice, TARGET_MINT);
          if (status && status.result === 'SETTLED') {
            clearInterval(pollInterval);
            setCheckingInvoice(false);
            setInvoicePaid(true);
            Alert.alert('Success!', 'Payment received and tokens claimed successfully!');
          }
        } catch (error) {
          console.error('Error checking invoice status:', error);
        }
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval);
          setCheckingInvoice(false);
        }
      }, 5000);

    } catch (err: any) {
      setInvoiceError(err.message || 'Failed to generate invoice');
      Alert.alert('Error', err.message || 'Failed to generate invoice');
    } finally {
      setInvoiceLoading(false);
    }
  };

  const handleRevealToken = async () => {
    if (!hiddenImageUri || !selectedImageType || !selectedImageName) return;
    try {
      const result = await revealToken(hiddenImageUri, 'image/png', 'image.png');
      const revealed = result.data.token;
      Alert.alert(
        'Invoice Revealed!',
        revealed,
        [
          { text: 'Copy', onPress: () => Clipboard.setString(revealed) },
          { text: 'OK', style: 'cancel' }
        ]
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to reveal invoice from image');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to Cashu Cloak</Text>
          <Text style={styles.subtitle}>Your secure mobile wallet</Text>

          <TouchableOpacity style={styles.button} onPress={pickImage}>
            <Text style={styles.buttonText}>Select Image</Text>
          </TouchableOpacity>

          {selectedImage && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: selectedImage }} style={styles.image} />
              <TextInput
                style={styles.input}
                placeholder="Amount (sats)"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={[styles.button, styles.actionButton]} 
                  onPress={handleGenerateInvoice}
                  disabled={invoiceLoading || !amount}
                >
                  <Text style={styles.buttonText}>Generate & Hide Invoice</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, styles.actionButton]} 
                  onPress={handleRevealToken}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>Reveal Invoice</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {invoiceLoading && <ActivityIndicator size="large" color="#0000ff" />}
          {invoiceError && <Text style={styles.error}>{invoiceError}</Text>}
          {invoicePaid && <Text style={styles.invoicePaid}>Invoice paid!</Text>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
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
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
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
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  actionButton: {
    width: '48%',
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
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

export default HomeScreen; 