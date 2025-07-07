import {
    Alert,
    Image,
    KeyboardAvoidingView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Platform,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { login, register, sendVerificationEmail, logout } from '../../services/authService';
import { useRouter } from "expo-router";



export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const router = useRouter();

    const handleSubmit = async () => {
        if (!email || !password) {
            Alert.alert('Fehler', 'Bitte fülle alle Felder aus');
            return;
        }

        try {
            let user;
            if (isLogin) {
                user = await login(email, password);

                if (!user.emailVerified) {
                    Alert.alert(
                        "E-Mail nicht bestätigt",
                        "Bitte bestätige deine E-Mail-Adresse. Wir haben dir eine neue E-Mail gesendet.",
                        [
                            {
                                text: "E-Mail erneut senden",
                                onPress: async () => {
                                    try {
                                        await sendVerificationEmail(user);
                                        Alert.alert("E-Mail gesendet", "Überprüfe dein Postfach und den Spam-Ordner.");
                                    } catch (error) {
                                        Alert.alert("Fehler", "E-Mail konnte nicht gesendet werden: " + error.message);
                                    }
                                }
                            },
                            {
                                text: "OK",
                                style: "cancel"
                            }
                        ]
                    );
                    await logout();
                    return;
                }

                router.replace('/home');
            } else {
                user = await register(email, password);
                await sendVerificationEmail(user);
                Alert.alert(
                    "Registrierung erfolgreich",
                    "Bitte überprüfe deine E-Mail-Adresse zur Verifizierung."
                );
                setIsLogin(true);
            }
        } catch (error) {
            console.error(error.message);
            if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
                Alert.alert("Fehler", "Falsche E-Mail oder Passwort.");
            } else if (error.code === "auth/email-already-in-use") {
                Alert.alert("Fehler", "Diese E-Mail wird bereits verwendet.");
            } else {
                Alert.alert("Fehler", error.message);
            }
        }

    }

    const toggleMode = () => {
        router.push('/register');
    };


    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.headerContainer}>
                        <Image source={require('../../assets/icon.png')} style={styles.logo} />
                        <Text style={styles.title}>Yumigo</Text>
                        <Text style={styles.subtitle}>
                            Hungry on the go?
                        </Text>
                        <Text style={styles.subtitle}>
                            Welcome back to Yumigo.
                        </Text>
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>E-Mail</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="your@email.com"
                                placeholderTextColor={theme.colors.textSecondary}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor={theme.colors.textSecondary}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                autoCapitalize="none"
                            />
                        </View>
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleSubmit}

                        >
                            <Text style={styles.submitButtonText}>
                                Sign in
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.switchContainer}>
                        <Text style={styles.switchText}>
                            No account yet?
                        </Text>
                        <TouchableOpacity onPress={toggleMode}>
                            <Text style={styles.switchButton}>
                                Sign up here
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}
const COLORS = {
    background: '#DDE6D5',
    surface: '#D1DEC8',
    border: '#0D6159',
    text: '#0D6159',
    accent: '#0D6159',
    textOnAccent: '#DDE6D5',
};

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 32,
        minHeight: '100%',
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 16,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: 'light',
        color: COLORS.text,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 2,
    },
    formContainer: {
        marginBottom: 32,
    },
    inputContainer: {
        marginBottom: 18,
    },
    label: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 15,
        color: COLORS.text,
        backgroundColor: COLORS.surface,
    },
    submitButton: {
        backgroundColor: COLORS.accent,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 12,
    },
    submitButtonText: {
        color: COLORS.textOnAccent,
        fontSize: 16,
        fontWeight: '600',
    },
    switchContainer: {
        alignItems: 'center',
        marginTop: -2,
    },
    switchText: {
        fontSize: 14,
        color: COLORS.text,
        marginBottom: 6,
    },
    switchButton: {
        fontSize: 15,
        color: COLORS.accent,
        fontWeight: '600',
        textDecorationLine: 'underline'
    },
});



