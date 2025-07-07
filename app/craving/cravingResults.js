import {SafeAreaView} from "react-native-safe-area-context";
import {ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import RecipeCard from "../../components/RecipeCard";
import CravingSummary from "../../components/CravingSummary";
import {useCallback, useState} from "react";
import {useTheme} from "../../contexts/ThemeContext";
import useTabBarHeight from "../../hooks/useTabBarHeight";
import useCravingResults from "../../hooks/useCravingResults";
import { COLORS } from '../../utils/constants';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function CravingResults() {
    const { cravingResultsRecipes, isLoading } = useCravingResults();
    const [searchQuery, setSearchQuery] = useState('');
    const { theme } = useTheme();
    const tabBarHeight = useTabBarHeight();
    const styles = createStyles(theme, tabBarHeight);
    const router = useRouter();
    const params = useLocalSearchParams();
    
    // Parse selections from params
    const cravings = params.cravings ? JSON.parse(params.cravings) : [];
    const allergies = params.allergies ? JSON.parse(params.allergies) : [];
    const preferences = params.preferences ? JSON.parse(params.preferences) : [];

    const getFilteredResults = useCallback(() => {
        if (!searchQuery.trim()) return cravingResultsRecipes;

        const query = searchQuery.toLowerCase();
        return cravingResultsRecipes.filter(recipe =>
            recipe.title?.toLowerCase().includes(query) ||
            recipe.description?.toLowerCase().includes(query) ||
            (Array.isArray(recipe.ingredients) &&
                recipe.ingredients.some(ing =>
                    typeof ing === 'string'
                        ? ing.toLowerCase().includes(query)
                        : ing?.name?.toLowerCase().includes(query)
                ))
        );
    }, [cravingResultsRecipes, searchQuery]);


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
                    <Text style={[styles.loadingText, { color: COLORS.gray }]}>
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
                    <Text style={[styles.subtitle, { color: COLORS.gray }]}>
                        {cravingResultsRecipes.length} recipe{cravingResultsRecipes.length !== 1 ? 's' : ''} found
                    </Text>
                )}
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                    <Ionicons name="search" size={20} color={COLORS.gray} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search your recommended recipes..."
                        placeholderTextColor={COLORS.gray}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close" size={20} color={COLORS.gray} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Summary of selections */}
            <View style={styles.summaryContainer}>
                <CravingSummary 
                    cravings={cravings}
                    allergies={allergies}
                    preferences={preferences}
                />
            </View>

            {getFilteredResults().length > 0 ? (
                <ScrollView
                    style={styles.feed}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.feedContent}
                >
                    {getFilteredResults().map((recipe) => (
                        <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                </ScrollView>
            ) : cravingResultsRecipes.length > 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="search-outline" size={80} color={COLORS.primary} />
                    <Text style={styles.emptyText}>No results found</Text>
                    <Text style={styles.emptySubtext}>
                        No recipes match "{searchQuery}"
                    </Text>
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
        </SafeAreaView>
    );
}


const createStyles = (theme, tabBarHeight) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    headerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
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
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
        backgroundColor: COLORS.white,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primary,
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
        paddingBottom: tabBarHeight, // Add padding to prevent content being hidden behind tab bar
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
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: theme.colors.cardAccent,
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        gap: 10,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: theme.colors.text,
    },
    summaryContainer: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },
});