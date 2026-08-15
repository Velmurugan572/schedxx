import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Screen } from '../../components/Screen.js';
import { Button } from '../../components/Button.js';
import { Input } from '../../components/Input.js';
import { useWorkspaceStore } from '../../store/workspace.store.js';
import { useTheme } from '../../theme/index.js';

export const WorkspaceSelectorScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const fetchWorkspaces = useWorkspaceStore((state) => state.fetchWorkspaces);
  const setActiveWorkspace = useWorkspaceStore((state) => state.setActiveWorkspace);
  const createWorkspace = useWorkspaceStore((state) => state.createWorkspace);
  const isLoading = useWorkspaceStore((state) => state.isLoading);
  const globalError = useWorkspaceStore((state) => state.error);

  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleSelect = (workspace) => {
    setActiveWorkspace(workspace);
    navigation.navigate('MainTabs');
  };

  const handleCreate = async () => {
    if (!newWorkspaceName.trim()) {
      setFormError('Workspace name cannot be empty');
      return;
    }
    setFormError('');
    const res = await createWorkspace(newWorkspaceName.trim());
    if (res.success) {
      setNewWorkspaceName('');
      navigation.navigate('MainTabs');
    } else {
      setFormError(res.message);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        {/* Hexagonal S Monogram */}
        <View style={[styles.logoWrapper, { borderColor: theme.colors.primary }]}>
          <Text style={[styles.logoText, { color: theme.colors.text }]}>S</Text>
        </View>
        <Text style={[styles.title, { color: theme.colors.text }]}>Select Workspace</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>Choose a workspace to continue to SchedX</Text>
      </View>

      {isLoading && workspaces.length === 0 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : globalError && workspaces.length === 0 ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{globalError}</Text>
          <Button title="Retry Connection" onPress={fetchWorkspaces} />
        </View>
      ) : (
        <FlatList
          data={workspaces}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isActive = activeWorkspace?.id === item.id;
            return (
              <TouchableOpacity
                onPress={() => handleSelect(item)}
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: isActive ? theme.colors.primary : theme.colors.border,
                    borderWidth: isActive ? 1.5 : 1
                  }
                ]}
              >
                <View>
                  <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{item.name}</Text>
                  <Text style={[styles.cardMeta, { color: theme.colors.textMuted }]}>Enterprise Suite</Text>
                </View>
                <View style={[styles.roleBadge, { backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.05)' }]}>
                  <Text style={[styles.cardRole, { color: isActive ? theme.colors.primary : theme.colors.textMuted }]}>
                    {item.role ? item.role.toUpperCase() : 'MEMBER'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <View style={[styles.createForm, { borderTopColor: theme.colors.border }]}>
        <Text style={[styles.formTitle, { color: theme.colors.text }]}>Create New Workspace</Text>
        <Input
          placeholder="Workspace Name"
          value={newWorkspaceName}
          onChangeText={setNewWorkspaceName}
          error={formError}
        />
        <Button title="Create & Switch" onPress={handleCreate} loading={isLoading} />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    marginVertical: 20,
    alignItems: 'center'
  },
  logoWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    transform: [{ rotate: '45deg' }]
  },
  logoText: {
    fontSize: 20,
    fontWeight: '900',
    transform: [{ rotate: '-45deg' }]
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6
  },
  list: {
    flex: 1
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600'
  },
  card: {
    padding: 18,
    borderRadius: 16,
    marginVertical: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700'
  },
  cardMeta: {
    fontSize: 11,
    marginTop: 4
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8
  },
  cardRole: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  createForm: {
    paddingTop: 16,
    borderTopWidth: 1,
    marginTop: 16
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.2
  }
});

export default WorkspaceSelectorScreen;
