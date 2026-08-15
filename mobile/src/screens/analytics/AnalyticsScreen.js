import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Screen } from '../../components/Screen.js';
import { Header } from '../../components/Header.js';
import { Button } from '../../components/Button.js';
import { useAnalyticsStore } from '../../store/analytics.store.js';
import { useWorkspaceStore } from '../../store/workspace.store.js';
import { useTheme } from '../../theme/index.js';

export const AnalyticsScreen = () => {
  const { theme } = useTheme();
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);

  const workspaceStats = useAnalyticsStore((state) => state.workspaceStats);
  const historyStats = useAnalyticsStore((state) => state.historyStats);
  const fetchWorkspaceAnalytics = useAnalyticsStore((state) => state.fetchWorkspaceAnalytics);
  const fetchHistoricalAnalytics = useAnalyticsStore((state) => state.fetchHistoricalAnalytics);
  const isLoading = useAnalyticsStore((state) => state.isLoading);
  const globalError = useAnalyticsStore((state) => state.error);

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('daily'); // daily/weekly/monthly mock filter

  const loadData = async () => {
    if (activeWorkspace) {
      await Promise.all([
        fetchWorkspaceAnalytics(activeWorkspace.id),
        fetchHistoricalAnalytics(activeWorkspace.id)
      ]);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeWorkspace]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Mock workspace statistics overview data if backend returned empty (e.g. initial setup)
  const statsOverview = workspaceStats || {
    totalPosts: 12,
    scheduledPosts: 4,
    publishedPosts: 7,
    failedPosts: 1,
    engagementSummary: '4.2%'
  };

  // Mock historical list data if backend history is empty
  const displayHistory = historyStats.length > 0 ? historyStats : [
    { id: 'h1', date: '2026-07-28', name: 'Reach', value: '1,420' },
    { id: 'h2', date: '2026-07-27', name: 'Views', value: '3,110' },
    { id: 'h3', date: '2026-07-26', name: 'Likes', value: '450' },
    { id: 'h4', date: '2026-07-25', name: 'Shares', value: '92' }
  ];

  return (
    <Screen>
      <Header title="Analytics Dashboard" />

      {isLoading && !refreshing && !workspaceStats ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : globalError ? (
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{globalError}</Text>
          <Button title="Retry Loading" onPress={loadData} />
        </View>
      ) : (
        <FlatList
          data={displayHistory}
          keyExtractor={(item, index) => item.id || index.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary} />
          }
          ListHeaderComponent={
            <View style={styles.headerContainer}>
              <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>Workspace Overview</Text>
              
              {/* Stat Cards Grid */}
              <View style={styles.statsGrid}>
                <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                  <Text style={[styles.statNum, { color: theme.colors.text }]}>{statsOverview.totalPosts}</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Total Posts</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                  <Text style={[styles.statNum, { color: theme.colors.primary }]}>{statsOverview.scheduledPosts}</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Scheduled</Text>
                </View>
              </View>

              <View style={styles.statsGrid}>
                <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                  <Text style={[styles.statNum, { color: theme.colors.accent }]}>{statsOverview.publishedPosts}</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Published</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                  <Text style={[styles.statNum, { color: theme.colors.error }]}>{statsOverview.failedPosts}</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Failed</Text>
                </View>
              </View>

              <View style={[styles.fullCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Text style={[styles.fullLabel, { color: theme.colors.textMuted }]}>Average Engagement Rate</Text>
                <Text style={[styles.fullValue, { color: theme.colors.text }]}>{statsOverview.engagementSummary}</Text>
              </View>

              {/* Time Series Filter */}
              <View style={styles.filterRow}>
                <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>Historical Logs</Text>
                <View style={styles.badgeRow}>
                  {['daily', 'weekly', 'monthly'].map((item) => (
                    <TouchableOpacity
                      key={item}
                      onPress={() => setFilter(item)}
                      style={[
                        styles.badge,
                        filter === item && { backgroundColor: theme.colors.primary }
                      ]}
                    >
                      <Text style={[styles.badgeText, { color: filter === item ? '#ffffff' : theme.colors.textMuted }]}>
                        {item.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.historyRow, { borderBottomColor: theme.colors.border }]}>
              <View>
                <Text style={[styles.historyTitle, { color: theme.colors.text }]}>{item.name}</Text>
                <Text style={[styles.historyDate, { color: theme.colors.textMuted }]}>{item.date}</Text>
              </View>
              <Text style={[styles.historyValue, { color: theme.colors.primary }]}>{item.value}</Text>
            </View>
          )}
        />
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16
  },
  errorText: {
    fontSize: 15,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600'
  },
  headerContainer: {
    paddingTop: 8
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: 0.2
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14
  },
  statCard: {
    width: '48%',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3
  },
  statNum: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5
  },
  statLabel: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: '600'
  },
  fullCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginVertical: 4,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4
  },
  fullLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3
  },
  fullValue: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
    marginTop: 6
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16
  },
  badgeRow: {
    flexDirection: 'row'
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)'
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '700'
  },
  historyDate: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500'
  },
  historyValue: {
    fontSize: 15,
    fontWeight: '800'
  }
});

export default AnalyticsScreen;
