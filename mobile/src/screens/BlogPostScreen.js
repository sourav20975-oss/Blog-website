import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { deletePost, fetchPost, subscribeToLiveSync } from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../components/PostCard';
import Header from '../components/Header';
import MarkdownViewer from '../components/MarkdownViewer';

export default function BlogPostScreen({ route, navigation }) {
  const { slug } = route.params || {};
  const { colors } = useTheme();
  const { isAdmin } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadPost = useCallback(
    async (isManualRefresh = false) => {
      if (!slug) return;
      if (isManualRefresh) setRefreshing(true);
      else if (!post) setLoading(true);
      setError('');

      try {
        const res = await fetchPost(slug);
        setPost(res);
      } catch (err) {
        setError(err.message || 'Post not found');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [slug]
  );

  useFocusEffect(
    useCallback(() => {
      loadPost();
    }, [loadPost])
  );

  useEffect(() => {
    const unsubscribe = subscribeToLiveSync((event, payload) => {
      if (event === 'post_updated' && payload?.slug === slug) {
        loadPost();
      } else if (event === 'post_deleted' && payload?.slug === slug) {
        if (navigation?.canGoBack && navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('MainTabs', { screen: 'Home' });
        }
      }
    });
    return unsubscribe;
  }, [slug, loadPost, navigation]);

  const handleDelete = () => {
    Alert.alert('Delete Post', `Are you sure you want to delete "${post?.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePost(slug);
            if (navigation?.canGoBack && navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('MainTabs', { screen: 'Home' });
            }
          } catch (err) {
            Alert.alert('Error', err.message || 'Failed to delete post');
          }
        },
      },
    ]);
  };

  const handleBackLink = () => {
    if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs', { screen: 'Home' });
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.surface }]}>
      <Header navigation={navigation} showBack title={post?.title || 'Blog Post'} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading article...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Feather name="alert-triangle" size={36} color={colors.danger} />
          <Text style={[styles.errorHeading, { color: colors.text }]}>Oops!</Text>
          <Text style={[styles.errorMessage, { color: colors.textMuted }]}>{error}</Text>
          <TouchableOpacity
            onPress={handleBackLink}
            style={[styles.backHomeBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.backHomeBtnText}>← Back to Home</Text>
          </TouchableOpacity>
        </View>
      ) : post ? (
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadPost(true)}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {/* Back link */}
          <TouchableOpacity
            onPress={handleBackLink}
            style={styles.backLink}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="arrow-left" size={14} color={colors.textMuted} />
            <Text style={[styles.backLinkText, { color: colors.textMuted }]}>All Posts</Text>
          </TouchableOpacity>

          {/* Cover Image */}
          {post.coverImage ? (
            <View style={[styles.coverContainer, { borderColor: colors.border }]}>
              <Image source={{ uri: post.coverImage }} style={styles.coverImage} resizeMode="cover" />
            </View>
          ) : null}

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>{post.title}</Text>

          {/* Quote */}
          {post.quote ? (
            <View style={[styles.quoteBox, { backgroundColor: colors.quoteBg, borderLeftColor: colors.quoteBorder }]}>
              <Text style={[styles.quoteText, { color: colors.textSecondary }]}>
                &ldquo;{post.quote}&rdquo;
              </Text>
            </View>
          ) : null}

          {/* Meta Info */}
          <View style={[styles.metaRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.authorText, { color: colors.textMuted }]}>
              By <Text style={{ color: colors.text, fontWeight: '700' }}>{post.author || 'Sourav Kumar'}</Text>
            </Text>
            <Text style={[styles.dateText, { color: colors.textMuted }]}>
              Updated: {formatDate(post.updatedAt)}
            </Text>
          </View>

          {/* Admin Edit/Delete bar */}
          {isAdmin && (
            <View style={styles.adminBar}>
              <TouchableOpacity
                onPress={() => navigation.navigate('EditPost', { slug: post.slug })}
                style={[styles.adminBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Feather name="edit-3" size={14} color={colors.text} />
                <Text style={[styles.adminBtnText, { color: colors.text }]}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDelete}
                style={[styles.adminBtn, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }]}
              >
                <Feather name="trash-2" size={14} color={colors.danger} />
                <Text style={[styles.adminBtnText, { color: colors.danger }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Article Markdown */}
          <View style={styles.articleBody}>
            <MarkdownViewer>{post.content}</MarkdownViewer>
          </View>
        </ScrollView>
      ) : null}
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  errorHeading: {
    fontSize: 20,
    fontWeight: '800',
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  backHomeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backHomeBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  contentContainer: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 50,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 14,
  },
  backLinkText: {
    fontSize: 13,
  },
  coverContainer: {
    width: '100%',
    height: 210,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 34,
    marginBottom: 10,
  },
  quoteBox: {
    borderLeftWidth: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 6,
    marginVertical: 10,
  },
  quoteText: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 14,
  },
  authorText: {
    fontSize: 13,
  },
  dateText: {
    fontSize: 12,
  },
  adminBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginBottom: 14,
  },
  adminBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  adminBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  articleBody: {
    marginTop: 6,
  },
});
