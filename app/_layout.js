import {Stack} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import {ThemeProvider} from '../contexts/ThemeContext';

function App() {
    return (
        <Stack screenOptions={{headerShown: false}}>
            <Stack.Screen name="(tabs)"/>
            <Stack.Screen name="recipe/[id]" options={{presentation: 'modal'}}/>
            <Stack.Screen name="category/[slug]" options={{presentation: 'push'}}/>
            <Stack.Screen name="profile/settings" options={{presentation: 'modal'}}/>
        </Stack>
    )
}

export default function RootLayout() {
    return (
        <ThemeProvider>
            <AuthenticatedUserProvider>
                <StatusBar style="auto"/>
                <App/>
            </AuthenticatedUserProvider>
        </ThemeProvider>
    );
}