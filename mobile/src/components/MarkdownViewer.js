import React, { useState } from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import * as Clipboard from 'expo-clipboard';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

export default function MarkdownViewer({ children }) {
  const { colors } = useTheme();
  const [copiedMap, setCopiedMap] = useState({});

  const copyCode = async (key, code) => {
    try {
      await Clipboard.setStringAsync(code);
      setCopiedMap((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedMap((prev) => ({ ...prev, [key]: false }));
      }, 2000);
    } catch {
      /* ignore */
    }
  };

  const markdownStyles = StyleSheet.create({
    body: {
      color: colors.text,
      fontSize: 15,
      lineHeight: 24,
    },
    heading1: {
      fontSize: 26,
      fontWeight: '800',
      color: colors.text,
      marginTop: 24,
      marginBottom: 10,
    },
    heading2: {
      fontSize: 21,
      fontWeight: '700',
      color: colors.text,
      marginTop: 20,
      marginBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingBottom: 6,
    },
    heading3: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginTop: 16,
      marginBottom: 6,
    },
    paragraph: {
      color: colors.textSecondary,
      fontSize: 15,
      lineHeight: 24,
      marginBottom: 14,
    },
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: colors.quoteBorder,
      backgroundColor: colors.quoteBg,
      paddingHorizontal: 14,
      paddingVertical: 8,
      marginVertical: 12,
      borderRadius: 4,
    },
    code_inline: {
      backgroundColor: colors.codeBg,
      color: colors.codeText,
      fontFamily: 'monospace',
      fontSize: 13,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    code_block: {
      backgroundColor: colors.preBg,
      color: colors.preText,
      fontFamily: 'monospace',
      fontSize: 13,
      padding: 14,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      marginVertical: 10,
    },
    fence: {
      backgroundColor: colors.preBg,
      color: colors.preText,
      fontFamily: 'monospace',
      fontSize: 13,
      padding: 14,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      marginVertical: 10,
    },
    link: {
      color: '#38bdf8',
      textDecorationLine: 'underline',
    },
    table: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      marginVertical: 12,
    },
    th: {
      backgroundColor: colors.codeBg,
      padding: 8,
      fontWeight: '700',
      color: colors.text,
      borderRightWidth: 1,
      borderRightColor: colors.border,
    },
    td: {
      padding: 8,
      color: colors.textSecondary,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      borderRightWidth: 1,
      borderRightColor: colors.border,
    },
    bullet_list: {
      marginVertical: 8,
    },
    ordered_list: {
      marginVertical: 8,
    },
    hr: {
      backgroundColor: colors.border,
      height: 1,
      marginVertical: 20,
    },
  });

  const rules = {
    fence: (node, children, parent, styles) => {
      const code = node.content || '';
      const key = `${node.key || Math.random()}`;
      const isCopied = copiedMap[key];

      return (
        <View key={node.key} style={[styles.fenceContainer, { marginVertical: 10 }]}>
          <View style={[styles.codeHeader, { backgroundColor: '#161b22', borderTopLeftRadius: 8, borderTopRightRadius: 8, paddingHorizontal: 12, paddingVertical: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
            <Text style={{ color: '#8b949e', fontSize: 11, fontFamily: 'monospace' }}>
              {node.sourceInfo || 'code'}
            </Text>
            <TouchableOpacity
              onPress={() => copyCode(key, code)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: isCopied ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)' }}
            >
              <Feather name={isCopied ? 'check' : 'copy'} size={12} color={isCopied ? '#4ade80' : '#c9d1d9'} />
              <Text style={{ color: isCopied ? '#4ade80' : '#c9d1d9', fontSize: 11, fontWeight: '600' }}>
                {isCopied ? 'Copied' : 'Copy'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.fence, { marginTop: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 }]}>
            <Text style={{ color: '#e6edf3', fontFamily: 'monospace', fontSize: 13, lineHeight: 20 }}>
              {code}
            </Text>
          </View>
        </View>
      );
    },
    link: (node, children) => {
      return (
        <Text
          key={node.key}
          style={markdownStyles.link}
          onPress={() => {
            if (node.attributes?.href) {
              Linking.openURL(node.attributes.href).catch(() => {});
            }
          }}
        >
          {children}
        </Text>
      );
    },
  };

  return (
    <Markdown style={markdownStyles} rules={rules}>
      {children || ''}
    </Markdown>
  );
}
