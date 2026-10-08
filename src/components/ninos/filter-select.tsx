import { ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { Brand } from '@/constants/brand';

export type FilterOption = {
  label: string;
  value: string;
};

type FilterSelectProps = {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
};

export function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value)?.label ?? label;

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className="min-w-[180px] flex-row items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-3"
        accessibilityRole="button"
        accessibilityLabel={label}>
        <Text className="mr-2 text-app-base text-slate-700" numberOfLines={1}>
          {selected}
        </Text>
        <ChevronDown size={18} color={Brand.textMuted} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View className="flex-1 justify-center bg-slate-900/40 px-6">
          <Pressable className="absolute inset-0" onPress={() => setOpen(false)} />
          <View className="rounded-lg border border-slate-200 bg-white p-3 shadow-card">
            <Text className="mb-2 px-2 text-app-sm font-semibold text-slate-500">{label}</Text>
            {options.map((option) => {
              const active = option.value === value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`rounded-lg px-3 py-3 ${active ? 'bg-petroleum-muted' : ''}`}>
                  <Text
                    className={`text-app-base ${
                      active ? 'font-semibold text-petroleum' : 'text-slate-800'
                    }`}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </>
  );
}
