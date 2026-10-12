
import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  router,
  useLocalSearchParams,
} from 'expo-router';

import { ScreenContainer } from '../../../components/layout/screen-container';
import { ScreenHeader } from '../../../components/layout/screen-header';
import { ResponsiveGrid } from '../../../components/layout/responsive-grid';

import { SectionCard } from '../../../components/ui/section-card';
import { StatCard } from '../../../components/ui/stat-card';
import { StatusBadge } from '../../../components/ui/status-badge';
import { AppButton } from '../../../components/ui/app-button';

import { FilterBar } from '../../../components/data/filter-bar';
import type { DataFilter } from '../../../components/data/filter-bar';

import { DataTable } from '../../../components/data/data-table';
import type { DataColumn } from '../../../components/data/data-table';

import { Pagination } from '../../../components/data/pagination';
import type { RowAction } from '../../../components/data/row-actions';

import { useNinos } from '../hooks/use-ninos';
import type { Nino } from '../types';

import { colors } from '../../../constants/theme';

const PAGE_SIZE = 7;

// ============================================
// FORMATO DE EDAD
// ============================================

function edadEnMeses(fechaISO: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(
    fechaISO
  );

  if (!match) return null;

  const anio = Number(match[1]);
  const mes = Number(match[2]);
  const dia = Number(match[3]);

  const nacimiento = new Date(anio, mes - 1, dia);
  const hoy = new Date();

  if (
    nacimiento.getFullYear() !== anio ||
    nacimiento.getMonth() !== mes - 1 ||
    nacimiento.getDate() !== dia ||
    nacimiento > hoy
  ) {
    return null;
  }

  let meses =
    (hoy.getFullYear() - anio) * 12 +
    (hoy.getMonth() + 1 - mes);

  if (hoy.getDate() < dia) {
    meses--;
  }

  return Math.max(0, meses);
}

function mostrarEdad(fechaISO: string): string {
  const meses = edadEnMeses(fechaISO);

  if (meses === null) return '—';

  if (meses < 12) {
    return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
  }

  const anios = Math.floor(meses / 12);
  const restantes = meses % 12;

  return (
    `${anios} ${anios === 1 ? 'año' : 'años'}` +
    (restantes > 0 ? ` ${restantes} meses` : '')
  );
}

// ============================================
// NORMALIZAR BÚSQUEDA
// ============================================

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// ============================================
// COLUMNAS DE LA TABLA
// ============================================

const COLUMNAS: DataColumn<Nino>[] = [
  {
    key: 'expediente',
    title: 'Expediente',
    width: 145,
    render: (nino) => (
      <Text style={styles.codigo}>
        {nino.codigo_expediente}
      </Text>
    ),
  },
  {
    key: 'nombre',
    title: 'Nombre del niño',
    width: 220,
    render: (nino) => (
      <Text style={styles.nombre}>
        {nino.nombres} {nino.apellidos}
      </Text>
    ),
  },
  {
    key: 'edad',
    title: 'Edad',
    width: 140,
    render: (nino) => (
      <Text style={styles.texto}>
        {mostrarEdad(nino.fecha_nacimiento)}
      </Text>
    ),
  },
  {
    key: 'familia',
    title: 'Familia',
    width: 150,
    render: (nino) => (
      <Text style={styles.texto}>
        {nino.familia?.codigo_familia ??
          String(nino.id_familia)}
      </Text>
    ),
  },
  {
    key: 'sexo',
    title: 'Sexo',
    width: 115,
    render: (nino) => (
      <Text style={styles.texto}>
        {nino.sexo === 'M'
          ? 'Masculino'
          : 'Femenino'}
      </Text>
    ),
  },
  {
    key: 'estado',
    title: 'Estado',
    width: 135,
    render: (nino) => (
      <StatusBadge
        label={nino.activo ? 'Activo' : 'Inactivo'}
        tone={nino.activo ? 'success' : 'neutral'}
      />
    ),
  },
];

// ============================================
// PANTALLA PRINCIPAL
// ============================================

