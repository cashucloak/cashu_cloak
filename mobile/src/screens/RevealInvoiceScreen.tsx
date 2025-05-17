import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSteganography } from '../hooks/useSteganography';
import Clipboard from '@react-native-clipboard/clipboard';

const RevealInvoiceScreen = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageType, setSelectedImageType] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(null);
  const { loading, revealToken } = useSteganography();

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
      Alert.alert(
        'Invoice Revealed!',
        revealed,
        [
          { text: 'Copy', onPress: () => Clipboard.setString(revealed) },
          { text: 'OK', style: 'cancel' }
        ]
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to reveal invoice from image');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Reveal Invoice</Text>

      {selectedImage && (
        <Image source={{ uri: selectedImage }} style={styles.image} />
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={handleRevealToken}
        disabled={loading || !selectedImage}
      >
        <Text style={styles.buttonText}>Reveal Invoice</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Select Different Image</Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator size="large" color="#007AFF" />}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, marginVertical: 10, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  image: { width: 300, height: 300, borderRadius: 10, marginBottom: 20 },
});

export default RevealInvoiceScreen;
