// Theme configuration for Cashu Cloak
// Bitcoin orange color: #F7931A

export const theme = {
  // Main colors
  colors: {
    // Primary colors
    primary: '#F7931A', // Bitcoin orange as primary/accent color
    primaryDark: '#D47A08',
    primaryLight: '#FFA94D',
    
    // Background colors
    background: '#121212', // Dark background
    surface: '#1E1E1E',
    card: '#252525',
    
    // Text colors
    text: '#FFFFFF',
    textSecondary: '#B3B3B3',
    textTertiary: '#9E9E9E',
    placeholder: '#BDBDBD',
    
    // UI colors
    border: '#2A2A2A',
    notification: '#F7931A',
    
    // Status colors
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    info: '#2196F3',
  },
  
  // Typography
  typography: {
    fontSizes: {
      small: 12,
      medium: 16,
      large: 20,
      xlarge: 24,
      xxlarge: 32,
    },
    fontWeights: {
      regular: '400',
      medium: '500',
      bold: '700',
    },
  },
  
  // Spacing
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 40,
  },
  
  // Border radius
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
  },
  
  // Shadows
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
};

// Helper functions to access theme values
export const getColor = (colorName: keyof typeof theme.colors) => theme.colors[colorName];
export const getFontSize = (size: keyof typeof theme.typography.fontSizes) => theme.typography.fontSizes[size];
export const getFontWeight = (weight: keyof typeof theme.typography.fontWeights) => theme.typography.fontWeights[weight];
export const getSpacing = (space: keyof typeof theme.spacing) => theme.spacing[space];
export const getBorderRadius = (radius: keyof typeof theme.borderRadius) => theme.borderRadius[radius];

export default theme; 