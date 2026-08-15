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
        {/* Hexagonal Geometric Logo */}
        <View style={styles.logoWrapper}>
          <View style={[styles.hexPart, { borderColor: theme.colors.primary }]} />
          <View style={[styles.hexPartInner, { borderColor: theme.colors.accent }]} />
          <Text style={[styles.logoText, { color: theme.colors.text }]}>S</Text>
        </View>
        <Text style={[styles.title, { color: theme.colors.text }]}>SchedX</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>Schedule Smarter. Grow Faster.</Text>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B1020'
  },
  logoContainer: {
    alignItems: 'center'
  },
  logoWrapper: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative'
  },
  hexPart: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 20,
    borderWidth: 3,
    transform: [{ rotate: '45deg' }]
  },
  hexPartInner: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 14,
    borderWidth: 2,
    transform: [{ rotate: '15deg' }],
    opacity: 0.7
  },
  logoText: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2
  },
  subtitle: {
    fontSize: 14,
    marginTop: 10,
    fontWeight: '600',
    letterSpacing: 0.5
  }
});

export default SplashScreen;
