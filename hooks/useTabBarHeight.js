// Use Tab Bar Height Hook - Hook zur Berechnung der Tab-Bar Höhe mit Safe Area
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export const useTabBarHeight = () => {
    const insets = useSafeAreaInsets();
    const tabBarHeight = 60 + (insets.bottom > 0 ? insets.bottom : 8);
    return tabBarHeight;
};
export default useTabBarHeight;
