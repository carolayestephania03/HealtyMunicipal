
import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  Href,
  router,
} from 'expo-router';

import { colors } from '../../constants/theme';
import { useResponsive } from '../../hooks/use-responsive';

export function AppHeader() {
  const { isMobile } = useResponsive();

  const [search, setSearch] = useState('');

  const handleSearch = () => {
    const query = search.trim();

    if (!query) return;

    // Búsqueda inicial dirigida al módulo de niños.
    router.push({
      pathname: '/ninos',
      params: { q: query },
    } as Href);
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingHorizontal: isMobile ? 16 : 24,
        },
      ]}
    >

      {/* Fila superior */}
      <View style={styles.topRow}>

        <View style={styles.titleContainer}>
          <Text
            numberOfLines={isMobile ? 1 : 2}
            style={[
              styles.title,
              isMobile && styles.mobileTitle,
            ]}
          >
            {isMobile
              ? 'SCCVI'
              : 'Sistema de Control de Crecimiento y Vacunación Infantil'}
          </Text>
        </View>

        <View style={styles.actions}>

          {/* Notificaciones */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ver alertas"
            onPress={() => router.navigate('/alertas')}
            style={({ pressed }) => [
              styles.notificationButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color={colors.text}
            />
          </Pressable>

          {/* Identificación del usuario */}
          <View style={styles.userContainer}>

            <View style={styles.avatar}>
              <Ionicons
                name="person-outline"
                size={21}
                color="#FFFFFF"
              />
            </View>

            {!isMobile && (
              <View style={styles.userInformation}>
                <Text style={styles.userName}>
                  Personal de salud
                </Text>

                <Text style={styles.userRole}>
                  Vista preliminar
                </Text>
              </View>
            )}

          </View>

        </View>
      </View>

      {/* Buscador general */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },

  titleContainer: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 23,
  },

  mobileTitle: {
    fontSize: 20,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  notificationButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F7FB',
    borderRadius: 11,
  },

  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    padding: 5,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    backgroundColor: '#F9FBFD',
  },

  avatar: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: colors.sidebar,
    justifyContent: 'center',
    alignItems: 'center',
  },

  userInformation: {
    paddingRight: 12,
    gap: 2,
  },

  userName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },

  userRole: {
    fontSize: 10,
    color: colors.muted,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    minHeight: 43,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
    backgroundColor: '#F7F9FC',
    paddingHorizontal: 14,
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    color: colors.text,
    paddingVertical: 10,
  },

  pressed: {
    opacity: 0.7,
  },
});
