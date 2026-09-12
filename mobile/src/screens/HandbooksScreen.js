import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import {
  fetchPdfs,
  getPdfViewUrl,
  getPdfDownloadUrl,
  toggleBookmark,
  subscribeToLiveSync,
} from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import Header from '../components/Header';

function formatBytes(bytes, decimals = 1) {
  if (!bytes) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default function HandbooksScreen({ navigation }) {
  const { colors } = useTheme();
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [savedIds, setSavedIds] = useState(new Set());

  const loadPdfs = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else if (pdfs.length === 0) setLoading(true);

    try {
      const res = await fetchPdfs({ limit: 30, q: query.trim() });
      setPdfs(res.pdfs || []);
    } catch (err) {
      console.warn('Failed to fetch PDFs:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [query, pdfs.length]);

  useFocusEffect(
    useCallback(() => {
      loadPdfs();
    }, [loadPdfs])
  );

  useEffect(() => {
    const unsubscribe = subscribeToLiveSync((event) => {
      if (event === 'pdf_uploaded' || event === 'pdf_deleted') {
        loadPdfs();
      }
    });
    return unsubscribe;
  }, [loadPdfs]);

  const handleOpenPdf = (pdf) => {
    const url = getPdfViewUrl(pdf._id);
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open PDF viewer on your device');
    });
  };

  const handleDownloadPdf = (pdf) => {
    const url = getPdfDownloadUrl(pdf._id);
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not download PDF on your device');
    });
  };

  const handleToggleSave = async (pdf) => {
    const nextSaved = !savedIds.has(pdf._id);
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (nextSaved) next.add(pdf._id);
      else next.delete(pdf._id);
      return next;
    });

    try {
      await toggleBookmark({
        itemType: 'pdf',
        itemId: pdf._id,
        title: pdf.title,
        author: pdf.author,
        category: pdf.category,
        coverImage: pdf.coverImage,
        fileSizeBytes: pdf.fileSize,
        pageCount: pdf.pageCount,
      });
    } catch (err) {
      console.error('Failed to bookmark pdf:', err);
    }
  };

  const renderItem = ({ item }) => {
    const isSaved = savedIds.has(item._id);

    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Cover Thumbnail */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => handleOpenPdf(item)} style={styles.coverWrapper}>
          {item.coverImage ? (
            <Image source={{ uri: item.coverImage }} style={styles.coverImage} resizeMode="cover" />
          ) : (
            <View style={[styles.coverPlaceholder, { backgroundColor: colors.codeBg }]}>
              <Feather name="book-open" size={32} color={colors.primary} />
            </View>
          )}

          {/* Category overlay */}
          <View style={styles.badgeCategory}>
            <Text style={styles.badgeCategoryText}>{item.category || 'Handbook'}</Text>
          </View>

          {/* File Size overlay */}
          <View style={styles.badgeSize}>
            <Text style={styles.badgeSizeText}>{formatBytes(item.fileSize)}</Text>
          </View>
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.cardBody}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => handleOpenPdf(item)}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
              {item.title}
            </Text>
          </TouchableOpacity>

          {item.description ? (
            <Text style={[styles.desc, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}

          <View style={styles.metaRow}>
            <Text style={[styles.metaText, { color: colors.textMuted }]}>
              By <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>{item.author || 'Sourav Kumar'}</Text>
            </Text>
            {item.pageCount > 0 ? (
              <>
                <Text style={[styles.metaDot, { color: colors.textMuted }]}>•</Text>
                <Text style={[styles.metaText, { color: colors.textMuted }]}>{item.pageCount} pages</Text>
              </>
            ) : null}
          </View>

          {/* Action Row */}
          <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              onPress={() => handleOpenPdf(item)}
              style={[styles.readBtn, { backgroundColor: colors.primary }]}
            >
              <Feather name="eye" size={13} color="#ffffff" />
              <Text style={styles.readBtnText}>Read Online</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleDownloadPdf(item)}
              style={[styles.downloadBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
            >
              <Feather name="download" size={13} color={colors.text} />
              <Text style={[styles.downloadBtnText, { color: colors.text }]}>Download</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleToggleSave(item)}
              style={[
                styles.bookmarkBtn,
                {
                  borderColor: isSaved ? colors.primaryBorder : colors.border,
                  backgroundColor: isSaved ? colors.badgeBg : colors.surface,
                },
              ]}
            >
              <Feather name="bookmark" size={14} color={isSaved ? colors.primary : colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.surface }]}>
      <Header title="Handbooks & Notes" />

      {/* Search Input */}
      <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="search" size={16} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search study handbooks, cheat sheets..."
          placeholderTextColor={colors.placeholder}
          style={[styles.searchInput, { color: colors.text }]}
        />
        {query ? (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Feather name="x" size={15} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading handbooks...</Text>
        </View>
      ) : pdfs.length === 0 ? (
        <View style={styles.centerContainer}>
          <Feather name="book-open" size={44} color={colors.textMuted} style={{ opacity: 0.4, marginBottom: 12 }} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No handbooks found</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            PDF materials and engineering notes will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={pdfs}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadPdfs(true)}
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
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
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  coverWrapper: {
    width: '100%',
    height: 160,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCategory: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeCategoryText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  badgeSize: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeSizeText: {
    color: '#ffffff',
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  cardBody: {
    padding: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
    marginBottom: 6,
  },
  desc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  metaText: {
    fontSize: 11,
  },
  metaDot: {
    fontSize: 11,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  readBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    height: 36,
    borderRadius: 8,
  },
  readBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  downloadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
  },
  downloadBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bookmarkBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
