
import React from 'react';

import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { colors } from '../../constants/theme';

type Props = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
};

function pageNumbers(
  page: number,
  total: number
): (number | '…')[] {
  const candidate = new Set([
    1,
    total,
    page - 1,
    page,
    page + 1,
  ]);

  const sorted = [...candidate]
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);

  const result: (number | '…')[] = [];

  sorted.forEach((n, index) => {
    if (
      index > 0 &&
      n - sorted[index - 1] > 1
    ) {
      result.push('…');
    }

    result.push(n);
  });

  return result;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  totalItems,
  pageSize = 7,
}: Props) {
  const { width } = useWindowDimensions();
  const mobile = width < 620;

  const total = Math.max(1, totalPages);

  const current = Math.min(
    Math.max(page, 1),
    total
  );

  const first =
    totalItems === 0
      ? 0
      : (current - 1) * pageSize + 1;

  const last =
    totalItems === undefined
      ? 0
      : Math.min(current * pageSize, totalItems);

  const changePage = (next: number) => {
    if (
      next >= 1 &&
      next <= total &&
      next !== current
    ) {
      onPageChange(next);
    }
  };

  return (
    <View style={styles.container}>

      {/* Información de registros */}
      {totalItems !== undefined && (
        <Text style={styles.caption}>
          Mostrando {first}–{last} de {totalItems} registros
        </Text>
      )}

      <View style={styles.controls}>

        {/* Anterior */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Página anterior"
          disabled={current === 1}
          onPress={() => changePage(current - 1)}
          style={[
            styles.controlButton,
            current === 1 && styles.disabled,
          ]}
        >
          <Ionicons
            name="chevron-back-outline"
            size={17}
            color={colors.primary}
          />
        </Pressable>

        {/* Páginas */}
        {mobile ? (
          <Text style={styles.caption}>
            Página {current} de {total}
          </Text>
        ) : (
          pageNumbers(current, total).map(
            (value, index) =>
              value === '…' ? (
                <Text
                  key={`ellipsis-${index}`}
                  style={styles.caption}
                >
                  …
                </Text>
              ) : (
                <Pressable
                  key={value}
                  accessibilityRole="button"
                  accessibilityLabel={`Ir a página ${value}`}
                  accessibilityState={{
                    selected: value === current,
                  }}
                  onPress={() => changePage(value)}
                  style={[
                    styles.controlButton,
                    value === current &&
                      styles.activeButton,
                  ]}
                >
                  <Text
                    style={[
                      styles.pageText,
                      value === current &&
                        styles.activeText,
                    ]}
                  >
                    {value}
                  </Text>
                </Pressable>
              )
          )
        )}

        {/* Siguiente */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Página siguiente"
          disabled={current === total}
          onPress={() => changePage(current + 1)}
          style={[
            styles.controlButton,
            current === total && styles.disabled,
          ]}
        >
          <Ionicons
            name="chevron-forward-outline"
            size={17}
            color={colors.primary}
          />
        </Pressable>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },

  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  controlButton: {
    minWidth: 34,
    minHeight: 34,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },

  activeButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  pageText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },

  activeText: {
    color: '#FFFFFF',
  },

  disabled: {
    opacity: 0.35,
  },

  caption: {
    color: colors.muted,
    fontSize: 12,
  },
});
