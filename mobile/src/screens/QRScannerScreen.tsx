import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
// import { RNCamera } from 'react-native-camera';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';

const QRScannerScreen = () => {
  const navigation = useNavigation<any>();
  const [scanning, setScanning] = useState(true);

  const onBarCodeRead = (event: { data: string }) => {
    if (scanning) {
      setScanning(false);
      try {
        // Try to parse the QR code data as JSON
        const tokenData = JSON.parse(event.data);
        // Navigate to reveal screen with the token
        navigation.navigate('RevealInvoice', { token: tokenData });
      } catch (e) {
        // If it's not JSON, treat it as a direct token string
        navigation.navigate('RevealInvoice', { token: event.data });
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* <RNCamera
        style={styles.camera}
        type={RNCamera.Constants.Type.back}
        onBarCodeRead={onBarCodeRead}
        captureAudio={false}
        androidCameraPermissionOptions={{
          title: 'Permission to use camera',
          message: 'We need your permission to use your camera',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
        </View>
      </RNCamera>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
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
});

export default QRScannerScreen; 