import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';

// Import the welcome image
const welcomeImage = require('../assets/images/cashucloak2.png');

const WelcomeScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <Image source={welcomeImage} style={styles.welcomeImage} resizeMode="contain" />
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('Description')}
      >
        <Text style={styles.buttonText}>Start Cloaking</Text>
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
    width: 600,
    height: 400,
    marginBottom: theme.spacing.s,
  },
  title: {
    fontSize: theme.typography.fontSizes.xxlarge * 1.3,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
    color: theme.colors.text,
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
    fontSize: theme.typography.fontSizes.large * 1.1,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default WelcomeScreen; 