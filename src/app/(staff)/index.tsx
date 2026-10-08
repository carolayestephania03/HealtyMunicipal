import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-slate-50 p-5">
      <Text className="text-app-2xl font-bold text-slate-900">Inicio</Text>
      <Text className="mt-2 text-app-base text-slate-500">
        Panel del personal de salud. Las tarjetas del dashboard quedan pendientes.
      </Text>

      <View className="mt-5 rounded-lg border border-slate-200 bg-white p-6 shadow-card">
        <View className="self-start rounded-full bg-amber-100 px-3 py-1">
          <Text className="text-app-sm font-semibold text-amber-800">Pendiente</Text>
        </View>
        <Text className="mt-4 text-app-xl font-semibold text-slate-800">Dashboard</Text>
        <Text className="mt-2 text-app-base leading-6 text-slate-500">
          Aquí se maquetarán las tarjetas de indicadores, alertas y accesos rápidos en una siguiente
          iteración.
        </Text>
      </View>
    </View>
  );
}
