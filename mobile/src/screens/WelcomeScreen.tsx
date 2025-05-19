import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';

// Import the welcome image
const welcomeImage = require('../assets/images/cashucloak2.png');

const WelcomeScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Image source={welcomeImage} style={styles.welcomeImage} resizeMode="contain" />
      
      <Text style={styles.title}>CashuCloak</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stealth Bitcoin Payments</Text>
        <Text style={styles.sectionText}>
          While <Text style={styles.bold}>cryptography</Text> protects the message, <Text style={styles.bold}>steganography</Text> protects the parties communicating
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <Text style={styles.sectionText}>
          Cashu Cloak allows you to send and receive Bitcoin <Text style={styles.bold}>stealthily</Text> by hiding them as Cashu tokens <Text style={styles.bold}>inside images</Text>
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Coming Soon</Text>
        <Text style={styles.sectionText}>
          Soon you'll be able to hide Bitcoin payments in <Text style={styles.bold}>WhatsApp messages</Text> and other <Text style={styles.bold}>digital media</Text>
        </Text>
      </View>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('Process')}
      >
        <Text style={styles.buttonText}>How It Works</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: theme.spacing.m,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
  },
  welcomeImage: {
    width: 250,
    height: 150,
    marginTop: theme.spacing.l,
    marginBottom: theme.spacing.s,
  },
  title: {
    fontSize: theme.typography.fontSizes.xxlarge * 1.3,
    fontWeight: 'bold',
    marginBottom: theme.spacing.l,
    textAlign: 'center',
    color: theme.colors.text,
  },
  section: {
    width: '100%',
    marginBottom: theme.spacing.m,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.large * 1.2,
    fontWeight: 'bold',
    marginBottom: theme.spacing.s,
    color: theme.colors.primary,
    textAlign: 'center',
  },
  sectionText: {
    fontSize: theme.typography.fontSizes.medium * 1.15,
    color: theme.colors.text,
    lineHeight: 26,
    textAlign: 'center',
  },
  bold: {
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
    marginVertical: theme.spacing.s,
    width: '50%',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  buttonText: {
    color: theme.colors.buttonText,
    fontSize: theme.typography.fontSizes.medium * 1.2,
    fontWeight: 'bold',
  },
});

export default WelcomeScreen; 