import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { uploadImage } from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import MarkdownEditor from './MarkdownEditor';

export default function PostForm({ initial, onSubmit, submitting, error }) {
  const { colors } = useTheme();

  const [form, setForm] = useState({
    title: initial?.title || '',
    slug: initial?.slug || '',
    author: initial?.author || 'Sourav Kumar',
    quote: initial?.quote || '',
    coverImage: initial?.coverImage || '',
    content: initial?.content || '',
  });

  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [coverUploading, setCoverUploading] = useState(false);

  const handleTitleChange = (val) => {
    if (!slugTouched) {
      const autoSlug = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setForm((prev) => ({ ...prev, title: val, slug: autoSlug }));
    } else {
      setForm((prev) => ({ ...prev, title: val }));
    }
  };

  const handlePickCoverImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission required', 'Please allow photo gallery access to upload a cover image.');
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!res.canceled && res.assets && res.assets[0]) {
      const asset = res.assets[0];
      setCoverUploading(true);
      try {
        const uploadRes = await uploadImage({
          uri: asset.uri,
          name: asset.fileName || 'cover.jpg',
          type: asset.mimeType || 'image/jpeg',
        });
        if (uploadRes?.url) {
          setForm((prev) => ({ ...prev, coverImage: uploadRes.url }));
        }
      } catch (err) {
        Alert.alert('Upload Failed', err.message || 'Could not upload cover image');
      } finally {
        setCoverUploading(false);
      }
    }
  };

  const handleSubmit = () => {
    if (!form.title.trim()) {
      Alert.alert('Validation Error', 'Title is required');
      return;
    }
    if (!form.content.trim()) {
      Alert.alert('Validation Error', 'Content is required');
      return;
    }
    onSubmit(form);
  };

  return (
    <View style={styles.container}>
      {error ? (
        <View style={[styles.errorBox, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }]}>
          <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
        </View>
      ) : null}

      {/* Title */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textMuted }]}>Title *</Text>
        <TextInput
          value={form.title}
          onChangeText={handleTitleChange}
          placeholder="My Awesome Tutorial"
          placeholderTextColor={colors.placeholder}
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
        />
      </View>

      {/* Slug */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textMuted }]}>Slug</Text>
        <TextInput
          value={form.slug}
          onChangeText={(val) => {
            setSlugTouched(true);
            setForm((prev) => ({ ...prev, slug: val }));
          }}
          placeholder="auto-generated-from-title"
          placeholderTextColor={colors.placeholder}
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
        />
      </View>

      {/* Author */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textMuted }]}>Author</Text>
        <TextInput
          value={form.author}
          onChangeText={(val) => setForm((prev) => ({ ...prev, author: val }))}
          placeholder="Author name"
          placeholderTextColor={colors.placeholder}
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
        />
      </View>

      {/* Cover Image */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textMuted }]}>Cover Image</Text>
        <View style={styles.coverRow}>
          <TextInput
            value={form.coverImage}
            onChangeText={(val) => setForm((prev) => ({ ...prev, coverImage: val }))}
            placeholder="Image URL or pick image"
            placeholderTextColor={colors.placeholder}
            style={[
              styles.input,
              { flex: 1, backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
            ]}
          />
          <TouchableOpacity
            onPress={handlePickCoverImage}
            disabled={coverUploading}
            style={[styles.uploadBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            {coverUploading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <Feather name="upload" size={14} color={colors.text} />
                <Text style={[styles.uploadBtnText, { color: colors.text }]}>Pick</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {form.coverImage ? (
          <View style={[styles.coverPreviewBox, { borderColor: colors.border }]}>
            <Image source={{ uri: form.coverImage }} style={styles.coverPreview} resizeMode="cover" />
          </View>
        ) : null}
      </View>

      {/* Quote */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textMuted }]}>Short Quote / Description</Text>
        <TextInput
          value={form.quote}
          onChangeText={(val) => setForm((prev) => ({ ...prev, quote: val }))}
          placeholder="One line description..."
          placeholderTextColor={colors.placeholder}
          multiline
          numberOfLines={2}
          style={[
            styles.input,
            styles.textAreaSmall,
            { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
          ]}
        />
      </View>

      {/* Content Markdown */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textMuted }]}>Content (Markdown) *</Text>
        <MarkdownEditor
          value={form.content}
          onChange={(val) => setForm((prev) => ({ ...prev, content: val }))}
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={submitting}
        style={[
          styles.saveButton,
          { backgroundColor: colors.primary },
          submitting && { opacity: 0.6 },
        ]}
      >
        {submitting ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <>
            <Feather name="check-circle" size={18} color="#ffffff" />
            <Text style={styles.saveButtonText}>Save Post</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  errorBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    height: 46,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  textAreaSmall: {
    height: 70,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  coverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  uploadBtn: {
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  uploadBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  coverPreviewBox: {
    marginTop: 10,
    height: 160,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  coverPreview: {
    width: '100%',
    height: '100%',
  },
  saveButton: {
    height: 50,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
