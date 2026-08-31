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

export default function PostCard({ post, onPress, onEdit, onDelete, isAdmin }) {
  const { colors } = useTheme();

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
      {/* Cover Image */}
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
            {formatDate(post.updatedAt)}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.readBtn, { backgroundColor: colors.primary }]}
            onPress={onPress}
            activeOpacity={0.8}
          >
            <Text style={styles.readBtnText}>Read More</Text>
            <Feather name="arrow-right" size={14} color="#ffffff" />
          </TouchableOpacity>

          {isAdmin && (
            <View style={styles.adminActions}>
              {onEdit && (
                <TouchableOpacity
                  onPress={onEdit}
                  style={[styles.actionBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
                >
                  <Feather name="edit-2" size={13} color={colors.textSecondary} />
                  <Text style={[styles.actionBtnText, { color: colors.textSecondary }]}>Edit</Text>
                </TouchableOpacity>
              )}

              {onDelete && (
                <TouchableOpacity
                  onPress={onDelete}
                  style={[styles.actionBtn, { borderColor: colors.dangerBorder, backgroundColor: colors.dangerBg }]}
                >
                  <Feather name="trash-2" size={13} color={colors.danger} />
                  <Text style={[styles.actionBtnText, { color: colors.danger }]}>Delete</Text>
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
    borderRadius: 14,
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
    gap: 6,
    marginBottom: 14,
  },
  metaText: {
    fontSize: 12,
  },
  metaDot: {
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexWrap: 'wrap',
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
  adminActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
