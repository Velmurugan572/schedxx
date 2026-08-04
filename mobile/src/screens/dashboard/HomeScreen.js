import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen.js';
import { Header } from '../../components/Header.js';
import { Button } from '../../components/Button.js';
import { useWorkspaceStore } from '../../store/workspace.store.js';
import { useTheme } from '../../theme/index.js';

export const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);

  return (
    <Screen>
      <Header
        title={activeWorkspace ? activeWorkspace.name : 'Sched'}
        rightElement={<Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Switch</Text>}
        onRightPress={() => navigation.navigate('WorkspaceSelector')}
      />

      <View style={styles.content}>
        <Text style={[styles.welcome, { color: theme.colors.text }]}>Dashboard</Text>
        <Text style={[styles.info, { color: theme.colors.textMuted }]}>
          Welcome to the mobile dashboard. View quick analytics and manage your posts here.
        </Text>

        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Quick Stats</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>0</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Scheduled</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.colors.accent }]}>0</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Published</Text>
            </View>
          </View>
        </View>

        <Button
          title="Create New Post"
          onPress={() => navigation.navigate('CreatePost')}
          style={styles.actionButton}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 16
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8
  },
  info: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24
  },
  card: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 24
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  statBox: {
    alignItems: 'center'
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4
  },
  actionButton: {
    marginTop: 'auto',
    marginBottom: 16
  }
});

export default HomeScreen;
