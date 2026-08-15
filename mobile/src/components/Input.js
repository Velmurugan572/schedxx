import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../theme/index.js';

export const Input = ({ label, placeholder, value, onChangeText, secureTextEntry = false, keyboardType = 'default', error }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: theme.colors.textMuted }]}>{label.toUpperCase()}</Text>}
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.card,
            color: theme.colors.text,
            borderColor: error ? theme.colors.error : theme.colors.border
          }
        ]}
      />
      {error && <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    width: '100%'
  },
  label: {
    fontSize: 11,
    marginBottom: 6,
    fontWeight: '700',
    letterSpacing: 1
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    letterSpacing: 0.2
  },
  error: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500'
  }
});

export default Input;
