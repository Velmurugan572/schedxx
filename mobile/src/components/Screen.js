import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/index.js';

export const Screen = ({ children, style }) => {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      <View style={[styles.inner, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  inner: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8
  }
});

export default Screen;
