import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator, ScrollView, Modal } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSteganography } from '../hooks/useSteganography';
import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';

const RevealInvoiceScreen = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageType, setSelectedImageType] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(null);
  const { loading, revealToken } = useSteganography();
  const navigation = useNavigation<any>();
  const [modalVisible, setModalVisible] = useState(false);
  const [revealedInvoice, setRevealedInvoice] = useState<string | null>(null);

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
      Alert.alert('Error', 'Failed to Uncloak Image');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {selectedImage && (
        <Image source={{ uri: selectedImage }} style={styles.image} />
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={handleRevealToken}
        disabled={loading || !selectedImage}
      >
        <Text style={styles.buttonText}>Uncloak Image</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Select Different Image</Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator size="large" color={theme.colors.primary} />}

      <Modal visible={modalVisible} transparent>
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Uncloaked Image!</Text>
            <View style={styles.invoiceBox}>
              <Text selectable style={styles.invoiceText}>{revealedInvoice}</Text>
            </View>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity onPress={() => Clipboard.setString(revealedInvoice || '')}>
                <Text style={styles.flatButtonText}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setModalVisible(false); navigation.navigate('Home'); }}>
                <Text style={styles.flatButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
    width: '100%', 
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
    width: '100%',
    alignItems: 'center',
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

export default RevealInvoiceScreen;
