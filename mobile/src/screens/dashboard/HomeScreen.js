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
        title={activeWorkspace ? activeWorkspace.name : 'SchedX'}
        rightElement={
          <View style={[styles.switchBadge, { backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.2)' }]}>
            <Text style={{ color: theme.colors.primary, fontWeight: '700', fontSize: 12 }}>SWITCH</Text>
          </View>
        }
        onRightPress={() => navigation.navigate('WorkspaceSelector')}
      />

      <View style={styles.content}>
        <View style={styles.heroContainer}>
          <Text style={[styles.welcome, { color: theme.colors.text }]}>Hello, Creator</Text>
          <Text style={[styles.info, { color: theme.colors.textMuted }]}>
            Here's how your workspace is performing today.
          </Text>
        </View>

        {/* Stats Card */}
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Workspace Metrics</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>4</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Scheduled</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.colors.accent }]}>12</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Published</Text>
            </View>
          </View>
        </View>

        {/* AI Suggestions Card Teaser */}
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={styles.aiHeader}>
            <Text style={[styles.aiBadge, { backgroundColor: 'rgba(124, 58, 237, 0.15)', color: theme.colors.accent }]}>
              AI COPILOT
            </Text>
            <Text style={[styles.cardSubtitle, { color: theme.colors.text }]}>Optimal Post Timing</Text>
          </View>
          <Text style={[styles.aiText, { color: theme.colors.textMuted }]}>
            "Based on audience activity, scheduling a caption-rich post today at 5:00 PM will increase engagement by ~18%."
          </Text>
        </View>

        <Button
          title="Compose New Post"
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
    paddingTop: 8
  },
  switchBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1
  },
  heroContainer: {
    marginBottom: 24
  },
  welcome: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5
  },
  info: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4
  },
  card: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 0.2
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  statBox: {
    alignItems: 'center',
    flex: 1
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1
  },
  statLabel: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: '600'
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.08)'
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  aiBadge: {
    fontSize: 9,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 10,
    overflow: 'hidden'
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: '700'
  },
  aiText: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic'
  },
  actionButton: {
    marginTop: 'auto',
    marginBottom: 8
  }
});

export default HomeScreen;
