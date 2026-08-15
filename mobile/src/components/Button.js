import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/index.js';

export const Button = ({ title, onPress, variant = 'primary', loading = false, disabled = false, style }) => {
  const { theme } = useTheme();

  const getStyles = () => {
    let backgroundColor = theme.colors.primary;
    let textColor = '#ffffff';

    if (variant === 'secondary') {
      backgroundColor = theme.colors.card;
      textColor = theme.colors.text;
    } else if (variant === 'outline') {
      backgroundColor = 'transparent';
      textColor = theme.colors.primary;
    }

    return { backgroundColor, textColor };
  };

  const { backgroundColor, textColor } = getStyles();
  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor },
        isOutline && { borderColor: theme.colors.primary, borderWidth: 1 },
        (disabled || loading) && { opacity: 0.5 },
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3
  }
});

export default Button;
