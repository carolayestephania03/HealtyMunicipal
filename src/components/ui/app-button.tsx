
import React from 'react';

import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { colors, radius } from '../../constants/theme';
import { AppIconName } from '../../constants/nav-icons';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'danger'
  | 'ghost';

type ButtonSize = 'small' | 'medium' | 'large';

type AppButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: AppIconName;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

const VARIANTS = {
  primary: {
    bg: colors.primary,
    border: colors.primary,
    text: '#FFFFFF',
  },
  secondary: {
    bg: colors.infoLight,
    border: colors.infoLight,
    text: colors.primary,
  },
  outline: {
    bg: colors.surface,
    border: colors.primary,
    text: colors.primary,
  },
  danger: {
    bg: colors.danger,
    border: colors.danger,
    text: '#FFFFFF',
  },
  ghost: {
    bg: 'transparent',
    border: 'transparent',
    text: colors.primary,
  },
};

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}: AppButtonProps) {
  const palette = VARIANTS[variant];

  const isDisabled = disabled || loading || !onPress;

  const renderIcon = () =>
    icon ? (
      <Ionicons
        name={icon}
        size={size === 'small' ? 16 : 19}
        color={palette.text}
      />
    ) : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[size],
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
        },
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={palette.text}
        />
      ) : (
        <View style={styles.content}>
          {iconPosition === 'left' && renderIcon()}

          <Text
            numberOfLines={2}
            style={[
              styles.label,
              { color: palette.text },
            ]}
          >
            {label}
          </Text>

          {iconPosition === 'right' && renderIcon()}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },

  small: {
    minHeight: 34,
    paddingHorizontal: 11,
  },

  medium: {
    minHeight: 44,
  },

  large: {
    minHeight: 51,
    paddingHorizontal: 20,
  },

  fullWidth: {
    width: '100%',
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },

  pressed: {
    opacity: 0.8,
  },

  disabled: {
    opacity: 0.45,
  },
});
