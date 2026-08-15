import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Screen } from '../../components/Screen.js';
import { Input } from '../../components/Input.js';
import { Button } from '../../components/Button.js';
import { useAuthStore } from '../../store/auth.store.js';
import { useTheme } from '../../theme/index.js';

export const LoginScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const globalError = useAuthStore((state) => state.error);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setValidationError('Please fill in all fields');
      return;
    }
    setValidationError('');
    await login(email, password);
  };

  const displayedError = validationError || globalError;

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        {/* Hexagonal S Monogram */}
        <View style={[styles.logoWrapper, { borderColor: theme.colors.primary }]}>
          <Text style={[styles.logoText, { color: theme.colors.text }]}>S</Text>
        </View>
        <Text style={[styles.title, { color: theme.colors.text }]}>SchedX</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>Schedule Smarter. Grow Faster.</Text>
      </View>

      <View style={[styles.form, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Input
          label="Email Address"
          placeholder="email@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          error={displayedError && !email ? 'Email is required' : null}
        />
        <Input
          label="Password"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={displayedError && !password ? 'Password is required' : null}
        />

        {displayedError ? (
          <Text style={[styles.error, { color: theme.colors.error }]}>{displayedError}</Text>
        ) : null}

        <Button title="Log In" onPress={handleLogin} loading={isLoading} style={styles.button} />

        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.link}>
          <Text style={{ color: theme.colors.primary, fontWeight: '600', fontSize: 14 }}>
            Don't have an account? Sign Up
          </Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#0B1020'
  },
  header: {
    marginBottom: 28,
    alignItems: 'center'
  },
  logoWrapper: {
    width: 60,
    height: 60,
    borderRadius: 16,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    transform: [{ rotate: '45deg' }]
  },
  logoText: {
    fontSize: 24,
    fontWeight: '900',
    transform: [{ rotate: '-45deg' }]
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
    fontWeight: '500'
  },
  form: {
    width: '100%',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5
  },
  button: {
    marginTop: 12
  },
  error: {
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 13,
    fontWeight: '600'
  },
  link: {
    marginTop: 18,
    alignItems: 'center'
  }
});

export default LoginScreen;
