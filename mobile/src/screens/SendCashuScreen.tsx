import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import { sendCashu, steganographyService, getBalance } from '../services/api';
import { launchImageLibrary } from 'react-native-image-picker';
import { theme } from '../theme';

type SendCashuParams = {
  imageUri?: string;
  imageType?: string;
  imageName?: string;
};

const SendCashuScreen = () => {
  const route = useRoute<RouteProp<Record<string, SendCashuParams>, string>>();
  const navigation = useNavigation<any>();
  const { imageUri } = route.params || {};

  const [sendAmount, setSendAmount] = useState('');
  const [sendToken, setSendToken] = useState<string | null>(null);
  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSend = async () => {
    setSendLoading(true);
    setSendError(null);
    setSendToken(null);
    try {
      const data = await sendCashu(Number(sendAmount), '');
      const token = data.token || JSON.stringify(data);
      setSendToken(token);

      // Hide the token in the selected image
      if (imageUri && token) {
        await steganographyService.hideToken(token, imageUri);
      }

      setModalVisible(true);
    } catch (err: any) {
      setSendError(err.message || 'Failed to send token');
    } finally {
      setSendLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', includeBase64: false });
    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      // You can use navigation.setParams or a state update if you want to update the image in place:
      navigation.setParams({
        imageUri: asset.uri,
        imageType: asset.type,
        imageName: asset.fileName,
      });
    }
  };

  return (
    <View style={styles.container}>
      {imageUri && (
        <TouchableOpacity onPress={pickImage}>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </TouchableOpacity>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Bitcoin (sats) to Send"
          placeholderTextColor={theme.colors.placeholder}
          keyboardType="numeric"
          value={sendAmount}
          onChangeText={setSendAmount}
        />
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={handleSend}
        disabled={sendLoading || !sendAmount}
      >
        <Text style={styles.buttonText}>Cloak</Text>
      </TouchableOpacity>
      {sendLoading && <ActivityIndicator size="large" color={theme.colors.primary} />}
      {sendError && <Text style={styles.error}>{sendError}</Text>}

      {/* Modal for displaying the token */}
      <Modal visible={modalVisible} transparent>
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cashu Token Generated!</Text>
            <Text style={styles.modalMessage}>Token hidden in image</Text>
            <View style={styles.invoiceBox}>
              <Text selectable style={styles.invoiceText}>{sendToken}</Text>
            </View>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity onPress={() => Clipboard.setString(sendToken || '')}>
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
  title: {
    fontSize: theme.typography.fontSizes.xlarge,
    fontWeight: 'bold',
    marginBottom: theme.spacing.m,
    color: theme.colors.text,
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.xl,
  },
  inputContainer: {
    width: '100%',
    marginBottom: theme.spacing.s,
    alignItems: 'center',
  },
  input: {
    width: '57.5%',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.xs,
    fontSize: theme.typography.fontSizes.medium,
    backgroundColor: theme.colors.card,
    color: theme.colors.text,
    textAlign: 'center',
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
  error: {
    color: theme.colors.error,
    marginTop: theme.spacing.m,
    fontSize: theme.typography.fontSizes.medium,
    textAlign: 'center',
  },
  tokenBox: {
    marginTop: theme.spacing.m,
    padding: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.small,
    backgroundColor: theme.colors.card,
  },
  tokenLabel: {
    fontSize: theme.typography.fontSizes.medium,
    fontWeight: 'bold',
    marginBottom: theme.spacing.s,
    color: theme.colors.text,
  },
  token: {
    fontSize: theme.typography.fontSizes.medium,
    color: theme.colors.textSecondary,
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

export default SendCashuScreen; 