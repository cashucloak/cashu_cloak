import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';

const HomeScreen = () => {
  const navigation = useNavigation<any>();

  const handleSendCashu = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', includeBase64: false });
    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      navigation.navigate('SendCashu', {
        imageUri: asset.uri,
        imageType: asset.type,
        imageName: asset.fileName,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Cashu Cloak</Text>
      <Text style={styles.subtitle}>Your secure mobile wallet</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('GenerateInvoice')}>
        <Text style={styles.buttonText}>Receive Cashu</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={handleSendCashu}>
        <Text style={styles.buttonText}>Send Cashu</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('RevealInvoice')}>
        <Text style={styles.buttonText}>Reveal Image</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: 300,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen; 