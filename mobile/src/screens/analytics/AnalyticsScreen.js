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
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center'
  },
  headerContainer: {
    paddingTop: 16
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center'
  },
  statNum: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4
  },
  fullCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginVertical: 4,
    marginBottom: 24
  },
  fullLabel: {
    fontSize: 12
  },
  fullValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 6
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12
  },
  badgeRow: {
    flexDirection: 'row'
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 6
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold'
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '600'
  },
  historyDate: {
    fontSize: 12,
    marginTop: 2
  },
  historyValue: {
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default AnalyticsScreen;
