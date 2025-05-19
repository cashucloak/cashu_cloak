import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Get screen dimensions for responsive sizing
const { width: screenWidth } = Dimensions.get('window');

const ProcessScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>How It Works</Text>
      
      {/* Step 1: Select Tokens */}
      <View style={styles.stepContainer}>
        <View style={styles.stepHeader}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <Text style={styles.stepTitle}>Select Tokens</Text>
        </View>
        <View style={styles.stepImageContainer}>
          <View style={styles.tokenVisual}>
            <Text style={styles.tokenText}>Cashu Token</Text>
          </View>
        </View>
        <Text style={styles.stepDescription}>
          Choose the Cashu tokens you want to send to someone privately.
        </Text>
      </View>

      {/* Step 2: Choose Image */}
      <View style={styles.stepContainer}>
        <View style={styles.stepHeader}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <Text style={styles.stepTitle}>Choose Image</Text>
        </View>
        <View style={styles.stepImageContainer}>
          <View style={styles.imageFrame}>
            <Text style={styles.imageIcon}>🖼️</Text>
          </View>
        </View>
        <Text style={styles.stepDescription}>
          Select any image to act as the carrier for your hidden payment.
        </Text>
      </View>

      {/* Step 3: Cloak Process */}
      <View style={styles.stepContainer}>
        <View style={styles.stepHeader}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <Text style={styles.stepTitle}>Cloak Process</Text>
        </View>
        <View style={styles.stepImageContainer}>
          <View style={styles.processVisual}>
            <View style={styles.tokenVisualSmall}>
              <Text style={styles.smallTokenText}>Token</Text>
            </View>
            <Text style={styles.plusIcon}>+</Text>
            <View style={styles.imageFrameSmall}>
              <Text style={styles.smallImageIcon}>🖼️</Text>
            </View>
            <Text style={styles.arrowIcon}>→</Text>
            <View style={styles.cloakedImageFrame}>
              <Text style={styles.smallImageIcon}>🖼️</Text>
              <Text style={styles.hiddenIcon}>💰</Text>
            </View>
          </View>
        </View>
        <Text style={styles.stepDescription}>
          The app uses steganography to invisibly embed your tokens into the image.
          The image looks unchanged to the human eye.
        </Text>
      </View>

      {/* Step 4: Share */}
      <View style={styles.stepContainer}>
        <View style={styles.stepHeader}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>4</Text>
          </View>
          <Text style={styles.stepTitle}>Send Stealthily</Text>
        </View>
        <View style={styles.stepImageContainer}>
          <View style={styles.shareVisual}>
            <View style={styles.cloakedImageFrame}>
              <Text style={styles.smallImageIcon}>🖼️</Text>
            </View>
            <Text style={styles.arrowIcon}>→</Text>
            <View style={styles.personIcon}>
              <Text style={styles.personText}>👤</Text>
            </View>
          </View>
        </View>
        <Text style={styles.stepDescription}>
          Share the image through any messaging app or social media. Only the recipient
          will know to check for hidden tokens.
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('MainApp')}
      >
        <Text style={styles.buttonText}>Get Started</Text>
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
    paddingHorizontal: theme.spacing.m,
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.fontSizes.xxlarge,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.l,
    textAlign: 'center',
    color: theme.colors.text,
  },
  stepContainer: {
    width: '100%',
    marginBottom: theme.spacing.m,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.m,
    ...theme.shadows.small,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.s,
  },
  stepNumberText: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  stepTitle: {
    fontSize: theme.typography.fontSizes.large,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  stepImageContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.m,
    height: 100,
  },
  stepDescription: {
    fontSize: theme.typography.fontSizes.medium,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
  },
  tokenVisual: {
    width: 120,
    height: 80,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.small,
  },
  tokenVisualSmall: {
    width: 70,
    height: 50,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.small,
  },
  tokenText: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  imageFrame: {
    width: 100,
    height: 100,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.small,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  imageFrameSmall: {
    width: 60,
    height: 60,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.small,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  imageIcon: {
    fontSize: 40,
  },
  processVisual: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  smallTokenText: {
    color: theme.colors.text,
    fontWeight: 'bold',
    fontSize: 12,
  },
  plusIcon: {
    fontSize: 20,
    color: theme.colors.text,
    marginHorizontal: 4,
  },
  arrowIcon: {
    fontSize: 20,
    color: theme.colors.text,
    marginHorizontal: 4,
  },
  smallImageIcon: {
    fontSize: 24,
  },
  cloakedImageFrame: {
    width: 60,
    height: 60,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.small,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    position: 'relative',
  },
  hiddenIcon: {
    position: 'absolute',
    fontSize: 14,
    bottom: 4,
    right: 4,
    opacity: 0.5,
  },
  shareVisual: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '60%',
  },
  personIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  personText: {
    fontSize: 24,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
    marginTop: theme.spacing.l,
    marginBottom: theme.spacing.xl,
    width: '80%',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  buttonText: {
    color: theme.colors.buttonText,
    fontSize: theme.typography.fontSizes.medium * 1.2,
    fontWeight: 'bold',
  },
});

export default ProcessScreen; 