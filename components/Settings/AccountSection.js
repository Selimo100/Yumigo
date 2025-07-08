// Account Section - Sektion für Account-bezogene Einstellungen (Passwort, Löschen, etc.)
import {Alert, Text, TouchableOpacity, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';

export const AccountSection = ({ styles, theme }) => {
  
  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'This feature will be available soon. You will be able to download all your recipes and data.',
      [{ text: 'OK' }]
    );
  };
  return (
    <>
      <TouchableOpacity style={styles.settingItem} onPress={handleExportData}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>Export Data</Text>
          <Text style={styles.settingSubtitle}>Download your recipes and data</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    </>
  );
};
