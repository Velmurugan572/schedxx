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
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor },
        isOutline && { borderContext: 1, borderColor: theme.colors.primary, borderWidth: 1 },
        (disabled || loading) && { opacity: 0.6 },
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginVertical: 8
  },
  text: {
    fontSize: 16,
    fontWeight: '600'
  }
});

export default Button;
