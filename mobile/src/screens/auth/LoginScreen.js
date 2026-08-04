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
        <Text style={[styles.title, { color: theme.colors.text }]}>Welcome Back</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>Sign in to your Sched account</Text>
      </View>

      <View style={styles.form}>
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
          <Text style={{ color: theme.colors.primary }}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    paddingHorizontal: 24
  },
  header: {
    marginBottom: 32,
    alignItems: 'center'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold'
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8
  },
  form: {
    width: '100%'
  },
  button: {
    marginTop: 16
  },
  error: {
    textAlign: 'center',
    marginVertical: 8,
    fontSize: 14,
    fontWeight: '600'
  },
  link: {
    marginTop: 16,
    alignItems: 'center'
  }
});

export default LoginScreen;
