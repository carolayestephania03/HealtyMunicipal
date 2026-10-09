
import React from 'react';

import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  Href,
  router,
  usePathname,
} from 'expo-router';

import { BOTTOM_NAV } from '../../constants/navigation';
import { NAV_ICONS } from '../../constants/nav-icons';
import { colors } from '../../constants/theme';

export function MobileBottomNav() {
  const pathname = usePathname();

  const knownRoute = BOTTOM_NAV.some(
    (item) =>
      item.href !== '/menu' &&
      (
        pathname === item.href ||
        pathname.startsWith(item.href + '/')
      )
  );

  return (
    <View style={styles.container}>

      {BOTTOM_NAV.map((item) => {
        const active =
          pathname === item.href ||
          pathname.startsWith(item.href + '/') ||
          (item.href === '/menu' && !knownRoute);

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
              styles.item,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name={
                NAV_ICONS[item.href] ??
                'ellipse-outline'
              }
              size={22}
              color={
                active ? colors.primary : colors.muted
              }
            />

            <Text
              numberOfLines={1}
              style={[
                styles.label,
                active && styles.activeLabel,
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    minHeight: 65,
    justifyContent: 'space-around',
    paddingVertical: 6,
  },

  item: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 2,
  },

  label: {
    fontSize: 10,
    color: colors.muted,
    textAlign: 'center',
  },

  activeLabel: {
    color: colors.primary,
    fontWeight: '800',
  },

  pressed: {
    opacity: 0.65,
  },
});
