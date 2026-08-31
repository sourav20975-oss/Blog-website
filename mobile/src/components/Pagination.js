import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

export default function Pagination({ page, pages, total, currentCount, onPageChange }) {
  const { colors } = useTheme();

  if (pages <= 1) return null;

  return (
    <View style={styles.container}>
      <View style={styles.buttonsRow}>
        <TouchableOpacity
          onPress={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          style={[
            styles.navButton,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity: page === 1 ? 0.4 : 1,
            },
          ]}
        >
          <Feather name="chevron-left" size={16} color={colors.text} />
          <Text style={[styles.navText, { color: colors.text }]}>Prev</Text>
        </TouchableOpacity>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pagesScroll}>
          {Array.from({ length: pages }).map((_, i) => {
            const n = i + 1;
            const active = n === page;
            return (
              <TouchableOpacity
                key={n}
                onPress={() => onPageChange(n)}
                style={[
                  styles.pageNumberBtn,
                  active
                    ? {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                        shadowColor: colors.primary,
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 2,
                      }
                    : {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                ]}
              >
                <Text
                  style={[
                    styles.pageNumberText,
                    { color: active ? '#ffffff' : colors.textSecondary },
                  ]}
                >
                  {n}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity
          onPress={() => onPageChange(Math.min(pages, page + 1))}
          disabled={page === pages}
          style={[
            styles.navButton,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity: page === pages ? 0.4 : 1,
            },
          ]}
        >
          <Text style={[styles.navText, { color: colors.text }]}>Next</Text>
          <Feather name="chevron-right" size={16} color={colors.text} />
        </TouchableOpacity>
      </View>

      {total > 0 && (
        <Text style={[styles.statsText, { color: colors.textMuted }]}>
          Showing {currentCount} of {total} post{total === 1 ? '' : 's'} · Page {page}/{pages}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    alignItems: 'center',
    gap: 12,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  navText: {
    fontSize: 13,
    fontWeight: '600',
  },
  pagesScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  pageNumberBtn: {
    minWidth: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  pageNumberText: {
    fontSize: 13,
    fontWeight: '700',
  },
  statsText: {
    fontSize: 12,
    textAlign: 'center',
  },
});
