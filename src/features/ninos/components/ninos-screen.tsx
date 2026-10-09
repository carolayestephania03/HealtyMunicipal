
import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Text,
  View,
  StyleSheet,
} from 'react-native';

import {
  Href,
  router,
  useLocalSearchParams,
} from 'expo-router';

import { ScreenContainer } from '../../../components/layout/screen-container';
import { ScreenHeader } from '../../../components/layout/screen-header';
import { ResponsiveGrid } from '../../../components/layout/responsive-grid';

import { StatCard } from '../../../components/ui/stat-card';
import { SectionCard } from '../../../components/ui/section-card';
import { StatusBadge } from '../../../components/ui/status-badge';

import { FilterBar } from '../../../components/data/filter-bar';
import type { DataFilter } from '../../../components/data/filter-bar';

import { DataTable } from '../../../components/data/data-table';
import type { DataColumn } from '../../../components/data/data-table';

import { Pagination } from '../../../components/data/pagination';
import type { RowAction } from '../../../components/data/row-actions';

import { colors } from '../../../constants/theme';

// =============================================
// TIPOS
// =============================================

type Vacunacion =
  | 'al-dia'
  | 'pendiente'
  | 'atrasada';

type NinoDemo = {
  id: string;
  nombre: string;
  edadMeses: number;
  comunidad: string;
  responsable: string;
  vacunacion: Vacunacion;
};

// =============================================
// DATOS FICTICIOS PARA PRUEBAS DE INTERFAZ
// =============================================

const DEMO_NINOS: NinoDemo[] = [
  {
    id: 'DEMO-001',
    nombre: 'Paciente de prueba 01',
    edadMeses: 8,
    comunidad: 'Comunidad A',
    responsable: 'Tutor de prueba 01',
    vacunacion: 'al-dia',
  },
  {
    id: 'DEMO-002',
    nombre: 'Paciente de prueba 02',
    edadMeses: 14,
    comunidad: 'Comunidad B',
    responsable: 'Tutor de prueba 02',
    vacunacion: 'pendiente',
  },
  {
    id: 'DEMO-003',
    nombre: 'Paciente de prueba 03',
    edadMeses: 36,
    comunidad: 'Comunidad A',
    responsable: 'Tutor de prueba 03',
    vacunacion: 'atrasada',
  },
  {
    id: 'DEMO-004',
    nombre: 'Paciente de prueba 04',
    edadMeses: 11,
    comunidad: 'Comunidad C',
    responsable: 'Tutor de prueba 04',
    vacunacion: 'al-dia',
  },
  {
    id: 'DEMO-005',
    nombre: 'Paciente de prueba 05',
    edadMeses: 26,
    comunidad: 'Comunidad B',
    responsable: 'Tutor de prueba 05',
    vacunacion: 'pendiente',
  },
  {
    id: 'DEMO-006',
    nombre: 'Paciente de prueba 06',
    edadMeses: 5,
    comunidad: 'Comunidad C',
    responsable: 'Tutor de prueba 06',
    vacunacion: 'al-dia',
  },
  {
    id: 'DEMO-007',
    nombre: 'Paciente de prueba 07',
    edadMeses: 19,
    comunidad: 'Comunidad A',
    responsable: 'Tutor de prueba 07',
    vacunacion: 'al-dia',
  },
  {
    id: 'DEMO-008',
    nombre: 'Paciente de prueba 08',
    edadMeses: 43,
    comunidad: 'Comunidad C',
    responsable: 'Tutor de prueba 08',
    vacunacion: 'atrasada',
  },
];

// =============================================
// FORMATO DE EDAD
// =============================================

function formatEdad(meses: number): string {
  if (meses < 12) {
    return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
  }

  const anios = Math.floor(meses / 12);
  const restantes = meses % 12;

  return (
    `${anios} ${anios === 1 ? 'año' : 'años'}` +
    (restantes ? ` ${restantes} meses` : '')
  );
}