export function NinosScreen() {
  const { q } = useLocalSearchParams<{
    q?: string;
  }>();

  const {
    ninos,
    loading,
    error,
    refresh,
  } = useNinos();

  const primeraApertura = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (primeraApertura.current) {
        primeraApertura.current = false;
        return;
      }

      refresh();
    }, [refresh])
  );

  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('todos');
  const [page, setPage] = useState(1);

  // Búsqueda desde el AppHeader.
  useEffect(() => {
    setSearch(typeof q === 'string' ? q : '');
    setPage(1);
  }, [q]);

  // ==========================================
  // INDICADORES
  // ==========================================

  const total = ninos.length;

  const menoresDos = ninos.filter((nino) => {
    const meses = edadEnMeses(nino.fecha_nacimiento);

    return meses !== null && meses < 24;
  }).length;

  const activos = ninos.filter(
    (nino) => nino.activo === true
  ).length;

  const inactivos = ninos.filter(
    (nino) => nino.activo === false
  ).length;

  // ==========================================
  // BÚSQUEDA Y FILTRADO LOCAL
  // ==========================================

  const filtrados = useMemo(() => {
    const termino = normalizar(search);

    return ninos.filter((nino) => {
      const texto = normalizar(
        [
          nino.codigo_expediente,
          nino.nombres,
          nino.apellidos,
          nino.familia?.codigo_familia ?? '',
        ].join(' ')
      );

      const coincideBusqueda =
        !termino || texto.includes(termino);

      const coincideEstado =
        estado === 'todos' ||
        (estado === 'activo' && nino.activo) ||
        (estado === 'inactivo' && !nino.activo);

      return coincideBusqueda && coincideEstado;
    });
  }, [ninos, search, estado]);

  // ==========================================
  // PAGINACIÓN
  // ==========================================

  const totalPages = Math.max(
    1,
    Math.ceil(filtrados.length / PAGE_SIZE)
  );

  const paginaActual = Math.min(page, totalPages);

  const registrosVisibles = filtrados.slice(
    (paginaActual - 1) * PAGE_SIZE,
    paginaActual * PAGE_SIZE
  );

  // ==========================================
  // FILTROS
  // ==========================================

  const filtros: DataFilter[] = [
    {
      key: 'estado',
      label: 'Estado del niño',
      value: estado,
      onChange: (valor) => {
        setEstado(valor);
        setPage(1);
      },
      options: [
        { label: 'Todos', value: 'todos' },
        { label: 'Activos', value: 'activo' },
        { label: 'Inactivos', value: 'inactivo' },
      ],
    },
  ];

  // ==========================================
  // ACCIONES
  // ==========================================

  const acciones = (nino: Nino): RowAction[] => {
    const id = String(nino.id_nino);

    return [
      {
        type: 'view',
        label: 'Visualizar',
        onPress: () =>
          router.push({
            pathname: '/ninos/[id]',
            params: { id },
          }),
      },
      {
        type: 'edit',
        label: 'Editar',
        onPress: () =>
          router.push({
            pathname: '/ninos/[id]/editar',
            params: { id },
          }),
      },
    ];
  };

  // ==========================================
  // INTERFAZ
  // ==========================================

  return (
    <ScreenContainer>

      <ScreenHeader
        title="Niños"
        description="Registro, consulta y seguimiento de los niños del centro de salud."
        actionLabel="Registrar niño"
        actionIcon="add-outline"
        onAction={() => router.push('/ninos/nuevo')}
      />

      <ResponsiveGrid maxColumns={4}>
        <StatCard
          value={loading ? '—' : total}
          label="Niños registrados"
          icon="people-outline"
          tone="info"
        />

        <StatCard
          value={loading ? '—' : menoresDos}
          label="Menores de 2 años"
          icon="body-outline"
          tone="success"
        />

        <StatCard
          value={loading ? '—' : activos}
          label="Niños activos"
          icon="checkmark-circle-outline"
          tone="success"
        />

        <StatCard
          value={loading ? '—' : inactivos}
          label="Niños inactivos"
          icon="alert-circle-outline"
          tone="warning"
        />
      </ResponsiveGrid>

      <SectionCard
        title="Listado de niños"
        icon="list-outline"
        action={
          <AppButton
            label="Actualizar"
            icon="refresh-outline"
            variant="outline"
            size="small"
            onPress={refresh}
            disabled={loading}
          />
        }
      >
        <FilterBar
          searchValue={search}
          onSearchChange={(valor) => {
            setSearch(valor);
            setPage(1);
          }}
          searchPlaceholder="Buscar por nombres, apellidos, expediente o familia..."
          filters={filtros}
        />

        {loading ? (
          <View style={styles.cargando}>
            <ActivityIndicator
              color={colors.primary}
              size="large"
            />
            <Text style={styles.texto}>
              Consultando registros...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.cargando}>
            <Text style={styles.error}>
              {error}
            </Text>
            <AppButton
              label="Reintentar"
              onPress={refresh}
              variant="outline"
            />
          </View>
        ) : (
          <>
            <DataTable
              data={registrosVisibles}
              columns={COLUMNAS}
              keyExtractor={(nino) =>
                String(nino.id_nino)
              }
              primaryColumnKey="nombre"
              actions={acciones}
              emptyTitle="Sin resultados"
              emptyDescription="No se encontraron niños que coincidan con los filtros."
            />

            <Pagination
              page={paginaActual}
              totalPages={totalPages}
              onPageChange={setPage}
              pageSize={PAGE_SIZE}
              totalItems={filtrados.length}
            />
          </>
        )}
      </SectionCard>

    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  nombre: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },

  codigo: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },

  texto: {
    fontSize: 12,
    color: colors.text,
  },

  cargando: {
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },

  error: {
    fontSize: 13,
    color: colors.danger,
    textAlign: 'center',
    lineHeight: 20,
  },
});
