
import { api } from '../../../services/api/api-client';

import type {
  Id,
  TutorPerfil,
  TutorResumen,
  EditarTutorDto,
  RespuestaApi,
  CrearTutorDto,
  AsociarTutorNinoDto,
  NinoBusqueda,
  ConsultaTablaTutores,
  RespuestaTablaTutores,
} from '../types';

// ======================================================
// CONFIGURACIÓN DE ENDPOINTS
// ======================================================

// Estos endpoints se montan antes del router
// original de Tutores.
//
// Se evita descargar identificaciones personales,
// documentos cifrados o hashes al frontend.

const BASE = '/api/tutores';

const segmentoId = (id: Id): string =>
  encodeURIComponent(String(id));

// ======================================================
// SERVICIO DE TUTORES
// ======================================================

export const tutoresService = {

  // --------------------------------------------------
  // CONSULTAR TABLA DE TUTORES
  // --------------------------------------------------

  tabla(
    filtros: ConsultaTablaTutores
  ): Promise<RespuestaTablaTutores> {

    return api.post<RespuestaTablaTutores>(
      `${BASE}/tabla`,
      filtros
    );
  },

  // --------------------------------------------------
  // CREAR NUEVO TUTOR
  // --------------------------------------------------

  crear(
    datos: CrearTutorDto
  ): Promise<RespuestaApi<TutorPerfil>> {

    return api.post<RespuestaApi<TutorPerfil>>(
      `${BASE}/perfil`,
      datos
    );
  },

  // --------------------------------------------------
  // BUSCAR NIÑOS PARA ASOCIACIÓN
  // --------------------------------------------------

  buscarNinos(
    q: string
  ): Promise<RespuestaApi<NinoBusqueda[]>> {

    return api.post<RespuestaApi<NinoBusqueda[]>>(
      `${BASE}/ninos-buscar`,
      {
        q: q.trim()
      }
    );
  },

  // --------------------------------------------------
  // ASOCIAR UN NIÑO AL TUTOR
  // --------------------------------------------------

  asociarNino(
    id: Id,
    idNino: Id,
    datos: AsociarTutorNinoDto
  ): Promise<RespuestaApi<TutorPerfil>> {

    return api.post<RespuestaApi<TutorPerfil>>(
      `${BASE}/perfil/${segmentoId(id)}/ninos/${segmentoId(idNino)}`,
      datos
    );
  },

  // --------------------------------------------------
  // FINALIZAR RELACIÓN TUTOR - NIÑO
  // --------------------------------------------------

  finalizarRelacion(
    id: Id,
    idNino: Id
  ): Promise<RespuestaApi<TutorPerfil>> {

    return api.patch<RespuestaApi<TutorPerfil>>(
      `${BASE}/perfil/${segmentoId(id)}/ninos/${segmentoId(idNino)}/finalizar`,
      {}
    );
  },

  // --------------------------------------------------
  // BUSCAR TUTOR POR NOMBRE O DPI
  // --------------------------------------------------

  buscar(
    q: string
  ): Promise<RespuestaApi<TutorResumen[]>> {

    return api.post<RespuestaApi<TutorResumen[]>>(
      `${BASE}/buscar`,
      {
        q: q.trim()
      }
    );
  },

  // --------------------------------------------------
  // CONSULTAR PERFIL DEL TUTOR
  // --------------------------------------------------

  perfil(
    id: Id
  ): Promise<RespuestaApi<TutorPerfil>> {

    return api.get<RespuestaApi<TutorPerfil>>(
      `${BASE}/perfil/${segmentoId(id)}`
    );
  },

  // --------------------------------------------------
  // EDITAR INFORMACIÓN DEL TUTOR
  // --------------------------------------------------

  editar(
    id: Id,
    datos: EditarTutorDto
  ): Promise<RespuestaApi<TutorPerfil>> {

    return api.put<RespuestaApi<TutorPerfil>>(
      `${BASE}/perfil/${segmentoId(id)}`,
      datos
    );
  },

  // --------------------------------------------------
  // ACTIVAR O DESACTIVAR TUTOR
  // --------------------------------------------------

  cambiarEstado(
    id: Id,
    activo: boolean
  ): Promise<RespuestaApi<TutorPerfil>> {

    return api.patch<RespuestaApi<TutorPerfil>>(
      `${BASE}/perfil/${segmentoId(id)}/estado`,
      {
        activo
      }
    );
  },
};
