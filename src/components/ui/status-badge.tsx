
import React from 'react';

import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { colors } from '../../constants/theme';
import { AppIconName } from '../../constants/nav-icons';

type StatusTone =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

type StatusBadgeProps = {
  label: string;
  tone?: StatusTone;
  icon?: AppIconName;
  showDot?: boolean;
};

const PALETTES = {
  success: {
    foreground: colors.success,
    background: colors.successLight,
  },
  warning: {
    foreground: colors.warning,
    background: colors.warningLight,
  },
  danger: {
    foreground: colors.danger,
    background: colors.dangerLight,
  },
  info: {
    foreground: colors.info,
    background: colors.infoLight,
  },
  neutral: {
    foreground: colors.muted,
    background: '#F1F5F9',
  },
};

export function StatusBadge({
  label,
  tone = 'info',
  icon,
  showDot = true,
}: StatusBadgeProps) {
  const palette = PALETTES[tone];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: palette.background,
        },
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={13}
          color={palette.foreground}
        />
      ) : showDot ? (
        <View
          style={[
            styles.dot,
            {
              backgroundColor: palette.foreground,
            },
          ]}
        />
      ) : null}

      <Text
        style={[
          styles.label,
          {
            color: palette.foreground,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});
