
import React, {
  ReactNode,
  useState,
} from 'react';

import {
  LayoutChangeEvent,
  StyleSheet,
  View,
} from 'react-native';

import { SearchInput } from '../ui/search-input';

import {
  SelectField,
  SelectOption,
} from '../forms/select-field';

export type DataFilter = {
  key: string;
  label: string;
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
};

type FilterBarProps = {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;

  filters?: readonly DataFilter[];
  children?: ReactNode;
};

const GAP = 12;

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  filters = [],
  children,
}: FilterBarProps) {
  const [containerWidth, setContainerWidth] =
    useState(0);

  const handleLayout = (
    event: LayoutChangeEvent
  ) => {
    const width = event.nativeEvent.layout.width;

    if (Math.abs(width - containerWidth) > 1) {
      setContainerWidth(width);
    }
  };

  const showSearch =
    searchValue !== undefined &&
    onSearchChange !== undefined;

  // =====================================
  // DISTRIBUCIÓN RESPONSIVA
  // =====================================

  // En escritorio, mantener el buscador
  // y hasta tres filtros en una sola fila.
  const desktop =
    containerWidth >= 1000 &&
    showSearch &&
    filters.length > 0 &&
    filters.length <= 3;

  // Columnas cuando no estamos en
  // distribución de escritorio.
  let filterColumns = 1;

  if (containerWidth >= 850) {
    filterColumns = 4;
  } else if (containerWidth >= 600) {
    filterColumns = 3;
  } else if (containerWidth >= 420) {
    filterColumns = 2;
  }

  filterColumns = Math.min(
    filterColumns,
    Math.max(filters.length, 1)
  );

  // Ancho del buscador.
  const searchWidth = desktop
    ? Math.round(containerWidth * 0.34)
    : containerWidth;

  // Ancho disponible para cada filtro.
  const filterWidth = desktop
    ? (
        containerWidth -
        searchWidth -
        GAP * filters.length
      ) / filters.length
    : (
        containerWidth -
        GAP * (filterColumns - 1)
      ) / filterColumns;

  return (
    <View
      style={styles.container}
      onLayout={handleLayout}
    >

      {/* BUSCADOR */}
      {showSearch && (
        <View
          style={[
            styles.searchContainer,
            {
              width:
                containerWidth > 0
                  ? searchWidth
                  : '100%',
            },
          ]}
        >
          <SearchInput
            value={searchValue!}
            onChangeText={onSearchChange!}
            placeholder={searchPlaceholder}
          />
        </View>
      )}

      {/* FILTROS */}
      {filters.map((filter) => (
        <View
          key={filter.key}
          style={[
            styles.filterContainer,
            {
              width:
                containerWidth > 0
                  ? Math.max(0, filterWidth)
                  : '100%',
            },
          ]}
        >
          <SelectField
            label={filter.label}
            value={filter.value}
            onChange={filter.onChange}
            options={filter.options}
          />
        </View>
      ))}

      {/* CONTENIDO ADICIONAL */}
      {children && (
        <View style={styles.extraContent}>
          {children}
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    gap: GAP,
  },

  searchContainer: {
    minWidth: 0,
    justifyContent: 'flex-end',
  },

  filterContainer: {
    minWidth: 0,
    justifyContent: 'flex-end',
  },

  extraContent: {
    width: '100%',
    minWidth: 0,
  },
});
