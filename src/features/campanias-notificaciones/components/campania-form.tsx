import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, Text, View, StyleSheet} from 'react-native';
import {colors} from '../../../constants/theme';
import {Boton, Campo, Chip, Aviso, ui} from './comunicaciones-ui';
import {comunicacionesService} from '../services/comunicaciones.service';
import type {Campania,CampaniaDto,Centro,Comunidad,Canal,EstadoVacunacion,Id} from '../types';

function fechaLocal(iso:string|null|undefined):string {
 if(!iso)return '';
 const d=new Date(iso);
 if(Number.isNaN(d.getTime()))return '';
 const p=(v:number)=>String(v).padStart(2,'0');
 return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
function fechaProgramada(cadena:string):string|null {
 if(!cadena.trim())return null;
 if(!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(cadena.trim()))throw new Error('Use YYYY-MM-DD HH:mm para programar el envío.');
 const fecha=new Date(cadena.replace(' ','T'));
 if(Number.isNaN(fecha.getTime())||fechaLocal(fecha.toISOString())!==cadena.trim())throw new Error('La fecha programada no es válida.');
 return fecha.toISOString();
}
type Props={campania?:Campania|null;centros:Centro[];comunidades:Comunidad[];centroUsuario:Id|null;global:boolean;onClose:()=>void;onSaved:()=>void};
export function CampaniaForm({campania,centros,comunidades,centroUsuario,global,onClose,onSaved}:Props){
 const editar=Boolean(campania);
 const [idCentro,setIdCentro]=useState(String(campania?.id_centro??centroUsuario??''));
 const [idComunidad,setIdComunidad]=useState(String(campania?.id_comunidad??''));
 const [titulo,setTitulo]=useState(campania?.titulo??'');
 const [mensaje,setMensaje]=useState(campania?.mensaje??'');
 const [canal,setCanal]=useState<Canal>(campania?.canal??'EMAIL');
 const [edadMin,setEdadMin]=useState(campania?.edad_minima_meses==null?'':String(campania.edad_minima_meses));
 const [edadMax,setEdadMax]=useState(campania?.edad_maxima_meses==null?'':String(campania.edad_maxima_meses));
 const [vacuna,setVacuna]=useState<'TODAS'|EstadoVacunacion>(campania?.estado_vacunacion_objetivo??'TODAS');
 const [fecha,setFecha]=useState(fechaLocal(campania?.fecha_programada));
 const [guardando,setGuardando]=useState(false);
 const [error,setError]=useState<string|null>(null);
 const [buscaComunidad,setBuscaComunidad]=useState('');
 useEffect(()=>{
  setIdCentro(String(campania?.id_centro??centroUsuario??''));setIdComunidad(String(campania?.id_comunidad??''));setTitulo(campania?.titulo??'');setMensaje(campania?.mensaje??'');setCanal(campania?.canal??'EMAIL');setEdadMin(campania?.edad_minima_meses==null?'':String(campania.edad_minima_meses));setEdadMax(campania?.edad_maxima_meses==null?'':String(campania.edad_maxima_meses));setVacuna(campania?.estado_vacunacion_objetivo??'TODAS');setFecha(fechaLocal(campania?.fecha_programada));setError(null);
 },[campania,centroUsuario]);
 const comunidadesFiltradas=useMemo(()=>comunidades.filter(c=>String(c.id_centro)===idCentro && c.activo!==false && c.nombre.toLowerCase().includes(buscaComunidad.toLowerCase())),[comunidades,idCentro,buscaComunidad]);
 const guardar=async()=>{
  try{
   setError(null);
   const nCentro=Number(idCentro);if(!Number.isSafeInteger(nCentro)||nCentro<1)throw new Error('Seleccione un centro de salud.');
   if(titulo.trim().length<1||titulo.trim().length>200)throw new Error('El título debe tener entre 1 y 200 caracteres.');
   if(!mensaje.trim()||mensaje.length>4096)throw new Error('El mensaje es obligatorio y no puede exceder 4096 caracteres.');
   const numero=(v:string,nombre:string)=>{
    if(!v.trim())return null;
    if(!/^\d+$/.test(v.trim()))throw new Error(`${nombre} debe ser un entero no negativo.`);
    return Number(v);
   };
   const minimo=numero(edadMin,'Edad mínima'),maximo=numero(edadMax,'Edad máxima');
   if(minimo!==null&&maximo!==null&&maximo<minimo)throw new Error('La edad máxima no puede ser menor que la mínima.');
   const fechaIso=fechaProgramada(fecha);
   const dto:CampaniaDto={id_centro:nCentro,id_comunidad:idComunidad?Number(idComunidad):null,titulo:titulo.trim(),mensaje:mensaje.trim(),canal,
    edad_minima_meses:minimo,edad_maxima_meses:maximo,estado_vacunacion_objetivo:vacuna==='TODAS'?null:vacuna,fecha_programada:fechaIso};
   setGuardando(true);
   const r=editar&&campania?await comunicacionesService.editarCampania(campania.id_campania,dto):await comunicacionesService.crearCampania(dto);
   if(!r.success)throw new Error(r.message??'No se pudo guardar.');
   onSaved();
  }catch(e){setError(e instanceof Error?e.message:'Error al guardar campaña.');}
  finally{setGuardando(false);}
 };
 return <View style={styles.container}>
  <Text style={styles.titulo}>{editar?'Editar campaña':'Registrar campaña'}</Text>
  <Text style={ui.muted}>La campaña tiene un canal único. Para enviar el mismo aviso por ambos medios, registre una campaña por Email y otra por Telegram.</Text>
  <Aviso mensaje={error}/>
  <View style={{gap:8}}><Text style={styles.label}>Centro de salud *</Text><View style={ui.fila}>
    {centros.filter(c=>c.activo!==false||String(c.id_centro)===idCentro).map(c=><Chip key={String(c.id_centro)} texto={c.nombre} activo={String(c.id_centro)===idCentro} disabled={!global} onPress={()=>{setIdCentro(String(c.id_centro));setIdComunidad('');}}/>)}
   </View>{!centros.length?<Text style={ui.muted}>No se obtuvo el catálogo de centros. Compruebe permisos o el perfil institucional.</Text>:null}</View>
  <View style={{gap:8}}><Text style={styles.label}>Comunidad destinataria</Text><Text style={ui.muted}>Seleccione «Todo el centro» para incluir todas sus comunidades.</Text>
    <Campo etiqueta="Filtrar comunidades" value={buscaComunidad} onChangeText={setBuscaComunidad} placeholder="Buscar comunidad..."/>
    <View style={ui.fila}><Chip texto="Todo el centro" activo={!idComunidad} onPress={()=>setIdComunidad('')}/>
    {comunidadesFiltradas.map(c=><Chip key={String(c.id_comunidad)} texto={c.nombre} activo={idComunidad===String(c.id_comunidad)} onPress={()=>setIdComunidad(String(c.id_comunidad))}/>)}</View>
  </View>
  <View style={ui.fila}><Campo etiqueta="Título *" value={titulo} onChangeText={setTitulo} placeholder="Ej. Jornada de vacunación"/></View>
  <Campo etiqueta="Mensaje de la campaña *" value={mensaje} onChangeText={setMensaje} lines={5} placeholder="Escriba el mensaje para padres o tutores..."/>
  <View style={{gap:8}}><Text style={styles.label}>Canal de comunicación *</Text><View style={ui.fila}><Chip texto="Correo electrónico" activo={canal==='EMAIL'} onPress={()=>setCanal('EMAIL')}/><Chip texto="Telegram" activo={canal==='TELEGRAM'} onPress={()=>setCanal('TELEGRAM')}/></View></View>
  <View style={ui.fila}><Campo etiqueta="Edad mínima del niño (meses)" value={edadMin} onChangeText={setEdadMin} placeholder="Sin mínimo" keyboardType="numeric"/>
  <Campo etiqueta="Edad máxima del niño (meses)" value={edadMax} onChangeText={setEdadMax} placeholder="Sin máximo" keyboardType="numeric"/></View>
  <View style={{gap:8}}><Text style={styles.label}>Estado de vacunación objetivo</Text><View style={ui.fila}>
    {(['TODAS','PENDIENTE','APLICADA','ATRASADA'] as const).map(v=><Chip key={v} texto={v==='TODAS'?'Sin filtro':v} activo={vacuna===v} onPress={()=>setVacuna(v)}/>)}</View></View>
  <Campo etiqueta="Fecha programada (YYYY-MM-DD HH:mm)" value={fecha} onChangeText={setFecha} placeholder="Dejar vacío para borrador"/>
  <Text style={ui.muted}>La fecha programada NO realiza envíos automáticos. Cuando llegue ese momento, se debe ejecutar «Enviar siguiente lote».</Text>
  <View style={ui.fila}><Boton texto={guardando?'Guardando...':'Guardar campaña'} icono="save-outline" onPress={()=>void guardar()} disabled={guardando}/><Boton texto="Cancelar" icono="close-outline" secundario onPress={onClose} disabled={guardando}/>{guardando?<ActivityIndicator color={colors.primary}/>:null}</View>
 </View>;
}
const styles=StyleSheet.create({container:{gap:18},titulo:{fontSize:20,fontWeight:'800',color:colors.text},label:{fontSize:13,fontWeight:'700',color:colors.text}});
