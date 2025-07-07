import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, CATEGORIES, ALLERGENS, DIETARY } from '../utils/constants';

const CravingSummary = ({ cravings = [], allergies = [], preferences = [] }) => {
    const getCravingItems = () => CATEGORIES.filter(item => cravings.includes(item.id));
    const getAllergyItems = () => ALLERGENS.filter(item => allergies.includes(item.id));
    const getPreferenceItems = () => DIETARY.filter(item => preferences.includes(item.id));

    const renderSection = (title, items, showNone = false) => {
        if (items.length === 0 && !showNone) return null;
        if (showNone && (items.length === 0 || items.some(item => item.id === 'none'))) {
            return (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{title}</Text>
                    <View style={styles.noneContainer}>
                        <Text style={styles.noneText}>None selected</Text>
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{title}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagContainer}>
                    {items.map((item) => (
                        <View
                            key={item.id}
                            style={[styles.tag, { backgroundColor: item.color + '20', borderColor: item.color }]}
                        >
                            <Text style={styles.tagEmoji}>{item.icon}</Text>
                            <Text style={[styles.tagText, { color: item.color }]}>{item.label}</Text>
                        </View>
                    ))}
                </ScrollView>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Selections</Text>
            {renderSection('Cravings', getCravingItems())}
            {renderSection('Allergies', getAllergyItems(), true)}
            {renderSection('Preferences', getPreferenceItems(), true)}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 12,
        textAlign: 'center',
    },
    section: {
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.gray,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    tagContainer: {
        flexDirection: 'row',
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 8,
    },
    tagEmoji: {
        fontSize: 16,
        marginRight: 6,
    },
    tagText: {
        fontSize: 14,
        fontWeight: '600',
    },
    noneContainer: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: COLORS.lightGray,
        borderRadius: 12,
    },
    noneText: {
        fontSize: 14,
        color: COLORS.gray,
        fontStyle: 'italic',
    },
});

export default CravingSummary;
