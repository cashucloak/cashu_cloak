import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { theme } from '../theme';
import QRCode from 'react-native-qrcode-svg';
import { sendCashu } from '../services/api';
import ViewShot from 'react-native-view-shot';
import CameraRoll from '@react-native-camera-roll/camera-roll';

const QRCodeScreen = () => {
  const [sendAmount, setSendAmount] = useState('');
  const [qrValue, setQrValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const viewShotRef = useRef<any>(null);

  const handleCloak = async () => {
    setLoading(true);
    setError(null);
    setQrValue(null);
    try {
      const data = await sendCashu(Number(sendAmount), '');
      const token = data.token || JSON.stringify(data);
      setQrValue(token);
    } catch (err: any) {
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
          await CameraRoll.save(uri, { type: 'photo' });
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
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0 }} style={styles.qrContainer}>
          <QRCode value={qrValue} size={200} />
        </ViewShot>
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
});

export default QRCodeScreen;
