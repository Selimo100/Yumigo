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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";
import { register, sendVerificationEmail } from "../../services/authService";
import { useRouter } from "expo-router";

export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const router = useRouter();

    const handleSubmit = async () => {
        if (!username || !email || !password) {
            Alert.alert("Fehler", "Bitte fülle alle Felder aus");
            return;
        }

        try {
            // Falls dein register-Service einen username mit braucht,
            // passe das hier entsprechend an, sonst nur email und password
            await register(email, password, username);
            await sendVerificationEmail();
            Alert.alert(
                "Registrierung erfolgreich",
                "Bitte überprüfe deine E-Mail-Adresse zur Verifizierung."
            );
            router.replace("/home");
        } catch (error) {
            console.error(error.message);
            if (error.code === "auth/email-already-in-use") {
                Alert.alert("Fehler", "Diese E-Mail wird bereits verwendet.");
            } else {
                Alert.alert("Fehler", error.message);
            }
        }
    };

    const goToHomeScreen = () => {
        router.push("/home");
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
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
                                placeholder="Your Username"
                                placeholderTextColor={theme.colors.textSecondary}
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

                        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                            <Text style={styles.submitButtonText}>Sign up</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.switchContainer}>
                        <Text style={styles.switchText}>Already have an account?</Text>
                        <TouchableOpacity onPress={goToHomeScreen}>
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
