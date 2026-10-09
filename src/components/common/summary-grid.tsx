
import React from 'react';

import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { colors } from '../../constants/theme';
import { ResponsiveGrid } from '../layout/responsive-grid';
import type { AppIconName } from '../../constants/nav-icons';

export type SummaryTone =
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral';

export type SummaryItem = {
  label: string;
  value: string | number;
  icon?: AppIconName;
  description?: string;
  tone?: SummaryTone;
};

type SummaryGridProps = {
  items: readonly SummaryItem[];
  maxColumns?: 1 | 2 | 3 | 4;
  minItemWidth?: number;
};

const PALETTES = {
  info: {
    background: colors.infoLight,
    foreground: colors.primary,
  },
  success: {
    background: colors.successLight,
    foreground: colors.success,
  },
  warning: {
    background: colors.warningLight,
    foreground: colors.warning,
  },
  danger: {
    background: colors.dangerLight,
    foreground: colors.danger,
  },
  neutral: {
    background: colors.canvas,
    foreground: colors.muted,
  },
};

export function SummaryGrid({
  items,
  maxColumns = 3,
  minItemWidth = 145,
}: SummaryGridProps) {
  return (
    <ResponsiveGrid
      maxColumns={maxColumns}
      minItemWidth={minItemWidth}
      gap={10}
    >
      {items.map((item, index) => {
        const palette =
          PALETTES[item.tone ?? 'neutral'];

        return (
          <View
            key={`${item.label}-${index}`}
            style={[
              styles.item,
              {
                backgroundColor: palette.background,
              },
            ]}
          >
            <View style={styles.heading}>
              {item.icon && (
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={palette.foreground}
                />
              )}

              <Text style={styles.label}>
                {item.label}
              </Text>
            </View>

            <Text
              style={[
                styles.value,
                { color: palette.foreground },
              ]}
            >
              {item.value}
            </Text>

            {item.description && (
              <Text style={styles.description}>
                {item.description}
              </Text>
            )}
          </View>
        );
      })}
    </ResponsiveGrid>
  );
}

const styles = StyleSheet.create({
  item: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 13,
    gap: 8,
    minHeight: 89,
    justifyContent: 'center',
  },

  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  label: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '600',
    flexShrink: 1,
  },

  value: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '800',
  },

  description: {
    fontSize: 11,
    lineHeight: 16,
    color: colors.muted,
  },
});
