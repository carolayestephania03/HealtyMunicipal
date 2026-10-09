import React from 'react';
import { Link } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

export default function NotFound() {
  return <View style={styles.box}><Text style={styles.title}>Pantalla no encontrada</Text><Link href="/inicio" style={styles.link}>Volver al inicio</Link></View>;
}
const styles = StyleSheet.create({ box: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 15, backgroundColor: colors.canvas }, title: { fontSize: 20, fontWeight: '700', color: colors.text }, link: { color: colors.primary } });
