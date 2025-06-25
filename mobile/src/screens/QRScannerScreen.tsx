import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Camera } from 'react-native-camera-kit';
import { useNavigation } from '@react-navigation/native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { theme } from '../theme';

const QRScannerScreen = () => {
  const navigation = useNavigation<any>();
  const [scanning, setScanning] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    try {
      const result = await check(PERMISSIONS.ANDROID.CAMERA);
      
      if (result === RESULTS.GRANTED) {
        setHasPermission(true);
      } else if (result === RESULTS.DENIED) {
        const permissionResult = await request(PERMISSIONS.ANDROID.CAMERA);
        if (permissionResult === RESULTS.GRANTED) {
          setHasPermission(true);
        } else {
          setHasPermission(false);
          Alert.alert('Permission Required', 'Camera permission is required to scan QR codes.');
        }
      } else {
        setHasPermission(false);
        Alert.alert('Permission Required', 'Camera permission is required to scan QR codes.');
      }
    } catch (error) {
      console.error('Permission check failed:', error);
      setHasPermission(false);
    }
  };

  const onReadCode = (event: { nativeEvent: { codeStringValue: string } }) => {
    if (scanning && event?.nativeEvent?.codeStringValue) {
      setScanning(false);
      const data = event.nativeEvent.codeStringValue;
      try {
        const tokenData = JSON.parse(data);
        navigation.navigate('RevealInvoice', { token: tokenData });
      } catch (err) {
        navigation.navigate('RevealInvoice', { token: data });
      }
    }
  };

  const onError = (event: { nativeEvent: { errorMessage: string } }) => {
    console.error('Camera error:', event.nativeEvent.errorMessage);
    Alert.alert('Camera Error', 'Failed to initialize camera. Please try again.');
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Checking camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Camera permission is required</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={checkCameraPermission}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        scanBarcode
        onReadCode={onReadCode}
        onError={onError}
        showFrame
        laserColor={theme.colors.primary}
        frameColor={theme.colors.primary}
        style={styles.camera}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
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
    marginVertical: 5,
  },
  secondaryButton: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: theme.colors.buttonText,
    fontSize: theme.typography.fontSizes.medium,
    fontWeight: 'bold',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSizes.medium,
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSizes.medium,
    textAlign: 'center',
  },
});

export default QRScannerScreen; 