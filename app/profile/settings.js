import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Stack, router} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {useTheme} from '../../contexts/ThemeContext';
import {useSettings} from '../../hooks/useSettings';
import {SettingItem, Section} from '../../components/Settings/SettingComponents';
import {ProfileSection} from '../../components/Settings/ProfileSection';
import {AccountSection} from '../../components/Settings/AccountSection';
import {createStyles} from '../../components/Settings/SettingsStyles';
export default function SettingsScreen() {
    const {theme, toggleTheme, isDarkMode} = useTheme();
    const {
        profile,
        notifications,
        isLoading,
        updateProfile,
        updateNotification,
        saveAllSettings
    } = useSettings();
    
    const styles = createStyles(theme);

    const saveProfile = async () => {
        const success = await saveAllSettings();
        if (success) {
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
                    <ActivityIndicator size="large" color={theme.colors.button} />
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
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text}/>
                </TouchableOpacity>
                <Text style={[styles.modalHeaderTitle, {color: theme.colors.text}]}>Settings</Text>
                <TouchableOpacity onPress={saveProfile} style={styles.saveButton}>
                    <Text style={[styles.saveButtonText, {color: theme.colors.button}]}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >                {/* Profile => Username, Email, Bio */}
                <Section title="Profile" styles={styles}>
                    <ProfileSection 
                        profile={profile}
                        updateProfile={updateProfile}
                        styles={styles}
                        theme={theme}
                    />
                </Section>

                {/* Appearance => Light-Dark Mode wechseln */}
                <Section title="Appearance" styles={styles}>
                    <SettingItem
                        title="Dark Mode"
                        subtitle="Switch between light and dark theme"
                        value={isDarkMode}
                        onValueChange={toggleTheme}
                        styles={styles}
                        theme={theme}
                    />
                </Section>                {/* Notifications Section */}
                <Section title="Notifications" styles={styles}>
                    <SettingItem
                        title="Push Notifications"
                        subtitle="Receive notifications on your device"
                        value={notifications.pushNotifications}
                        onValueChange={(value) => updateNotification('pushNotifications', value)}
                         styles={styles}
                             theme={theme}
                    />
                    <SettingItem
                        title="Email Notifications"
                        subtitle="Receive updates via email"
                        value={notifications.emailNotifications}
                        onValueChange={(value) => updateNotification('emailNotifications', value)}
                         styles={styles}
                             theme={theme}
                    />
                    <SettingItem
                        title="Recipe Recommendations"
                        subtitle="Get personalized recipe suggestions"
                        value={notifications.recipeRecommendations}
                        onValueChange={(value) => updateNotification('recipeRecommendations', value)}
                         styles={styles}
                             theme={theme}
                    />
                    <SettingItem
                        title="Social Updates"
                        subtitle="Updates from people you follow"
                        value={notifications.socialUpdates}
                        onValueChange={(value) => updateNotification('socialUpdates', value)}
                         styles={styles}
                             theme={theme}
                    />
                </Section>                {/* Account Actions */}
                <Section title="Account"  styles={styles}>
                    <AccountSection styles={styles} theme={theme} />
                </Section>
            </ScrollView>        </SafeAreaView>
    );
}
