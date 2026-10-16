
import React, { ReactNode } from 'react';

import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import { colors } from '../../constants/theme';
import { useResponsive } from '../../hooks/use-responsive';
import { AppIconName } from '../../constants/nav-icons';
import { AppButton } from '../ui/app-button';

type ScreenHeaderProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  actionIcon?: AppIconName;
  onAction?: () => void;
  rightContent?: ReactNode;
};

export function ScreenHeader({
  title,
  description,
  actionLabel,
  actionIcon,
  onAction,
  rightContent,
}: ScreenHeaderProps) {
  const { isMobile } = useResponsive();

  return (
    <View
      style={[
        styles.container,
        isMobile && styles.mobileContainer,
      ]}
    >
      <View style={styles.heading}>
        <Text
          style={[
            styles.title,
            isMobile && styles.mobileTitle,
          ]}
        >
          {title}
        </Text>

        {description && (
          <Text style={styles.description}>
            {description}
          </Text>
        )}
      </View>

      {actionLabel && onAction && (
        <AppButton
          label={actionLabel}
          icon={actionIcon}
          onPress={onAction}
          fullWidth={isMobile}
        />
      )}

      {rightContent}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },

  mobileContainer: {
    alignItems: 'stretch',
  },

  heading: {
    flex: 1,
    minWidth: 220,
    gap: 5,
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 38,
  },

  mobileTitle: {
    fontSize: 25,
    lineHeight: 32,
  },

  description: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.muted,
  },
});
