import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import { getCaptcha } from '../services/api';
import { useTheme } from '../theme/ThemeContext';

export default function Captcha({
  value,
  onChange,
  onError,
  onLoaded,
  refreshKey,
  onRefresh,
}) {
  const { colors } = useTheme();
  const [svg, setSvg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getCaptcha()
      .then((res) => {
        if (!alive) return;
        setSvg(res.svg);
        if (onLoaded) onLoaded(res.captchaId);
      })
      .catch((e) => {
        if (onError && alive) onError(e.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [refreshKey]);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textMuted }]}>Security Check *</Text>
      <View style={styles.captchaRow}>
        <View style={[styles.svgBox, { backgroundColor: colors.codeBg, borderColor: colors.border }]}>
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : svg ? (
            <SvgXml xml={svg} width={130} height={46} />
          ) : (
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>Failed to load</Text>
          )}
        </View>

        <TouchableOpacity
          onPress={onRefresh}
          style={[styles.refreshBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          disabled={loading}
          accessibilityLabel="Refresh Captcha"
        >
          <Feather name="refresh-cw" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Type the characters above"
        placeholderTextColor={colors.placeholder}
        autoCapitalize="none"
        autoCorrect={false}
        style={[
          styles.input,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  captchaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  svgBox: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  refreshBtn: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
});
