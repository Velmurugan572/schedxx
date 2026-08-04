import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { Screen } from '../../components/Screen.js';
import { Input } from '../../components/Input.js';
import { Button } from '../../components/Button.js';
import { useAuthStore } from '../../store/auth.store.js';
import { useTheme } from '../../theme/index.js';

export const RegisterScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const globalError = useAuthStore((state) => state.error);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
      setValidationError('All fields are required.');
      return;
    }
    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters long.');
      return;
    }
    setValidationError('');
    await register(email, password, firstName, lastName);
  };

  const displayedError = validationError || globalError;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>Get started with Sched today</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="First Name"
            placeholder="John"
            value={firstName}
            onChangeText={setFirstName}
          />
          <Input
            label="Last Name"
            placeholder="Doe"
            value={lastName}
            onChangeText={setLastName}
          />
          <Input
            label="Email Address"
            placeholder="email@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <Input
            label="Password"
            placeholder="•••••••• (Min 8 chars)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {displayedError ? (
            <Text style={[styles.error, { color: theme.colors.error }]}>{displayedError}</Text>
          ) : null}

          <Button title="Sign Up" onPress={handleRegister} loading={isLoading} style={styles.button} />

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.link}>
            <Text style={{ color: theme.colors.primary }}>Already have an account? Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  scroll: {
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 24
  },
  header: {
    marginBottom: 24,
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

export default RegisterScreen;
