
import React from 'react';

import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

import { Slot } from 'expo-router';

import { colors } from '../../constants/theme';
import { useResponsive } from '../../hooks/use-responsive';

import { Sidebar } from './sidebar';
import { AppHeader } from './app-header';
import { MobileBottomNav } from './mobile-bottom-nav';

export function AppLayout() {
  const { isDesktop } = useResponsive();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.surface}
      />

      <View style={styles.container}>

        {/* Menú lateral solamente para escritorio */}
        {isDesktop && <Sidebar />}

        {/* Contenido principal */}
        <View style={styles.main}>

          {/* Encabezado fijo */}
          <AppHeader />

          {/* Pantalla correspondiente a la ruta */}
          <View style={styles.content}>
            <Slot />
          </View>

          {/* Navegación inferior para móvil y tablet */}
          {!isDesktop && <MobileBottomNav />}

        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.canvas,
  },

  main: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.canvas,
  },

  content: {
    flex: 1,
    minHeight: 0,
    backgroundColor: colors.canvas,
  },
});
