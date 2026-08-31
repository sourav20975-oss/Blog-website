import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Header({ navigation, showBack = false, title = null }) {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, isLoggedIn } = useAuth();

  const handleBackPress = () => {
    if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation?.navigate('MainTabs', { screen: 'Home' });
    }
  };

  const handleLogoPress = () => {
    navigation?.navigate('MainTabs', { screen: 'Home' });
  };

  return (
    <View
      style={[
        styles.headerWrapper,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          paddingTop: Math.max(insets.top, 10),
        },
      ]}
    >
      <View style={styles.headerContent}>
        {/* Left Section */}
        <View style={styles.leftContainer}>
          {showBack ? (
            <TouchableOpacity
              onPress={handleBackPress}
              style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="arrow-left" size={20} color={colors.text} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleLogoPress}
              style={styles.brandRow}
              activeOpacity={0.8}
            >
              <View style={styles.logoBadge}>
                <Text style={styles.logoBadgeText}>&lt;/&gt;</Text>
              </View>
              <Text style={[styles.brandText, { color: colors.text }]}>
                Blog<Text style={{ color: colors.primary }}>Verse</Text>
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Center Title (if present) */}
        {title && showBack && (
          <View style={styles.centerContainer}>
            <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
              {title}
            </Text>
          </View>
        )}

        {/* Right Section */}
        <View style={styles.rightContainer}>
          {isLoggedIn && user?.name && (
            <View style={[styles.userBadge, { backgroundColor: colors.badgeBg, borderColor: colors.primaryBorder }]}>
              <Text style={[styles.userBadgeText, { color: colors.badgeText }]} numberOfLines={1}>
                {user.name.split(' ')[0]}
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={toggleTheme}
            style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <Ionicons
              name={isDark ? 'sunny-outline' : 'moon-outline'}
              size={18}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerContent: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    backgroundColor: '#f97316',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  logoBadgeText: {
    color: '#ffffff',
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '800',
  },
  brandText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  centerContainer: {
    flex: 1,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    maxWidth: 90,
  },
  userBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
