import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { fetchBookmarks, toggleBookmark, clearBookmarks, subscribeToLiveSync, getPdfViewUrl } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import Header from '../components/Header';

export default function SavedScreen({ navigation }) {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'post' | 'pdf'
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const hasLoadedRef = useRef(false);

  const loadBookmarks = useCallback(async (isManual = false) => {
    if (isManual) {
      setRefreshing(true);
    } else if (!hasLoadedRef.current) {
      setLoading(true);
    }

    try {
      const res = await fetchBookmarks();
      if (res && Array.isArray(res.bookmarks)) {
        setBookmarks(res.bookmarks);
        const posts = res.bookmarks.filter((b) => b.itemType === 'post');
        await AsyncStorage.setItem('@blogverse_saved_posts', JSON.stringify(posts));
      }
    } catch (err) {
      console.warn('Failed to load bookmarks from server:', err.message);
      // Fallback to local cache
      try {
        const raw = await AsyncStorage.getItem('@blogverse_saved_posts');
        if (raw) {
          const cached = JSON.parse(raw).map((p) => ({
            ...p,
            itemId: p.slug,
            itemType: 'post',
          }));
          setBookmarks(cached);
        }
      } catch {
        /* ignore */
      }
    } finally {
      hasLoadedRef.current = true;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (hasLoadedRef.current) {
        fetchBookmarks()
          .then((res) => {
            if (res && Array.isArray(res.bookmarks)) {
              setBookmarks(res.bookmarks);
            }
          })
          .catch(() => {});
      }
    }, [])
  );

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  useEffect(() => {
    const unsubscribe = subscribeToLiveSync((event) => {
      if (event === 'bookmark_toggled' || event === 'bookmarks_cleared') {
        loadBookmarks();
      }
    });
    return unsubscribe;
  }, [loadBookmarks]);

  const handleRemove = async (item) => {
    try {
      setBookmarks((prev) => prev.filter((b) => b.itemId !== item.itemId));
      await toggleBookmark({
        itemType: item.itemType,
        itemId: item.itemId,
      });
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to remove bookmark');
    }
  };

  const handleClearAll = () => {
    Alert.alert('Clear Saved Vault', 'Are you sure you want to remove all saved notes and handbooks?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All',
        style: 'destructive',
        onPress: async () => {
          try {
            setBookmarks([]);
            await clearBookmarks();
            await AsyncStorage.removeItem('@blogverse_saved_posts');
          } catch (err) {
            Alert.alert('Error', err.message || 'Failed to clear saved library');
          }
        },
      },
    ]);
  };

  const filtered = bookmarks.filter((b) => {
    if (activeTab === 'all') return true;
    return b.itemType === activeTab;
  });

  const renderItem = ({ item }) => {
    const isPdf = item.itemType === 'pdf';
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => {
          if (isPdf) {
            Linking.openURL(getPdfViewUrl(item.itemId)).catch(() =>
              Alert.alert('Error', 'Could not open PDF document')
            );
          } else {
            navigation.navigate('BlogPost', { slug: item.slug || item.itemId });
          }
        }}
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        {item.coverImage ? (
          <Image source={{ uri: item.coverImage }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <View style={[styles.cardImagePlaceholder, { backgroundColor: colors.codeBg }]}>
            <Feather name={isPdf ? 'book-open' : 'file-text'} size={24} color={colors.primary} />
          </View>
        )}

        <View style={styles.cardContent}>
          <View style={styles.badgeRow}>
            <View style={[styles.typeBadge, { backgroundColor: isPdf ? 'rgba(59, 130, 246, 0.15)' : colors.badgeBg }]}>
              <Text style={[styles.typeBadgeText, { color: isPdf ? '#3b82f6' : colors.primary }]}>
                {isPdf ? 'Handbook' : item.category || 'Article'}
              </Text>
            </View>

            <TouchableOpacity onPress={() => handleRemove(item)} style={styles.removeBtn}>
              <Feather name="trash-2" size={14} color={colors.danger} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
            {item.title}
          </Text>

          <View style={styles.cardFooter}>
            <Text style={[styles.cardAuthor, { color: colors.textMuted }]}>
              {item.author || 'Sourav Kumar'}
            </Text>
            <View style={styles.actionPrompt}>
              <Text style={[styles.actionPromptText, { color: isPdf ? '#3b82f6' : colors.primary }]}>
                {isPdf ? 'Read PDF' : 'Read Note'}
              </Text>
              <Feather name="arrow-right" size={12} color={isPdf ? '#3b82f6' : colors.primary} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.surface }]}>
      <Header
        title="Saved Library"
        rightAction={
          bookmarks.length > 0 ? (
            <TouchableOpacity onPress={handleClearAll} style={styles.clearHeaderBtn}>
              <Feather name="trash-2" size={16} color={colors.danger} />
            </TouchableOpacity>
          ) : null
        }
      />

      {/* Tabs */}
      <View style={[styles.tabsRow, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => setActiveTab('all')}
          style={[
            styles.tabItem,
            activeTab === 'all' && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'all' ? colors.primary : colors.textMuted, fontWeight: '700' },
            ]}
          >
            All ({bookmarks.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('post')}
          style={[
            styles.tabItem,
            activeTab === 'post' && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'post' ? colors.primary : colors.textMuted, fontWeight: '700' },
            ]}
          >
            Articles ({bookmarks.filter((b) => b.itemType === 'post').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('pdf')}
          style={[
            styles.tabItem,
            activeTab === 'pdf' && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'pdf' ? colors.primary : colors.textMuted, fontWeight: '700' },
            ]}
          >
            Handbooks ({bookmarks.filter((b) => b.itemType === 'pdf').length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading saved vault...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.centerContainer}>
          <Feather name="bookmark" size={42} color={colors.textMuted} style={{ opacity: 0.5, marginBottom: 12 }} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No saved items yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            Tap the bookmark icon on any article or handbook to save it for offline reading.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.itemId}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadBookmarks(true)}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  clearHeaderBtn: {
    padding: 6,
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
  },
  tabItem: {
    paddingVertical: 12,
    marginRight: 20,
  },
  tabText: {
    fontSize: 13,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  listContent: {
    padding: 16,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 14,
    flexDirection: 'row',
    height: 110,
  },
  cardImage: {
    width: 100,
    height: '100%',
  },
  cardImagePlaceholder: {
    width: 100,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  removeBtn: {
    padding: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardAuthor: {
    fontSize: 11,
  },
  actionPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  actionPromptText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
