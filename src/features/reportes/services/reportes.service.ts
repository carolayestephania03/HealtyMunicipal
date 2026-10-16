import { api } from '../../../services/api/api-client';
import type { CatalogoReportes, GenerarReporteDto, PdfGenerado, RespuestaApi } from '../types';
const BASE = '/api/reportes';
export const reportesService = {
  catalogo(): Promise<RespuestaApi<CatalogoReportes>> {
    return api.get<RespuestaApi<CatalogoReportes>>(`${BASE}/catalogo`);
  },
  generar(datos: GenerarReporteDto): Promise<RespuestaApi<PdfGenerado>> {
    return api.post<RespuestaApi<PdfGenerado>>(`${BASE}/generar`, datos);
  },
};
