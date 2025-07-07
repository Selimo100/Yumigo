import { Platform } from 'react-native';

/**
 * Utility function to create platform-specific styles
 * This helps remove ugly borders on Android while keeping them on iOS
 */
export const createPlatformStyles = (iosStyles = {}, androidStyles = {}) => {
  return Platform.OS === 'ios' ? iosStyles : androidStyles;
};

/**
 * Smart border utility that removes borders on Android but keeps them on iOS
 * @param {number} borderWidth - The border width for iOS
 * @param {string} borderColor - The border color for iOS
 * @returns {object} Platform-specific border styles
 */
export const smartBorder = (borderWidth = 1, borderColor = '#000') => {
  return createPlatformStyles(
    {
      borderWidth,
      borderColor,
    },
    {
      // No borders on Android
      borderWidth: 0,
    }
  );
};

/**
 * Smart elevation/shadow utility
 * Uses shadows on iOS and elevation on Android (but with reduced elevation)
 * @param {object} shadowConfig - Shadow configuration for iOS
 * @param {number} elevation - Elevation for Android (reduced for subtlety)
 * @returns {object} Platform-specific shadow/elevation styles
 */
export const smartShadow = (
  shadowConfig = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  elevation = 2
) => {
  return createPlatformStyles(
    {
      ...shadowConfig,
      elevation: 0, // Disable elevation on iOS since we use shadows
    },
    {
      // Reduced elevation on Android, no shadow properties
      elevation: Math.max(0, elevation - 1),
      shadowColor: 'transparent',
    }
  );
};

/**
 * Smart card style that looks good on both platforms
 * @param {object} theme - Theme object
 * @param {object} customStyles - Additional custom styles
 * @returns {object} Platform-optimized card styles
 */
export const smartCard = (theme, customStyles = {}) => {
  const baseStyles = {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
  };

  const platformStyles = createPlatformStyles(
    {
      // iOS: subtle border and shadow
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    {
      // Android: no border, minimal elevation
      borderWidth: 0,
      elevation: 1,
    }
  );

  return {
    ...baseStyles,
    ...platformStyles,
    ...customStyles,
  };
};

/**
 * Smart button style that looks modern on both platforms
 * @param {object} theme - Theme object with colors property
 * @param {boolean} isPrimary - Whether this is a primary button
 * @param {object} customStyles - Additional custom styles
 * @returns {object} Platform-optimized button styles
 */
export const smartButton = (theme, isPrimary = false, customStyles = {}) => {
  const baseStyles = {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  };

  if (isPrimary) {
    const primaryStyles = createPlatformStyles(
      {
        // iOS: border and shadow for primary buttons
        backgroundColor: theme.colors?.primary || '#0D6159',
        borderWidth: 1,
        borderColor: theme.colors?.primary || '#0D6159',
        shadowColor: theme.colors?.primary || '#0D6159',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      {
        // Android: no border, subtle elevation
        backgroundColor: theme.colors?.primary || '#0D6159',
        borderWidth: 0,
        elevation: 2,
      }
    );
    
    return {
      ...baseStyles,
      ...primaryStyles,
      ...customStyles,
    };
  } else {
    const secondaryStyles = createPlatformStyles(
      {
        // iOS: border for secondary buttons
        backgroundColor: theme.colors?.surface || '#F8F9FA',
        borderWidth: 1,
        borderColor: theme.colors?.border || '#E0E0E0',
      },
      {
        // Android: no border, just background
        backgroundColor: theme.colors?.surface || '#F8F9FA',
        borderWidth: 0,
        elevation: 1,
      }
    );
    
    return {
      ...baseStyles,
      ...secondaryStyles,
      ...customStyles,
    };
  }
};

/**
 * Smart input style that removes ugly Android borders
 * @param {object} theme - Theme object
 * @param {boolean} hasError - Whether the input has an error
 * @param {object} customStyles - Additional custom styles
 * @returns {object} Platform-optimized input styles
 */
export const smartInput = (theme, hasError = false, customStyles = {}) => {
  const baseStyles = {
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
  };

  const platformStyles = createPlatformStyles(
    {
      // iOS: subtle border
      borderWidth: 1,
      borderColor: hasError ? '#DC3545' : theme.colors.border,
    },
    {
      // Android: no border, just background
      borderWidth: 0,
      backgroundColor: hasError ? '#DC354508' : theme.colors.surface,
    }
  );

  return {
    ...baseStyles,
    ...platformStyles,
    ...customStyles,
  };
};

/**
 * Android-specific style remover
 * Removes problematic style properties on Android
 * @param {object} styles - Original styles
 * @returns {object} Cleaned styles for Android
 */
export const androidStyleCleanup = (styles) => {
  if (Platform.OS !== 'android') {
    return styles;
  }

  const cleanedStyles = { ...styles };
  
  // Remove border properties that cause ugly frames on Android
  delete cleanedStyles.borderWidth;
  delete cleanedStyles.borderColor;
  delete cleanedStyles.borderTopWidth;
  delete cleanedStyles.borderBottomWidth;
  delete cleanedStyles.borderLeftWidth;
  delete cleanedStyles.borderRightWidth;
  delete cleanedStyles.borderTopColor;
  delete cleanedStyles.borderBottomColor;
  delete cleanedStyles.borderLeftColor;
  delete cleanedStyles.borderRightColor;
  
  // Reduce elevation if too high
  if (cleanedStyles.elevation && cleanedStyles.elevation > 3) {
    cleanedStyles.elevation = Math.min(2, cleanedStyles.elevation);
  }
  
  return cleanedStyles;
};

export default {
  createPlatformStyles,
  smartBorder,
  smartShadow,
  smartCard,
  smartButton,
  smartInput,
  androidStyleCleanup,
};
