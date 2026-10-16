
import React from 'react';

import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';

import {
  Redirect,
} from 'expo-router';

import {
  HealthStaffLayout,
} from '../../components/layout/health-staff-layout';

import {
  useAuth,
} from '../../features/auth/hooks/use-auth';

import { colors } from '../../constants/theme';

export default function StaffLayout() {
  const { session, loading } = useAuth();

  // ======================================
  // ESPERAR RESTAURACIÓN DE SESIÓN
  // ======================================

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </View>
    );
  }

  // ======================================
  // USUARIO SIN SESIÓN
  // ======================================

  if (!session) {
    return <Redirect href="/login" />;
  }

  // ======================================
  // USUARIO AUTENTICADO
  // ======================================

  return <HealthStaffLayout />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.canvas,
  },
});
