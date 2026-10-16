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
  EstadoTelegramTutor,
  EnlaceTelegramTutor,
  ResultadoPruebaTelegram,
} from '../types';

// Estos cuatro endpoints nuevos se montan antes del router original de Tutores.
// No usan GET /api/tutores: evita descargar todas las identificaciones personales.
const BASE = '/api/tutores';
const segmentoId = (id: Id): string => encodeURIComponent(String(id));

export const tutoresService = {
  tabla(filtros: ConsultaTablaTutores): Promise<RespuestaTablaTutores> {
    return api.post<RespuestaTablaTutores>(`${BASE}/tabla`, filtros);
  },
  crear(datos: CrearTutorDto): Promise<RespuestaApi<TutorPerfil>> {
    return api.post<RespuestaApi<TutorPerfil>>(`${BASE}/perfil`, datos);
  },
  buscarNinos(q: string): Promise<RespuestaApi<NinoBusqueda[]>> {
    return api.post<RespuestaApi<NinoBusqueda[]>>(`${BASE}/ninos-buscar`, { q: q.trim() });
  },
  asociarNino(id: Id, idNino: Id, datos: AsociarTutorNinoDto): Promise<RespuestaApi<TutorPerfil>> {
    return api.post<RespuestaApi<TutorPerfil>>(
      `${BASE}/perfil/${segmentoId(id)}/ninos/${segmentoId(idNino)}`, datos
    );
  },
  finalizarRelacion(id: Id, idNino: Id): Promise<RespuestaApi<TutorPerfil>> {
    return api.patch<RespuestaApi<TutorPerfil>>(
      `${BASE}/perfil/${segmentoId(id)}/ninos/${segmentoId(idNino)}/finalizar`, {}
    );
  },
  buscar(q: string): Promise<RespuestaApi<TutorResumen[]>> {
    // El DPI va en el cuerpo, nunca en la URL.
    return api.post<RespuestaApi<TutorResumen[]>>(
      `${BASE}/buscar`,
      { q: q.trim() }
    );
  },

  perfil(id: Id): Promise<RespuestaApi<TutorPerfil>> {
    return api.get<RespuestaApi<TutorPerfil>>(`${BASE}/perfil/${segmentoId(id)}`);
  },

  editar(id: Id, datos: EditarTutorDto): Promise<RespuestaApi<TutorPerfil>> {
    return api.put<RespuestaApi<TutorPerfil>>(
      `${BASE}/perfil/${segmentoId(id)}`,
      datos
    );
  },

  telegramEstado(id: Id): Promise<RespuestaApi<EstadoTelegramTutor>> {
    return api.get(`${BASE}/${segmentoId(id)}/telegram/estado`);
  },
  telegramGenerar(id: Id): Promise<RespuestaApi<EnlaceTelegramTutor>> {
    return api.post(`${BASE}/${segmentoId(id)}/telegram/vinculacion`, {});
  },
  telegramPrueba(id: Id): Promise<RespuestaApi<ResultadoPruebaTelegram>> {
    return api.post(`${BASE}/${segmentoId(id)}/telegram/prueba`, {});
  },
  telegramDesvincular(id: Id): Promise<RespuestaApi<EstadoTelegramTutor>> {
    return api.post(`${BASE}/${segmentoId(id)}/telegram/desvincular`, {});
  },

  cambiarEstado(id: Id, activo: boolean): Promise<RespuestaApi<TutorPerfil>> {
    return api.patch<RespuestaApi<TutorPerfil>>(
      `${BASE}/perfil/${segmentoId(id)}/estado`,
      { activo }
    );
  },
};
