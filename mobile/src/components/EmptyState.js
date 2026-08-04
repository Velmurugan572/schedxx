import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/index.js';

export const EmptyState = ({ message = 'No data available.' }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color: theme.colors.textMuted }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500'
  }
});

export default EmptyState;
