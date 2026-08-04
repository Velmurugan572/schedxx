import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen.js';
import { useAuthStore } from '../store/auth.store.js';
import { useTheme } from '../theme/index.js';

export const SplashScreen = () => {
  const { theme } = useTheme();
  const checkSession = useAuthStore((state) => state.checkSession);

  useEffect(() => {
    const check = async () => {
      // Simulate splash display time
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await checkSession();
    };
    check();
  }, []);

  return (
    <Screen style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={[styles.title, { color: theme.colors.primary }]}>SCHED</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>Mobile Workspace Suite</Text>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoContainer: {
    alignItems: 'center'
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 4
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    fontWeight: '500'
  }
});

export default SplashScreen;
