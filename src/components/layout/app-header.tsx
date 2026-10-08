import { Bell, Menu, Search, UserRound } from 'lucide-react-native';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand } from '@/constants/brand';

type AppHeaderProps = {
  compact: boolean;
  onMenuPress: () => void;
};

export function AppHeader({ compact, onMenuPress }: AppHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="border-b border-slate-200 bg-white px-4 pb-3"
      style={{ paddingTop: Math.max(insets.top, 12) }}>
      <View className="flex-row items-center gap-3">
        {compact ? (
          <Pressable
            onPress={onMenuPress}
            className="h-11 w-11 items-center justify-center rounded-lg bg-petroleum-muted"
            accessibilityLabel="Abrir menú">
            <Menu size={22} color={Brand.petroleum} />
          </Pressable>
        ) : null}

        {compact ? (
          <Text className="flex-shrink text-app-lg font-bold text-petroleum" numberOfLines={1}>
            SCCVI
          </Text>
        ) : (
          <Text className="text-app-lg font-semibold text-slate-800" numberOfLines={1}>
            Sistema de Control de Crecimiento y Vacunación Infantil
          </Text>
        )}

        <View className="ml-auto flex-row items-center gap-2">
          <Pressable
            className="relative h-11 w-11 items-center justify-center rounded-lg bg-slate-100"
            accessibilityLabel="Notificaciones">
            <Bell size={22} color={Brand.petroleum} />
            <View className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-600" />
          </Pressable>
          <Pressable
            className="h-11 flex-row items-center rounded-lg bg-petroleum-muted px-2.5"
            accessibilityLabel="Perfil de usuario">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-petroleum">
              <UserRound size={18} color="#ffffff" />
            </View>
            {compact ? null : (
              <View className="ml-2 mr-1">
                <Text className="text-app-sm font-semibold text-slate-800">Dra. Ana López</Text>
                <Text className="text-xs text-slate-500">Personal de salud</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      <View className="mt-3 flex-row items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
        <Search size={20} color={Brand.textMuted} />
        <TextInput
          className="ml-2 flex-1 text-app-base text-slate-800"
          placeholder="Buscar niño por nombre, DPI..."
          placeholderTextColor={Brand.textMuted}
          accessibilityLabel="Buscar niño por nombre, DPI o QR"
        />
      </View>
    </View>
  );
}
