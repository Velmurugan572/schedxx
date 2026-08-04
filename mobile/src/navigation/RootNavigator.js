import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/auth.store.js';
import AuthNavigator from './AuthNavigator.js';
import AppNavigator from './AppNavigator.js';
import SplashScreen from '../screens/SplashScreen.js';
import { useTheme } from '../theme/index.js';

export const RootNavigator = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const { theme } = useTheme();

  return (
    <NavigationContainer theme={theme}>
      {isLoading ? (
        <SplashScreen />
      ) : isAuthenticated ? (
        <AppNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

export default RootNavigator;
