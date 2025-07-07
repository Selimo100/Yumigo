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
        <CravingLayout
            title="Select your preferences"
            subtitle="Choose all that apply"
            stepNumber={3}
            totalSteps={3}
            onBack={() => router.back()}
        >
            <View style={styles.grid}>
                {PREFERENCE_OPTIONS.map((pref) => {
                    const isSelected = selectedPreferences.includes(pref.id);
                    return (
                        <CravingSelector
                            key={pref.id}
                            item={pref}
                            isSelected={isSelected}
                            onPress={() => togglePreference(pref.id)}
                        />
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
        </CravingLayout>
    );
}

const styles = StyleSheet.create({
    grid: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        justifyContent: 'space-between',
        width: '100%'
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
