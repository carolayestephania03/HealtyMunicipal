import { Text, View } from 'react-native';

type ModulePlaceholderProps = {
  title: string;
  description: string;
};

export function ModulePlaceholder({ title, description }: ModulePlaceholderProps) {
  return (
    <View className="flex-1 bg-slate-50 p-5">
      <View className="rounded-lg border border-slate-200 bg-white p-6 shadow-card">
        <Text className="text-app-2xl font-bold text-slate-900">{title}</Text>
        <Text className="mt-2 text-app-base text-slate-500">{description}</Text>
        <View className="mt-5 rounded-lg bg-petroleum-muted px-4 py-3">
          <Text className="text-app-sm font-medium text-petroleum">
            Contenido de este módulo pendiente.
          </Text>
        </View>
      </View>
    </View>
  );
}
