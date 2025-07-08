// Platform Style Test - Testkomponente für plattformspezifische Styling-Verbesserungen
import {Platform, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from '../contexts/ThemeContext';
import {smartButton, smartCard, smartInput} from '../utils/platformStyles';

export default function PlatformStyleTest() {
  const { theme } = useTheme();

  const oldCardStyle = {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  };

  const oldInputStyle = {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    marginVertical: 8,
    marginHorizontal: 16,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView style={{ flex: 1 }}>
        <Text style={styles.title}>Platform Styling Test</Text>
        <Text style={styles.platform}>Current Platform: {Platform.OS}</Text>
        
        <Text style={styles.sectionTitle}>Old Card Style (with borders on Android):</Text>
        <View style={oldCardStyle}>
          <Text style={{ color: theme.colors.text }}>
            This card uses the old styling approach with borders that look ugly on Android
          </Text>
        </View>

        <Text style={styles.sectionTitle}>New Smart Card Style:</Text>
        <View style={smartCard(theme)}>
          <Text style={{ color: theme.colors.text }}>
            This card uses the new smartCard utility that removes borders on Android 
            but keeps them on iOS for a platform-appropriate look
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Old Input Style:</Text>
        <Text style={oldInputStyle}>Old input with borders on all platforms</Text>

        <Text style={styles.sectionTitle}>New Smart Input Style:</Text>
        <Text style={smartInput(theme)}>New input with platform-appropriate styling</Text>

        <Text style={styles.sectionTitle}>Button Comparison:</Text>
        <View style={smartButton(theme, true, { marginHorizontal: 16, marginVertical: 8 })}>
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
            Smart Primary Button
          </Text>
        </View>

        <View style={smartButton(theme, false, { marginHorizontal: 16, marginVertical: 8 })}>
          <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
            Smart Secondary Button
          </Text>
        </View>

        <Text style={styles.info}>
          On Android: Borders are removed and elevation is reduced for a cleaner look.{'\n'}
          On iOS: Borders and shadows are maintained for the iOS design language.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#0D6159',
  },
  platform: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
    marginHorizontal: 16,
    color: '#0D6159',
  },
  info: {
    fontSize: 14,
    lineHeight: 20,
    marginHorizontal: 16,
    marginVertical: 20,
    color: '#666',
    textAlign: 'center',
  },
});
