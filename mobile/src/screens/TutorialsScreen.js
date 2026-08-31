import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import Header from '../components/Header';

const TUTORIALS = [
  {
    title: 'SQL Tutorial',
    slug: 'the-ultimate-sql-course',
    desc: 'Master relational database queries, joins, indexes, subqueries, and database design.',
    icon: 'database',
    iconLib: Feather,
    color: '#38bdf8',
  },
  {
    title: 'Docker Notes',
    slug: 'the-ultimate-docker-course',
    desc: 'Containerize your applications with Dockerfiles, compose multi-container stacks, and deploy.',
    icon: 'docker',
    iconLib: FontAwesome5,
    color: '#0284c7',
  },
  {
    title: 'Linux & Networking',
    slug: 'the-ultimate-linux-networking-course',
    desc: 'Learn terminal mastery, bash scripting, SSH, DNS, firewalls, and server administration.',
    icon: 'terminal',
    iconLib: Feather,
    color: '#10b981',
  },
  {
    title: 'Git & Open Source',
    slug: 'the-ultimate-open-source-contribution-course',
    desc: 'Version control mastery, branching strategies, merge conflicts, pull requests, and OSS workflow.',
    icon: 'git-branch',
    iconLib: Feather,
    color: '#f97316',
  },
];

const STACK_ITEMS = [
  { name: 'MongoDB', role: 'Database' },
  { name: 'Express.js', role: 'Backend API' },
  { name: 'React Native (Expo)', role: 'Mobile Framework' },
  { name: 'Node.js', role: 'Runtime' },
];

const SOCIALS = [
  {
    label: 'GitHub',
    url: 'https://github.com/sourav20975-oss',
    icon: 'github',
    lib: Feather,
  },
  {
    label: 'LinkedIn',
    url: 'https://www.linkedin.com/in/sourav-kumar-20975s/',
    icon: 'linkedin',
    lib: Feather,
  },
  {
    label: 'Twitter / X',
    url: 'https://twitter.com',
    icon: 'twitter',
    lib: Feather,
  },
  {
    label: 'YouTube',
    url: 'https://youtube.com',
    icon: 'youtube',
    lib: Feather,
  },
];

export default function TutorialsScreen({ navigation }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: colors.surface }]}>
      <Header navigation={navigation} title="Explore Tutorials" />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.title, { color: colors.text }]}>Featured Courses & Notes</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Hand-crafted in-depth guides to boost your developer skills.
          </Text>
        </View>

        {/* Tutorial Cards */}
        <View style={styles.cardsGrid}>
          {TUTORIALS.map((item) => {
            const IconComponent = item.iconLib;
            return (
              <TouchableOpacity
                key={item.slug}
                onPress={() => navigation.navigate('BlogPost', { slug: item.slug })}
                style={[
                  styles.tutorialCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                activeOpacity={0.8}
              >
                <View style={[styles.iconWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <IconComponent name={item.icon} size={22} color={item.color} />
                </View>

                <View style={styles.cardInfo}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
                  <View style={styles.startRow}>
                    <Text style={[styles.startText, { color: colors.primary }]}>Read Course</Text>
                    <Feather name="arrow-right" size={13} color={colors.primary} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Built With Section */}
        <View style={[styles.builtWithCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.blockTitle, { color: colors.text }]}>Built With MERN Stack</Text>
          <View style={styles.techList}>
            {STACK_ITEMS.map((t) => (
              <View key={t.name} style={[styles.techPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.techName, { color: colors.text }]}>{t.name}</Text>
                <Text style={[styles.techRole, { color: colors.textMuted }]}>{t.role}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Social Links */}
        <View style={[styles.socialsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.blockTitle, { color: colors.text }]}>Connect with Sourav</Text>
          <View style={styles.socialButtonsRow}>
            {SOCIALS.map((s) => {
              const IconLib = s.lib;
              return (
                <TouchableOpacity
                  key={s.label}
                  onPress={() => Linking.openURL(s.url).catch(() => {})}
                  style={[styles.socialBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <IconLib name={s.icon} size={18} color={colors.textSecondary} />
                  <Text style={[styles.socialLabel, { color: colors.text }]}>{s.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
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
    gap: 18,
  },
  sectionHeader: {
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  cardsGrid: {
    gap: 12,
  },
  tutorialCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 14,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 8,
  },
  startRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  startText: {
    fontSize: 12,
    fontWeight: '700',
  },
  builtWithCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  blockTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  techList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  techPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  techName: {
    fontSize: 12,
    fontWeight: '700',
  },
  techRole: {
    fontSize: 10,
  },
  socialsCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  socialButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  socialLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
