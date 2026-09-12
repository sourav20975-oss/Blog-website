import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  deletePost,
  fetchPosts,
  fetchBookmarks,
  toggleBookmark,
  subscribeToLiveSync,
} from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import PostCard from '../components/PostCard';
import SkeletonCard from '../components/SkeletonCard';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 6;
const CATEGORIES = [
  'All',
  'Web Development',
  'Programming',
  'DevOps & Linux',
  'Cloud & AI',
  'System Design',
  'Tutorials',
];
const QUICK_TOPICS = ['Linux', 'SQL', 'Docker', 'React', 'Git'];

export default function HomeScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const { isAdmin } = useAuth();

  const [posts, setPosts] = useState([]);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [query, setQuery] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);

  // Set of saved post slugs for instant, blink-free UI
  const [savedSlugs, setSavedSlugs] = useState(new Set());
  const searchInputRef = useRef(null);
  const initialLoadedRef = useRef(false);

  // Debounce search query
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(query.trim());
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  // Reset to page 1 on query or category change
  useEffect(() => {
    setPage(1);
  }, [debouncedQ, category]);

  // Load saved bookmarks cache
  const loadSavedSlugs = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem('@blogverse_saved_posts');
      if (raw) {
        const list = JSON.parse(raw);
        setSavedSlugs(new Set(list.map((p) => p.slug)));
      }
      // Also fetch from server silently
      fetchBookmarks()
        .then((res) => {
          if (res?.bookmarks) {
            const serverSlugs = new Set(
              res.bookmarks.filter((b) => b.itemType === 'post').map((b) => b.itemId || b.slug)
            );
            setSavedSlugs(serverSlugs);
          }
        })
        .catch(() => {});
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    loadSavedSlugs();
  }, [loadSavedSlugs]);

  // Fetch posts with zero screen blinking
  const loadPosts = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) {
        setRefreshing(true);
      } else if (!initialLoadedRef.current) {
        setLoading(true);
      }
      setError('');

      try {
        const res = await fetchPosts({
          page,
          limit: PAGE_SIZE,
          q: debouncedQ,
          category,
        });

        if (res && Array.isArray(res.posts)) {
          setPosts(res.posts);
          setPages(res.pages || 1);
          setTotal(res.total || 0);
        }
      } catch (err) {
        setError(err.message || 'Failed to load posts');
      } finally {
        initialLoadedRef.current = true;
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, debouncedQ, category]
  );

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Silent sync on tab focus without screen flashing
  useFocusEffect(
    useCallback(() => {
      if (initialLoadedRef.current) {
        fetchPosts({ page, limit: PAGE_SIZE, q: debouncedQ, category })
          .then((res) => {
            if (res && Array.isArray(res.posts)) {
              setPosts(res.posts);
              setPages(res.pages || 1);
              setTotal(res.total || 0);
            }
          })
          .catch(() => {});
        loadSavedSlugs();
      }
    }, [page, debouncedQ, category, loadSavedSlugs])
  );

  // Real-time listener for internal CRUD events
  useEffect(() => {
    const unsubscribe = subscribeToLiveSync((event) => {
      if (
        event === 'post_created' ||
        event === 'post_updated' ||
        event === 'post_deleted'
      ) {
        loadPosts();
      } else if (event === 'bookmark_toggled' || event === 'bookmarks_cleared') {
        loadSavedSlugs();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [loadPosts, loadSavedSlugs]);

  // Bookmark toggle handler
  const handleToggleSave = async (post) => {
    const isSaved = savedSlugs.has(post.slug);
    const nextSlugs = new Set(savedSlugs);
    if (isSaved) {
      nextSlugs.delete(post.slug);
    } else {
      nextSlugs.add(post.slug);
    }
    setSavedSlugs(nextSlugs);

    // Sync to local AsyncStorage
    try {
      const raw = await AsyncStorage.getItem('@blogverse_saved_posts');
      let list = raw ? JSON.parse(raw) : [];
      if (!isSaved) {
        list = [post, ...list.filter((p) => p.slug !== post.slug)];
      } else {
        list = list.filter((p) => p.slug !== post.slug);
      }
      await AsyncStorage.setItem('@blogverse_saved_posts', JSON.stringify(list));
    } catch {
      /* ignore */
    }

    // Sync to MongoDB server in background
    try {
      await toggleBookmark({
        itemType: 'post',
        itemId: post.slug,
        title: post.title,
        slug: post.slug,
        author: post.author,
        category: post.category,
        coverImage: post.coverImage,
        readTime: post.readTime,
      });
    } catch {
      /* server sync fallback */
    }
  };

  const handleDeletePost = (post) => {
    Alert.alert('Delete Post', `Are you sure you want to delete "${post.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePost(post.slug);
            loadPosts(true);
          } catch (err) {
            Alert.alert('Error', err.message || 'Failed to delete post');
          }
        },
      },
    ]);
  };

  const renderHeader = () => (
    <View style={styles.headerSection}>
      {/* Editorial Hero Banner (Matching Web Exactly) */}
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            shadowColor: isDark ? '#000000' : '#71717a',
          },
        ]}
      >
        {/* Engineering Status Pill */}
        <View style={[styles.statusPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.statusDot} />
          <Text style={[styles.statusText, { color: colors.text }]}>Engineering Journal</Text>
          <Text style={[styles.statusSep, { color: colors.textMuted }]}>•</Text>
          <Text style={[styles.statusMuted, { color: colors.textSecondary }]}>Open Reference</Text>
        </View>

        {/* Hero Title */}
        <Text style={[styles.heroTitle, { color: colors.text }]}>
          Practical notes for engineers who build systems.
        </Text>

        {/* Hero Subtitle */}
        <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
          In-depth articles covering Linux internals, database architecture, backend engineering, and distributed design.
        </Text>

        {/* High-Craft Search Box */}
        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.placeholder} style={styles.searchIcon} />
          <TextInput
            ref={searchInputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Search articles, topics, commands..."
            placeholderTextColor={colors.placeholder}
            style={[styles.searchInput, { color: colors.text }]}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="x" size={14} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Topic Pills */}
        <View style={styles.topicsRow}>
          <Text style={[styles.topicsLabel, { color: colors.textMuted }]}>Topics:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topicsScroll}>
            {QUICK_TOPICS.map((topic) => {
              const active = query.toLowerCase() === topic.toLowerCase();
              return (
                <TouchableOpacity
                  key={topic}
                  onPress={() => setQuery(active ? '' : topic)}
                  style={[
                    styles.topicChip,
                    {
                      backgroundColor: active ? colors.badgeBg : colors.surface,
                      borderColor: active ? colors.primaryBorder : colors.border,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.topicChipText,
                      { color: active ? colors.primary : colors.textSecondary },
                    ]}
                  >
                    #{topic}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* Horizontal Category Filter Bar (Matching Web) */}
      <View style={styles.categoriesSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    {
                      color: isSelected ? '#ffffff' : colors.textSecondary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Section Title Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {category === 'All' ? 'Articles & Tutorials' : category}
          </Text>
          <View style={[styles.countBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.countText, { color: colors.textMuted }]}>{total}</Text>
          </View>
        </View>

        {isAdmin && (
          <TouchableOpacity
            onPress={() => navigation.navigate('CreatePost')}
            style={[styles.writeBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={14} color="#ffffff" />
            <Text style={styles.writeBtnText}>Write</Text>
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <View style={[styles.errorCard, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }]}>
          <Feather name="alert-circle" size={15} color={colors.danger} />
          <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.surface }]}>
      <Header
        navigation={navigation}
        onSearchPress={() => searchInputRef.current?.focus()}
      />

      <FlatList
        data={posts}
        keyExtractor={(item) => item.slug || item._id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            isAdmin={isAdmin}
            isSaved={savedSlugs.has(item.slug)}
            onToggleSave={handleToggleSave}
            onPress={() => navigation.navigate('BlogPost', { slug: item.slug })}
            onEdit={() => navigation.navigate('EditPost', { slug: item.slug })}
            onDelete={() => handleDeletePost(item)}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={() => {
          if (loading && posts.length === 0) {
            return (
              <View style={{ paddingHorizontal: 0 }}>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </View>
            );
          }
          return (
            <View style={styles.emptyContainer}>
              <Feather name="book-open" size={36} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                {debouncedQ
                  ? `No articles found for "${debouncedQ}"`
                  : category !== 'All'
                  ? `No articles found in ${category}`
                  : 'No articles published yet.'}
              </Text>
            </View>
          );
        }}
        ListFooterComponent={() => (
          <Pagination
            page={page}
            pages={pages}
            total={total}
            currentCount={posts.length}
            onPageChange={(newPage) => setPage(newPage)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadPosts(true)}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  headerSection: {
    paddingTop: 14,
    paddingBottom: 10,
  },
  heroCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 16,
  },
  statusPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusSep: {
    fontSize: 10,
  },
  statusMuted: {
    fontSize: 11,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.6,
    lineHeight: 28,
  },
  heroSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
    marginTop: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  topicsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  topicsLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  topicsScroll: {
    gap: 6,
    paddingRight: 10,
  },
  topicChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  topicChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  categoriesSection: {
    marginBottom: 16,
  },
  categoriesScroll: {
    gap: 8,
    paddingRight: 8,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  countBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
  },
  writeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  writeBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12.5,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 240,
  },
});
