import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fetchPost, updatePost } from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import PostForm from '../components/PostForm';

export default function EditPostScreen({ route, navigation }) {
  const { slug } = route.params || {};
  const { colors } = useTheme();
  const { isAdmin, isLoggedIn } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchPost(slug)
      .then(setPost)
      .catch((err) => setError(err.message || 'Failed to load post'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (!isLoggedIn || !isAdmin) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.surface }]}>
        <Header navigation={navigation} showBack title="Edit Post" />
        <View style={styles.restrictedContainer}>
          <Text style={[styles.restrictedHeading, { color: colors.text }]}>Admin Access Required</Text>
          <Text style={[styles.restrictedMessage, { color: colors.textMuted }]}>
            You must be logged in as an administrator to edit posts.
          </Text>
        </View>
      </View>
    );
  }

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setError('');
    try {
      const updated = await updatePost(slug, formData);
      navigation.replace('BlogPost', { slug: updated.slug || slug });
    } catch (err) {
      setError(err.message || 'Failed to update post');
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.surface }]}>
      <Header navigation={navigation} showBack title="Edit Post" />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading post details...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
          <Text style={[styles.pageTitle, { color: colors.text }]}>Edit Post</Text>
          <Text style={[styles.pageSubtitle, { color: colors.textMuted }]} numberOfLines={1}>
            {post?.title}
          </Text>

          <View style={styles.formContainer}>
            <PostForm initial={post} onSubmit={handleSubmit} submitting={submitting} error={error} />
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
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
