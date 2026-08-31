import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

export default function ProfileScreen({ navigation }) {
  const { colors, theme, toggleTheme } = useTheme();
  const { user, isLoggedIn, isAdmin, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of your session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.navigate('MainTabs', { screen: 'Home' });
        },
      },
    ]);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.surface }]}>
      <Header navigation={navigation} title="Account & Settings" />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* User Card */}
        {isLoggedIn ? (
          <View style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.avatarBox, { backgroundColor: colors.badgeBg, borderColor: colors.primaryBorder }]}>
              <Text style={[styles.avatarText, { color: colors.primary }]}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>

            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>{user?.name}</Text>
              <Text style={[styles.userEmail, { color: colors.textMuted }]}>{user?.email}</Text>
              <View style={[styles.roleBadge, { backgroundColor: colors.badgeBg, borderColor: colors.primaryBorder }]}>
                <Text style={[styles.roleText, { color: colors.badgeText }]}>
                  {isAdmin ? 'ADMINISTRATOR' : 'MEMBER'}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={[styles.guestCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.avatarBox, { backgroundColor: colors.codeBg, borderColor: colors.border }]}>
              <Feather name="user" size={24} color={colors.textMuted} />
            </View>

            <Text style={[styles.guestTitle, { color: colors.text }]}>Join the Community</Text>
            <Text style={[styles.guestDesc, { color: colors.textMuted }]}>
              Login or create an account to get full access to articles, write posts, and more.
            </Text>

            <View style={styles.authButtonsRow}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                style={[styles.authBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
              >
                <Text style={[styles.authBtnText, { color: colors.text }]}>Login</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('Signup')}
                style={[styles.authBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}
              >
                <Text style={[styles.authBtnText, { color: '#ffffff', fontWeight: '700' }]}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Preferences Section */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>PREFERENCES</Text>

          {/* Theme switch item */}
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons
                name={theme === 'dark' ? 'moon-outline' : 'sunny-outline'}
                size={20}
                color={colors.primary}
              />
              <View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
                <Text style={[styles.settingSubLabel, { color: colors.textMuted }]}>
                  {theme === 'dark' ? 'Sleek dark theme active' : 'Clean light theme active'}
                </Text>
              </View>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Admin Section (if admin) */}
        {isAdmin && (
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>ADMIN TOOLS</Text>

            <TouchableOpacity
              onPress={() => navigation.navigate('CreatePost')}
              style={styles.settingItemAction}
            >
              <View style={styles.settingLeft}>
                <Feather name="plus-circle" size={19} color={colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Write a New Post</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {/* App Info */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>ABOUT APP</Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>App Name</Text>
            <Text style={[styles.infoVal, { color: colors.text }]}>BlogVerse Mobile</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Version</Text>
            <Text style={[styles.infoVal, { color: colors.text }]}>1.0.0 (Expo SDK 51)</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Author</Text>
            <Text style={[styles.infoVal, { color: colors.text }]}>Sourav Kumar</Text>
          </View>
        </View>

        {/* Logout button */}
        {isLoggedIn && (
          <TouchableOpacity
            onPress={handleLogout}
            style={[styles.logoutBtn, { borderColor: colors.dangerBorder, backgroundColor: colors.dangerBg }]}
          >
            <Feather name="log-out" size={18} color={colors.danger} />
            <Text style={[styles.logoutText, { color: colors.danger }]}>Log Out</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 14,
  },
  avatarBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 13,
    marginBottom: 4,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
  },
  guestCard: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  guestTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  guestDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 8,
  },
  authButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  authBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingItemAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingSubLabel: {
    fontSize: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  infoLabel: {
    fontSize: 13,
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '600',
  },
  logoutBtn: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
