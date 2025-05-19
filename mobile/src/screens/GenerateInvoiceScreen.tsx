import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, StyleSheet, Alert, ActivityIndicator, Modal } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSteganography } from '../hooks/useSteganography';
import { createLightningInvoice, getBalance, checkInvoiceStatus } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import Clipboard from '@react-native-clipboard/clipboard';
import { theme } from '../theme';

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
  const [currentBalance, setCurrentBalance] = useState<number>(0);

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

  const handleMintChange = (mintUrl: string) => {
    setSelectedMint(mintUrl);
  };

  const handleGenerateInvoice = async () => {
    if (!selectedImage || !amount) return;
    try {
      const data = await createLightningInvoice(Number(amount), selectedMint);
      const invoice = data.payment_request || data.invoice || JSON.stringify(data);
      setGeneratedInvoice(invoice);
      await hideToken(invoice, selectedImage);

      // 1. Get the initial balance before polling
      const balanceData = await getBalance();
      const initialBalance = balanceData.mints && balanceData.mints[selectedMint]
        ? balanceData.mints[selectedMint].available
        : 0;

      setModalVisible(true);

      // 2. Start polling for invoice status and balance
      let pollCount = 0;
      const maxPolls = 60; // 5 minutes if polling every 5 seconds

      const pollInterval = setInterval(async () => {
        pollCount++;
        try {
          // Check invoice status as before
          const status = await checkInvoiceStatus(invoice, selectedMint);

          // Check current balance
          const balanceData = await getBalance();
          const newBalance = balanceData.mints && balanceData.mints[selectedMint]
            ? balanceData.mints[selectedMint].available
            : 0;

          // If invoice is settled or balance increased, stop polling and show success
          if ((status && status.result === 'SETTLED') || newBalance > initialBalance) {
            clearInterval(pollInterval);
            setModalVisible(false);
            Alert.alert('Success!', 'Payment received and tokens claimed', [
              { text: 'OK', onPress: () => navigation.navigate('Home') }
            ]);
            return;
          }
        } catch (error) {
          clearInterval(pollInterval);
          setModalVisible(false);
          Alert.alert(
            'Error',
            'There was a problem checking the invoice status. Please check your balance manually.'
          );
          return;
        }
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval);
          setModalVisible(false);
          Alert.alert('Timeout', 'Invoice polling timed out. Please check your balance manually.');
        }
      }, 5000);

    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to generate invoice');
    }
  };

  return (
    <View style={styles.container}>
      {selectedImage && (
        <TouchableOpacity onPress={pickImage}>
          <Image source={{ uri: selectedImage }} style={styles.image} />
        </TouchableOpacity>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Bitcoin (sats) to Receive"
          placeholderTextColor={theme.colors.placeholder}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
      </View>
      {mintLoading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      ) : availableMints.length > 1 ? (
        <Picker
          selectedValue={selectedMint}
          onValueChange={handleMintChange}
          style={styles.input}
          dropdownIconColor={theme.colors.text}
        >
          {availableMints.map((mint) => (
            <Picker.Item key={mint.url} label={mint.url} value={mint.url} color={theme.colors.text} />
          ))}
        </Picker>
      ) : null}
      <TouchableOpacity
        style={styles.button}
        onPress={handleGenerateInvoice}
        disabled={loading || !amount || !selectedImage}
      >
        <Text style={styles.buttonText}>Generate & Cloak</Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator size="large" color={theme.colors.primary} />}

      <Modal visible={modalVisible} transparent>
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Lightning Invoice Generated!</Text>
            <Text style={styles.modalMessage}>Invoice hidden in image</Text>
            <View style={styles.invoiceBox}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.m,
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.m,
  },
  inputContainer: {
    width: '100%',
    marginBottom: theme.spacing.s,
    alignItems: 'center',
  },
  input: {
    width: 300,
    height: 40,
    borderColor: theme.colors.border,
    borderWidth: 1,
    marginBottom: theme.spacing.s,
    padding: theme.spacing.s,
    borderRadius: theme.borderRadius.small,
    textAlign: 'center',
    backgroundColor: theme.colors.card,
    color: theme.colors.text,
    fontSize: theme.typography.fontSizes.medium,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
    marginVertical: theme.spacing.s,
    width: '57.5%',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  buttonText: {
    color: theme.colors.buttonText,
    fontSize: theme.typography.fontSizes.medium,
    fontWeight: 'bold',
  },
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.large,
    alignItems: 'center',
    minWidth: 300,
    ...theme.shadows.large,
  },
  modalTitle: {
    fontSize: theme.typography.fontSizes.xlarge,
    fontWeight: 'bold',
    marginBottom: theme.spacing.m,
    color: theme.colors.text,
  },
  modalMessage: {
    fontSize: theme.typography.fontSizes.medium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.m,
    textAlign: 'center',
  },
  invoiceBox: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.small,
    marginBottom: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  invoiceText: {
    fontSize: theme.typography.fontSizes.medium,
    color: theme.colors.textSecondary,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  flatButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSizes.medium,
    fontWeight: 'bold',
    marginHorizontal: theme.spacing.m,
  },
});

export default GenerateInvoiceScreen;
