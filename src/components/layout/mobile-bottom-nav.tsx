import { Link, usePathname } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand } from '@/constants/brand';
import { isNavActive, MOBILE_NAV } from '@/constants/staff-nav';

export function MobileBottomNav() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row border-t border-slate-200 bg-white px-1 pt-1"
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}>
      {MOBILE_NAV.map((item) => {
        const active = isNavActive(pathname, String(item.href));
        const Icon = item.icon;
        const color = active ? Brand.petroleum : Brand.textMuted;

        return (
          <Link key={String(item.href)} href={item.href} asChild>
            <Pressable className="flex-1 items-center py-2" accessibilityState={{ selected: active }}>
              <Icon size={22} color={color} strokeWidth={active ? 2.4 : 2} />
              <Text
                className={`mt-1 text-xs ${
                  active ? 'font-semibold text-petroleum' : 'font-medium text-slate-500'
                }`}
                numberOfLines={1}>
                {item.label}
              </Text>
            </Pressable>
          </Link>
        );
      })}
    </View>
  );
}
