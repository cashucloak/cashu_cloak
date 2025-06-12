import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import { sendCashu } from '../services/api';
import { theme } from '../theme';
import QRCode from 'react-native-qrcode-svg';

const QRCodeScreen = () => {
  const navigation = useNavigation<any>();
  const [sendAmount, setSendAmount] = useState('');
  const [sendToken, setSendToken] = useState<string | null>(null);
  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleGenerate = async () => {
    if (!sendAmount) return;
    setSendLoading(true);
    setSendError(null);
    setSendToken(null);

    try {
      const data = await sendCashu(parseInt(sendAmount), '');
      const token = data.token;
      setSendToken(token);
      setModalVisible(true);
    } catch (err: any) {
      setSendError(err.message || 'Failed to generate token');
    } finally {
      setSendLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Generate QR Code</Text>
      <Text style={styles.subtitle}>Enter the amount of Bitcoin to cloak</Text>

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
        onPress={handleGenerate}
        disabled={sendLoading || !sendAmount}
      >
        <Text style={styles.buttonText}>Generate QR Code</Text>
      </TouchableOpacity>
      {sendLoading && <ActivityIndicator size="large" color={theme.colors.primary} />}
      {sendError && <Text style={styles.error}>{sendError}</Text>}

      <Modal visible={modalVisible} transparent>
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cashu Token Generated!</Text>
            <Text style={styles.modalMessage}>Scan QR Code</Text>
            <View style={styles.qrContainer}>
              <QRCode
                value={sendToken || ''}
                size={200}
                backgroundColor={theme.colors.background}
                color={theme.colors.text}
              />
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.m,
  },
  title: {
    fontSize: theme.typography.fontSizes.xlarge,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.medium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  input: {
    width: '57.5%',
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
    fontSize: theme.typography.fontSizes.medium,
    textAlign: 'center',
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
    width: '57.5%',
    alignItems: 'center',
  },
  buttonText: {
    color: theme.colors.buttonText,
    fontSize: theme.typography.fontSizes.medium,
    fontWeight: 'bold',
  },
  error: {
    color: theme.colors.error,
    marginTop: theme.spacing.m,
    textAlign: 'center',
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
  },
  modalTitle: {
    fontSize: theme.typography.fontSizes.xlarge,
    fontWeight: 'bold',
    marginBottom: theme.spacing.m,
    color: theme.colors.text,
  },
  modalMessage: {
    fontSize: theme.typography.fontSizes.medium,
    marginBottom: theme.spacing.m,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  qrContainer: {
    padding: theme.spacing.m,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.m,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  flatButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSizes.medium,
    fontWeight: 'bold',
    padding: theme.spacing.m,
  },
});

export default QRCodeScreen; 