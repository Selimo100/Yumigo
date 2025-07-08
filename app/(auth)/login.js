import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native"
import {SafeAreaView} from "react-native-safe-area-context";
import {useState} from 'react';
import {useTheme} from '../../contexts/ThemeContext';
import {login, logout, register, sendVerificationEmail} from '../../services/authService';
import {useRouter} from "expo-router";
import {validateEmail, validatePassword} from '../../utils/validation';
import {smartButton, smartInput} from '../../utils/platformStyles';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const router = useRouter();
    const handleSubmit = async () => {
        if (!email || !password) {
            Alert.alert('Missing Information', 'Please fill in all fields to continue.');
            return;
        }
        if (!validateEmail(email)) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return;
        }
        if (!validatePassword(password)) {
            Alert.alert('Password Too Short', 'Your password must be at least 8 characters long.');
            return;
        }
        try {
            let user;
            if (isLogin) {
                user = await login(email, password);
                if (!user.emailVerified) {
                    Alert.alert(
                        "Email Verification Required",
                        "Please verify your email address before signing in. Check your inbox for the verification email.",
                        [
                            {
                                text: "Resend Verification Email",
                                onPress: async () => {
                                    try {
                                        await sendVerificationEmail(user);
                                        Alert.alert("Email Sent", "Verification email sent successfully. Please check your inbox and spam folder.");
                                    } catch (error) {
                                        Alert.alert("Unable to Send Email", "We couldn't send the verification email at this time. Please try again later.");
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
                    "Registration Successful",
                    "Welcome to Yumigo! Please check your email for verification instructions."
                );
                setIsLogin(true);
            }
        } catch (error) {
            if (error.code === "auth/user-not-found") {
                Alert.alert(
                    "Account Not Found", 
                    "No account exists with this email address. You will be redirected to create a new account.",
                    [
                        {
                            text: "OK",
                            onPress: () => router.push('/register')
                        }
                    ]
                );
            } else if (error.code === "auth/wrong-password") {
                Alert.alert(
                    "Incorrect Password", 
                    "The password you entered is incorrect. Please check your password and try again."
                );
            } else if (error.code === "auth/invalid-credential") {
                Alert.alert(
                    "Invalid Login Credentials", 
                    "The email or password you entered is incorrect. Please check your information and try again."
                );
            } else if (error.code === "auth/email-already-in-use") {
                Alert.alert(
                    "Email Already Registered", 
                    "An account with this email already exists. Please sign in instead or use a different email address."
                );
            } else if (error.code === "auth/weak-password") {
                Alert.alert(
                    "Password Too Weak", 
                    "Please choose a stronger password with at least 8 characters."
                );
            } else if (error.code === "auth/invalid-email") {
                Alert.alert(
                    "Invalid Email Format", 
                    "Please enter a valid email address."
                );
            } else if (error.code === "auth/too-many-requests") {
                Alert.alert(
                    "Too Many Attempts", 
                    "You've made too many unsuccessful login attempts. Please wait a few minutes before trying again."
                );
            } else if (error.code === "auth/network-request-failed") {
                Alert.alert(
                    "Connection Problem", 
                    "Please check your internet connection and try again."
                );
            } else if (error.code === "auth/user-disabled") {
                Alert.alert(
                    "Account Disabled", 
                    "This account has been temporarily disabled. Please contact support for assistance."
                );
            } else {
                Alert.alert(
                    "Sign In Failed", 
                    "We're having trouble signing you in right now. Please try again in a moment."
                );
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
                                placeholderTextColor={theme.colors?.textSecondary || '#666'}
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
                                placeholder="Password (min. 8 characters)"
                                placeholderTextColor={theme.colors?.textSecondary || '#666'}
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
        ...smartInput({ colors: COLORS }, false, {
            fontSize: 15,
        }),
    },
    submitButton: {
        ...smartButton({ colors: COLORS }, true, {
            paddingVertical: 14,
            borderRadius: 10,
            marginTop: 12,
        }),
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