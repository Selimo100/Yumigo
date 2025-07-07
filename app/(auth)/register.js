import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Image,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";
import { register } from "../../services/authService";
import { useRouter } from "expo-router";
import { validateEmail, validatePassword, validateUsername } from "../../utils/validation";

export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const router = useRouter();

    const handleSubmit = async () => {
        // Validation
        if (!username || !email || !password) {
            Alert.alert("Missing Information", "Please fill in all fields to continue");
            return;
        }

        if (!validateUsername(username)) {
            Alert.alert("Invalid Username", "Username must be between 3 and 20 characters long");
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert("Invalid Email", "Please enter a valid email address");
            return;
        }

        if (!validatePassword(password)) {
            Alert.alert("Password Too Short", "Password must be at least 8 characters long");
            return;
        }

        try {
            // Register user (verification email is sent automatically)
            const user = await register(email, password, username);
            Alert.alert(
                "Registration Successful",
                "Welcome to Yumigo! Please check your email for verification instructions. You will be redirected to the home page."
            );
            router.replace("/home");
        } catch (error) {
            // Entferne das console.error um Firebase Errors zu unterdrücken
            // console.error(error.message);
            
            // User-friendly error messages
            if (error.code === "auth/email-already-in-use") {
                Alert.alert(
                    "Email Already Registered", 
                    "An account with this email already exists. Would you like to sign in instead?",
                    [
                        {
                            text: "Sign In",
                            onPress: () => router.push('/login')
                        },
                        {
                            text: "Try Different Email",
                            style: "cancel"
                        }
                    ]
                );
            } else if (error.code === "auth/weak-password") {
                Alert.alert(
                    "Password Too Weak", 
                    "Please choose a stronger password with at least 8 characters, including letters and numbers."
                );
            } else if (error.code === "auth/invalid-email") {
                Alert.alert(
                    "Invalid Email Format", 
                    "Please enter a valid email address."
                );
            } else if (error.code === "auth/operation-not-allowed") {
                Alert.alert(
                    "Registration Disabled", 
                    "Account registration is currently disabled. Please try again later."
                );
            } else if (error.code === "auth/too-many-requests") {
                Alert.alert(
                    "Too Many Attempts", 
                    "Too many registration attempts. Please wait a few minutes before trying again."
                );
            } else if (error.code === "auth/network-request-failed") {
                Alert.alert(
                    "Connection Problem", 
                    "Please check your internet connection and try again."
                );
            } else {
                Alert.alert(
                    "Registration Failed", 
                    "We're having trouble creating your account right now. Please try again in a moment."
                );
            }
        }
    };

    const goToLogin = () => {
        router.push("/login");
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
                        <Image source={require("../../assets/icon.png")} style={styles.logo} />
                        <Text style={styles.title}>Yumigo</Text>
                        <Text style={styles.subtitle}>Hungry on the go?</Text>
                        <Text style={styles.subtitle}>Sign up now with Yumigo!</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Username</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Your Username (3-20 characters)"
                                placeholderTextColor={theme.colors?.textSecondary || '#666'}
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

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

                        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                            <Text style={styles.submitButtonText}>Sign up</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.switchContainer}>
                        <Text style={styles.switchText}>Already have an account?</Text>
                        <TouchableOpacity onPress={goToLogin}>
                            <Text style={styles.switchButton}>Sign in here</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const COLORS = {
    background: "#DDE6D5",
    surface: "#D1DEC8",
    border: "#0D6159",
    text: "#0D6159",
    accent: "#0D6159",
    textOnAccent: "#DDE6D5",
};

const createStyles = (theme) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: COLORS.background,
        },
        scrollContainer: {
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 24,
            paddingVertical: 32,
            minHeight: '100%',
        },
        headerContainer: {
            alignItems: "center",
            marginBottom: 48,
        },
        logo: {
            width: 120,
            height: 120,
            marginBottom: 16,
        },
        title: {
            fontSize: 36,
            fontWeight: "bold",
            color: COLORS.text,
            marginBottom: 4,
        },
        subtitle: {
            fontSize: 16,
            fontWeight: "300",
            color: COLORS.text,
            textAlign: "center",
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
            fontWeight: "bold",
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
            alignItems: "center",
            marginTop: 12,
        },
        submitButtonText: {
            color: COLORS.textOnAccent,
            fontSize: 16,
            fontWeight: "600",
        },
        switchContainer: {
            alignItems: "center",
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
            fontWeight: "600",
            textDecorationLine: "underline",
        },
    });