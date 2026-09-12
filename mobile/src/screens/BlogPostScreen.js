import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import {
  deletePost,
  fetchPost,
  likePost,
  fetchComments,
  createComment,
  deleteComment,
  toggleBookmark,
  subscribeToLiveSync,
} from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../components/PostCard';
import Header from '../components/Header';
import MarkdownViewer from '../components/MarkdownViewer';

function timeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function BlogPostScreen({ route, navigation }) {
  const { slug } = route.params || {};
  const { colors } = useTheme();
  const { user, isAdmin } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Likes state
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // Bookmark state
  const [saved, setSaved] = useState(false);

  // Comments state
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [guestName, setGuestName] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const loadPost = useCallback(
    async (isManualRefresh = false) => {
      if (!slug) return;
      if (isManualRefresh) setRefreshing(true);
      else if (!post) setLoading(true);
      setError('');

      try {
        const res = await fetchPost(slug);
        setPost(res);
        setLikesCount(res.likes || 0);

        // Load comments
        try {
          setCommentsLoading(true);
          const cRes = await fetchComments(slug);
          setComments(cRes.comments || []);
        } catch {
          /* ignore */
        } finally {
          setCommentsLoading(false);
        }

        // Check local saved status
        try {
          const raw = await AsyncStorage.getItem('@blogverse_saved_posts');
          if (raw) {
            const list = JSON.parse(raw);
            setSaved(list.some((p) => p.slug === slug));
          }
          const likedRaw = await AsyncStorage.getItem(`@blogverse_liked_${slug}`);
          setLiked(likedRaw === 'true');
        } catch {
          /* ignore */
        }
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
      } else if (event === 'comment_created' && payload?.slug === slug) {
        setComments((prev) => [payload.comment, ...prev]);
      } else if (event === 'comment_deleted' && payload?.slug === slug) {
        setComments((prev) => prev.filter((c) => c._id !== payload.commentId));
      }
    });
    return unsubscribe;
  }, [slug, loadPost, navigation]);

  const handleLike = async () => {
    if (liked) return;
    setLiked(true);
    setLikesCount((prev) => prev + 1);
    try {
      await AsyncStorage.setItem(`@blogverse_liked_${slug}`, 'true');
      await likePost(slug);
    } catch {
      /* ignore */
    }
  };

  const handleToggleSave = async () => {
    const nextState = !saved;
    setSaved(nextState);

    try {
      const raw = await AsyncStorage.getItem('@blogverse_saved_posts');
      let list = raw ? JSON.parse(raw) : [];
      if (nextState) {
        list = [post, ...list.filter((p) => p.slug !== slug)];
      } else {
        list = list.filter((p) => p.slug !== slug);
      }
      await AsyncStorage.setItem('@blogverse_saved_posts', JSON.stringify(list));

      await toggleBookmark({
        itemType: 'post',
        itemId: slug,
        title: post.title,
        slug: post.slug,
        author: post.author,
        category: post.category,
        coverImage: post.coverImage,
        readTime: post.readTime,
      });
    } catch (err) {
      console.error('Bookmark toggle failed:', err);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const payload = {
        content: commentText.trim(),
      };
      if (!user) {
        payload.userName = guestName.trim() || 'Mobile Reader';
      }
      const newComment = await createComment(slug, payload);
      setComments((prev) => [newComment, ...prev]);
      setCommentText('');
    } catch (err) {
      Alert.alert('Comment Failed', err.message || 'Could not post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = (commentId) => {
    Alert.alert('Delete Comment', 'Are you sure you want to remove this comment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteComment(slug, commentId);
            setComments((prev) => prev.filter((c) => c._id !== commentId));
          } catch (err) {
            Alert.alert('Error', err.message || 'Failed to delete comment');
          }
        },
      },
    ]);
  };

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
      <Header
        title={post?.title || 'Article'}
        showBack
        onBack={() => {
          if (navigation?.canGoBack && navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate('MainTabs', { screen: 'Home' });
          }
        }}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading article...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
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
          {/* Back link & Category */}
          <View style={styles.topNavRow}>
            <TouchableOpacity
              onPress={handleBackLink}
              style={styles.backLink}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="arrow-left" size={14} color={colors.textMuted} />
              <Text style={[styles.backLinkText, { color: colors.textMuted }]}>All Notes</Text>
            </TouchableOpacity>

            {post.category ? (
              <View style={[styles.catBadge, { backgroundColor: colors.badgeBg, borderColor: colors.primaryBorder }]}>
                <Text style={[styles.catBadgeText, { color: colors.primary }]}>{post.category}</Text>
              </View>
            ) : null}
          </View>

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

          {/* Meta Info & Actions Bar */}
          <View style={[styles.metaRow, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.authorText, { color: colors.textMuted }]}>
                By <Text style={{ color: colors.text, fontWeight: '700' }}>{post.author || 'Sourav Kumar'}</Text>
              </Text>
              <Text style={[styles.dateText, { color: colors.textMuted }]}>
                {formatDate(post.updatedAt || post.createdAt)} • {post.readTime || 3} min read
              </Text>
            </View>

            {/* Quick Actions (Like & Bookmark) */}
            <View style={styles.iconActionsRow}>
              <TouchableOpacity
                onPress={handleLike}
                style={[
                  styles.roundActionBtn,
                  {
                    backgroundColor: liked ? 'rgba(239, 68, 68, 0.12)' : colors.card,
                    borderColor: liked ? 'rgba(239, 68, 68, 0.3)' : colors.border,
                  },
                ]}
              >
                <Feather
                  name="heart"
                  size={15}
                  color={liked ? '#ef4444' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.roundActionText,
                    { color: liked ? '#ef4444' : colors.textSecondary },
                  ]}
                >
                  {likesCount}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleToggleSave}
                style={[
                  styles.roundActionBtn,
                  {
                    backgroundColor: saved ? colors.badgeBg : colors.card,
                    borderColor: saved ? colors.primaryBorder : colors.border,
                  },
                ]}
              >
                <Feather
                  name="bookmark"
                  size={15}
                  color={saved ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.roundActionText,
                    { color: saved ? colors.primary : colors.textSecondary },
                  ]}
                >
                  {saved ? 'Saved' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Cover Image */}
          {post.coverImage ? (
            <View style={[styles.coverContainer, { borderColor: colors.border }]}>
              <Image source={{ uri: post.coverImage }} style={styles.coverImage} resizeMode="cover" />
            </View>
          ) : null}

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

          {/* Tags */}
          {post.tags && post.tags.length > 0 ? (
            <View style={[styles.tagsSection, { borderTopColor: colors.border }]}>
              <Text style={[styles.tagsHeading, { color: colors.textMuted }]}>Related Tags:</Text>
              <View style={styles.tagsRow}>
                {post.tags.map((tag, i) => (
                  <View key={i} style={[styles.tagChip, { backgroundColor: colors.badgeBg }]}>
                    <Text style={[styles.tagChipText, { color: colors.primary }]}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Comments Section */}
          <View style={[styles.commentsSection, { borderTopColor: colors.border }]}>
            <View style={styles.commentsHeader}>
              <Feather name="message-square" size={18} color={colors.primary} />
              <Text style={[styles.commentsTitle, { color: colors.text }]}>
                Discussion ({comments.length})
              </Text>
            </View>

            {/* Comment Box */}
            <View style={[styles.commentForm, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {!user ? (
                <TextInput
                  value={guestName}
                  onChangeText={setGuestName}
                  placeholder="Your Name (e.g. Alex)"
                  placeholderTextColor={colors.placeholder}
                  style={[styles.guestNameInput, { borderColor: colors.border, color: colors.text }]}
                />
              ) : null}

              <TextInput
                value={commentText}
                onChangeText={setCommentText}
                placeholder="Share a thoughtful remark or question..."
                placeholderTextColor={colors.placeholder}
                multiline
                numberOfLines={3}
                style={[styles.commentInput, { color: colors.text }]}
              />

              <TouchableOpacity
                onPress={handleAddComment}
                disabled={submittingComment || !commentText.trim()}
                style={[
                  styles.commentSubmitBtn,
                  { backgroundColor: colors.primary },
                  (!commentText.trim() || submittingComment) && { opacity: 0.5 },
                ]}
              >
                {submittingComment ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Feather name="send" size={13} color="#ffffff" />
                    <Text style={styles.commentSubmitText}>Post Comment</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Comment List */}
            {commentsLoading ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 16 }} />
            ) : comments.length === 0 ? (
              <Text style={[styles.noCommentsText, { color: colors.textMuted }]}>
                No comments yet. Start the discussion!
              </Text>
            ) : (
              <View style={styles.commentList}>
                {comments.map((c) => {
                  const canDelete = isAdmin || (user && c.user && (c.user === user.id || c.user === user._id));
                  return (
                    <View
                      key={c._id}
                      style={[styles.commentItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                    >
                      <View style={styles.commentTopRow}>
                        <View style={styles.commentUserBox}>
                          <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
                            <Text style={styles.avatarText}>
                              {(c.userName?.[0] || 'U').toUpperCase()}
                            </Text>
                          </View>
                          <View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <Text style={[styles.commentUserName, { color: colors.text }]}>
                                {c.userName}
                              </Text>
                              {c.role === 'admin' ? (
                                <View style={[styles.roleBadge, { backgroundColor: colors.badgeBg }]}>
                                  <Text style={[styles.roleBadgeText, { color: colors.primary }]}>admin</Text>
                                </View>
                              ) : null}
                            </View>
                            <Text style={[styles.commentTime, { color: colors.textMuted }]}>
                              {timeAgo(c.createdAt)}
                            </Text>
                          </View>
                        </View>

                        {canDelete ? (
                          <TouchableOpacity
                            onPress={() => handleDeleteComment(c._id)}
                            style={styles.deleteCommentBtn}
                          >
                            <Feather name="trash-2" size={13} color={colors.danger} />
                          </TouchableOpacity>
                        ) : null}
                      </View>

                      <Text style={[styles.commentContent, { color: colors.textSecondary }]}>
                        {c.content}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
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
    padding: 24,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  backHomeBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backHomeBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 48,
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    marginBottom: 8,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backLinkText: {
    fontSize: 13,
    fontWeight: '600',
  },
  catBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  catBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  coverContainer: {
    width: '100%',
    height: 210,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    marginVertical: 14,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 23,
    fontWeight: '800',
    lineHeight: 31,
    marginTop: 10,
    marginBottom: 8,
  },
  quoteBox: {
    borderLeftWidth: 4,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 10,
  },
  quoteText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginVertical: 8,
  },
  authorText: {
    fontSize: 13,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
    marginTop: 2,
  },
  iconActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roundActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  roundActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  adminBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 12,
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
    fontWeight: '600',
  },
  articleBody: {
    marginTop: 10,
  },
  tagsSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 16,
    marginTop: 20,
  },
  tagsHeading: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  commentsSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 24,
    marginTop: 24,
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  commentForm: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  guestNameInput: {
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 13,
    marginBottom: 8,
  },
  commentInput: {
    minHeight: 60,
    textAlignVertical: 'top',
    fontSize: 14,
    lineHeight: 20,
  },
  commentSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  commentSubmitText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  noCommentsText: {
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 16,
  },
  commentList: {
    gap: 10,
  },
  commentItem: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  commentTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commentUserBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  commentUserName: {
    fontSize: 13,
    fontWeight: '700',
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  commentTime: {
    fontSize: 10,
  },
  deleteCommentBtn: {
    padding: 4,
  },
  commentContent: {
    fontSize: 13,
    lineHeight: 19,
  },
});
