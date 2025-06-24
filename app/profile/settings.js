import React, {useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Image,
    Alert,
    Switch,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Stack, router} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {useTheme} from '../../contexts/ThemeContext';


    const SettingItem = ({title, subtitle, value, onValueChange, styles, theme, type = 'switch'}) => (
        <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{title}</Text>
                {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
            </View>
            {type === 'switch' && (
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    trackColor={{false: theme.colors.border, true: theme.colors.button}}
                    thumbColor={value ? theme.colors.buttonText : theme.colors.textSecondary}
                />
            )}
            {type === 'chevron' && (
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary}/>
            )}
        </View>
        )
    ;

    const Section = ({title, styles, children}) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.sectionContent}>
                {children}
            </View>
        </View>
    );

export default function SettingsScreen() {

    const {theme, toggleTheme, isDarkMode} = useTheme();
    const styles = createStyles(theme);

    const [profile, setProfile] = useState({
        username: 'Username',
        bio: 'Food enthusiast | 15-min recipe creator | Making cooking simple',
        email: 'user@example.com',
        profileImage: null,
    });

    // verschiedene useStates für die einzelnen sliders
    const [pushNotifications, setPushNotifications] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(false);
    const [recipeRecommendations, setRecipeRecommendations] = useState(true);
    const [socialUpdates, setSocialUpdates] = useState(true);

    const pickProfileImage = async () => {
        try {
            const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled) {
                setProfile(prev => ({...prev, profileImage: result.assets[0].uri}));
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const saveProfile = () => {
        Alert.alert('Success', 'Profile updated successfully!');
        router.back();
    };


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
            >
                {/* Profile => Username, Email, Bio */}
                <Section title="Profile" styles={styles}>
                    <View style={styles.profileSection}>
                        <TouchableOpacity style={styles.profileImageContainer} onPress={pickProfileImage}>
                            {profile.profileImage ? (
                                <Image source={{uri: profile.profileImage}} style={styles.profileImage}/>
                            ) : (
                                <View style={styles.profileImagePlaceholder}>
                                    <Ionicons name="person" size={40} color={theme.colors.textSecondary}/>
                                </View>
                            )}
                            <View style={styles.cameraIcon}>
                                <Ionicons name="camera" size={16} color="#fff"/>
                            </View>
                        </TouchableOpacity>

                        <View style={styles.profileInputs}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Username</Text>
                                <TextInput
                                    style={styles.input}
                                    value={profile.username}
                                    onChangeText={(text) => setProfile(prev => ({...prev, username: text}))}
                                    placeholder="Enter username"
                                    placeholderTextColor={theme.colors.textSecondary}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Email</Text>
                                <TextInput
                                    style={styles.input}
                                    value={profile.email}
                                    onChangeText={(text) => setProfile(prev => ({...prev, email: text}))}
                                    placeholder="Enter email"
                                    placeholderTextColor={theme.colors.textSecondary}
                                    keyboardType="email-address"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Bio</Text>
                                <TextInput
                                    style={[styles.input, styles.bioInput]}
                                    value={profile.bio}
                                    onChangeText={(text) => setProfile(prev => ({...prev, bio: text}))}
                                    placeholder="Tell us about yourself"
                                    placeholderTextColor={theme.colors.textSecondary}
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>
                        </View>
                    </View>
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
                </Section>

                {/* Notifications Section */}
                <Section title="Notifications" styles={styles}>
                    <SettingItem
                        title="Push Notifications"
                        subtitle="Receive notifications on your device"
                        value={pushNotifications}
                        onValueChange={setPushNotifications}
                         styles={styles}
                             theme={theme}
                    />
                    <SettingItem
                        title="Email Notifications"
                        subtitle="Receive updates via email"
                        value={emailNotifications}
                        onValueChange={setEmailNotifications}
                         styles={styles}
                             theme={theme}
                    />
                    <SettingItem
                        title="Recipe Recommendations"
                        subtitle="Get personalized recipe suggestions"
                        value={recipeRecommendations}
                        onValueChange={setRecipeRecommendations}
                         styles={styles}
                             theme={theme}
                    />
                    <SettingItem
                        title="Social Updates"
                        subtitle="Updates from people you follow"
                        value={socialUpdates}
                        onValueChange={setSocialUpdates}
                         styles={styles}
                             theme={theme}
                    />
                </Section>

                {/* Account Actions */}
                <Section title="Account"  styles={styles}>
                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingTitle}>Change Password</Text>
                            <Text style={styles.settingSubtitle}>Update your account password</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary}/>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingTitle}>Export Data</Text>
                            <Text style={styles.settingSubtitle}>Download your recipes and data</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary}/>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.settingItem, styles.dangerItem]}>
                        <View style={styles.settingInfo}>
                            <Text style={[styles.settingTitle, styles.dangerText]}>Delete Account</Text>
                            <Text style={styles.settingSubtitle}>Permanently delete your account</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#DC3545"/>
                    </TouchableOpacity>
                </Section>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    headerButton: {
        padding: 8,
    },
    saveButton: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '600',
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: 16,
        marginHorizontal: 20,
    },
    sectionContent: {
        backgroundColor: theme.colors.surface,
        marginHorizontal: 16,
        borderRadius: 12,
        overflow: 'hidden',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    settingInfo: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 2,
    },
    settingSubtitle: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    dangerItem: {
        borderBottomWidth: 0,
    },
    dangerText: {
        color: '#DC3545',
    },
    profileSection: {
        padding: 20,
        alignItems: 'center',
    },
    profileImageContainer: {
        position: 'relative',
        marginBottom: 24,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    profileImagePlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    }, cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.textSecondary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: theme.colors.surface,
    },
    profileInputs: {
        width: '100%',
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 8,
    },
    input: {
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: theme.colors.text,
    }, bioInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
    },
    modalCloseButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    modalHeaderTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 16,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
