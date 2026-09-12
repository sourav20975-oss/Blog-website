import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';

export default function Logo({ size = 'md', showText = true, style }) {
  const { colors, isDark } = useTheme();

  const dimensions = {
    sm: { icon: 26, fontSize: 14, spacing: 6 },
    md: { icon: 34, fontSize: 18, spacing: 8 },
    lg: { icon: 42, fontSize: 22, spacing: 10 },
    xl: { icon: 60, fontSize: 30, spacing: 14 },
  };

  const current = dimensions[size] || dimensions.md;

  return (
    <View style={[styles.container, { gap: current.spacing }, style]}>
      {/* Premium Geometric Monogram Icon */}
      <View style={{ width: current.icon, height: current.icon }}>
        <Svg viewBox="0 0 40 40" width="100%" height="100%">
          <Defs>
            {/* Background Gradient */}
            <LinearGradient id="bv-bg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#1E1E24" />
              <Stop offset="100%" stopColor="#0B0B0E" />
            </LinearGradient>

            {/* Ember Glow Gradient */}
            <LinearGradient id="bv-ember" x1="8" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#FF7A1A" />
              <Stop offset="50%" stopColor="#FF5500" />
              <Stop offset="100%" stopColor="#EA580C" />
            </LinearGradient>

            {/* Accent Gold Gradient */}
            <LinearGradient id="bv-gold" x1="12" y1="6" x2="28" y2="34" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#FDBA74" />
              <Stop offset="100%" stopColor="#FB923C" />
            </LinearGradient>

            {/* Outer Border Gradient */}
            <LinearGradient id="bv-border" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="rgba(255, 255, 255, 0.28)" />
              <Stop offset="100%" stopColor="rgba(255, 255, 255, 0.06)" />
            </LinearGradient>
          </Defs>

          {/* Squircle Base */}
          <Rect
            x="1"
            y="1"
            width="38"
            height="38"
            rx="11"
            fill="url(#bv-bg)"
            stroke="url(#bv-border)"
            strokeWidth="1.2"
          />

          {/* Ambient Glow */}
          <Circle cx="20" cy="20" r="11" fill="#FF5500" opacity="0.25" />

          {/* Left Wing / Bracket */}
          <Path
            d="M13 13.5L8.5 20L13 26.5"
            stroke="url(#bv-gold)"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Right Wing / Bracket */}
          <Path
            d="M27 13.5L31.5 20L27 26.5"
            stroke="url(#bv-gold)"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Center Dynamic Geometric 'V' Anchor */}
          <Path
            d="M16 16.5L20 25.5L24 16.5"
            stroke="url(#bv-ember)"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Center Vertex Spark */}
          <Circle cx="20" cy="14" r="1.75" fill="#FFAA44" />
        </Svg>
      </View>

      {/* Brand Typography */}
      {showText && (
        <Text style={[styles.brandText, { fontSize: current.fontSize, color: isDark ? '#ffffff' : '#18181b' }]}>
          Blog<Text style={styles.brandAccent}>Verse</Text>
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  brandAccent: {
    color: '#f97316',
  },
});
