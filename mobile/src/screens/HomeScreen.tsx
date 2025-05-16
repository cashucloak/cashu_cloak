import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {launchImageLibrary, Asset} from 'react-native-image-picker';
import { useSteganography } from '../hooks/useSteganography';
import RNFS from 'react-native-fs';
import { NativeModules } from 'react-native';
import CameraRoll from '@react-native-camera-roll/camera-roll';

const HomeScreen: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageType, setSelectedImageType] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const { loading, error, result, hideToken, revealToken } = useSteganography();
  const [hiddenImageUri, setHiddenImageUri] = useState<string | null>(null);

  console.log('HomeScreen rendered');

  const pickImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 600,
        maxWidth: 600,
        quality: 1,
      });
      console.log('Image picker result:', result);
      if (result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri || null);
        setSelectedImageType(result.assets[0].type || 'image/jpeg');
        setSelectedImageName(result.assets[0].fileName || 'image.jpg');
      } else {
        console.log('No image selected');
      }
    } catch (err) {
      console.error('Error picking image:', err);
    }
  };

  const handleHideToken = async () => {
    if (!selectedImage) return;
    try {
      // Make sure selectedImage is a PNG
      const newImageUri = await hideToken(message, selectedImage); // Calls backend /hide
      setHiddenImageUri(newImageUri);
      Alert.alert('Token hidden!', 'A new image with the hidden token has been saved.');
    } catch (err) {
      // Handle error
    }
  };

  const handleRevealToken = async () => {
    if (!hiddenImageUri || !selectedImageType || !selectedImageName) return;
    try {
      const result = await revealToken(hiddenImageUri, 'image/png', 'image.png'); // Calls backend /reveal
      Alert.alert('Token revealed!', result.data.token);
    } catch (err) {
      // Handle error
    }
  };

  const checkFileExists = async (uri: string) => {
    const path = uri.startsWith('file://') ? uri.replace('file://', '') : uri;
    const exists = await RNFS.exists(path);
    console.log('File exists:', exists);
    return exists;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to Cashu Cloak</Text>
          <Text style={styles.subtitle}>Your secure mobile wallet</Text>

          <TouchableOpacity style={styles.button} onPress={pickImage}>
            <Text style={styles.buttonText}>Select Image</Text>
          </TouchableOpacity>

          {selectedImage && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: selectedImage }} style={styles.image} />
              <TextInput
                style={styles.input}
                placeholder="Enter message to hide"
                value={message}
                onChangeText={setMessage}
              />
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={[styles.button, styles.actionButton]} 
                  onPress={handleHideToken}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>Hide Token</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, styles.actionButton]} 
                  onPress={handleRevealToken}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>Reveal Token</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {hiddenImageUri && (
            <View style={styles.imageContainer}>
              <Text>Stego Image (with hidden token):</Text>
              <Image source={{ uri: hiddenImageUri }} style={styles.image} />
            </View>
          )}

          {loading && <ActivityIndicator size="large" color="#0000ff" />}
          {error && <Text style={styles.error}>{error}</Text>}
          {result && <Text style={styles.result}>Token hidden successfully!</Text>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
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
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  actionButton: {
    width: '48%',
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
  result: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
});

export default HomeScreen; 