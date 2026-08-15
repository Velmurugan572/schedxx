import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Screen } from '../../components/Screen.js';
import { Header } from '../../components/Header.js';
import { EmptyState } from '../../components/EmptyState.js';
import { Button } from '../../components/Button.js';
import { useNotificationStore } from '../../store/notification.store.js';
import { useTheme } from '../../theme/index.js';

export const NotificationsScreen = () => {
  const { theme } = useTheme();
  
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const deleteNotification = useNotificationStore((state) => state.deleteNotification);
  const isLoading = useNotificationStore((state) => state.isLoading);
  const globalError = useNotificationStore((state) => state.error);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  return (
    <Screen>
      <Header
        title={`Alerts (${unreadCount} Unread)`}
        rightElement={unreadCount > 0 && <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Mark All Read</Text>}
        onRightPress={markAllAsRead}
      />

      {isLoading && !refreshing && notifications.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : globalError && notifications.length === 0 ? (
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{globalError}</Text>
          <Button title="Retry Connection" onPress={fetchNotifications} />
        </View>
      ) : notifications.length === 0 ? (
        <EmptyState message="All caught up! You have no system notifications or failure alerts." />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          style={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => !item.read && markAsRead(item.id)}
              activeOpacity={0.8}
              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: item.read ? theme.colors.border : theme.colors.primary,
                  borderWidth: item.read ? 1 : 2
                }
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.badgeRow}>
                  <Text style={[styles.title, { color: theme.colors.text }]}>{item.title}</Text>
                  {!item.read && (
                    <View style={[styles.unreadBadge, { backgroundColor: theme.colors.primary }]} />
                  )}
                </View>
                <TouchableOpacity onPress={() => deleteNotification(item.id)}>
                  <Text style={[styles.delete, { color: theme.colors.error }]}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.body, { color: theme.colors.textMuted }]}>{item.body}</Text>
              <Text style={[styles.time, { color: theme.colors.textMuted }]}>
                {new Date(item.createdAt).toLocaleTimeString()} | {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
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
  list: {
    flex: 1,
    paddingTop: 8
  },
  card: {
    padding: 18,
    borderRadius: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.9
  },
  unreadBadge: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 10
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.1
  },
  delete: {
    fontSize: 14,
    paddingHorizontal: 8,
    fontWeight: '700'
  },
  body: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500'
  },
  time: {
    fontSize: 10,
    marginTop: 10,
    alignSelf: 'flex-end',
    fontWeight: '600',
    letterSpacing: 0.2
  }
});

export default NotificationsScreen;
