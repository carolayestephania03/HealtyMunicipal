import React, { ReactNode } from 'react';
import { Text, StyleSheet } from 'react-native';
import { SectionCard } from '../ui/section-card';
import { colors } from '../../constants/theme';

type Props = { title: string; description?: string; children: ReactNode };
export function FormPanel({ title, description, children }: Props) {
  return <SectionCard title={title}>
    {description ? <Text style={styles.description}>{description}</Text> : null}
    {children}
  </SectionCard>;
}
const styles = StyleSheet.create({ description: { color: colors.muted, fontSize: 13, lineHeight: 20 } });
