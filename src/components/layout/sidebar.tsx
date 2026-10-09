
import React from 'react';

import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  Href,
  router,
  usePathname,
} from 'expo-router';

import { NAV_GROUPS } from '../../constants/navigation';
import { NAV_ICONS } from '../../constants/nav-icons';
import { colors } from '../../constants/theme';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <View style={styles.container}>

      {/* Identificación del sistema */}
      <View style={styles.brand}>
        <Text style={styles.brandTitle}>
          SCCVI
        </Text>

        <Text style={styles.brandDescription}>
          Sistema de Control de Crecimiento y Vacunación Infantil
        </Text>
      </View>

      {/* Grupos de navegación */}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {NAV_GROUPS.map((group) => (
          <View
            key={group.title}
            style={styles.group}
          >
            <Text style={styles.groupTitle}>
              {group.title}
            </Text>

            {group.items.map((item) => {
              const active =
                pathname === item.href ||
                pathname.startsWith(item.href + '/');

              return (
                <Pressable
                  key={item.href}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  accessibilityState={{ selected: active }}
                  onPress={() =>
                    router.navigate(item.href as Href)
                  }
                  style={({ pressed }) => [
                    styles.menuItem,
                    active && styles.activeItem,
                    pressed && styles.pressedItem,
                  ]}
                >
                  <Ionicons
                    name={
                      NAV_ICONS[item.href] ??
                      'ellipse-outline'
                    }
                    size={22}
                    color="#FFFFFF"
                  />

                  <Text
                    numberOfLines={2}
                    style={[
                      styles.itemText,
                      active && styles.activeText,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          SCCVI · Sistema de salud infantil
        </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 260,
    flexShrink: 0,
    backgroundColor: colors.sidebar,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.12)',
  },

  brand: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },

  brandTitle: {
    fontSize: 29,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  brandDescription: {
    fontSize: 12,
    lineHeight: 19,
    color: '#D3ECF0',
    marginTop: 3,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },

  group: {
    marginBottom: 20,
    gap: 3,
  },

  groupTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C4E4E9',
    letterSpacing: 1,
    marginBottom: 7,
    paddingHorizontal: 11,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 43,
    borderRadius: 9,
    paddingHorizontal: 13,
    paddingVertical: 9,
    gap: 13,
  },

  activeItem: {
    backgroundColor: 'rgba(255,255,255,0.17)',
  },

  pressedItem: {
    opacity: 0.7,
  },

  itemText: {
    flex: 1,
    color: '#E8F5F7',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 19,
  },

  activeText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  footer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
  },

  footerText: {
    color: '#B7DCE3',
    fontSize: 10,
    textAlign: 'center',
  },
});