// =============================================
// ESTADOS DE VACUNACIÓN
// =============================================

const estado = {
  'al-dia': {
    label: 'Al día',
    tone: 'success',
  },
  pendiente: {
    label: 'Pendiente',
    tone: 'warning',
  },
  atrasada: {
    label: 'Atrasada',
    tone: 'danger',
  },
} as const;

// =============================================
// COLUMNAS REUTILIZABLES
// =============================================

const COLUMNS: DataColumn<NinoDemo>[] = [
  {
    key: 'id',
    title: 'Código',
    width: 105,
    render: (item) => (
      <Text style={styles.value}>
        {item.id}
      </Text>
    ),
  },
  {
    key: 'nombre',
    title: 'Nombre del niño',
    width: 205,
    render: (item) => (
      <Text style={styles.name}>
        {item.nombre}
      </Text>
    ),
  },
  {
    key: 'edad',
    title: 'Edad',
    width: 125,
    render: (item) => (
      <Text style={styles.value}>
        {formatEdad(item.edadMeses)}
      </Text>
    ),
  },
  {
    key: 'comunidad',
    title: 'Comunidad',
    width: 135,
    render: (item) => (
      <Text style={styles.value}>
        {item.comunidad}
      </Text>
    ),
  },
  {
    key: 'responsable',
    title: 'Responsable',
    width: 170,
    render: (item) => (
      <Text style={styles.value}>
        {item.responsable}
      </Text>
    ),
  },
  {
    key: 'vacunacion',
    title: 'Vacunación',
    width: 135,
    render: (item) => (
      <StatusBadge
        {...estado[item.vacunacion]}
      />
    ),
  },
];

const PAGE_SIZE = 5;

// =============================================
// PANTALLA PRINCIPAL
// =============================================

