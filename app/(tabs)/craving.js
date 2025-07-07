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
import { useTheme } from "../../contexts/ThemeContext";
import { useRouter } from 'expo-router';
import { CATEGORIES, COLORS } from '../../utils/constants';
import useTabBarHeight from '../../hooks/useTabBarHeight';

export default function CravingSelection() {
    const [selectedCravings, setSelectedCravings] = useState([]);
    const { theme } = useTheme();
    const tabBarHeight = useTabBarHeight();
    const styles = createStyles(theme, tabBarHeight);
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
            pathname: '/craving/allergySelection',
            params: { cravings: JSON.stringify(selectedCravings) },
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.title}>What are you craving for today?</Text>
                    <Text style={styles.subsubtitle}>Tell us your mood, we'll find your food</Text>
                </View>

                <View style={styles.grid}>
                    {CATEGORIES.map((craving) => {
                        const isSelected = selectedCravings.includes(craving.id);
                        return (
                            <TouchableOpacity
                                key={craving.id}
                                style={[
                                    styles.cravingButton,
                                    {
                                        backgroundColor: isSelected ? COLORS.primary : COLORS.white,
                                        borderColor: COLORS.primary,
                                        shadowColor: COLORS.primary,
                                        transform: [{ scale: isSelected ? 1.02 : 1 }],
                                    },
                                ]}
                                onPress={() => toggleCraving(craving.id)}
                            >
                                <View style={styles.cravingContent}>
                                    <Text style={styles.cravingEmoji}>
                                        {craving.icon}
                                    </Text>
                                    <Text style={[
                                        styles.cravingLabel, 
                                        { color: isSelected ? COLORS.white : COLORS.primary }
                                    ]}>
                                        {craving.label}
                                    </Text>
                                </View>
                                {isSelected && (
                                    <View style={[styles.checkmarkWrapper, { backgroundColor: COLORS.white }]}>
                                        <Text style={[styles.checkmark, { color: COLORS.primary }]}>✓</Text>
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
                                { backgroundColor: selectedCravings.length === 0 ? COLORS.lightGray : COLORS.primary },
                            ]}
                            onPress={handleNextButton}
                            disabled={selectedCravings.length === 0}
                        >
                            <Text style={[
                                styles.submitButtonText,
                                { color: selectedCravings.length === 0 ? COLORS.gray : COLORS.white }
                            ]}>
                                {selectedCravings.length === 0 ? 'Please select at least one craving' : 'Next →'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = ( tabBarHeight) => StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: COLORS.white 
    },
    scrollContent: { 
        padding: 20, 
        paddingBottom: tabBarHeight + 20, 
        alignItems: 'center' 
    },
    header: { 
        alignItems: 'center', 
        marginBottom: 30 
    },
    logoImage: {
        width: 100,
        height: 100,
        marginTop: 20,
    },
    title: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        color: COLORS.primary, 
        marginBottom: 8, 
        marginTop: 16,
        textAlign: 'center'
    },
    subsubtitle: { 
        fontSize: 16, 
        color: COLORS.gray, 
        textAlign: 'center'
    },
    grid: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 4,
    },
    cravingButton: {
        width: '47%',
        borderRadius: 16,
        borderWidth: 2,
        height: 110,
        marginBottom: 12,
        paddingVertical: 16,
        paddingHorizontal: 12,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        shadowOpacity: 0.1,
        elevation: 3,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cravingContent: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    cravingEmoji: {
        fontSize: 28,
        marginBottom: 6,
        textAlign: 'center',
    },
    cravingLabel: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 16,
    },
    checkmarkWrapper: {
        position: 'absolute',
        top: 8,
        right: 8,
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
        shadowOpacity: 0.2,
        elevation: 2,
    },
    checkmark: {
        fontSize: 14,
        fontWeight: '900',
    },
    buttonsContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: 30,
        paddingHorizontal: 4,
    },
    submitButton: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        width: '100%',
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        shadowOpacity: 0.1,
        elevation: 3,
    },
    submitButtonText: {
        fontWeight: '600',
        fontSize: 16,
        textAlign: 'center',
    },
    errorContainer: {
        width: '100%',
        backgroundColor: '#fce8e8',
        borderColor: COLORS.error,
        borderWidth: 1,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginTop: 12,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        alignSelf: 'center',
    },
    errorText: {
        color: COLORS.error,
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
});
