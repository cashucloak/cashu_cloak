import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import { sendCashu, steganographyService } from '../services/api';
import { launchImageLibrary } from 'react-native-image-picker';

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
      <Text style={styles.title}>Cloak Invoice to Send</Text>
      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.image} />
      )}
      <TextInput
        style={styles.input}
        placeholder="Amount (sats) to Receive"
        keyboardType="numeric"
        value={sendAmount}
        onChangeText={setSendAmount}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleSend}
        disabled={sendLoading || !sendAmount}
      >
        <Text style={styles.buttonText}>Generate & Cloak Invoice</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Select Different Image</Text>
      </TouchableOpacity>
      {sendLoading && <ActivityIndicator size="large" color="#007AFF" />}
      {sendError && <Text style={styles.error}>{sendError}</Text>}

      {/* Modal for displaying the token */}
      <Modal visible={modalVisible} transparent>
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Token Generated!</Text>
            <Text style={styles.modalMessage}>Token hidden in image. Ready to send!</Text>
            <View style={styles.invoiceBox}>
              <Text selectable style={styles.invoiceText}>{sendToken}</Text>
            </View>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity onPress={() => Clipboard.setString(sendToken || '')}>
                <Text style={styles.flatButtonText}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setModalVisible(false); navigation.goBack(); }}>
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
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: 'red',
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  tokenBox: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  tokenLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  token: {
    fontSize: 16,
    color: '#333',
  },
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 300,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalMessage: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  invoiceBox: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  invoiceText: {
    fontSize: 16,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  flatButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 20,
  },
});

export default SendCashuScreen; 