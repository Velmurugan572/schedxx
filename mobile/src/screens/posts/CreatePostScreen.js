import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert, ActivityIndicator, Image, TouchableOpacity, FlatList, Modal } from 'react-native';
import { Screen } from '../../components/Screen.js';
import { Header } from '../../components/Header.js';
import { Input } from '../../components/Input.js';
import { Button } from '../../components/Button.js';
import { usePostStore } from '../../store/post.store.js';
import { useWorkspaceStore } from '../../store/workspace.store.js';
import { useMediaStore } from '../../store/media.store.js';
import { useTheme } from '../../theme/index.js';

export const CreatePostScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const editingPostId = route?.params?.postId || null;

  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  
  const createPost = usePostStore((state) => state.createPost);
  const updatePost = usePostStore((state) => state.updatePost);
  const deletePost = usePostStore((state) => state.deletePost);
  const schedulePost = usePostStore((state) => state.schedulePost);
  const generateAICopilot = usePostStore((state) => state.generateAICopilot);
  
  const saveLocalDraft = usePostStore((state) => state.saveLocalDraft);
  const loadLocalDraft = usePostStore((state) => state.loadLocalDraft);
  const posts = usePostStore((state) => state.posts);
  const globalError = usePostStore((state) => state.error);
  const isLoading = usePostStore((state) => state.isLoading);

  // Media stores hooks
  const mediaAssets = useMediaStore((state) => state.mediaAssets);
  const fetchMediaAssets = useMediaStore((state) => state.fetchMediaAssets);
  const attachMedia = useMediaStore((state) => state.attachMediaToPost);
  const detachMedia = useMediaStore((state) => state.detachMediaFromPost);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [attachments, setAttachments] = useState([]); // List of media attached
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  // Platform selection for scheduling
  const [platform, setPlatform] = useState('X'); 
  const [socialAccountId, setSocialAccountId] = useState('8b5e28a4-0c24-4f05-9502-d9e030282b8f'); // Standard mock UUID
  
  // AI prompt state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiTone, setAiTone] = useState('PROFESSIONAL');

  // Load existing post if editing, or restore local autosaved draft
  useEffect(() => {
    const loadContent = async () => {
      if (editingPostId) {
        const post = posts.find((p) => p.id === editingPostId);
        if (post) {
          setTitle(post.title || '');
          setContent(post.content || '');
          // Map backend post-media relationships if present
          setAttachments(post.media?.map(m => m.mediaAsset) || []);
        }
      } else {
        const local = await loadLocalDraft();
        if (local) {
          setTitle(local.title || '');
          setContent(local.content || '');
          Alert.alert('Draft Restored', 'Restored your unsaved draft.');
        }
      }
      if (activeWorkspace) {
        fetchMediaAssets(activeWorkspace.id);
      }
    };
    loadContent();
  }, [editingPostId, activeWorkspace]);

  // Local auto-save trigger on input change
  const handleContentChange = (text) => {
    setContent(text);
    if (!editingPostId) {
      saveLocalDraft(title, text);
    }
  };

  const handleTitleChange = (text) => {
    setTitle(text);
    if (!editingPostId) {
      saveLocalDraft(text, content);
    }
  };

  // Create or Update
  const handleSave = async () => {
    if (!activeWorkspace) {
      Alert.alert('Error', 'Please select a workspace first.');
      return;
    }
    if (!content.trim()) {
      Alert.alert('Validation Error', 'Post content is required.');
      return;
    }

    let res;
    if (editingPostId) {
      res = await updatePost(editingPostId, title, content);
    } else {
      res = await createPost(activeWorkspace.id, title, content);
    }

    if (res.success) {
      Alert.alert('Success', 'Post saved to backend successfully.');
      navigation.goBack();
    } else {
      Alert.alert('Save Failed', res.message || globalError);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!editingPostId) return;
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const res = await deletePost(editingPostId);
          if (res.success) {
            navigation.goBack();
          }
        }
      }
    ]);
  };

  // Schedule Post
  const handleSchedule = async () => {
    if (!editingPostId) {
      Alert.alert('Error', 'Please save the draft before scheduling.');
      return;
    }
    if (!scheduledAt) {
      Alert.alert('Validation Error', 'Please select a publication date.');
      return;
    }
    const res = await schedulePost(activeWorkspace.id, editingPostId, socialAccountId, scheduledAt);
    if (res.success) {
      Alert.alert('Success', 'Post queued for scheduling successfully.');
    } else {
      Alert.alert('Scheduling Error', res.message || globalError);
    }
  };

  // AI Generation
  const handleAICopilot = async (actionType) => {
    if (!activeWorkspace) return;
    let promptText = aiPrompt || content;
    if (actionType === 'REWRITE') promptText = `Rewrite the following text: ${content}`;
    if (actionType === 'SHORTEN') promptText = `Shorten the following text: ${content}`;
    if (actionType === 'EXPAND') promptText = `Expand the following text: ${content}`;

    const res = await generateAICopilot(activeWorkspace.id, promptText, platform, aiTone);
    if (res.success) {
      setContent(res.content);
      if (!editingPostId) saveLocalDraft(title, res.content);
      Alert.alert('Gemini Optimizer', 'Content optimized successfully.');
    } else {
      Alert.alert('AI Copilot Error', res.message || globalError);
    }
  };

  // Media Attachment handlers
  const handleAttachMedia = async (asset) => {
    setIsMediaModalOpen(false);
    if (!editingPostId) {
      // Local addition for new draft post
      setAttachments([...attachments, asset]);
      return;
    }

    const res = await attachMedia(editingPostId, asset.id);
    if (res.success) {
      setAttachments([...attachments, asset]);
    } else {
      Alert.alert('Attachment Error', res.message || globalError);
    }
  };

  const handleDetachMedia = async (assetId) => {
    if (!editingPostId) {
      setAttachments(attachments.filter(item => item.id !== assetId));
      return;
    }

    const res = await detachMedia(editingPostId, assetId);
    if (res.success) {
      setAttachments(attachments.filter(item => item.id !== assetId));
    } else {
      Alert.alert('Detachment Error', res.message || globalError);
    }
  };

  return (
    <Screen>
      <Header
        title={editingPostId ? 'Edit Post' : 'New Post'}
        rightElement={editingPostId && <Text style={{ color: theme.colors.error, fontWeight: 'bold' }}>Delete</Text>}
        onRightPress={handleDelete}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.form}>
          <Input
            label="Post Title (Optional)"
            placeholder="Introduce your campaign title"
            value={title}
            onChangeText={handleTitleChange}
          />

          <View style={styles.editorContainer}>
            <Input
              label="Content"
              placeholder="What would you like to share today?"
              value={content}
              onChangeText={handleContentChange}
            />
            <Text style={[styles.charCounter, { color: theme.colors.textMuted }]}>
              {content.length} characters (Max 20,000)
            </Text>
          </View>

          {/* ATTACHMENT DISPLAY CARD */}
          <View style={styles.attachmentsSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Media Attachments</Text>
            {attachments.length === 0 ? (
              <Text style={{ color: theme.colors.textMuted, fontSize: 13, marginBottom: 8 }}>No attachments yet.</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.attachmentScroll}>
                {attachments.map((item) => (
                  <View key={item.id} style={styles.thumbWrapper}>
                    <Image source={{ uri: item.fileUrl }} style={styles.miniThumb} />
                    <TouchableOpacity onPress={() => handleDetachMedia(item.id)} style={styles.closeBtn}>
                      <Text style={{ color: '#ffffff', fontSize: 10, fontWeight: 'bold' }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
            <Button title="Attach Media Asset" variant="outline" onPress={() => setIsMediaModalOpen(true)} />
          </View>

          {/* AI COPILOT SECTION */}
          <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>✨ Gemini AI Copilot</Text>
            
            <Input
              placeholder="Describe what to generate or instruction..."
              value={aiPrompt}
              onChangeText={setAiPrompt}
            />

            <View style={styles.row}>
              <Button title="Generate" onPress={() => handleAICopilot('GENERATE')} style={styles.rowBtn} />
              <Button title="Rewrite" variant="outline" onPress={() => handleAICopilot('REWRITE')} style={styles.rowBtn} />
            </View>
            <View style={styles.row}>
              <Button title="Shorten" variant="outline" onPress={() => handleAICopilot('SHORTEN')} style={styles.rowBtn} />
              <Button title="Expand" variant="outline" onPress={() => handleAICopilot('EXPAND')} style={styles.rowBtn} />
            </View>
          </View>

          {/* SCHEDULER SECTION */}
          <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>📅 Scheduling Details</Text>
            
            <Input
              label="Schedule Date & Time (ISO 8601)"
              placeholder="YYYY-MM-DDTHH:MM:SSZ"
              value={scheduledAt}
              onChangeText={setScheduledAt}
            />

            <Button
              title="Schedule Publication"
              variant="secondary"
              onPress={handleSchedule}
              disabled={!editingPostId}
            />
            {!editingPostId && (
              <Text style={[styles.tip, { color: theme.colors.textMuted }]}>
                * You must save the post first to schedule publication.
              </Text>
            )}
          </View>

          <Button title="Save Post Draft" onPress={handleSave} loading={isLoading} style={styles.saveButton} />
        </View>
      </ScrollView>

      {/* MEDIA SELECTOR MODAL */}
      <Modal visible={isMediaModalOpen} animationType="slide">
        <Screen>
          <Header title="Choose Media Asset" rightElement={<Text style={{ color: theme.colors.primary }}>Cancel</Text>} onRightPress={() => setIsMediaModalOpen(false)} />
          <FlatList
            data={mediaAssets}
            keyExtractor={(item) => item.id}
            numColumns={3}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleAttachMedia(item)} style={styles.modalCell}>
                <Image source={{ uri: item.fileUrl }} style={styles.modalThumb} />
              </TouchableOpacity>
            )}
            style={{ marginTop: 16 }}
          />
        </Screen>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: 16
  },
  form: {
    flex: 1
  },
  editorContainer: {
    marginBottom: 16
  },
  charCounter: {
    alignSelf: 'flex-end',
    fontSize: 12,
    marginTop: 4
  },
  attachmentsSection: {
    marginVertical: 8
  },
  attachmentScroll: {
    flexDirection: 'row',
    marginBottom: 8
  },
  thumbWrapper: {
    position: 'relative',
    marginRight: 12
  },
  miniThumb: {
    width: 60,
    height: 60,
    borderRadius: 6
  },
  closeBtn: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  section: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 12
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4
  },
  rowBtn: {
    flex: 0.48,
    marginVertical: 0
  },
  tip: {
    fontSize: 11,
    marginTop: 8,
    textAlign: 'center'
  },
  saveButton: {
    marginTop: 16
  },
  modalCell: {
    width: '32%',
    aspectRatio: 1,
    margin: '0.6%',
    borderRadius: 4,
    overflow: 'hidden'
  },
  modalThumb: {
    width: '100%',
    height: '100%'
  }
});

export default CreatePostScreen;
