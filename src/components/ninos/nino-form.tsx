import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Brand } from '@/constants/brand';
import type { Nino } from '@/types/nino';

type NinoFormProps = {
  title: string;
  submitLabel: string;
  initial?: Partial<Nino>;
};

export function NinoForm({ title, submitLabel, initial }: NinoFormProps) {
  const [nombre, setNombre] = useState(initial?.nombre ?? '');
  const [edad, setEdad] = useState(initial?.edad?.toString() ?? '');
  const [dpiMadre, setDpiMadre] = useState(initial?.dpiMadre ?? '');
  const [dpiPadre, setDpiPadre] = useState(initial?.dpiPadre ?? '');
  const [vacunacion, setVacunacion] = useState(initial?.vacunacion?.toString() ?? '');
  const [ultimoPesoKg, setUltimoPesoKg] = useState(initial?.ultimoPesoKg?.toString() ?? '');
  const [ultimaMedidaCm, setUltimaMedidaCm] = useState(initial?.ultimaMedidaCm?.toString() ?? '');

  function submit() {
    if (!nombre.trim()) {
      Alert.alert('Falta el nombre', 'Ingresa el nombre completo del niño.');
      return;
    }

    if (Platform.OS === 'web') {
      window.alert('Los datos se guardarán cuando el registro esté conectado.');
      router.replace('/ninos');
      return;
    }

    Alert.alert('Listo', 'Los datos se guardarán cuando el registro esté conectado.', [
      { text: 'Volver al listado', onPress: () => router.replace('/ninos') },
    ]);
  }

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerClassName="p-5 pb-8">
      <Pressable
        onPress={() => router.back()}
        className="mb-4 flex-row items-center self-start"
        accessibilityRole="button"
        accessibilityLabel="Volver">
        <ArrowLeft size={20} color={Brand.petroleum} />
        <Text className="ml-2 text-app-base font-semibold text-petroleum">Volver</Text>
      </Pressable>

      <View className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
        <Text className="text-app-2xl font-bold text-slate-900">{title}</Text>
        <Text className="mt-1 text-app-base text-slate-500">
          Completa los datos principales del niño.
        </Text>

        <Field label="Nombre" value={nombre} onChangeText={setNombre} />
        <Field
          label="Edad"
          value={edad}
          onChangeText={setEdad}
          keyboardType="number-pad"
        />
        <Field
          label="DPI madre"
          value={dpiMadre}
          onChangeText={setDpiMadre}
          keyboardType="number-pad"
        />
        <Field
          label="DPI padre"
          value={dpiPadre}
          onChangeText={setDpiPadre}
          keyboardType="number-pad"
        />
        <Field
          label="Estado de vacunación (%)"
          value={vacunacion}
          onChangeText={setVacunacion}
          keyboardType="number-pad"
        />
        <Field
          label="Último peso (kg)"
          value={ultimoPesoKg}
          onChangeText={setUltimoPesoKg}
          keyboardType="decimal-pad"
        />
        <Field
          label="Última medida (cm)"
          value={ultimaMedidaCm}
          onChangeText={setUltimaMedidaCm}
          keyboardType="decimal-pad"
        />

        <Pressable
          onPress={submit}
          className="mt-6 h-12 items-center justify-center rounded-lg bg-petroleum"
          accessibilityRole="button">
          <Text className="text-app-base font-semibold text-white">{submitLabel}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'number-pad' | 'decimal-pad';
}) {
  return (
    <View className="mt-4">
      <Text className="mb-1.5 text-app-sm font-semibold text-slate-600">{label}</Text>
      <TextInput
        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-app-base text-slate-800"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholderTextColor={Brand.textMuted}
      />
    </View>
  );
}
