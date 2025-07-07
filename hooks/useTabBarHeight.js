import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Hook to get the height of the bottom tab bar
 * This helps prevent content from being hidden behind the tab bar
 */
export const useTabBarHeight = () => {
  const insets = useSafeAreaInsets();
  
  // Calculate the same height as used in the TabLayout
  const tabBarHeight = 60 + (insets.bottom > 0 ? insets.bottom : 8);
  
  return tabBarHeight;
};

export default useTabBarHeight;
