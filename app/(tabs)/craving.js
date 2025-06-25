import React, { useState } from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from "../../contexts/ThemeContext";
import { useRouter } from 'expo-router';

const CRAVINGS = [
    { id: 'sweet', label: 'Sweet', iconName: 'cupcake' },
    { id: 'salty', label: 'Salty', iconName: 'shaker' },
    { id: 'spicy', label: 'Spicy', iconName: 'fire' },
    { id: 'sour', label: 'Sour', iconName: 'fruit-citrus' },
    { id: 'cold', label: 'Cold', iconName: 'ice-cream' },
    { id: 'hot', label: 'Hot', iconName: 'coffee' },
];

export default function CravingSelection() {
    const [selectedCravings, setSelectedCravings] = useState([]);
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const [error, setError] = useState('');
    const router = useRouter();

    const toggleCraving = (id) => {
        setSelectedCravings((prev) => {
            let newSelection = prev.includes(id)
                ? prev.filter((c) => c !== id)
                : [...prev, id];

            if (newSelection.includes('hot') && newSelection.includes('cold')) {
                setError('"Cold" and "Hot"cannot be selected together.');
            } else if (newSelection.length > 2) {
                setError('Please select up to 2 cravings only.');
            } else {
                setError('');
            }

            return newSelection;
        });
    };

    const handleNextButton = () => {
        router.push({
            pathname: '/results',
            params: { cravings: JSON.stringify(selectedCravings) },
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Image source={require('../../assets/icon.png')} style={styles.logoImage} />
                    <Text style={styles.title}>What are you craving for today?</Text>
                    <Text style={styles.subsubtitle}>Tell us your mood, we'll find your food</Text>
                </View>

                <View style={styles.grid}>
                    {CRAVINGS.map((craving) => {
                        const isSelected = selectedCravings.includes(craving.id);
                        return (
                            <TouchableOpacity
                                key={craving.id}
                                style={[
                                    styles.cravingButton,
                                    {
                                        backgroundColor: isSelected ? '#0D6159' : '#DDE6D5',
                                        borderColor: '#0D6159',
                                        shadowOpacity: isSelected ? 0.8 : 0.3,
                                        transform: [{ scale: isSelected ? 1.05 : 1 }],
                                    },
                                ]}
                                onPress={() => toggleCraving(craving.id)}
                            >
                                <View style={styles.cravingContent}>
                                    <MaterialCommunityIcons
                                        name={craving.iconName}
                                        size={40}
                                        color={isSelected ? '#DDE6D5' : '#0D6159'}
                                    />
                                    <Text style={[styles.cravingLabel, { color: isSelected ? '#DDE6D5' : '#0D6159' }]}>
                                        {craving.label}
                                    </Text>
                                </View>
                                {isSelected && (
                                    <View style={styles.checkmarkWrapper}>
                                        <Text style={styles.checkmark}>✓</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View style={styles.buttonsContainer}>
                    {error ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                { backgroundColor: selectedCravings.length === 0 ? '#7a9a97' : '#0D6159' },
                            ]}
                            onPress={handleNextButton}
                            disabled={selectedCravings.length === 0}
                        >
                            <Text style={styles.submitButtonText}>Next →</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    scrollContent: { padding: 20, paddingBottom: 40, alignItems: 'center' },
    header: { alignItems: 'center', marginBottom: 30 },
    logoImage: {
        width: 120,
        height: 120,
        marginTop: 30,
    },

    title: { fontSize: 23.8, fontWeight: 'bold', color: '#0D6159', marginBottom: 4, marginTop: -5 },
    subsubtitle: { fontSize: 14, color: '#0D6159', opacity: 0.8 },

    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    cravingButton: {
        width: '48%',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#0D6159',
        height: 106,
        marginBottom: 16,
        paddingVertical: 16,
        paddingHorizontal: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 4,
        shadowOpacity: 0.3,
    },

    cravingContent: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },

    cravingLabel: {
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    checkmarkWrapper: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#DDE6D5',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmark: {
        color: '#0D6159',
        fontWeight: '700',
    },

    buttonsContainer: {
        width: '100%',
        alignItems: 'center',
    },
    submitButton: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        marginBottom: 12,
    },
    submitButtonText: {
        color: '#DDE6D5',
        fontWeight: '700',
        fontSize: 16,
        textAlign: 'center',
    },

    errorContainer: {
        width: '100%',
        backgroundColor: '#fce8e8',
        borderColor: '#e05656',
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginTop: 12,
        shadowColor: '#a71d2a',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        alignSelf: 'center',
    },
    errorText: {
        color: '#a71d2a',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
});
