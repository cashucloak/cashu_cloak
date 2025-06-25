import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import { Camera } from 'react-native-camera-kit';
import { useNavigation } from '@react-navigation/native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { theme } from '../theme';

const QRScannerScreen = () => {
  const navigation = useNavigation<any>();
  const [scanning, setScanning] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

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
      setScannedData(data);
      setShowModal(true);
    }
  };

  const handleProceed = () => {
    if (scannedData) {
      try {
        const tokenData = JSON.parse(scannedData);
        navigation.navigate('RevealInvoiceScreen', { token: tokenData });
      } catch (err) {
        navigation.navigate('RevealInvoiceScreen', { token: scannedData });
      }
    }
    setShowModal(false);
    setScannedData(null);
    setScanning(true);
  };

  const handleScanAgain = () => {
    setShowModal(false);
    setScannedData(null);
    setScanning(true);
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

      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>QR Code Scanned!</Text>
            <Text style={styles.modalSubtitle}>Content:</Text>
            <View style={styles.dataContainer}>
              <Text style={styles.scannedData} numberOfLines={10}>
                {scannedData}
              </Text>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.proceedButton]}
                onPress={handleProceed}
              >
                <Text style={styles.modalButtonText}>Proceed</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.scanAgainButton]}
                onPress={handleScanAgain}
              >
                <Text style={styles.modalButtonText}>Scan Again</Text>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.l,
    margin: theme.spacing.m,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: theme.typography.fontSizes.large,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.m,
  },
  modalSubtitle: {
    fontSize: theme.typography.fontSizes.medium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.s,
  },
  dataContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.small,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    maxHeight: 200,
  },
  scannedData: {
    fontSize: theme.typography.fontSizes.small,
    color: theme.colors.text,
    fontFamily: 'monospace',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.m,
  },
  modalButton: {
    flex: 1,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
  },
  proceedButton: {
    backgroundColor: theme.colors.primary,
  },
  scanAgainButton: {
    backgroundColor: '#666',
  },
  modalButtonText: {
    color: theme.colors.buttonText,
    fontSize: theme.typography.fontSizes.medium,
    fontWeight: 'bold',
  },
});

export default QRScannerScreen; 