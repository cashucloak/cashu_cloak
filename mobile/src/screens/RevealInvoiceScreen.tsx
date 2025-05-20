import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator, ScrollView, Modal } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSteganography } from '../hooks/useSteganography';
import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';
import { receiveCashuToken, getBalance } from '../services/api';

const RevealInvoiceScreen = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageType, setSelectedImageType] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(null);
  const { loading, revealToken } = useSteganography();
  const navigation = useNavigation<any>();
  const [modalVisible, setModalVisible] = useState(false);
  const [revealedInvoice, setRevealedInvoice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemResult, setRedeemResult] = useState<string | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);

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

  const handleRevealToken = async () => {
    if (!selectedImage || !selectedImageType || !selectedImageName) return;
    try {
      const result = await revealToken(selectedImage, selectedImageType, selectedImageName);
      const revealed = result.data.token;
      setRevealedInvoice(revealed);
      setModalVisible(true);
    } catch (err) {
      setError('Failed to Uncloak Image');
    }
  };

  const handleRedeemToken = async () => {
    if (!revealedInvoice) return;
    setRedeemLoading(true);
    setRedeemError(null);
    setRedeemResult(null);
    setModalVisible(false);
    try {
      const data = await receiveCashuToken(revealedInvoice);
      // Get new balance after receiving token
      const balanceData = await getBalance();
      const newBalance = balanceData.mints ? (Object.values(balanceData.mints)[0] as { available: number }).available : 0;
      setRedeemResult('Token Received');
    } catch (err: any) {
      setRedeemError(err.message || 'Failed to receive BTC');
    } finally {
      setRedeemLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {selectedImage && (
        <TouchableOpacity onPress={pickImage}>
          <Image source={{ uri: selectedImage }} style={styles.image} />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={handleRevealToken}
        disabled={loading || !selectedImage}
      >
        <Text style={styles.buttonText}>Uncloak Image</Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator size="large" color={theme.colors.primary} />}
      {error && <Text style={styles.error}>{error}</Text>}
      {redeemLoading && <ActivityIndicator size="large" color={theme.colors.primary} />}
      {redeemError && <Text style={styles.error}>{redeemError}</Text>}
      {redeemResult && <Text style={styles.success}>{redeemResult}</Text>}

      <Modal visible={modalVisible} transparent>
        <TouchableOpacity 
          style={styles.modal} 
          activeOpacity={1} 
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={e => e.stopPropagation()}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Uncloaked Image!</Text>
              <View style={styles.invoiceBox}>
                <Text selectable style={styles.invoiceText}>{revealedInvoice}</Text>
              </View>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity 
                  style={styles.modalButton} 
                  onPress={handleRedeemToken} 
                  disabled={redeemLoading}
                >
                  <Text style={styles.buttonText}>Redeem BTC</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: theme.spacing.m,
    backgroundColor: theme.colors.background,
  },
  title: { 
    fontSize: theme.typography.fontSizes.xlarge, 
    fontWeight: 'bold', 
    marginBottom: theme.spacing.m,
    color: theme.colors.text,
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
  image: { 
    width: 300, 
    height: 300, 
    borderRadius: theme.borderRadius.medium, 
    marginBottom: theme.spacing.m,
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
  modalText: {
    fontSize: theme.typography.fontSizes.medium,
    marginBottom: theme.spacing.m,
    color: theme.colors.textSecondary,
  },
  modalButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
    marginVertical: theme.spacing.s,
    width: '57.5%',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  modalButtonText: {
    color: theme.colors.buttonText,
    fontSize: theme.typography.fontSizes.medium,
    fontWeight: 'bold',
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
    justifyContent: 'center',
    width: '100%',
  },
  flatButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSizes.medium,
    fontWeight: 'bold',
    marginHorizontal: theme.spacing.m,
  },
  error: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSizes.medium,
    marginTop: theme.spacing.m,
  },
  invoice: {
    fontSize: theme.typography.fontSizes.medium,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.m,
  },
  success: {
    color: theme.colors.success,
    fontSize: theme.typography.fontSizes.medium,
    marginTop: theme.spacing.m,
    textAlign: 'center',
  },
});

export default RevealInvoiceScreen;