export function NinosScreen() {
  const { q } = useLocalSearchParams<{
    q?: string;
  }>();

  const [search, setSearch] = useState('');

  const [comunidad, setComunidad] =
    useState('todas');

  const [vacunacion, setVacunacion] =
    useState('todos');

  const [edad, setEdad] =
    useState('todas');

  const [page, setPage] = useState(1);

  // Recibir búsquedas del encabezado global
  useEffect(() => {
    setSearch(
      typeof q === 'string' ? q : ''
    );
    setPage(1);
  }, [q]);

  // ===========================================
  // FILTRADO
  // ===========================================

  const filtered = useMemo(
    () =>
      DEMO_NINOS.filter((nino) => {
        const term = search
          .toLocaleLowerCase()
          .trim();

        const matchesText =
          !term ||
          [
            nino.nombre,
            nino.id,
            nino.responsable,
          ].some((text) =>
            text
              .toLocaleLowerCase()
              .includes(term)
          );

        const matchesComunidad =
          comunidad === 'todas' ||
          nino.comunidad === comunidad;

        const matchesVacunacion =
          vacunacion === 'todos' ||
          nino.vacunacion === vacunacion;

        const matchesEdad =
          edad === 'todas' ||
          (
            edad === 'menor1' &&
            nino.edadMeses < 12
          ) ||
          (
            edad === '1a2' &&
            nino.edadMeses >= 12 &&
            nino.edadMeses < 24
          ) ||
          (
            edad === '2omas' &&
            nino.edadMeses >= 24
          );

        return (
          matchesText &&
          matchesComunidad &&
          matchesVacunacion &&
          matchesEdad
        );
      }),
    [search, comunidad, vacunacion, edad]
  );

  // ===========================================
  // PAGINACIÓN
  // ===========================================

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / PAGE_SIZE)
  );

  const visible = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // ===========================================
  // CONFIGURACIÓN DE FILTROS
  // ===========================================

  const filters: DataFilter[] = [
    {
      key: 'comunidad',
      label: 'Comunidad',
      value: comunidad,
      options: [
        {
          label: 'Todas las comunidades',
          value: 'todas',
        },
        {
          label: 'Comunidad A',
          value: 'Comunidad A',
        },
        {
          label: 'Comunidad B',
          value: 'Comunidad B',
        },
        {
          label: 'Comunidad C',
          value: 'Comunidad C',
        },
      ],
      onChange: (value) => {
        setComunidad(value);
        setPage(1);
      },
    },
    {
      key: 'vacunacion',
      label: 'Vacunación',
      value: vacunacion,
      options: [
        {
          label: 'Todos los estados',
          value: 'todos',
        },
        {
          label: 'Al día',
          value: 'al-dia',
        },
        {
          label: 'Pendiente',
          value: 'pendiente',
        },
        {
          label: 'Atrasada',
          value: 'atrasada',
        },
      ],
      onChange: (value) => {
        setVacunacion(value);
        setPage(1);
      },
    },
    {
      key: 'edad',
      label: 'Edad',
      value: edad,
      options: [
        {
          label: 'Todas las edades',
          value: 'todas',
        },
        {
          label: 'Menor de 1 año',
          value: 'menor1',
        },
        {
          label: 'De 1 a menos de 2 años',
          value: '1a2',
        },
        {
          label: '2 años o más',
          value: '2omas',
        },
      ],
      onChange: (value) => {
        setEdad(value);
        setPage(1);
      },
    },
  ];

  // ===========================================
  // ACCIONES POR REGISTRO
  // ===========================================

  const getActions = (
    nino: NinoDemo
  ): RowAction[] => [
    {
      type: 'view',
      label: 'Ver',
      onPress: () =>
        router.push(
          `/ninos/${nino.id}` as Href
        ),
    },
    {
      type: 'edit',
      label: 'Editar',
      onPress: () =>
        router.push(
          `/ninos/${nino.id}/editar` as Href
        ),
    },
  ];

  // ===========================================
  // INTERFAZ
  // ===========================================

  return (
    <ScreenContainer>

      <ScreenHeader
        title="Niños"
        description="Registro, consulta y seguimiento de los niños del centro de salud."
        actionLabel="Registrar niño"
        actionIcon="add-outline"
        onAction={() =>
          router.push('/ninos/nuevo')
        }
      />

      {/* Indicadores generales */}
      <ResponsiveGrid maxColumns={4}>

        <StatCard
          value="—"
          label="Niños registrados"
          icon="people-outline"
        />

        <StatCard
          value="—"
          label="Menores de 2 años"
          icon="body-outline"
          tone="success"
        />

        <StatCard
          value="—"
          label="Con control reciente"
          icon="stats-chart-outline"
          tone="warning"
        />

        <StatCard
          value="—"
          label="Con vacunas pendientes"
          icon="medkit-outline"
          tone="danger"
        />

      </ResponsiveGrid>

      {/* Listado */}
      <SectionCard
        title="Listado de niños"
        icon="list-outline"
      >

        <View style={styles.demoBanner}>
          <Text style={styles.demoText}>
            DEMOSTRACIÓN: los registros siguientes
            son ejemplos locales; todavía no están
            conectados a la API ni representan
            pacientes reales.
          </Text>
        </View>

        {/* Buscador y filtros */}
        <FilterBar
          searchValue={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          searchPlaceholder="Buscar por nombre, código o responsable..."
          filters={filters}
        />

        {/* Tabla / tarjetas */}
        <DataTable
          data={visible}
          columns={COLUMNS}
          keyExtractor={(nino) => nino.id}
          primaryColumnKey="nombre"
          actions={getActions}
          emptyTitle="Sin resultados"
          emptyDescription="Pruebe con otros filtros o cambie el texto de búsqueda."
        />

        {/* Paginación */}
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
        />

      </SectionCard>

    </ScreenContainer>
  );
}

// =============================================
// ESTILOS
// =============================================

const styles = StyleSheet.create({
  value: {
    fontSize: 12,
    color: colors.text,
  },

  name: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },

  demoBanner: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.infoLight,
    padding: 10,
  },

  demoText: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
  },
});
