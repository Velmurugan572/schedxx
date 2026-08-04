import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../theme/index.js';

export const Input = ({ label, placeholder, value, onChangeText, secureTextEntry = false, keyboardType = 'default', error }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: theme.colors.textMuted }]}>{label}</Text>}
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
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
    marginVertical: 8,
    width: '100%'
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500'
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16
  },
  error: {
    fontSize: 12,
    marginTop: 4
  }
});

export default Input;
