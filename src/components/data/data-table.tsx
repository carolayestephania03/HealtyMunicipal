
import React, {
  ReactNode,
  useState,
} from 'react';

import {
  LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../../constants/theme';

import { EmptyState } from '../feedback/empty-state';
import { RowActions } from './row-actions';
import type { RowAction } from './row-actions';

export type DataColumn<T> = {
  key: string;
  title: string;
  width?: number;
  render: (item: T) => ReactNode;
  hideOnMobile?: boolean;
};

type Props<T> = {
  data: readonly T[];
  columns: readonly DataColumn<T>[];
  keyExtractor: (item: T) => string;

  actions?: (item: T) => readonly RowAction[];
  primaryColumnKey?: string;

  emptyTitle?: string;
  emptyDescription?: string;

  mobileBreakpoint?: number;
};

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  actions,
  primaryColumnKey,
  emptyTitle = 'No hay registros para mostrar',
  emptyDescription = 'Modifique los filtros o intente otra búsqueda.',
  mobileBreakpoint = 760,
}: Props<T>) {
  const [containerWidth, setContainerWidth] =
    useState(0);

  const mobile = containerWidth < mobileBreakpoint;

  const primary =
    columns.find(
      (col) => col.key === primaryColumnKey
    ) ?? columns[0];

  const actionWidth = 142;

  const minimumTableWidth = columns.reduce(
    (sum, col) => sum + (col.width ?? 145),
    actions ? actionWidth : 0
  );

  const tableWidth = Math.max(
    containerWidth,
    minimumTableWidth
  );

  const handleLayout = (
    event: LayoutChangeEvent
  ) => {
    const width = event.nativeEvent.layout.width;

    if (Math.abs(width - containerWidth) > 1) {
      setContainerWidth(width);
    }
  };

  return (
    <View
      onLayout={handleLayout}
      style={styles.wrapper}
    >
      {data.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
        />
      ) : mobile ? (

        // Presentación en tarjetas para móvil
        <View style={styles.mobileList}>
          {data.map((item) => (
            <View
              key={keyExtractor(item)}
              style={styles.mobileCard}
            >
              {primary && (
                <View style={styles.mobileHeading}>
                  {primary.render(item)}
                </View>
              )}

              {columns
                .filter(
                  (col) =>
                    col.key !== primary?.key &&
                    !col.hideOnMobile
                )
                .map((col) => (
                  <View
                    key={col.key}
                    style={styles.mobileField}
                  >
                    <Text style={styles.mobileLabel}>
                      {col.title}
                    </Text>

                    <View style={styles.mobileValue}>
                      {col.render(item)}
                    </View>
                  </View>
                ))}

              {actions && (
                <RowActions
                  actions={actions(item)}
                  showLabels
                />
              )}
            </View>
          ))}
        </View>

      ) : (

        // Presentación en tabla para escritorio
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator
          contentContainerStyle={{
            minWidth: tableWidth,
          }}
        >
          <View
            style={[
              styles.table,
              { width: tableWidth },
            ]}
          >
            {/* Encabezado */}
            <View
              style={[
                styles.tableRow,
                styles.tableHeader,
              ]}
            >
              {columns.map((col) => (
                <View
                  key={col.key}
                  style={[
                    styles.cell,
                    {
                      width: col.width ?? 145,
                      flexGrow: 1,
                    },
                  ]}
                >
                  <Text style={styles.headerText}>
                    {col.title}
                  </Text>
                </View>
              ))}

              {actions && (
                <View
                  style={[
                    styles.cell,
                    { width: actionWidth },
                  ]}
                >
                  <Text style={styles.headerText}>
                    Acciones
                  </Text>
                </View>
              )}
            </View>

            {/* Registros */}
            {data.map((item) => (
              <View
                key={keyExtractor(item)}
                style={styles.tableRow}
              >
                {columns.map((col) => (
                  <View
                    key={col.key}
                    style={[
                      styles.cell,
                      {
                        width: col.width ?? 145,
                        flexGrow: 1,
                      },
                    ]}
                  >
                    {col.render(item)}
                  </View>
                ))}

                {actions && (
                  <View
                    style={[
                      styles.cell,
                      { width: actionWidth },
                    ]}
                  >
                    <RowActions
                      actions={actions(item)}
                    />
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    minWidth: 0,
  },

  table: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
    overflow: 'hidden',
  },

  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 58,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },

  tableHeader: {
    backgroundColor: '#F5F9FD',
    minHeight: 43,
  },

  cell: {
    minWidth: 0,
    paddingHorizontal: 10,
    paddingVertical: 9,
    justifyContent: 'center',
  },

  headerText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },

  mobileList: {
    gap: 10,
  },

  mobileCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 13,
    gap: 12,
    backgroundColor: colors.surface,
  },

  mobileHeading: {
    paddingBottom: 9,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  mobileField: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },

  mobileLabel: {
    width: '38%',
    fontSize: 12,
    color: colors.muted,
  },

  mobileValue: {
    flex: 1,
    minWidth: 0,
  },
});
