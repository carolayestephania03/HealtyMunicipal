export type Nino = {
  id: string;
  nombre: string;
  edad: number;
  dpiMadre: string;
  dpiPadre: string | null;
  vacunacion: number;
  ultimoPesoKg: number;
  ultimaMedidaCm: number;
  comunidad: string;
};

export type AgeRangeFilter = 'todos' | '0-5' | '6-17';
export type VaccinationStatusFilter = 'todos' | 'al_dia' | 'seguimiento' | 'atrasado';
