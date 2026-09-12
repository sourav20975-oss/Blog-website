import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

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

export default function PostCard({
  post,
  onPress,
  onEdit,
  onDelete,
  isAdmin = false,
  isSaved = false,
  onToggleSave = null,
}) {
  const { colors, isDark } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: isDark ? '#000000' : '#71717a',
        },
      ]}
    >
      {/* Aspect Ratio 16/10 Cover Image */}
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

        {/* Category Pill on Top-Left (Matching Web) */}
        {post.category ? (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{post.category}</Text>
          </View>
        ) : null}

        {/* Reading Time Pill on Top-Right (Matching Web) */}
        <View style={styles.readTimeBadge}>
          <Feather name="clock" size={10} color="#e4e4e7" />
          <Text style={styles.readTimeBadgeText}>{post.readTime || 3} min read</Text>
        </View>
      </View>

      {/* Card Body */}
      <View style={styles.body}>
        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {post.title}
        </Text>

        {/* Subtitle / Excerpt */}
        {post.quote ? (
          <Text style={[styles.quote, { color: colors.textSecondary }]} numberOfLines={2}>
            {post.quote}
          </Text>
        ) : null}

        {/* Meta Stats Row (Date, Views, Likes) */}
        <View style={[styles.metaRow, { borderTopColor: colors.border }]}>
          <Text style={[styles.metaDate, { color: colors.textMuted }]}>
            {formatDate(post.updatedAt || post.createdAt)}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Feather name="eye" size={12} color={colors.textMuted} />
              <Text style={[styles.statValue, { color: colors.textMuted }]}>
                {post.views || 0}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Feather name="heart" size={12} color="#f43f5e" />
              <Text style={[styles.statValue, { color: '#f43f5e' }]}>
                {post.likes || 0}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions Row: Read Guide & Save Bookmark (Matching Web) */}
        <View style={styles.actionsRow}>
          <View style={styles.leftActions}>
            <TouchableOpacity
              style={styles.readGuideLink}
              onPress={onPress}
              activeOpacity={0.7}
            >
              <Text style={[styles.readGuideText, { color: colors.text }]}>
                Read Guide
              </Text>
              <Feather name="arrow-right" size={13} color={colors.primary} />
            </TouchableOpacity>

            {onToggleSave && (
              <TouchableOpacity
                onPress={() => onToggleSave(post)}
                activeOpacity={0.7}
                style={[
                  styles.saveBtn,
                  {
                    backgroundColor: isSaved ? colors.badgeBg : 'transparent',
                    borderColor: isSaved ? colors.primaryBorder : colors.border,
                  },
                ]}
              >
                <Feather
                  name="bookmark"
                  size={12}
                  color={isSaved ? colors.primary : colors.textMuted}
                />
                <Text
                  style={[
                    styles.saveBtnText,
                    { color: isSaved ? colors.primary : colors.textMuted },
                  ]}
                >
                  {isSaved ? 'Saved' : 'Save'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Admin Edit & Delete Actions */}
          {isAdmin && (
            <View style={styles.adminActions}>
              {onEdit && (
                <TouchableOpacity
                  onPress={onEdit}
                  style={[styles.adminBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
                  activeOpacity={0.7}
                >
                  <Feather name="edit-3" size={12} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
              {onDelete && (
                <TouchableOpacity
                  onPress={onDelete}
                  style={[styles.adminBtn, { borderColor: colors.dangerBorder, backgroundColor: colors.dangerBg }]}
                  activeOpacity={0.7}
                >
                  <Feather name="trash-2" size={12} color={colors.danger} />
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
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 16 / 10,
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
    fontSize: 28,
    fontWeight: '700',
  },
  categoryBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  categoryBadgeText: {
    color: '#ffffff',
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  readTimeBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readTimeBadgeText: {
    color: '#e4e4e7',
    fontSize: 10.5,
    fontWeight: '500',
  },
  body: {
    padding: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  quote: {
    marginTop: 6,
    fontSize: 12.5,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  metaDate: {
    fontSize: 11,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 2,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  readGuideLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readGuideText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  saveBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  adminActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  adminBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
