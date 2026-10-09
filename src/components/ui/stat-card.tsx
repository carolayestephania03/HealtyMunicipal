
import React from 'react';

import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { colors } from '../../constants/theme';
import { AppIconName } from '../../constants/nav-icons';

type StatTone = 'info' | 'success' | 'warning' | 'danger';

type StatCardProps = {
  value: string | number;
  label: string;
  detail?: string;
  tone?: StatTone;
  icon?: AppIconName;
  symbol?: string;
  onPress?: () => void;
};

// Equivalencias con los símbolos de la base anterior
const LEGACY_ICONS: Record<string, AppIconName> = {
  '◉': 'people-outline',
  '✚': 'medkit-outline',
  '↗': 'stats-chart-outline',
  '⚠': 'warning-outline',
  '♧': 'body-outline',
  '▤': 'qr-code-outline',
};

const PALETTES = {
  info: {
    background: '#F1F8FF',
    circle: '#DCEEFF',
    border: '#D7E7FB',
    foreground: colors.primary,
  },
  success: {
    background: '#F0FCF6',
    circle: '#D9F8E8',
    border: '#D7F1E5',
    foreground: colors.success,
  },
  warning: {
    background: '#FFFAF0',
    circle: '#FFF0D4',
    border: '#F5E9D0',
    foreground: colors.warning,
  },
  danger: {
    background: '#FFF3F5',
    circle: '#FFE0E6',
    border: '#F7DFE4',
    foreground: colors.danger,
  },
};

export function StatCard({
  value,
  label,
  detail,
  tone = 'info',
  icon,
  symbol,
  onPress,
}: StatCardProps) {
  const palette = PALETTES[tone];

  const iconName =
    icon ??
    (symbol ? LEGACY_ICONS[symbol] : undefined) ??
    'stats-chart-outline';

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: palette.background,
          borderColor: palette.border,
        },
        pressed && onPress && styles.pressed,
      ]}
    >

      <View style={styles.mainRow}>

        <View
          style={[
            styles.iconContainer,
            { backgroundColor: palette.circle },
          ]}
        >
          <Ionicons
            name={iconName}
            size={28}
            color={palette.foreground}
          />
        </View>

        <View style={styles.textContainer}>

          <Text
            numberOfLines={1}
            style={styles.value}
          >
            {value}
          </Text>

          <Text style={styles.label}>
            {label}
          </Text>

        </View>

        {onPress && (
          <Ionicons
            name="chevron-forward-outline"
            size={19}
            color={palette.foreground}
          />
        )}

      </View>

      {detail && (
        <Text style={styles.detail}>
          {detail}
        </Text>
      )}

    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    minHeight: 117,
    justifyContent: 'center',
    gap: 13,
  },

  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },

  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },

  textContainer: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },

  value: {
    fontSize: 27,
    fontWeight: '800',
    color: colors.text,
  },

  label: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
  },

  detail: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 18,
  },

  pressed: {
    opacity: 0.8,
  },
});
