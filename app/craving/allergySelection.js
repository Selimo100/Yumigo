import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ALLERGENS, COLORS } from '../../utils/constants';
import CravingLayout from '../../components/Craving/CravingLayout';
import CravingSelector from '../../components/Craving/CravingSelector';
import { useTheme } from '../../contexts/ThemeContext';
import { smartShadow, smartButton } from '../../utils/platformStyles';

// Add "None" option to allergens
const ALLERGY_OPTIONS = [
    ...ALLERGENS,
    { id: 'none', label: 'None', color: COLORS.success, icon: '✅' }
];

export default function AllergySelection() {
    const [selectedAllergies, setSelectedAllergies] = useState([]);
    const router = useRouter();
    const params = useLocalSearchParams();
    const cravings = params.cravings ? JSON.parse(params.cravings) : [];
    const { theme } = useTheme();
    const styles = createStyles(theme);

    const toggleAllergy = (id) => {
        setSelectedAllergies((prev) => {
            if (id === 'none') return ['none'];
            if (prev.includes('none')) return [id];
            if (prev.includes(id)) return prev.filter((a) => a !== id);
            return [...prev, id];
        });
    };

    const handleNext = () => {
        router.push({
            pathname: '/craving/preferencesSelection',
            params: { 
                cravings: JSON.stringify(cravings),
                allergies: JSON.stringify(selectedAllergies) 
            },
        });
    };

    return (
        <CravingLayout
            title="Any allergies or intolerances?"
            subtitle="Select all that apply"
            stepNumber={2}
            totalSteps={3}
            onBack={() => router.back()}
        >
            <View style={styles.grid}>
                {ALLERGY_OPTIONS.map((allergy) => {
                    const isSelected = selectedAllergies.includes(allergy.id);
                    return (
                        <CravingSelector
                            key={allergy.id}
                            item={allergy}
                            isSelected={isSelected}
                            onPress={() => toggleAllergy(allergy.id)}
                            style={[
                                styles.allergyCard,
                                {
                                    backgroundColor: isSelected ? COLORS.primary : theme.colors.cardBackground,
                                    borderColor: isSelected ? COLORS.primary : theme.colors.border,
                                },
                            ]}
                            labelStyle={{
                                color: isSelected ? COLORS.white : theme.colors.text,
                            }}
                        />
                    );
                })}
            </View>

            <View style={styles.buttonsContainer}>
                <TouchableOpacity
                    style={[
                        styles.submitButton, 
                        { backgroundColor: selectedAllergies.length === 0 ? theme.colors.disabled : COLORS.primary }
                    ]}
                    onPress={handleNext}
                    disabled={selectedAllergies.length === 0}
                >
                    <Text style={[
                        styles.submitButtonText,
                        { color: selectedAllergies.length === 0 ? theme.colors.textSecondary : COLORS.white }
                    ]}>
                        {selectedAllergies.length === 0 ? 'Please select at least one option' : 'Next →'}
                    </Text>
                </TouchableOpacity>
            </View>
        </CravingLayout>
    );
}

const createStyles = (theme) => StyleSheet.create({
    grid: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 10,
    },
    allergyCard: {
        width: '31%',
        aspectRatio: 1,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        alignItems: 'center',
        justifyContent: 'center',
        ...smartShadow(
            {
                shadowColor: theme.colors.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
            },
            2
        ),
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
});