
export type RegistroId = number | string;

// ======================================================
// TIPOS NUMÉRICOS
// ======================================================

// PostgreSQL / Sequelize puede devolver los campos
// DECIMAL como cadenas de texto.

export type ValorDecimal =
  | number
  | string
  | null;

// ======================================================
// RESPUESTA GENERAL DE LA API
// ======================================================

export type RespuestaApi<T> = {
  success: boolean;
  message: string;
  data: T;
};

// ======================================================
// REGISTRO DE CRECIMIENTO
// ======================================================

export type RegistroCrecimiento = {
  id_registro: RegistroId;

  id_nino: RegistroId;
  id_usuario_registro: RegistroId;

  fecha_medicion: string;
  edad_meses: number | string;

  peso_kg: number | string;
  talla_cm: number | string;

  imc: ValorDecimal;

  // --------------------------------------------------
  // PERCENTILES OMS
  // --------------------------------------------------

  percentil_peso_edad: ValorDecimal;
  percentil_talla_edad: ValorDecimal;
  percentil_imc_edad: ValorDecimal;

  // --------------------------------------------------
  // PUNTUACIONES Z
  // --------------------------------------------------

  zscore_peso_edad: ValorDecimal;
  zscore_talla_edad: ValorDecimal;
  zscore_imc_edad: ValorDecimal;

  // --------------------------------------------------
  // OBSERVACIONES
  // --------------------------------------------------

  observaciones?: string | null;

  // --------------------------------------------------
  // USUARIO QUE REGISTRÓ EL CONTROL
  // --------------------------------------------------

  usuarioRegistro?: {
    id_usuario: RegistroId;
    nombres: string;
    apellidos: string;
  } | null;
};

// ======================================================
// REGISTRAR CONTROL DE CRECIMIENTO
// ======================================================

export type CrearControlDto = {
  id_nino: number;
  fecha_medicion: string;
  peso_kg: number;
  talla_cm: number;
  observaciones?: string | null;
};

// ======================================================
// ACTUALIZAR CONTROL DE CRECIMIENTO
// ======================================================

export type ActualizarControlDto =
  Partial<
    Omit<
      CrearControlDto,
      'id_nino'
    >
  >;

// ======================================================
// CONVERTIR DECIMAL A NÚMERO
// ======================================================

export function numeroSeguro(
  valor: unknown
): number | null {

  if (
    valor === null ||
    valor === undefined ||
    valor === ''
  ) {
    return null;
  }

  const numero = Number(valor);

  return Number.isFinite(numero)
    ? numero
    : null;
}

// ======================================================
// OBTENER FECHA YYYY-MM-DD
// ======================================================

export function fechaCorta(
  fecha: string
): string {

  return fecha?.slice(0, 10) || '—';
}
