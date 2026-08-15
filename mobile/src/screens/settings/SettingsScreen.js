import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Switch, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Screen } from '../../components/Screen.js';
import { Header } from '../../components/Header.js';
import { Button } from '../../components/Button.js';
import { useAuthStore } from '../../store/auth.store.js';
import { useWorkspaceStore } from '../../store/workspace.store.js';
import { useTheme } from '../../theme/index.js';
import api from '../../services/api.js';
import storage from '../../utils/storage.js';

export const SettingsScreen = () => {
  const { theme, themeMode, setThemeMode } = useTheme();
  
  const user = useAuthStore((state) => state.user);
  const fetchUserProfile = useAuthStore((state) => state.fetchUserProfile);
  const logout = useAuthStore((state) => state.logout);
  const isLoadingUser = useAuthStore((state) => state.isLoading);
  
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);

  // Preference states stored locally
  const [notifyAlerts, setNotifyAlerts] = useState(true);
  const [notifySuccess, setNotifySuccess] = useState(false);
  const [aiTonePreference, setAiTonePreference] = useState('PROFESSIONAL');
  
  // API Health status indicators
  const [apiHealth, setApiHealth] = useState('Checking...');
  const [apiHealthColor, setApiHealthColor] = useState(theme.colors.textMuted);

  const checkHealth = async () => {
    try {
      const res = await api.get('/health');
      if (res.data.success) {
        setApiHealth('ONLINE');
        setApiHealthColor(theme.colors.accent);
      } else {
        setApiHealth('DEGRADED');
        setApiHealthColor(theme.colors.warning);
      }
    } catch (err) {
      setApiHealth('OFFLINE');
      setApiHealthColor(theme.colors.error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    checkHealth();

    // Load local AI tone preference
    const loadPrefs = async () => {
      const tone = await storage.getItem('default_ai_tone');
      if (tone) setAiTonePreference(tone);
    };
    loadPrefs();
  }, []);

  const handleToneChange = async (tone) => {
    setAiTonePreference(tone);
    await storage.setItem('default_ai_tone', tone);
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to end your session?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout }
    ]);
  };

  return (
    <Screen>
      <Header title="Settings" />

      {isLoadingUser && !user ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          
          {/* USER PROFILE INFO SECTION */}
          <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>User Profile</Text>
            <View style={styles.infoRow}>
              <Text style={{ color: theme.colors.textMuted }}>Name</Text>
              <Text style={[styles.infoVal, { color: theme.colors.text }]}>
                {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={{ color: theme.colors.textMuted }}>Email</Text>
              <Text style={[styles.infoVal, { color: theme.colors.text }]}>{user?.email || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={{ color: theme.colors.textMuted }}>Workspace</Text>
              <Text style={[styles.infoVal, { color: theme.colors.text }]}>{activeWorkspace?.name || 'None Selected'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={{ color: theme.colors.textMuted }}>Member Role</Text>
              <Text style={[styles.infoVal, { color: theme.colors.primary, fontWeight: 'bold' }]}>
                {activeWorkspace?.role || 'N/A'}
              </Text>
            </View>
          </View>

          {/* THEME PREFERENCE MODES */}
          <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Theme Settings</Text>
            <View style={styles.themeRow}>
              {['light', 'dark', 'system'].map((mode) => (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setThemeMode(mode)}
                  style={[
                    styles.themeBtn,
                    { borderColor: theme.colors.border },
                    themeMode === mode && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                  ]}
                >
                  <Text style={{ color: themeMode === mode ? '#ffffff' : theme.colors.text, fontWeight: '600' }}>
                    {mode.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* MOCK NOTIFICATION TOGGLES */}
          <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Preferences</Text>
            
            <View style={styles.prefRow}>
              <Text style={{ color: theme.colors.text }}>Failure System Alerts</Text>
              <Switch value={notifyAlerts} onValueChange={setNotifyAlerts} />
            </View>
            <View style={styles.prefRow}>
              <Text style={{ color: theme.colors.text }}>Publishing Success Alerts</Text>
              <Switch value={notifySuccess} onValueChange={setNotifySuccess} />
            </View>

            {/* AI Default Tone Local Preference */}
            <Text style={[styles.subLabel, { color: theme.colors.textMuted, marginTop: 12 }]}>AI Default Assistant Tone</Text>
            <View style={styles.themeRow}>
              {['PROFESSIONAL', 'CASUAL', 'HUMOROUS'].map((tone) => (
                <TouchableOpacity
                  key={tone}
                  onPress={() => handleToneChange(tone)}
                  style={[
                    styles.toneBtn,
                    { borderColor: theme.colors.border },
                    aiTonePreference === tone && { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent }
                  ]}
                >
                  <Text style={{ color: aiTonePreference === tone ? '#ffffff' : theme.colors.text, fontSize: 11, fontWeight: '600' }}>
                    {tone}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ABOUT SECTION */}
          <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>About App</Text>
            <View style={styles.infoRow}>
              <Text style={{ color: theme.colors.textMuted }}>Version</Text>
              <Text style={{ color: theme.colors.text }}>1.0.0 (Release)</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={{ color: theme.colors.textMuted }}>Backend System Status</Text>
              <Text style={{ color: apiHealthColor, fontWeight: 'bold' }}>{apiHealth}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={{ color: theme.colors.textMuted }}>Developer Info</Text>
              <Text style={{ color: theme.colors.text }}>Sched Platform Team</Text>
            </View>
          </View>

          <Button title="Log Out Session" variant="secondary" onPress={handleLogout} style={styles.logoutButton} />
        </ScrollView>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  scroll: {
    paddingVertical: 12
  },
  card: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 0.2
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)'
  },
  infoVal: {
    fontWeight: '600'
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6
  },
  themeBtn: {
    flex: 0.31,
    height: 40,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  toneBtn: {
    flex: 0.31,
    height: 36,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.3
  },
  logoutButton: {
    marginTop: 10,
    marginBottom: 24
  }
});

export default SettingsScreen;
