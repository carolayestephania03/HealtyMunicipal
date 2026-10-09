import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/theme';

// La pantalla de autenticación se implementará al validar el contrato auth/JWT del backend.
// Esta ruta NO realiza autenticación y no debe usarse como mecanismo de seguridad.
export default function Login() {
  return <View style={styles.root}><Text style={styles.title}>SCCVI</Text><Text style={styles.description}>Inicio de sesión pendiente de integración con la API.</Text></View>;
}
const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.canvas, padding: 24, gap: 10 },
  title: { fontSize: 30, fontWeight: '800', color: colors.primary },
  description: { fontSize: 14, color: colors.muted, textAlign: 'center' },
});
