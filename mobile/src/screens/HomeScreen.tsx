import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { theme } from '../theme';

// Import the welcome image
const welcomeImage = require('../assets/images/cashucloak2.png');

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
      <Image source={welcomeImage} style={styles.welcomeImage} resizeMode="contain" />
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
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeImage: {
    width: 250,
    height: 150,
    marginBottom: theme.spacing.m,
  },
  title: {
    fontSize: theme.typography.fontSizes.xxlarge,
    fontWeight: 'bold',
    marginBottom: theme.spacing.s,
    textAlign: 'center',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.medium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
    marginVertical: theme.spacing.s,
    width: 300,
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  buttonText: {
    color: theme.colors.buttonText,
    fontSize: theme.typography.fontSizes.medium,
    fontWeight: 'bold',
  },
});

export default HomeScreen; 