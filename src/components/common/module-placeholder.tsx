import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { ScreenContainer } from '../layout/screen-container';
import { ScreenHeader } from '../layout/screen-header';
import { SectionCard } from '../ui/section-card';
import { colors } from '../../constants/theme';

type Props = { title: string; description: string; nextStep?: string };
export function ModulePlaceholder({ title, description, nextStep }: Props) {
  return (
    <ScreenContainer>
      <ScreenHeader title={title} description={description} />
      <SectionCard title="Módulo preparado">
        <View style={styles.content}>
          <Text style={styles.symbol}>◈</Text>
          <Text style={styles.heading}>Estructura y navegación listas</Text>
          <Text style={styles.text}>{nextStep ?? 'La interfaz funcional y la integración con la API se incorporarán en la siguiente etapa.'}</Text>
          <Text style={styles.note}>No se muestran datos clínicos ficticios ni registros guardados.</Text>
        </View>
      </SectionCard>
    </ScreenContainer>
  );
}
const styles = StyleSheet.create({
  content: { alignItems: 'center', paddingVertical: 38, gap: 9 },
  symbol: { fontSize: 42, color: colors.primary },
  heading: { color: colors.text, fontWeight: '800', fontSize: 18, textAlign: 'center' },
  text: { color: colors.muted, fontSize: 14, lineHeight: 21, maxWidth: 480, textAlign: 'center' },
  note: { fontSize: 12, color: colors.warning, textAlign: 'center', marginTop: 8 },
});
