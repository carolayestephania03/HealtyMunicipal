import { Slot } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, useWindowDimensions, View } from 'react-native';

import { AppHeader } from '@/components/layout/app-header';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { Sidebar } from '@/components/layout/sidebar';
import { TABLET_BREAKPOINT } from '@/constants/brand';

export function HealthStaffLayout() {
  const { width } = useWindowDimensions();
  const compact = width < TABLET_BREAKPOINT;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View className="flex-1 flex-row bg-slate-50">
      {compact ? null : <Sidebar />}

      <View className="flex-1">
        <AppHeader compact={compact} onMenuPress={() => setMenuOpen(true)} />
        <View className="flex-1">
          <Slot />
        </View>
        {compact ? <MobileBottomNav /> : null}
      </View>

      <Modal
        visible={compact && menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}>
        <View className="flex-1 flex-row">
          <Sidebar variant="overlay" onNavigate={() => setMenuOpen(false)} />
          <Pressable className="flex-1 bg-slate-900/40" onPress={() => setMenuOpen(false)} />
        </View>
      </Modal>
    </View>
  );
}
