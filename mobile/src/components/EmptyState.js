import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/index.js';

export const EmptyState = ({ message = 'No data available.' }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <View style={styles.circle}>
        <Text style={{ color: theme.colors.accent, fontSize: 24, fontWeight: 'bold' }}>⚡</Text>
      </View>
      <Text style={[styles.text, { color: theme.colors.textMuted }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  text: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 20
  }
});

export default EmptyState;
