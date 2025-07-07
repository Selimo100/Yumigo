import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {ALLERGENS, CATEGORIES, COLORS, DIETARY} from '../utils/constants';

const CravingSummary = ({cravings = [], allergies = [], preferences = []}) => {
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
                            style={[styles.tag, {backgroundColor: item.color + '20', borderColor: item.color}]}
                        >
                            <Text style={styles.tagEmoji}>{item.icon}</Text>
                            <Text style={[styles.tagText, {color: item.color}]}>{item.label}</Text>
                        </View>
                    ))}
                </ScrollView>
            </View>
        );
    };

    return (
        <>
            <View style={styles.container}>
                <Text style={styles.title}>Your Selections</Text>
                {renderSection('Cravings', getCravingItems())}

                {/* Allergies und Preferences nebeneinander */}
                <View style={styles.compactRow}>
                    {renderSection('Allergies', getAllergyItems(), true, true)}
                    {renderSection('Preferences', getPreferenceItems(), true, true)}
                </View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 10,
        marginBottom: 10,
        shadowColor: COLORS.primary,
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    title: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 6,
        textAlign: 'center',
    },
    section: {
        marginBottom: 6,
    },
    compactSection: {
        flex: 1,
        marginRight: 8,
        marginBottom: 0,
    },
    compactRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.gray,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    tagContainer: {
        flexDirection: 'row',
        maxHeight: 30,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 3,
        paddingHorizontal: 6,
        borderRadius: 12,
        borderWidth: 1,
        marginRight: 4,
    },
    tagEmoji: {
        fontSize: 12,
        marginRight: 3,
    },
    tagText: {
        fontSize: 10,
        fontWeight: '600',
    },
    noneContainer: {
        paddingVertical: 4,
        paddingHorizontal: 6,
        backgroundColor: COLORS.lightGray,
        borderRadius: 6,
    },
    noneText: {
        fontSize: 10,
        color: COLORS.gray,
        fontStyle: 'italic',
    },
});

export default CravingSummary;