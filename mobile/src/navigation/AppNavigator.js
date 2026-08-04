import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/dashboard/HomeScreen.js';
import CreatePostScreen from '../screens/posts/CreatePostScreen.js';
import MediaLibraryScreen from '../screens/media/MediaLibraryScreen.js';
import AnalyticsScreen from '../screens/analytics/AnalyticsScreen.js';
import NotificationsScreen from '../screens/notifications/NotificationsScreen.js';
import SettingsScreen from '../screens/settings/SettingsScreen.js';
import WorkspaceSelectorScreen from '../screens/workspace/WorkspaceSelectorScreen.js';
import { useTheme } from '../theme/index.js';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabNavigator = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border
        }
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Posts" component={CreatePostScreen} />
      <Tab.Screen name="Media" component={MediaLibraryScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Alerts" component={NotificationsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WorkspaceSelector" component={WorkspaceSelectorScreen} />
      <Stack.Screen name="MainTabs" component={TabNavigator} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
