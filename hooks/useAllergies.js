import { useLocalSearchParams } from 'expo-router';
const useAllergies = () => {
    const { allergies } = useLocalSearchParams();
    if (!allergies) return []; 
    try {
        const parsedAllergies = allergies ? JSON.parse(allergies) : [];
        return Array.isArray(parsedAllergies) ? parsedAllergies : [];
    } catch (error) {
        return [];
    }
};
export default useAllergies;
