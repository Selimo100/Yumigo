import {ActivityIndicator, Alert, LogBox, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {router, Stack} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {useTheme} from '../../contexts/ThemeContext';
import {useSettings} from '../../hooks/useSettings';
import {Section, SettingItem} from '../../components/Settings/SettingComponents';
import {ProfileSection} from '../../components/Settings/ProfileSection';
import {AccountSection} from '../../components/Settings/AccountSection';
import {createStyles} from '../../components/Settings/SettingsStyles';
import {profileUpdateEmitter} from '../../utils/profileUpdateEmitter';

// Ignoriere spezifische Warnungen
LogBox.ignoreLogs(['Warning: Text strings must be rendered within a <Text> component']);

export default function SettingsScreen() {
    const { theme, toggleTheme, isDarkMode } = useTheme();
    const {
        profile,
        isLoading,
        updateProfile,
        saveAllSettings
    } = useSettings();

    const styles = createStyles(theme); const saveProfile = async () => {
        const success = await saveAllSettings();
        if (success) {
            profileUpdateEmitter.emit();
            Alert.alert('Success', 'Profile updated successfully!');
            router.back();
        } else {
            Alert.alert('Error', 'Failed to save settings. Please try again.');
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Loading settings...</Text>
                </View>
            </SafeAreaView>
        );
    }


    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />

            <View style={[styles.modalHeader, {
                backgroundColor: theme.isDarkMode
                    ? 'rgba(0,0,0,0.8)'
                    : 'rgba(255,255,255,0.9)',
                borderBottomColor: theme.colors.border
            }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.modalCloseButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.modalHeaderTitle, { color: theme.colors.text }]}>Settings</Text>
                <TouchableOpacity onPress={saveProfile} style={styles.saveButton}>
                    <Text style={[styles.saveButtonText, { color: theme.colors.primary }]}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <Section title="Profile" styles={styles}>
                    <ProfileSection
                        profile={profile}
                        updateProfile={updateProfile}
                        styles={styles}
                        theme={theme}
                    />
                </Section>

                <Section title="Appearance" styles={styles}>
                    <SettingItem
                        title="Dark Mode"
                        subtitle="Switch between light and dark theme"
                        value={isDarkMode}
                        onValueChange={toggleTheme}
                        styles={styles}
                        theme={theme}
                    />
                </Section>
                <Section title="Account" styles={styles}>
                    <AccountSection styles={styles} theme={theme} />
                </Section>
            </ScrollView>        </SafeAreaView>
    );
}
