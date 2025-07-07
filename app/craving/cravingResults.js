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
import { smartShadow } from '../../utils/platformStyles';

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
                {cravingResultsRecipes.length > 0 && (
                    <Text style={styles.subtitle}>
                        {cravingResultsRecipes.length} recipe{cravingResultsRecipes.length !== 1 ? 's' : ''} found
                    </Text>
                )}
            </View>

            {/* Summary of selections */}
            <View style={styles.summaryContainer}>
                <CravingSummary 
                    cravings={cravings}
                    allergies={allergies}
                    preferences={preferences}
                />
            </View>

            {cravingResultsRecipes.length > 0 ? (
                <ScrollView
                    style={styles.feed}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.feedContent}
                >
                    {cravingResultsRecipes.map((recipe) => (
                        <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                </ScrollView>
            ) : (
                <View style={styles.emptyState}>
                    <Ionicons name="heart-outline" size={80} color={COLORS.primary} />
                    <Text style={styles.emptyText}>No recipes found</Text>
                    <Text style={styles.emptySubtext}>
                        Try adjusting your craving or preferences
                    </Text>
                </View>
            )}
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
        ...smartShadow(
            {
                shadowColor: theme.colors.shadow,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
            },
            1
        ),
    },
    backButton: {
        padding: 8,
    },
    startOverButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.primary,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: theme.colors.cardBackground,
        ...smartShadow(
            {
                shadowColor: theme.colors.shadow,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
            },
            1
        ),
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    subtitle: {
        fontSize: 14,
        marginTop: 4,
        color: theme.colors.textSecondary,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 16,
        color: theme.colors.textSecondary,
    },
    feed: {
        flex: 1,
        paddingTop: 10,
    },
    feedContent: {
        paddingBottom: tabBarHeight,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginTop: 20,
        marginBottom: 10,
    },
    emptySubtext: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    summaryContainer: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },
});