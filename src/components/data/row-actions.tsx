
import React from 'react';

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { colors } from '../../constants/theme';
import type { AppIconName } from '../../constants/nav-icons';

export type RowActionType =
  | 'view'
  | 'edit'
  | 'history'
  | 'download'
  | 'notify'
  | 'link'
  | 'delete'
  | 'custom';

export type RowAction = {
  type: RowActionType;
  label: string;
  onPress: () => void;
  icon?: AppIconName;
  disabled?: boolean;
};

type Props = {
  actions: readonly RowAction[];
  showLabels?: boolean;
};

const ICONS: Record<RowActionType, AppIconName> = {
  view: 'eye-outline',
  edit: 'create-outline',
  history: 'time-outline',
  download: 'download-outline',
  notify: 'paper-plane-outline',
  link: 'people-outline',
  delete: 'trash-outline',
  custom: 'ellipsis-horizontal-outline',
};

export function RowActions({
  actions,
  showLabels = false,
}: Props) {
  if (actions.length === 0) return null;

  return (
    <View style={styles.container}>
      {actions.map((action, index) => {
        const color =
          action.type === 'delete'
            ? colors.danger
            : colors.primary;

        return (
          <Pressable
            key={`${action.type}-${index}`}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            accessibilityState={{
              disabled: !!action.disabled,
            }}
            disabled={action.disabled}
            onPress={action.onPress}
            style={({ pressed }) => [
              styles.button,
              showLabels && styles.buttonWithLabel,
              action.type === 'delete' &&
                styles.dangerButton,
              pressed && styles.pressed,
              action.disabled && styles.disabled,
            ]}
          >
            <Ionicons
              name={action.icon ?? ICONS[action.type]}
              size={18}
              color={color}
            />

            {showLabels && (
              <Text
                style={[
                  styles.label,
                  { color },
                ]}
              >
                {action.label}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },

  button: {
    minWidth: 40,
    minHeight: 40,
    paddingHorizontal: 9,
    borderRadius: 8,
    backgroundColor: colors.infoLight,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },

  buttonWithLabel: {
    paddingHorizontal: 11,
  },

  dangerButton: {
    backgroundColor: colors.dangerLight,
  },

  label: {
    fontSize: 12,
    fontWeight: '700',
  },

  pressed: {
    opacity: 0.65,
  },

  disabled: {
    opacity: 0.4,
  },
});
