import { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import { Screen } from '../../components/Screen.js';
import { Header } from '../../components/Header.js';
import { EmptyState } from '../../components/EmptyState.js';
import { Button } from '../../components/Button.js';
import { useMediaStore } from '../../store/media.store.js';
import { useWorkspaceStore } from '../../store/workspace.store.js';
import { useTheme } from '../../theme/index.js';

export const MediaLibraryScreen = () => {
  const { theme } = useTheme();
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  
  const mediaAssets = useMediaStore((state) => state.mediaAssets);
  const fetchMediaAssets = useMediaStore((state) => state.fetchMediaAssets);
  const uploadMediaAsset = useMediaStore((state) => state.uploadMediaAsset);
  const deleteMediaAsset = useMediaStore((state) => state.deleteMediaAsset);
  const isLoading = useMediaStore((state) => state.isLoading);
  const globalError = useMediaStore((state) => state.error);

  useEffect(() => {
    if (activeWorkspace) {
      fetchMediaAssets(activeWorkspace.id);
    }
  }, [activeWorkspace]);

  // Mock pick file action for simulation
  const handleSelectAndUpload = async () => {
    if (!activeWorkspace) {
      Alert.alert('Error', 'Please select a workspace first.');
      return;
    }

    // Mock file input selection
    const mockFile = {
      uri: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500',
      name: `mock-img-${Date.now()}.jpg`,
      type: 'image/jpeg'
    };

    const res = await uploadMediaAsset(activeWorkspace.id, mockFile);
    if (res.success) {
      Alert.alert('Upload Successful', 'Media file registered in library.');
    } else {
      Alert.alert('Upload Failed', res.message || globalError);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Asset', 'Confirm permanent removal of this file.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteMediaAsset(id);
        }
      }
    ]);
  };

  return (
    <Screen>
      <Header title="Media Library" />

      {isLoading && mediaAssets.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : globalError && mediaAssets.length === 0 ? (
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{globalError}</Text>
          <Button title="Retry" onPress={() => fetchMediaAssets(activeWorkspace.id)} />
        </View>
      ) : mediaAssets.length === 0 ? (
        <View style={styles.flex}>
          <EmptyState message="Your media library is empty. Upload images or video files to get started." />
          <Button title="Mock Image Upload" onPress={handleSelectAndUpload} style={styles.uploadButton} />
        </View>
      ) : (
        <View style={styles.flex}>
          <FlatList
            data={mediaAssets}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            renderItem={({ item }) => (
              <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Image source={{ uri: item.fileUrl }} style={styles.thumbnail} />
                <View style={styles.info}>
                  <Text style={[styles.filename, { color: theme.colors.text }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.meta, { color: theme.colors.textMuted }]}>
                    {Math.round(item.fileSize / 1024)} KB | {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                  <Text style={{ color: theme.colors.error, fontSize: 12, fontWeight: 'bold' }}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}
          />
          <Button title="Mock Image Upload" onPress={handleSelectAndUpload} style={styles.uploadButton} />
        </View>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  errorText: {
    fontSize: 15,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600'
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 4
  },
  card: {
    width: '48%',
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3
  },
  thumbnail: {
    width: '100%',
    height: 120,
    backgroundColor: '#161F32'
  },
  info: {
    padding: 12
  },
  filename: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.1
  },
  meta: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500'
  },
  deleteBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)'
  },
  uploadButton: {
    marginHorizontal: 4,
    marginBottom: 16,
    marginTop: 10
  }
});

export default MediaLibraryScreen;
