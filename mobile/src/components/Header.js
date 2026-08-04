import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../theme/index.js';

export const Header = ({ title, rightElement, onRightPress }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { borderBottomColor: theme.colors.border }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      {rightElement && (
        <TouchableOpacity onPress={onRightPress} activeOpacity={0.7}>
          {rightElement}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    paddingBottom: 8
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  }
});

export default Header;
