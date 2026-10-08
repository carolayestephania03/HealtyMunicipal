import type { AgeRangeFilter, Nino, VaccinationStatusFilter } from '@/types/nino';

export const NINOS: Nino[] = [
  {
    id: '1',
    nombre: 'Mateo López García',
    edad: 3,
    dpiMadre: '1234567890101',
    dpiPadre: null,
    vacunacion: 85,
    ultimoPesoKg: 14.5,
    ultimaMedidaCm: 98,
    comunidad: 'San Juan',
  },
  {
    id: '2',
    nombre: 'Ana Pérez Pérez',
    edad: 4,
    dpiMadre: '9876543210202',
    dpiPadre: '5678901230303',
    vacunacion: 60,
    ultimoPesoKg: 15.1,
    ultimaMedidaCm: 101,
    comunidad: 'La Unión',
  },
  {
    id: '3',
    nombre: 'Luis Méndez Castro',
    edad: 2,
    dpiMadre: '1122334450404',
    dpiPadre: '4455667780505',
    vacunacion: 100,
    ultimoPesoKg: 11.8,
    ultimaMedidaCm: 88,
    comunidad: 'San Juan',
  },
  {
    id: '4',
    nombre: 'Sofía Ramírez Díaz',
    edad: 1,
    dpiMadre: '3012456789012',
    dpiPadre: '3012987654321',
    vacunacion: 42,
    ultimoPesoKg: 9.4,
    ultimaMedidaCm: 74,
    comunidad: 'El Rosario',
  },
  {
    id: '5',
    nombre: 'Diego Morales Cruz',
    edad: 7,
    dpiMadre: '2456789012345',
    dpiPadre: '2456123456789',
    vacunacion: 92,
    ultimoPesoKg: 24.3,
    ultimaMedidaCm: 124,
    comunidad: 'La Unión',
  },
  {
    id: '6',
    nombre: 'Camila Hernández López',
    edad: 12,
    dpiMadre: '1789012345678',
    dpiPadre: null,
    vacunacion: 55,
    ultimoPesoKg: 41.2,
    ultimaMedidaCm: 148,
    comunidad: 'San Pedro',
  },
  {
    id: '7',
    nombre: 'José Antonio Ruiz',
    edad: 16,
    dpiMadre: '4098765432109',
    dpiPadre: '4098123456780',
    vacunacion: 38,
    ultimoPesoKg: 58.6,
    ultimaMedidaCm: 169,
    comunidad: 'El Rosario',
  },
  {
    id: '8',
    nombre: 'Valentina Gómez Soto',
    edad: 5,
    dpiMadre: '5566778899001',
    dpiPadre: '5566123456789',
    vacunacion: 78,
    ultimoPesoKg: 18.2,
    ultimaMedidaCm: 110,
    comunidad: 'San Pedro',
  },
];

export const COMUNIDADES = [...new Set(NINOS.map((nino) => nino.comunidad))].sort((a, b) =>
  a.localeCompare(b, 'es')
);

export function getNinoById(id: string) {
  return NINOS.find((nino) => nino.id === id);
}

export function matchesAgeRange(edad: number, range: AgeRangeFilter) {
  if (range === '0-5') {
    return edad >= 0 && edad <= 5;
  }
  if (range === '6-17') {
    return edad >= 6 && edad <= 17;
  }
  return true;
}

export function matchesVaccinationStatus(percent: number, status: VaccinationStatusFilter) {
  if (status === 'al_dia') {
    return percent >= 80;
  }
  if (status === 'seguimiento') {
    return percent >= 50 && percent < 80;
  }
  if (status === 'atrasado') {
    return percent < 50;
  }
  return true;
}

export function normalizeSearch(value: string) {
  return value.trim().toLowerCase().replace(/[\s-]/g, '');
}

export function matchesSearch(nino: Nino, query: string) {
  const needle = normalizeSearch(query);
  if (!needle) {
    return true;
  }

  const haystacks = [nino.nombre, nino.dpiMadre, nino.dpiPadre ?? ''];
  return haystacks.some((value) => normalizeSearch(value).includes(needle));
}

export function formatDpi(value: string | null) {
  if (!value) {
    return 'N/A';
  }

  const digits = value.replace(/\D/g, '');
  if (digits.length !== 13) {
    return value;
  }

  return `${digits.slice(0, 4)} ${digits.slice(4, 9)} ${digits.slice(9)}`;
}
