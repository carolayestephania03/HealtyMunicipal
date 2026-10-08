import { Text, View } from 'react-native';

type VaccinationBadgeProps = {
  percent: number;
};

export function vaccinationTone(percent: number) {
  if (percent >= 80) {
    return 'ok' as const;
  }
  if (percent >= 50) {
    return 'watch' as const;
  }
  return 'risk' as const;
}

export function VaccinationBadge({ percent }: VaccinationBadgeProps) {
  const tone = vaccinationTone(percent);
  const styles = {
    ok: 'bg-emerald-100',
    watch: 'bg-amber-100',
    risk: 'bg-red-100',
  }[tone];
  const textStyles = {
    ok: 'text-emerald-800',
    watch: 'text-amber-800',
    risk: 'text-red-800',
  }[tone];

  return (
    <View className={`self-start rounded-full px-3 py-1 ${styles}`}>
      <Text className={`text-app-sm font-semibold ${textStyles}`}>{percent}%</Text>
    </View>
  );
}
