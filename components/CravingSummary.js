import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, CATEGORIES, ALLERGENS, DIETARY } from '../utils/constants';

const CravingSummary = ({ cravings = [], allergies = [], preferences = [] }) => {
    const getCravingItems = () => CATEGORIES.filter(item => cravings.includes(item.id));
    const getAllergyItems = () => ALLERGENS.filter(item => allergies.includes(item.id));
    const getPreferenceItems = () => DIETARY.filter(item => preferences.includes(item.id));

    const renderSection = (title, items, showNone = false, isCompact = false) => {
        if (items.length === 0 && !showNone) return null;
        if (showNone && (items.length === 0 || items.some(item => item.id === 'none'))) {
            return (
                <View style={[styles.section, isCompact && styles.compactSection]}>
                    <Text style={styles.sectionTitle}>{title}</Text>
                    <View style={styles.noneContainer}>
                        <Text style={styles.noneText}>None</Text>
                    </View>
                </View>
            );
        }

        return (
            <View style={[styles.section, isCompact && styles.compactSection]}>
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
            
            {/* Allergies und Preferences nebeneinander */}
            <View style={styles.compactRow}>
                {renderSection('Allergies', getAllergyItems(), true, true)}
                {renderSection('Preferences', getPreferenceItems(), true, true)}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 10, // Noch weiter reduziert
        marginBottom: 10, // Noch weiter reduziert
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    title: {
        fontSize: 15, // Noch kleiner
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 6, // Reduziert
        textAlign: 'center',
    },
    section: {
        marginBottom: 6, // Reduziert
    },
    compactSection: {
        flex: 1,
        marginRight: 8, // Abstand zwischen den beiden Spalten
        marginBottom: 0,
    },
    compactRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    sectionTitle: {
        fontSize: 11, // Noch kleiner
        fontWeight: '600',
        color: COLORS.gray,
        marginBottom: 4, // Reduziert
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    tagContainer: {
        flexDirection: 'row',
        maxHeight: 30, // Noch kleiner
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 3, // Noch kleiner
        paddingHorizontal: 6, // Noch kleiner
        borderRadius: 12, // Kleiner
        borderWidth: 1,
        marginRight: 4, // Kleiner
    },
    tagEmoji: {
        fontSize: 12, // Kleiner
        marginRight: 3, // Kleiner
    },
    tagText: {
        fontSize: 10, // Kleiner
        fontWeight: '600',
    },
    noneContainer: {
        paddingVertical: 4, // Kleiner
        paddingHorizontal: 6, // Kleiner
        backgroundColor: COLORS.lightGray,
        borderRadius: 6, // Kleiner
    },
    noneText: {
        fontSize: 10, // Kleiner
        color: COLORS.gray,
        fontStyle: 'italic',
    },
});

export default CravingSummary;