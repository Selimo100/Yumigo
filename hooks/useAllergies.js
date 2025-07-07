import { useLocalSearchParams } from 'expo-router';

// Hook zum Abrufen der ausgewählten Allergien aus den URL-Parametern
const useAllergies = () => {
    // Zugriff auf URL-Parameter in einer Expo-Router-Seite
    const { allergies } = useLocalSearchParams();

    if (!allergies) return []; // Wenn keine Daten übergeben wurden

    try {
        // Versuche, den JSON-String in ein Array umzuwandeln
        const parsedAllergies = allergies ? JSON.parse(allergies) : [];

        // Wenn das Ergebnis ein Array ist, gib es zurück – sonst leeres Array
        return Array.isArray(parsedAllergies) ? parsedAllergies : [];
    } catch (error) {
        // Falls JSON.parse fehlschlägt, gib eine Warnung aus und ein leeres Array zurück
        console.warn('Failed to parse allergies:', error);
        return [];
    }
};

export default useAllergies;
