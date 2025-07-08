import {useLocalSearchParams} from 'expo-router';

const usePreferences = () => {
    const { preferences } = useLocalSearchParams();
    if (!preferences) return []; 
    try {
        const parsedPreferences = preferences ? JSON.parse(preferences) : [];
        return Array.isArray(parsedPreferences) ? parsedPreferences : [];
    } catch (error) {
        return [];
    }
};
export default usePreferences;