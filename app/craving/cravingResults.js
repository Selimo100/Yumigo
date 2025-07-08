import {SafeAreaView} from "react-native-safe-area-context";
import {ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import RecipeCard from "../../components/RecipeCard";
import CravingSummary from "../../components/Craving/CravingSummary";
import {useCallback, useState} from "react";
import {useTheme} from "../../contexts/ThemeContext";
import useTabBarHeight from "../../hooks/useTabBarHeight";
import useCravingResults from "../../hooks/useCravingResults";
import { COLORS } from '../../utils/constants';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { smartShadow, smartDivider } from '../../utils/platformStyles';

export default function CravingResults() {
    const { cravingResultsRecipes, isLoading } = useCravingResults();
    const { theme } = useTheme();
    const tabBarHeight = useTabBarHeight();
    const styles = createStyles(theme, tabBarHeight);
    const router = useRouter();
    const params = useLocalSearchParams();
    
    // Parse selections from params
    const cravings = params.cravings ? JSON.parse(params.cravings) : [];
    const allergies = params.allergies ? JSON.parse(params.allergies) : [];
    const preferences = params.preferences ? JSON.parse(params.preferences) : [];

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.headerBar}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Your Results</Text>
                    <TouchableOpacity 
                    onPress={() => router.push('/craving')} 
                    style={styles.startOverButton}
                >
                    <Ionicons name="refresh" size={20} color={COLORS.primary} />
                </TouchableOpacity>
                </View>
                
                <View style={styles.header}>
                    <Text style={styles.title}>Recommended for you</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>
                        Loading your recommended recipes...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Fixed Header */}
            <View style={styles.headerBar}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Your Results</Text>
                <TouchableOpacity 
                    onPress={() => router.push('/craving')} 
                    style={styles.startOverButton}
                >
                    <Ionicons name="refresh" size={20} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Title Section */}
                <View style={styles.titleSection}>
                    <Text style={styles.title}>Recommended for you</Text>
                    {cravingResultsRecipes.length > 0 && (
                        <Text style={styles.subtitle}>
                            {cravingResultsRecipes.length} recipe{cravingResultsRecipes.length !== 1 ? 's' : ''} found
                        </Text>
                    )}
                </View>

                {/* Summary Section */}
                <View style={styles.summarySection}>
                    <CravingSummary 
                        cravings={cravings}
                        allergies={allergies}
                        preferences={preferences}
                    />
                </View>

                {/* Results Section */}
                <View style={styles.resultsSection}>
                    {cravingResultsRecipes.length > 0 ? (
                        <View style={styles.recipesContainer}>
                            {cravingResultsRecipes.map((recipe, index) => (
                                <View key={recipe.id} style={styles.recipeWrapper}>
                                    <RecipeCard recipe={recipe} />
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="heart-outline" size={80} color={COLORS.primary} />
                            <Text style={styles.emptyText}>No recipes found</Text>
                            <Text style={styles.emptySubtext}>
                                Try adjusting your craving or preferences
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (theme, tabBarHeight) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    headerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: theme.colors.cardBackground,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
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
    backButton: {
        padding: 8,
    },
    startOverButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.primary,
        letterSpacing: 0.5,
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: tabBarHeight + 20,
    },
    titleSection: {
        paddingHorizontal: 20,
        paddingVertical: 24,
        backgroundColor: theme.colors.background,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 4,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.primary,
        textAlign: 'center',
        fontWeight: '600',
    },
    summarySection: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: theme.colors.background,
    },
    resultsSection: {
        flex: 1,
        paddingTop: 16,
        backgroundColor: theme.colors.background,
    },
    recipesContainer: {
        paddingHorizontal: 8,
    },
    recipeWrapper: {
        marginBottom: 12,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        paddingHorizontal: 40,
    },
    loadingText: {
        fontSize: 18,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        fontWeight: '500',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginTop: 20,
        marginBottom: 10,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
});