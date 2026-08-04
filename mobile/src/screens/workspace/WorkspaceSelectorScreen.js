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
        <Text style={[styles.title, { color: theme.colors.text }]}>Select Workspace</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>Choose a workspace to continue</Text>
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
                    borderWidth: isActive ? 2 : 1
                  }
                ]}
              >
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{item.name}</Text>
                <Text style={[styles.cardRole, { color: theme.colors.textMuted }]}>{item.role}</Text>
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
    marginVertical: 24,
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4
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
    padding: 16,
    borderRadius: 8,
    marginVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600'
  },
  cardRole: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  createForm: {
    paddingTop: 16,
    borderTopWidth: 1,
    marginTop: 16
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8
  }
});

export default WorkspaceSelectorScreen;
