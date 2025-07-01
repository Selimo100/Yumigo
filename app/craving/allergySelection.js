import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { useRouter } from 'expo-router';

const ALLERGIES = [
    { id: 'gluten', label: 'Gluten', iconName: 'bread-slice' },
    { id: 'dairy', label: 'Dairy', iconName: 'cheese' },
    { id: 'nuts', label: 'Nuts', iconName: 'peanut' },
    { id: 'eggs', label: 'Eggs', iconName: 'egg'},
    { id: 'soy', label: 'Soy', iconName: 'soy-sauce' },
    { id: 'shellfish', label: 'Shellfish', iconName: 'fish' },
    { id: 'fish', label: 'Fish', iconName: 'fish' },
    { id: 'none', label: 'None', iconName: 'check-circle' },
];

export default function AllergySelection() {
    const [selectedAllergies, setSelectedAllergies] = useState([]);
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const router = useRouter();

    const toggleAllergy = (id) => {
        setSelectedAllergies((prev) => {
            if (id === 'none') return ['none']; // Only none if selected
            if (prev.includes('none')) return [id]; // Replace none with other
            if (prev.includes(id)) return prev.filter((a) => a !== id);
            return [...prev, id];
        });
    };

    const handleNext = () => {
        router.push({
            pathname: '/craving/preferencesSelection',
            params: { allergies: JSON.stringify(selectedAllergies) },
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.title}>Any allergies or intolerances?</Text>
                    <Text style={styles.subsubtitle}>Select all that apply</Text>
                </View>

                <View style={styles.grid}>
                    {ALLERGIES.map((allergy) => {
                        const isSelected = selectedAllergies.includes(allergy.id);
                        return (
                            <TouchableOpacity
                                key={allergy.id}
                                style={[
                                    styles.cravingButton,
                                    {
                                        backgroundColor: isSelected ? '#0D6159' : '#DDE6D5',
                                        shadowOpacity: isSelected ? 0.8 : 0.3,
                                        transform: [{ scale: isSelected ? 1.05 : 1 }],
                                    },
                                ]}
                                onPress={() => toggleAllergy(allergy.id)}
                            >
                                <View style={styles.cravingContent}>
                                    <MaterialCommunityIcons
                                        name={allergy.iconName}
                                        size={40}
                                        color={isSelected ? '#DDE6D5' : '#0D6159'}
                                    />
                                    <Text style={[styles.cravingLabel, { color: isSelected ? '#DDE6D5' : '#0D6159' }]}>
                                        {allergy.label}
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
                    <TouchableOpacity
                        style={[styles.submitButton, { backgroundColor: selectedAllergies.length === 0 ? '#7a9a97' : '#0D6159' }]}
                        onPress={handleNext}
                        disabled={selectedAllergies.length === 0}
                    >
                        <Text style={styles.submitButtonText}>
                            {selectedAllergies.length === 0 ? 'Please select at least one option' : 'Next →'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    scrollContent: { padding: 20, paddingBottom: 40, alignItems: 'center' },
    header: { alignItems: 'center', marginBottom: 30 },
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
});
