
import React, { ReactNode } from 'react';

import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { colors } from '../../constants/theme';
import { AppIconName } from '../../constants/nav-icons';

type SectionCardProps = {
  title?: string;
  icon?: AppIconName;
  action?: ReactNode;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function SectionCard({
  title,
  icon,
  action,
  children,
  style,
}: SectionCardProps) {
  const showHeader = Boolean(title || action);

  return (
    <View style={[styles.card, style]}>

      {showHeader && (
        <View style={styles.header}>

          <View style={styles.titleContainer}>

            {icon && (
              <View style={styles.iconBox}>
                <Ionicons
                  name={icon}
                  size={20}
                  color={colors.primary}
                />
              </View>
            )}

            {title && (
              <Text style={styles.title}>
                {title}
              </Text>
            )}

          </View>

          {action && (
            <View style={styles.action}>
              {action}
            </View>
          )}

        </View>
      )}

      <View style={styles.content}>
        {children}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    gap: 14,
    minWidth: 0,
  },

  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },

  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    gap: 10,
  },

  iconBox: {
    width: 34,
    height: 34,
    backgroundColor: '#EAF4FF',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    flexShrink: 1,
  },

  action: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  content: {
    gap: 12,
    minWidth: 0,
  },
});
