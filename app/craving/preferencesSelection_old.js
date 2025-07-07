import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { DIETARY, COLORS } from '../../utils/constants';
import CravingLayout from '../../components/CravingLayout';
import CravingSelector from '../../components/CravingSelector';

// Add "None" option to dietary preferences
const PREFERENCE_OPTIONS = [
    ...DIETARY,
    { id: 'none', label: 'None', color: COLORS.success, icon: '✅' }
];

export default function PreferencesSelection() {
    const [selectedPreferences, setSelectedPreferences] = useState([]);
    const router = useRouter();
    const params = useLocalSearchParams();
    const cravings = params.cravings ? JSON.parse(params.cravings) : [];
    const allergies = params.allergies ? JSON.parse(params.allergies) : [];

    const togglePreference = (id) => {
        setSelectedPreferences((prev) => {
            if (id === 'none') return ['none']; // Only none if selected
            if (prev.includes('none')) return [id]; // Replace none with other
            if (prev.includes(id)) return prev.filter((a) => a !== id);
            return [...prev, id];
        });
    };

    const handleNext = () => {
        router.push({
            pathname: '/craving/cravingResults',
            params: { 
                cravings: JSON.stringify(cravings),
                allergies: JSON.stringify(allergies),
                preferences: JSON.stringify(selectedPreferences) 
            },
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerBar}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Step 3 of 3</Text>
                <View style={styles.placeholder} />
            </View>
            
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.title}>Select your preferences</Text>
                    <Text style={styles.subsubtitle}>Choose all that apply</Text>
                </View>

                <View style={styles.grid}>
                    {PREFERENCE_OPTIONS.map((pref) => {
                        const isSelected = selectedPreferences.includes(pref.id);
                        return (
                            <TouchableOpacity
                                key={pref.id}
                                style={[
                                    styles.cravingButton,
                                    {
                                        backgroundColor: isSelected ? pref.color : COLORS.white,
                                        borderColor: pref.color,
                                        shadowColor: pref.color,
                                        transform: [{ scale: isSelected ? 1.02 : 1 }],
                                    },
                                ]}
                                onPress={() => togglePreference(pref.id)}
                            >
                                <View style={styles.cravingContent}>
                                    <Text style={styles.cravingEmoji}>
                                        {pref.icon}
                                    </Text>
                                    <Text style={[
                                        styles.cravingLabel, 
                                        { color: isSelected ? COLORS.white : pref.color }
                                    ]}>
                                        {pref.label}
                                    </Text>
                                </View>
                                {isSelected && (
                                    <View style={[styles.checkmarkWrapper, { backgroundColor: COLORS.white }]}>
                                        <Text style={[styles.checkmark, { color: pref.color }]}>✓</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View style={styles.buttonsContainer}>
                    <TouchableOpacity
                        style={[
                            styles.submitButton, 
                            { backgroundColor: selectedPreferences.length === 0 ? COLORS.lightGray : COLORS.primary }
                        ]}
                        onPress={handleNext}
                        disabled={selectedPreferences.length === 0}
                    >
                        <Text style={[
                            styles.submitButtonText,
                            { color: selectedPreferences.length === 0 ? COLORS.gray : COLORS.white }
                        ]}>
                            {selectedPreferences.length === 0 ? 'Please select at least one preference' : 'Find Recipes →'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (theme, tabBarHeight) => StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: COLORS.background 
    },
    headerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.primary,
    },
    placeholder: {
        width: 40, // Same width as back button for centering
    },
    scrollContent: { 
        padding: 20, 
        paddingBottom: tabBarHeight + 20, 
        alignItems: 'center' 
    },
    header: { 
        alignItems: 'center', 
        marginBottom: 30,
        marginTop: 20
    },
    title: { 
        fontSize: 26, 
        fontWeight: 'bold', 
        color: COLORS.primary, 
        marginBottom: 8,
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
        width: '100%'
    },
    cravingButton: {
        width: '48%',
        borderRadius: 20,
        borderWidth: 2,
        height: 120,
        marginBottom: 16,
        paddingVertical: 20,
        paddingHorizontal: 16,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        shadowOpacity: 0.15,
        elevation: 4,
        position: 'relative',
    },
    cravingContent: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    cravingEmoji: {
        fontSize: 32,
        marginBottom: 8,
    },
    cravingLabel: {
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
    },
    checkmarkWrapper: {
        position: 'absolute',
        top: 10,
        right: 10,
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        shadowOpacity: 0.2,
        elevation: 2,
    },
    checkmark: {
        fontSize: 16,
        fontWeight: '900',
    },
    buttonsContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: 20,
    },
    submitButton: {
        paddingVertical: 18,
        paddingHorizontal: 32,
        borderRadius: 25,
        width: '100%',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        shadowOpacity: 0.15,
        elevation: 4,
    },
    submitButtonText: {
        fontWeight: '700',
        fontSize: 16,
        textAlign: 'center',
    },
});
