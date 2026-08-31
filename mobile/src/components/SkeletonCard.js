import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function SkeletonCard() {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Animated.View
        style={[
          styles.imagePlaceholder,
          { backgroundColor: colors.border, opacity },
        ]}
      />
      <View style={styles.content}>
        <Animated.View
          style={[styles.line, { width: '80%', height: 18, backgroundColor: colors.border, opacity }]}
        />
        <Animated.View
          style={[styles.line, { width: '100%', height: 12, backgroundColor: colors.border, opacity }]}
        />
        <Animated.View
          style={[styles.line, { width: '60%', height: 12, backgroundColor: colors.border, opacity }]}
        />
        <View style={styles.footer}>
          <Animated.View
            style={[styles.buttonPlaceholder, { backgroundColor: colors.border, opacity }]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  imagePlaceholder: {
    width: '100%',
    height: 170,
  },
  content: {
    padding: 16,
    gap: 10,
  },
  line: {
    borderRadius: 4,
  },
  footer: {
    marginTop: 8,
    flexDirection: 'row',
  },
  buttonPlaceholder: {
    width: 90,
    height: 32,
    borderRadius: 8,
  },
});
