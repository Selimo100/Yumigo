import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {useEffect, useState} from 'react';
import RecipeCard from '../../components/RecipeCard';
import RecipeForm from '../../components/RecipeForm/RecipeForm';
import {useTheme} from '../../contexts/ThemeContext';
import useAuth from "../../lib/useAuth"
import {Stack, Redirect} from 'expo-router'
import {db} from '../../lib/firebaseconfig'
import {getDocs, collection} from 'firebase/firestore'

export default function HomeScreen() {

    const [recipeList, setRecipeList] = useState([]);
    const [error, setError] = useState(null);

    const getRecipes = async () => {
        try {
            console.log('🔍 Fetching recipes from Firestore...');
            const data = await getDocs(collection(db, 'recipes'));
            const recipes = data.docs.map((doc) => ({id: doc.id, ...doc.data()}));
            console.log('✅ Recipes fetched:', recipes);
            setRecipeList(recipes);
        } catch (err) {
            console.error('❌ Error fetching recipes:', err);
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        getRecipes();
    }, []);

    const {theme} = useTheme();
    const styles = createStyles(theme);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const handleCreatePress = () => {
        setShowCreateModal(true);
    };

    const handleRecipeSuccess = (recipeId) => {
        console.log('Recipe created with ID:', recipeId);
        setShowCreateModal(false);
        getRecipes();
    };

    const handleCloseModal = () => {
        setShowCreateModal(false);
    };

    const {user, isLoading} = useAuth()
    console.log(user)
    if (isLoading) {
        return <ActivityIndicator/>
    }

    if (!user) {
        return <Redirect href="/login"/>
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Top Navigation */}
            <View style={styles.topNav}>
                <Text style={styles.logo}>Yumigo</Text>
                <View style={styles.topNavIcons}>
                    <TouchableOpacity style={styles.createButton} onPress={handleCreatePress}>
                        <Ionicons name="add" size={24} color={theme.colors.buttonText}/>
                        <Text style={styles.createText}>Create</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.notificationIcon}>
                        <Ionicons name="notifications-outline" size={24} color={theme.colors.text}/>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Recipe Feed */}
            <ScrollView style={styles.feed} showsVerticalScrollIndicator={false}>
                {recipeList.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe}/>
                ))}
            </ScrollView>

            {/* Create Recipe Modal */}
            {/* Create Recipe Modal */}
            <Modal
                visible={showCreateModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={handleCloseModal}
            >
                <SafeAreaView style={[styles.modalContainer, {backgroundColor: theme.colors.background}]}>
                    {/* Modal Header */}
                    <View style={[styles.modalHeader, {
                        backgroundColor: theme.isDarkMode
                            ? 'rgba(0,0,0,0.8)'
                            : 'rgba(255,255,255,0.9)',
                        borderBottomColor: theme.colors.border
                    }]}>
                        <TouchableOpacity onPress={handleCloseModal} style={styles.modalCloseButton}>
                            <Ionicons name="arrow-back" size={24} color={theme.colors.text}/>
                        </TouchableOpacity>
                        <Text style={[styles.modalHeaderTitle, {color: theme.colors.text}]}>Create Recipe</Text>
                    </View>

                    <RecipeForm onSuccess={handleRecipeSuccess} onCancel={handleCloseModal}/>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    topNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    logo: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    topNavIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.button,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 5,
    },
    createText: {
        color: theme.colors.buttonText,
        fontSize: 14,
        fontWeight: '600',
    },
    notificationIcon: {
        padding: 5,
    },
    feed: {
        flex: 1,
        paddingTop: 10,
    },
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
    },
    modalCloseButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    modalHeaderTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 16,
    },
});