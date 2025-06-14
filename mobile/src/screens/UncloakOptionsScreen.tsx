import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';

const UncloakOptionsScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
    <Text style={styles.title}>Choose How to Uncloak your Bitcoin</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('RevealInvoiceScreen')}
      >
        <Text style={styles.buttonText}>Uncloak Image</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('QRScanner')}
      >
        <Text style={styles.buttonText}>Uncloak QR Code</Text>
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
  },
  title: {
    fontSize: theme.typography.fontSizes.large,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    width: '57.5%',
    marginVertical: theme.spacing.m,
  },
  buttonText: {
    color: theme.colors.buttonText,
    fontSize: theme.typography.fontSizes.medium,
    fontWeight: 'bold',
  },
});

export default UncloakOptionsScreen; 