import { useLocalSearchParams } from 'expo-router';

// Hook zum Abrufen der ausgewählten Ernährungspräferenzen aus den URL-Parametern
const usePreferences = () => {
    // Zugriff auf URL-Parameter in einer Expo-Router-Seite
    const { preferences } = useLocalSearchParams();

    if (!preferences) return []; // Wenn keine Daten übergeben wurden

    try {
        // Versuche, den JSON-String in ein Array umzuwandeln
        const parsedPreferences = preferences ? JSON.parse(preferences) : [];

        // Wenn das Ergebnis ein Array ist, gib es zurück – sonst leeres Array
        return Array.isArray(parsedPreferences) ? parsedPreferences : [];
    } catch (error) {
        // Falls JSON.parse fehlschlägt, gib eine Warnung aus und ein leeres Array zurück
        return [];
    }
};

export default usePreferences;