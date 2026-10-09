
import React, { ReactNode } from 'react';

import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';

import { colors } from '../../constants/theme';
import { SectionCard } from '../ui/section-card';
import type { AppIconName } from '../../constants/nav-icons';

type FormPanelProps = {
  title: string;
  description?: string;
  icon?: AppIconName;

  children: ReactNode;

  headerAction?: ReactNode;
  status?: ReactNode;
  footer?: ReactNode;

  style?: StyleProp<ViewStyle>;
};

export function FormPanel({
  title,
  description,
  icon = 'create-outline',
  children,
  headerAction,
  status,
  footer,
  style,
}: FormPanelProps) {
  return (
    <SectionCard
      title={title}
      icon={icon}
      action={headerAction}
      style={style}
    >
      {/* Información introductoria */}
      {description && (
        <Text style={styles.description}>
          {description}
        </Text>
      )}

      {/* Estado opcional del formulario */}
      {status && (
        <View style={styles.status}>
          {status}
        </View>
      )}

      {/* Contenido principal */}
      <View style={styles.body}>
        {children}
      </View>

      {/* Acciones inferiores */}
      {footer && (
        <View style={styles.footer}>
          {footer}
        </View>
      )}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  description: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
  },

  status: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },

  body: {
    gap: 16,
    minWidth: 0,
  },

  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 15,
    marginTop: 3,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
});
