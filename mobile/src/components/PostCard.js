import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { toggleBookmark, subscribeToLiveSync } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function formatDate(d) {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export default function PostCard({ post, onPress, onEdit, onDelete, isAdmin }) {
  const { colors } = useTheme();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    const checkSaved = async () => {
      try {
        const raw = await AsyncStorage.getItem('@blogverse_saved_posts');
        if (raw) {
          const list = JSON.parse(raw);
          if (active) {
            setSaved(list.some((p) => p.slug === post.slug));
          }
        }
      } catch {
        /* ignore */
      }
    };
    checkSaved();

    const unsubscribe = subscribeToLiveSync((event, payload) => {
      if (event === 'bookmark_toggled' && payload?.itemId === post.slug) {
        setSaved(Boolean(payload.saved));
      } else if (event === 'bookmarks_cleared') {
        setSaved(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [post.slug]);

  const handleToggleSave = async () => {
    const nextState = !saved;
    setSaved(nextState);

    try {
      // Local AsyncStorage sync
      const raw = await AsyncStorage.getItem('@blogverse_saved_posts');
      let list = raw ? JSON.parse(raw) : [];
      if (nextState) {
        list = [post, ...list.filter((p) => p.slug !== post.slug)];
      } else {
        list = list.filter((p) => p.slug !== post.slug);
      }
      await AsyncStorage.setItem('@blogverse_saved_posts', JSON.stringify(list));

      // MongoDB Database sync
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
    } catch (err) {
      console.error('Bookmark toggle error on mobile:', err);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.isDark ? '#000000' : '#71717a',
        },
      ]}
    >
      {/* Cover Image with Category & Read Time overlays */}
      <View style={[styles.imageContainer, { backgroundColor: colors.codeBg }]}>
        {post.coverImage ? (
          <Image
            source={{ uri: post.coverImage }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderBox}>
            <Text style={[styles.placeholderText, { color: colors.textMuted }]}>&lt;/&gt;</Text>
          </View>
        )}

        {/* Category Pill */}
        {post.category ? (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{post.category}</Text>
          </View>
        ) : null}

        {/* Reading Time */}
        <View style={styles.readTimeBadge}>
          <Feather name="clock" size={10} color="#ffffff" />
          <Text style={styles.readTimeBadgeText}>{post.readTime || 3} min</Text>
        </View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {post.title}
        </Text>

        {post.quote ? (
          <Text style={[styles.quote, { color: colors.textSecondary }]} numberOfLines={2}>
            {post.quote}
          </Text>
        ) : null}

        <View style={styles.metaRow}>
          <Text style={[styles.metaText, { color: colors.textMuted }]}>
            By <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>{post.author || 'Sourav Kumar'}</Text>
          </Text>
          <Text style={[styles.metaDot, { color: colors.textMuted }]}>•</Text>
          <Text style={[styles.metaText, { color: colors.textMuted }]}>
            {formatDate(post.updatedAt || post.createdAt)}
          </Text>
          <Text style={[styles.metaDot, { color: colors.textMuted }]}>•</Text>
          <View style={styles.statsInline}>
            <Feather name="heart" size={11} color={colors.primary} />
            <Text style={[styles.metaText, { color: colors.primary, fontWeight: '600' }]}>
              {post.likes || 0}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
          <View style={styles.leftActions}>
            <TouchableOpacity
              style={[styles.readBtn, { backgroundColor: colors.primary }]}
              onPress={onPress}
              activeOpacity={0.8}
            >
              <Text style={styles.readBtnText}>Read More</Text>
              <Feather name="arrow-right" size={13} color="#ffffff" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleToggleSave}
              style={[
                styles.bookmarkBtn,
                {
                  borderColor: saved ? colors.primaryBorder : colors.border,
                  backgroundColor: saved ? colors.badgeBg : colors.surface,
                },
              ]}
            >
              <Feather
                name="bookmark"
                size={14}
                color={saved ? colors.primary : colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          {isAdmin && (
            <View style={styles.adminActions}>
              {onEdit && (
                <TouchableOpacity
                  onPress={onEdit}
                  style={[styles.actionBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
                >
                  <Feather name="edit-2" size={13} color={colors.textSecondary} />
                </TouchableOpacity>
              )}

              {onDelete && (
                <TouchableOpacity
                  onPress={onDelete}
                  style={[styles.actionBtn, { borderColor: colors.dangerBorder, backgroundColor: colors.dangerBg }]}
                >
                  <Feather name="trash-2" size={13} color={colors.danger} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  placeholderBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontFamily: 'monospace',
    fontSize: 32,
    fontWeight: '700',
  },
  categoryBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  categoryBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  readTimeBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readTimeBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  body: {
    padding: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 23,
    marginBottom: 6,
  },
  quote: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  metaText: {
    fontSize: 12,
  },
  metaDot: {
    fontSize: 12,
  },
  statsInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  readBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  readBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  bookmarkBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
