import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebaseconfig';
import { useLocalSearchParams } from 'expo-router';

const useCravingResults = () => {
    const [cravingResultsRecipes, setCravingResultsRecipes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const params = useLocalSearchParams();

    // Get parameters from URL
    const selectedCravings = params.cravings ? JSON.parse(params.cravings) : [];
    const selectedAllergies = params.allergies ? JSON.parse(params.allergies) : [];
    const selectedPreferences = params.preferences ? JSON.parse(params.preferences) : [];

    useEffect(() => {
        const fetchRecipes = async () => {
            setIsLoading(true);
            try {
                const recipesRef = collection(db, 'recipes');
                const snapshot = await getDocs(recipesRef);

                const allRecipes = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                console.log("All Recipes:", allRecipes.length);
                console.log("Selected Cravings:", selectedCravings);
                console.log("Selected Preferences:", selectedPreferences);
                console.log("Selected Allergies:", selectedAllergies);

                const filteredRecipes = allRecipes.filter(recipe => {
                    // 1. Filter by cravings (categories) - if any selected
                    if (selectedCravings.length > 0) {
                        const matchesCraving = selectedCravings.some(craving =>
                            recipe.categories?.includes(craving) || 
                            recipe.tags?.includes(craving) ||
                            recipe.category === craving
                        );
                        if (!matchesCraving) return false;
                    }

                    // 2. Exclude recipes with allergens - if 'none' is not selected
                    if (!selectedAllergies.includes('none') && selectedAllergies.length > 0) {
                        const hasAllergyConflict = selectedAllergies.some(allergy =>
                            recipe.allergens?.includes(allergy) ||
                            recipe.allergies?.includes(allergy)
                        );
                        if (hasAllergyConflict) return false;
                    }

                    // 3. Include recipes matching dietary preferences - if 'none' is not selected
                    if (!selectedPreferences.includes('none') && selectedPreferences.length > 0) {
                        const matchesPreference = selectedPreferences.some(pref =>
                            recipe.dietary?.includes(pref) || 
                            recipe.tags?.includes(pref) ||
                            recipe.diet === pref
                        );
                        if (!matchesPreference) return false;
                    }

                    return true;
                });

                console.log("Filtered Recipes:", filteredRecipes.length);
                setCravingResultsRecipes(filteredRecipes);
            } catch (error) {
                console.error("Error fetching craving results:", error);
                setCravingResultsRecipes([]);
            } finally {
                setIsLoading(false);
            }
        };

        // Only fetch if we have at least some parameters
        if (selectedCravings.length > 0 || selectedAllergies.length > 0 || selectedPreferences.length > 0) {
            fetchRecipes();
        } else {
            setIsLoading(false);
        }
    }, [params.cravings, params.allergies, params.preferences]);

    return { cravingResultsRecipes, isLoading };
};

export default useCravingResults;
