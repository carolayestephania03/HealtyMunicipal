import { Link, usePathname } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SIDEBAR_WIDTH } from '@/constants/brand';
import { isNavActive, STAFF_NAV } from '@/constants/staff-nav';

type SidebarProps = {
  variant?: 'fixed' | 'overlay';
  onNavigate?: () => void;
};

export function Sidebar({ variant = 'fixed', onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-petroleum"
      style={{
        width: SIDEBAR_WIDTH,
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 16,
      }}>
      <View className="px-5 pb-6">
        <Text className="text-app-xl font-bold text-white">SCCVI</Text>
        <Text className="mt-1 text-app-sm leading-5 text-white/80">
          Control de crecimiento y vacunación infantil
        </Text>
      </View>

      <ScrollView className="flex-1 px-3" showsVerticalScrollIndicator={false}>
        {STAFF_NAV.map((item) => {
          const active = isNavActive(pathname, String(item.href));
          const Icon = item.icon;

          return (
            <Link key={String(item.href)} href={item.href} asChild onPress={onNavigate}>
              <Pressable
                className={`mb-1 flex-row items-center rounded-lg px-3 py-3 ${
                  active ? 'bg-white/15' : ''
                }`}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}>
                <Icon size={22} color="#ffffff" strokeWidth={active ? 2.4 : 2} />
                <Text
                  className={`ml-3 flex-1 text-app-base ${
                    active ? 'font-semibold text-white' : 'font-medium text-white/85'
                  }`}>
                  {item.label}
                </Text>
              </Pressable>
            </Link>
          );
        })}
      </ScrollView>

      <View className="mx-4 mt-3 rounded-lg bg-petroleum-dark px-3 py-3">
        <Text className="text-app-sm font-semibold text-white">Personal de salud</Text>
        <Text className="mt-0.5 text-app-sm text-white/70">
          {variant === 'overlay' ? 'Menú completo' : 'Centro de atención primaria'}
        </Text>
      </View>
    </View>
  );
}
