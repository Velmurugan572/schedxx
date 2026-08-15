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
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          {/* Hexagonal S Monogram */}
          <View style={[styles.logoWrapper, { borderColor: theme.colors.primary }]}>
            <Text style={[styles.logoText, { color: theme.colors.text }]}>S</Text>
          </View>
          <Text style={[styles.title, { color: theme.colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>Get started with SchedX today</Text>
        </View>

        <View style={[styles.form, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
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
            <Text style={{ color: theme.colors.primary, fontWeight: '600', fontSize: 14 }}>
              Already have an account? Log In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  scroll: {
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32
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

export default RegisterScreen;
