import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../theme/index.js';

export const Header = ({ title, rightElement, onRightPress }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { borderBottomColor: theme.colors.border }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      {rightElement && (
        <TouchableOpacity onPress={onRightPress} activeOpacity={0.8}>
          {rightElement}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    paddingBottom: 12,
    marginBottom: 16
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5
  }
});

export default Header;
