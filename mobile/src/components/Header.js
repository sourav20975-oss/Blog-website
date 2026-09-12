import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

export default function Header({ navigation, showBack = false, title = null, onSearchPress = null }) {
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
          paddingTop: Math.max(insets.top, 12),
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
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={18} color={colors.text} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleLogoPress}
              activeOpacity={0.8}
            >
              <Logo size="md" showText={true} />
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
          {onSearchPress && (
            <TouchableOpacity
              onPress={onSearchPress}
              style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              accessibilityLabel="Search"
              activeOpacity={0.7}
            >
              <Feather name="search" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}

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
            activeOpacity={0.7}
          >
            <Ionicons
              name={isDark ? 'sunny-outline' : 'moon-outline'}
              size={17}
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
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 999,
    borderWidth: 1,
    maxWidth: 90,
  },
  userBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
