import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';

// Import the welcome image
const welcomeImage = require('../assets/images/cashucloak2.png');

const HomeScreen = () => {
  const navigation = useNavigation<any>();

  const handleSendCashu = () => {
    navigation.navigate('CloakingOptions');
  };

  return (
    <View style={styles.container}>
      <Image source={welcomeImage} style={styles.welcomeImage} resizeMode="contain" />
      <Text style={styles.title}>Cashu Cloak</Text>
      <Text style={styles.subtitle}>Your secure BTC mobile wallet</Text>

      <TouchableOpacity style={styles.button} onPress={handleSendCashu}>
        <Text style={styles.buttonText}>Cloak</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('UncloakOptionsScreen')}>
        <Text style={styles.buttonText}>Uncloak</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.m,
  },
  welcomeImage: {
    width: 200,
    height: 200,
    marginBottom: theme.spacing.l,
  },
  title: {
    fontSize: theme.typography.fontSizes.xxlarge,
    fontWeight: 'bold',
    marginBottom: theme.spacing.s,
    color: theme.colors.text,
    textAlign: 'center',
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
    width: '57.5%',
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