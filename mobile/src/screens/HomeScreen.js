import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { deletePost, fetchPosts, subscribeToLiveSync } from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import PostCard from '../components/PostCard';
import SkeletonCard from '../components/SkeletonCard';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 6;

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const { isAdmin } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [page, setPage] = useState(1);

  // Debounce search query
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(query.trim());
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  // Reset to page 1 on query change
  useEffect(() => {
    setPage(1);
  }, [debouncedQ]);

  const loadData = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setRefreshing(true);
      else if (!data) setLoading(true);
      setError('');

      try {
        const res = await fetchPosts({ page, limit: PAGE_SIZE, q: debouncedQ });
        setData(res);
      } catch (err) {
        setError(err.message || 'Failed to load posts');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, debouncedQ]
  );

  // Auto sync on focus & query change
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Real-time listener for internal and external sync
  useEffect(() => {
    const unsubscribe = subscribeToLiveSync(() => {
      loadData();
    });
    // Background polling every 20 seconds to catch website updates live
    const interval = setInterval(() => {
      loadData();
    }, 20000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [loadData]);

  const handleDeletePost = (post) => {
    Alert.alert('Delete Post', `Are you sure you want to delete "${post.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePost(post.slug);
            loadData(true);
          } catch (err) {
            Alert.alert('Error', err.message || 'Failed to delete post');
          }
        },
      },
    ]);
  };

  const posts = data?.posts || [];
  const pages = data?.pages || 1;
  const total = data?.total || 0;

  const renderHeader = () => (
    <View style={styles.headerSection}>
      {/* Hero */}
      <View style={styles.heroSection}>
        <View style={[styles.heroBadge, { backgroundColor: colors.badgeBg, borderColor: colors.primaryBorder }]}>
          <Text style={[styles.heroBadgeText, { color: colors.badgeText }]}>MERN Stack Blog</Text>
        </View>

        <Text style={[styles.heroTitle, { color: colors.text }]}>
          Learn to <Text style={{ color: colors.primary }}>Code</Text>
        </Text>

        <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
          Tutorials, notes and blogs — all in one place. Free forever.
        </Text>
      </View>

      {/* Search and Action Row */}
      <View style={styles.controlsRow}>
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.placeholder} style={styles.searchIcon} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by title or author..."
            placeholderTextColor={colors.placeholder}
            style={[styles.searchInput, { color: colors.text }]}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
              <Feather name="x" size={14} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {isAdmin && (
          <TouchableOpacity
            onPress={() => navigation.navigate('CreatePost')}
            style={[styles.writeBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={16} color="#ffffff" />
            <Text style={styles.writeBtnText}>Write Post</Text>
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <View style={[styles.errorCard, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }]}>
          <Feather name="alert-circle" size={16} color={colors.danger} />
          <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.surface }]}>
      <Header navigation={navigation} />

      <FlatList
        data={loading ? [] : posts}
        keyExtractor={(item) => item.slug || item._id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            isAdmin={isAdmin}
            onPress={() => navigation.navigate('BlogPost', { slug: item.slug })}
            onEdit={() => navigation.navigate('EditPost', { slug: item.slug })}
            onDelete={() => handleDeletePost(item)}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={() => {
          if (loading) {
            return (
              <View style={{ paddingHorizontal: 16 }}>
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
                {debouncedQ ? `No posts found for "${debouncedQ}"` : 'No posts published yet.'}
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
            onRefresh={() => loadData(true)}
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
    paddingBottom: 30,
  },
  headerSection: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  heroBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 10,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    marginBottom: 6,
  },
  searchBox: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  writeBtn: {
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  writeBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 10,
  },
  errorText: {
    fontSize: 13,
    flex: 1,
  },
  emptyContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
