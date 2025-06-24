import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

export default function InstructionInput({
    instructions,
    onUpdateInstruction,
    onAddInstruction,
    onRemoveInstruction,
    error
}) {
    const { theme } = useTheme();
    const styles = createStyles(theme);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.label}>Instructions *</Text>
                <TouchableOpacity style={styles.addButton} onPress={onAddInstruction}>
                    <Ionicons name="add" size={18} color={theme.colors.text} />
                    <Text style={styles.addButtonText}>Add Step</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>Write your recipe instructions step by step</Text>

            {instructions.map((instruction, index) => (
                <View key={index} style={styles.instructionCard}>
                    <View style={styles.cardHeader}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>{index + 1}</Text>
                        </View>
                        <Text style={styles.stepLabel}>Step {index + 1}</Text>
                        {instructions.length > 1 && (
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => onRemoveInstruction(index)}
                            >
                                <Ionicons name="trash-outline" size={18} color="#DC3545" />
                            </TouchableOpacity>
                        )}
                    </View>
                    <TextInput
                        style={[styles.instructionInput, error && styles.errorBorder]}
                        placeholder="Describe what to do in this step..."
                        placeholderTextColor={theme.colors.textSecondary}
                        value={instruction}
                        onChangeText={(text) => onUpdateInstruction(index, text)}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                        returnKeyType="next"
                    />
                </View>
            ))}

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
    },
    subtitle: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: 16,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 4,
    },
    addButtonText: {
        color: theme.colors.text,
        fontSize: 14,
        fontWeight: '500',
    },
    instructionCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: 16,
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    stepNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepNumberText: {
        color: theme.colors.text,
        fontSize: 12,
        fontWeight: '600',
    },
    stepLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text,
        flex: 1,
    },
    removeButton: {
        padding: 4,
        borderRadius: 6,
        backgroundColor: theme.colors.background,
    },
    instructionInput: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: theme.colors.inputBackground,
        color: theme.colors.text,
        minHeight: 80,
    },
    errorBorder: {
        borderColor: '#DC3545',
    },
    errorText: {
        color: '#DC3545',
        fontSize: 12,
        marginTop: 4,
    },
});