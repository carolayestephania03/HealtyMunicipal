import { api } from '../../../services/api/api-client';
import type { Id, RespuestaApi, Campania, CampaniaDto, Notificacion, CatalogosComunicacion, Objetivo, ResumenGeneracion, LoteEnvio, EstadoCampania } from '../types';
const idR = (id:Id)=>encodeURIComponent(String(id));
const API_C = '/api/campanias';
const API_N = '/api/notificaciones';
export const comunicacionesService = {
 campanias: (f?:{estado?:EstadoCampania;id_centro?:Id}):Promise<RespuestaApi<Campania[]>>=>{
   const params=new URLSearchParams();
   if(f?.estado)params.set('estado',f.estado);
   if(f?.id_centro)params.set('id_centro',String(f.id_centro));
   const q=params.toString();return api.get<RespuestaApi<Campania[]>>(`${API_C}${q?'?'+q:''}`);
 },
 campania: (id:Id):Promise<RespuestaApi<Campania>>=>api.get(`${API_C}/${idR(id)}`),
 crearCampania: (body:CampaniaDto):Promise<RespuestaApi<Campania>>=>api.post(API_C,body),
 editarCampania: (id:Id,body:Partial<CampaniaDto>):Promise<RespuestaApi<Campania>>=>api.put(`${API_C}/${idR(id)}`,body),
 poblacion: (id:Id):Promise<RespuestaApi<Objetivo[]>>=>api.get(`${API_C}/${idR(id)}/poblacion`),
 generar: (id:Id):Promise<RespuestaApi<ResumenGeneracion>>=>api.post(`${API_C}/${idR(id)}/notificaciones`,{}),
 enviarLote: (id:Id):Promise<RespuestaApi<LoteEnvio>>=>api.post(`${API_C}/${idR(id)}/enviar-lote`,{}),
 finalizar: (id:Id):Promise<RespuestaApi<Campania>>=>api.patch(`${API_C}/${idR(id)}/finalizar`,{}),
 cancelar: (id:Id):Promise<RespuestaApi<Campania>>=>api.patch(`${API_C}/${idR(id)}/cancelar`,{}),
 notificaciones: (f?:{estado?:string;canal?:string}):Promise<RespuestaApi<Notificacion[]>>=>{
   const q=new URLSearchParams();if(f?.estado)q.set('estado',f.estado);if(f?.canal)q.set('canal',f.canal);
   return api.get(`${API_N}${q.toString()?'?'+q.toString():''}`);
 },
 procesarNotificacion: (id:Id):Promise<RespuestaApi<Notificacion>>=>api.post(`${API_N}/${idR(id)}/procesar`,{}),
 catalogos: ():Promise<RespuestaApi<CatalogosComunicacion>>=>api.get(`${API_C}/catalogos`),
};
