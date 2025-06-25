import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { theme } from '../theme';
import QRCode from 'react-native-qrcode-svg';
import { sendCashu } from '../services/api';
import ViewShot from 'react-native-view-shot';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';

const QRCodeScreen = () => {
  const [sendAmount, setSendAmount] = useState('');
  const [qrValue, setQrValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const viewShotRef = useRef<any>(null);
  const inputRef = useRef<TextInput>(null);

  // Focus the input when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleCloak = async () => {
    setLoading(true);
    setError(null);
    setQrValue(null);
    try {
      const data = await sendCashu(Number(sendAmount), '');
      console.log('Cashu API response:', data);
      const token = data.token || JSON.stringify(data);
      console.log('Token being set as QR value:', token);
      console.log('Token type:', typeof token);
      console.log('Token length:', token.length);
      setQrValue(token);
    } catch (err: any) {
      console.error('Error in handleCloak:', err);
      setError(err.message || 'Failed to cloak BTC');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saveQrToGallery = async () => {
      if (qrValue && viewShotRef.current) {
        try {
          const uri = await viewShotRef.current.capture();
          await CameraRoll.saveAsset(uri);
          Alert.alert('Saved', 'QR code saved to gallery!');
        } catch (e) {
          Alert.alert('Error', 'Failed to save QR code to gallery.');
        }
      }
    };
    if (qrValue) {
      saveQrToGallery();
    }
  }, [qrValue]);

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
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
        onPress={handleCloak}
        disabled={loading || !sendAmount}
      >
        <Text style={styles.buttonText}>Cloak</Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator size="large" color={theme.colors.primary} />}
      {error && <Text style={styles.error}>{error}</Text>}
      {qrValue && (
        <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 16 }}>
          <QRCode
            value={qrValue}
            size={350}
            color="black"
            backgroundColor="white"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
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
    alignItems: 'center',
    width: '57.5%',
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
  qrContainer: {
    marginTop: theme.spacing.xl,
    padding: theme.spacing.m,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrLabel: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSizes.medium,
    fontWeight: 'bold',
    marginTop: theme.spacing.m,
  },
  qrInfo: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSizes.medium,
    marginTop: theme.spacing.s,
  },
});

export default QRCodeScreen;
