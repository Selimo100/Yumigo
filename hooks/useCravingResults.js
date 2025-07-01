import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebaseconfig';
import usePreferences from './usePreferences';
import useAllergies from './useAllergies';

const useCravingResults = () => {
    const [cravingResultsRecipes, setCravingResultsRecipes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const preferences = usePreferences();
    const selectedPreferences = Array.isArray(preferences) ? preferences : [];

    const allergies = useAllergies();
    const selectedAllergies = Array.isArray(allergies) ? allergies : [];

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
                console.log("Preferences:", selectedPreferences);
                console.log("Allergies:", selectedAllergies);

                const filteredRecipes = allRecipes.filter(recipe => {
                    // 1. Allergien ausschließen
                    const hasAllergyConflict = selectedAllergies.some(allergy =>
                        recipe.allergens?.includes(allergy)
                    );

                    if (hasAllergyConflict) return false;

                    // 2. Muss mindestens eine Präferenz matchen, wenn welche ausgewählt wurden
                    if (selectedPreferences.length > 0) {
                        const matchesPreference = selectedPreferences.some(pref =>
                            recipe.tags?.includes(pref)
                        );
                        if (!matchesPreference) return false;
                    }

                    return true;
                });

                setCravingResultsRecipes(filteredRecipes);
            } catch (error) {
                console.error("Error fetching craving results:", error);
                setCravingResultsRecipes([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecipes();
    }, [selectedPreferences, selectedAllergies]);

    return { cravingResultsRecipes, isLoading };
};

export default useCravingResults;
