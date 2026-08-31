import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { createPost } from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import PostForm from '../components/PostForm';

export default function CreatePostScreen({ navigation }) {
  const { colors } = useTheme();
  const { isAdmin, isLoggedIn } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isLoggedIn || !isAdmin) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.surface }]}>
        <Header navigation={navigation} showBack title="Write Post" />
        <View style={styles.restrictedContainer}>
          <Text style={[styles.restrictedHeading, { color: colors.text }]}>Admin Access Required</Text>
          <Text style={[styles.restrictedMessage, { color: colors.textMuted }]}>
            You must be logged in as an administrator to write posts.
          </Text>
        </View>
      </View>
    );
  }

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setError('');
    try {
      const created = await createPost(formData);
      navigation.replace('BlogPost', { slug: created.slug });
    } catch (err) {
      setError(err.message || 'Failed to create post');
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.surface }]}>
      <Header navigation={navigation} showBack title="Write Post" />

      <ScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
        <Text style={[styles.pageTitle, { color: colors.text }]}>Write a New Post</Text>
        <Text style={[styles.pageSubtitle, { color: colors.textMuted }]}>
          Markdown supported — headings, code snippets, tables, lists, and images.
        </Text>

        <View style={styles.formContainer}>
          <PostForm onSubmit={handleSubmit} submitting={submitting} error={error} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 13,
    marginBottom: 20,
    lineHeight: 18,
  },
  formContainer: {
    marginTop: 4,
  },
  restrictedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  restrictedHeading: {
    fontSize: 18,
    fontWeight: '700',
  },
  restrictedMessage: {
    fontSize: 14,
    textAlign: 'center',
  },
});
