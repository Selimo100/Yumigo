import {Stack} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import {ThemeProvider} from '../contexts/ThemeContext';
import {NotificationProvider} from '../contexts/NotificationContext';
import AuthenticatedUserProvider from "../lib/AuthenticatedUserProvider";

function App() {
    return (
        <Stack screenOptions={{headerShown: false}}>
            <Stack.Screen name="(tabs)"/>
            <Stack.Screen name="recipe/[id]" options={{presentation: 'modal'}}/>
            <Stack.Screen name="category/[slug]" options={{presentation: 'push'}}/>
            <Stack.Screen name="profile/settings" options={{presentation: 'modal'}}/>
            <Stack.Screen name="craving/mealTypeSelection" options={{presentation: 'modal'}}/>
            <Stack.Screen name="craving/allergySelection" options={{presentation: 'modal'}}/>
            <Stack.Screen name="craving/preferencesSelection" options={{presentation: 'modal'}}/>
            <Stack.Screen name="craving/cravingResults" options={{presentation: 'modal'}}/>

        </Stack>
    )
}

export default function RootLayout() {
    return (
        <ThemeProvider>
            <AuthenticatedUserProvider>
                <NotificationProvider>
                    <StatusBar style="auto"/>
                    <App/>
                </NotificationProvider>
            </AuthenticatedUserProvider>
        </ThemeProvider>
    );
}