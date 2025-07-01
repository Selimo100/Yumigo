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

const MEAL_TYPES = [
    { id: 'breakfast', label: 'Breakfast', iconName: 'coffee' },
    { id: 'snack', label: 'Snack', iconName: 'cookie' },
    { id: 'lunch', label: 'Lunch', iconName: 'food' },
    { id: 'dinner', label: 'Dinner', iconName: 'food-variant' },
    { id: 'dessert', label: 'Dessert', iconName: 'cake' },
];

export default function MealTypeSelection() {
    const [selectedMealTypes, setSelectedMealTypes] = useState([]);
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const router = useRouter();

    const toggleMealType = (id) => {
        setSelectedMealTypes((prev) =>
            prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
        );
    };

    const handleNext = () => {
        router.push({
            pathname: '/craving/allergySelection',
            params: { mealTypes: JSON.stringify(selectedMealTypes) },
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.title}>Select meal types</Text>
                    <Text style={styles.subsubtitle}>Choose your preferred meal times</Text>
                </View>

                <View style={styles.grid}>
                    {MEAL_TYPES.map((meal) => {
                        const isSelected = selectedMealTypes.includes(meal.id);
                        return (
                            <TouchableOpacity
                                key={meal.id}
                                style={[
                                    styles.cravingButton,
                                    {
                                        backgroundColor: isSelected ? '#0D6159' : '#DDE6D5',
                                        shadowOpacity: isSelected ? 0.8 : 0.3,
                                        transform: [{ scale: isSelected ? 1.05 : 1 }],
                                    },
                                ]}
                                onPress={() => toggleMealType(meal.id)}
                            >
                                <View style={styles.cravingContent}>
                                    <MaterialCommunityIcons
                                        name={meal.iconName}
                                        size={40}
                                        color={isSelected ? '#DDE6D5' : '#0D6159'}
                                    />
                                    <Text style={[styles.cravingLabel, { color: isSelected ? '#DDE6D5' : '#0D6159' }]}>
                                        {meal.label}
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
                        style={[styles.submitButton, { backgroundColor: selectedMealTypes.length === 0 ? '#7a9a97' : '#0D6159' }]}
                        onPress={handleNext}
                        disabled={selectedMealTypes.length === 0}
                    >
                        <Text style={styles.submitButtonText}>
                            {selectedMealTypes.length === 0 ? 'Please select at least one meal type' : 'Next →'}
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
