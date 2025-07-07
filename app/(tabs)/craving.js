import React, { useState } from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Platform,
} from 'react-native';
import { useTheme } from "../../contexts/ThemeContext";
import { useRouter } from 'expo-router';
import { CATEGORIES, COLORS } from '../../utils/constants';
import useTabBarHeight from '../../hooks/useTabBarHeight';
import { smartShadow, smartButton, smartBorder, androidStyleCleanup, smartGridTwoColumns, smartGridItemTwoColumns } from '../../utils/platformStyles';
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
                setError('"Cold" and "Hot" cannot be selected together.');
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
                            <View key={craving.id} style={styles.gridItem}>
                                <TouchableOpacity
                                    style={[
                                        styles.cravingButton,
                                        {
                                            backgroundColor: isSelected ? COLORS.primary : theme.colors.cardBackground,
                                            transform: [{ scale: isSelected ? 1.02 : 1 }],
                                        },
                                        // Plattformspezifische Styles
                                        Platform.OS === 'ios' ? {
                                            borderWidth: 2,
                                            borderColor: isSelected ? COLORS.primary : theme.colors.border,
                                            shadowColor: isSelected ? COLORS.primary : theme.colors.shadow,
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: isSelected ? 0.25 : 0.1,
                                            shadowRadius: 4,
                                            elevation: 0,
                                        } : {
                                            borderWidth: 1,
                                            borderColor: isSelected ? COLORS.primary : '#e0e0e0',
                                            shadowColor: 'transparent',
                                            shadowOffset: { width: 0, height: 0 },
                                            shadowOpacity: 0,
                                            shadowRadius: 0,
                                            elevation: 0,
                                        }
                                    ]}
                                    onPress={() => toggleCraving(craving.id)}
                                >
                                    <View style={styles.cravingContent}>
                                        <Text style={styles.cravingEmoji}>
                                            {craving.icon}
                                        </Text>
                                        <Text style={[
                                            styles.cravingLabel, 
                                            { color: isSelected ? COLORS.white : theme.colors.text }
                                        ]}>
                                            {craving.label}
                                        </Text>
                                    </View>
                                    {isSelected && (
                                        <View style={[
                                            styles.checkmarkWrapper, 
                                            { backgroundColor: COLORS.white },
                                            // Plattformspezifische Schatten für Checkmark
                                            Platform.OS === 'ios' ? {
                                                shadowOffset: { width: 0, height: 1 },
                                                shadowRadius: 2,
                                                shadowOpacity: 0.2,
                                                shadowColor: '#000',
                                                elevation: 0,
                                            } : {
                                                shadowColor: 'transparent',
                                                shadowOffset: { width: 0, height: 0 },
                                                shadowOpacity: 0,
                                                shadowRadius: 0,
                                                elevation: 0,
                                            }
                                        ]}>
                                            <Text style={[styles.checkmark, { color: COLORS.primary }]}>✓</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </View>
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
                                { backgroundColor: selectedCravings.length === 0 ? theme.colors.disabled : COLORS.primary },
                            ]}
                            onPress={handleNextButton}
                            disabled={selectedCravings.length === 0}
                        >
                            <Text style={[
                                styles.submitButtonText,
                                { color: selectedCravings.length === 0 ? theme.colors.textSecondary : COLORS.white }
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
const createStyles = (theme, tabBarHeight) => StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: theme.colors.background 
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
        color: theme.colors.text, 
        marginBottom: 8, 
        marginTop: 16,
        textAlign: 'center'
    },
    subsubtitle: { 
        fontSize: 16, 
        color: theme.colors.textSecondary, 
        textAlign: 'center'
    },
    grid: { 
        ...smartGridTwoColumns(),
    },
    gridItem: {
        ...smartGridItemTwoColumns(),
    },
    cravingButton: {
        width: '100%',
        borderRadius: 16,
        height: 110,
        paddingVertical: 16,
        paddingHorizontal: 12,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        // Komplett ohne Schatten/Borders - werden nur per Platform inline gesetzt
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
        // Komplett ohne Schatten - werden nur per Platform inline gesetzt
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
        ...smartButton({ colors: { primary: COLORS.primary } }, true, {
            paddingVertical: 16,
            paddingHorizontal: 32,
            borderRadius: 12,
            width: '100%',
        }),
    },
    submitButtonText: {
        fontWeight: '600',
        fontSize: 16,
        textAlign: 'center',
    },
    errorContainer: {
        width: '100%',
        backgroundColor: theme.colors.errorBackground || '#fce8e8',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginTop: 12,
        alignSelf: 'center',
        ...smartShadow(
            {
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            1
        ),
    },
    errorText: {
        color: COLORS.error,
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
});