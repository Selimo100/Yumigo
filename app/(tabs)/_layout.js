import { Tabs } from "expo-router";
import BottomNavIcon from "../../components/BottomNavIcon";

const tabs = [
    {
        name: "explore/index",
        title: "Explore",
        icon: "compass-outline",
        iconFocused: "compass"
    },
    {
        name: "trails/index",
        title: "Trails",
        icon: "trail-sign-outline",
        iconFocused: "trail-sign"
    },
    {
        name: "favorites/index",
        title: "Favorites",
        icon: "heart-outline",
        iconFocused: "heart"
    },
    {
        name: "profile/index",
        title: "Profile",
        icon: "person-circle-outline",
        iconFocused: "person-circle"
    }
];

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: "#1e3a8a",
                tabBarInactiveTintColor: "#94a3b8",
            }}
        >
            {tabs.map(({ name, title, icon, iconFocused }) => {
                return (
                    <Tabs.Screen
                        key={name}
                        name={name}
                        options={{
                            title,
                            tabBarIcon: ({ color, focused }) => (
                                <BottomNavIcon 
                                    name={focused ? iconFocused : icon} 
                                    color={color} 
                                />
                            ),
                        }}
                    />
                );
            })}
        </Tabs>
    );
}