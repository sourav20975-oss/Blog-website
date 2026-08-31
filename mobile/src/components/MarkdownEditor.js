import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { uploadImage } from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import MarkdownViewer from './MarkdownViewer';

export default function MarkdownEditor({ value = '', onChange }) {
  const { colors } = useTheme();
  const [mode, setMode] = useState('write'); // 'write' or 'preview'
  const [uploading, setUploading] = useState(false);
  const [cursorPos, setCursorPos] = useState({ start: 0, end: 0 });

  function insertText(prefix, suffix = '', placeholder = '') {
    const start = cursorPos.start ?? value.length;
    const end = cursorPos.end ?? value.length;
    const selected = value.substring(start, end);
    const inner = selected || placeholder;
    const replacement = prefix + inner + suffix;
    const nextVal = value.substring(0, start) + replacement + value.substring(end);
    onChange(nextVal);
  }

  function insertLinePrefix(prefix) {
    const start = cursorPos.start ?? 0;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const nextVal = value.substring(0, lineStart) + prefix + value.substring(lineStart);
    onChange(nextVal);
  }

  async function handlePickImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Please grant photo gallery permission to upload images.');
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!res.canceled && res.assets && res.assets[0]) {
      const asset = res.assets[0];
      setUploading(true);
      try {
        const uploadRes = await uploadImage({
          uri: asset.uri,
          name: asset.fileName || 'blog-image.jpg',
          type: asset.mimeType || 'image/jpeg',
        });
        if (uploadRes?.url) {
          const alt = (asset.fileName || 'image').replace(/\.[^.]+$/, '');
          insertText(`\n![${alt}](${uploadRes.url})\n`);
        }
      } catch (err) {
        Alert.alert('Upload Failed', err.message || 'Could not upload image');
      } finally {
        setUploading(false);
      }
    }
  }

  const words = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Top Bar with Toolbar & Mode Switcher */}
      <View style={[styles.toolbarHeader, { borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarRow}>
          <TouchableOpacity
            onPress={() => insertText('**', '**', 'bold text')}
            style={[styles.tBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            accessibilityLabel="Bold"
          >
            <Feather name="bold" size={14} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => insertText('*', '*', 'italic text')}
            style={[styles.tBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            accessibilityLabel="Italic"
          >
            <Feather name="italic" size={14} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => insertLinePrefix('# ')}
            style={[styles.tBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={[styles.tBtnText, { color: colors.text }]}>H1</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => insertLinePrefix('## ')}
            style={[styles.tBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={[styles.tBtnText, { color: colors.text }]}>H2</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => insertLinePrefix('> ')}
            style={[styles.tBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Feather name="message-square" size={14} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => insertLinePrefix('- ')}
            style={[styles.tBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Feather name="list" size={14} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => insertText('`', '`', 'code')}
            style={[styles.tBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Feather name="code" size={14} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => insertText('\n```javascript\n', '\n```\n', '// code here')}
            style={[styles.tBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <MaterialCommunityIcons name="code-braces" size={16} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => insertText('[', '](https://)', 'link text')}
            style={[styles.tBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Feather name="link" size={14} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePickImage}
            disabled={uploading}
            style={[styles.tBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            {uploading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Feather name="image" size={14} color={colors.text} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              insertText(
                '\n| Col 1 | Col 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |\n\n'
              )
            }
            style={[styles.tBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Feather name="grid" size={14} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => insertText('\n\n---\n\n')}
            style={[styles.tBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Feather name="minus" size={14} color={colors.text} />
          </TouchableOpacity>
        </ScrollView>

        {/* Mode toggle */}
        <View style={styles.modeSwitchContainer}>
          <TouchableOpacity
            onPress={() => setMode('write')}
            style={[
              styles.modeBtn,
              mode === 'write' && { backgroundColor: colors.primary },
            ]}
          >
            <Text
              style={[
                styles.modeBtnText,
                { color: mode === 'write' ? '#ffffff' : colors.textMuted },
              ]}
            >
              Write
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setMode('preview')}
            style={[
              styles.modeBtn,
              mode === 'preview' && { backgroundColor: colors.primary },
            ]}
          >
            <Text
              style={[
                styles.modeBtnText,
                { color: mode === 'preview' ? '#ffffff' : colors.textMuted },
              ]}
            >
              Preview
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Editor or Preview area */}
      {mode === 'write' ? (
        <View style={styles.inputWrapper}>
          <TextInput
            value={value}
            onChangeText={onChange}
            onSelectionChange={(e) => setCursorPos(e.nativeEvent.selection)}
            placeholder={'# Write your content in Markdown...\n\nSupports headings, bold, code blocks, lists, quotes, and images.'}
            placeholderTextColor={colors.placeholder}
            multiline
            textAlignVertical="top"
            style={[
              styles.textArea,
              {
                color: colors.text,
                backgroundColor: 'transparent',
              },
            ]}
          />
          <View style={[styles.statusBar, { borderTopColor: colors.border }]}>
            <Text style={[styles.statsText, { color: colors.textMuted }]}>
              {words} words · {value.length} characters
            </Text>
            <Text style={[styles.statsText, { color: colors.textMuted }]}>Markdown</Text>
          </View>
        </View>
      ) : (
        <ScrollView style={styles.previewContainer} nestedScrollEnabled>
          {value.trim() ? (
            <MarkdownViewer>{value}</MarkdownViewer>
          ) : (
            <Text style={{ color: colors.textMuted, fontStyle: 'italic', padding: 16 }}>
              Preview will appear here...
            </Text>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    minHeight: 280,
  },
  toolbarHeader: {
    padding: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 8,
  },
  tBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  modeSwitchContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 6,
    padding: 2,
  },
  modeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 5,
  },
  modeBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  inputWrapper: {
    flex: 1,
  },
  textArea: {
    minHeight: 220,
    maxHeight: 400,
    padding: 12,
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 21,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  statsText: {
    fontSize: 11,
  },
  previewContainer: {
    padding: 16,
    minHeight: 220,
    maxHeight: 400,
  },
});
