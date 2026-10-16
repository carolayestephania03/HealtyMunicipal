import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {useFocusEffect} from 'expo-router';
import {ScreenContainer} from '../../../components/layout/screen-container';
import {ScreenHeader} from '../../../components/layout/screen-header';
import {colors} from '../../../constants/theme';
import {Aviso, Bloque, Boton, Campo, Chip, ui} from './comunicaciones-ui';
import {CampaniaForm} from './campania-form';
import {comunicacionesService as svc} from '../services/comunicaciones.service';
import type {Campania,Centro,Comunidad,EstadoCampania,EstadoNotificacion,Canal,Id,Notificacion,Objetivo,CatalogosComunicacion} from '../types';

type Tab='CAMPAÑAS'|'NOTIFICACIONES';
type EstadoFiltro='TODAS'|EstadoCampania;
type NotifFiltro='TODAS'|EstadoNotificacion;
type Vista='LISTADO'|'NUEVA'|'EDITAR'|'DETALLE';
type Confirmar={titulo:string;descripcion:string;ejecutar:()=>Promise<void>};
const estadosCamp:EstadoFiltro[]=['TODAS','BORRADOR','PROGRAMADA','EN_PROCESO','FINALIZADA','CANCELADA'];
const estadosNotif:NotifFiltro[]=['TODAS','PENDIENTE','ENVIADA','ERROR'];
const norm=(t:unknown)=>String(t??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const fecha=(t:string|null|undefined)=>t?new Date(t).toLocaleString('es-GT',{dateStyle:'short',timeStyle:'short'}):'—';
const labelCanal=(c:Canal)=>c==='EMAIL'?'Correo':'Telegram';
const paginaDe=<T,>(items:T[],page:number)=>items.slice((page-1)*7,page*7);

function Medida({titulo,valor,icono,color=colors.primary}:{titulo:string;valor:number;icono:React.ComponentProps<typeof Ionicons>['name'];color?:string}){
 return <View style={s.kpi}><Ionicons name={icono} color={color} size={23}/><Text style={s.kpiValue}>{valor}</Text><Text style={ui.muted}>{titulo}</Text></View>;
}
function EncabezadoTabla({celdas,proporciones}:{celdas:string[];proporciones:number[]}){
 return <View style={[s.tr,s.th]}>{celdas.map((c,i)=><Text key={`${c}-${i}`} style={[s.celda,s.heading,{flex:proporciones[i]}]}>{c}</Text>)}</View>;
}
function Col({text,flex=1,muted=false,max=2}:{text:string;flex?:number;muted?:boolean;max?:number}){
 return <Text numberOfLines={max} style={[s.celda,{flex,color:muted?colors.muted:colors.text,fontWeight:muted?'400':'600'}]}>{text}</Text>;
}
function ChipEstado({nombre}:{nombre:string}){
 const ok=nombre==='ENVIADA'||nombre==='FINALIZADA';
 const bad=nombre==='ERROR'||nombre==='CANCELADA';
 const color=ok?colors.success:bad?colors.danger:colors.primary;
 return <View style={[s.estado,{backgroundColor:ok?colors.successLight:bad?colors.dangerLight:colors.infoLight}]}><Text style={{color,fontSize:11,fontWeight:'800'}}>{nombre.replaceAll('_',' ')}</Text></View>;
}
function Paginacion({pagina,total,onPage}:{pagina:number;total:number;onPage:(p:number)=>void}){
 const max=Math.max(1,Math.ceil(total/7));
 return <View style={[ui.fila,{justifyContent:'space-between'}]}><Text style={ui.muted}>{total} registros · Página {Math.min(pagina,max)} de {max}</Text>
 <View style={ui.fila}><Boton texto="Anterior" icono="chevron-back" secundario disabled={pagina<=1} onPress={()=>onPage(Math.max(1,pagina-1))}/><Boton texto="Siguiente" icono="chevron-forward" secundario disabled={pagina>=max} onPress={()=>onPage(Math.min(max,pagina+1))}/></View></View>;
}
export default function CampaniasNotificacionesScreen(){
 const [tab,setTab]=useState<Tab>('CAMPAÑAS');
 const [vista,setVista]=useState<Vista>('LISTADO');
 const [campanias,setCampanias]=useState<Campania[]>([]);
 const [notificaciones,setNotificaciones]=useState<Notificacion[]>([]);
 const [centros,setCentros]=useState<Centro[]>([]);
 const [comunidades,setComunidades]=useState<Comunidad[]>([]);
 const [catalogos,setCatalogos]=useState<CatalogosComunicacion|null>(null);
 const [cargando,setCargando]=useState(true);
 const [errorDatos,setErrorDatos]=useState<string|null>(null);
 const [mensaje,setMensaje]=useState<string|null>(null);
 const [exito,setExito]=useState(false);
 const [recarga,setRecarga]=useState(0);
 const [busqueda,setBusqueda]=useState('');
 const [estado,setEstado]=useState<EstadoFiltro>('TODAS');
 const [canalFiltro,setCanalFiltro]=useState<'TODOS'|Canal>('TODOS');
 const [estadoNotif,setEstadoNotif]=useState<NotifFiltro>('TODAS');
 const [pagina,setPagina]=useState(1);
 const [campaniaActual,setCampaniaActual]=useState<Campania|null>(null);
 const [objetivos,setObjetivos]=useState<Objetivo[]|null>(null);
 const [cargandoObjetivos,setCargandoObjetivos]=useState(false);
 const [anchoTabla,setAnchoTabla]=useState(0);
 const [confirmar,setConfirmar]=useState<Confirmar|null>(null);
 const [procesando,setProcesando]=useState(false);
 const primerFoco=useRef(true);
 const refrescar=useCallback(()=>setRecarga(v=>v+1),[]);
 useFocusEffect(useCallback(()=>{if(primerFoco.current)primerFoco.current=false;else refrescar();},[refrescar]));
 useEffect(()=>{
  let activo=true;setCargando(true);setErrorDatos(null);
  Promise.allSettled([svc.campanias(),svc.notificaciones(),svc.catalogos()]).then(r=>{
   if(!activo)return;
   const [rc,rn,rk]=r;
   const fallos:string[]=[];
   if(rc.status==='fulfilled'&&rc.value.success&&Array.isArray(rc.value.data))setCampanias(rc.value.data);else fallos.push('No se pudieron obtener las campañas.');
   if(rn.status==='fulfilled'&&rn.value.success&&Array.isArray(rn.value.data))setNotificaciones(rn.value.data.filter(n=>n.canal==='EMAIL'||n.canal==='TELEGRAM'));else fallos.push('No se pudieron consultar las notificaciones.');
   if(rk.status==='fulfilled'&&rk.value.success){
     setCatalogos(rk.value.data);setCentros(rk.value.data.centros);setComunidades(rk.value.data.comunidades);
   }else fallos.push('No se pudo consultar el catálogo autorizado de centros y comunidades.');
   setErrorDatos(fallos.length?fallos.join(' '):null);
  }).finally(()=>{if(activo)setCargando(false);});
  return()=>{activo=false;};
 },[recarga]);
 const esGlobal=Boolean(catalogos?.es_global);
 const puedeGestionar=Boolean(catalogos?.puede_gestionar);
 const abrirTab=(n:Tab)=>{setTab(n);setVista('LISTADO');setBusqueda('');setPagina(1);setMensaje(null);setConfirmar(null);};
 const regresar=()=>{setVista('LISTADO');setCampaniaActual(null);setObjetivos(null);refrescar();};
 const notifsDe=(id:Id)=>notificaciones.filter(n=>String(n.id_campania)===String(id));
 const filtradas=useMemo(()=>campanias.filter(c=>{
  const txt=norm([c.titulo,c.mensaje,c.centroSalud?.nombre,c.comunidad?.nombre,c.canal,c.estado].join(' '));
  return (!busqueda||txt.includes(norm(busqueda)))&&(estado==='TODAS'||c.estado===estado)&&(canalFiltro==='TODOS'||c.canal===canalFiltro);
 }),[campanias,busqueda,estado,canalFiltro]);
 const filtradasNot=useMemo(()=>notificaciones.filter(n=>{
  const txt=norm([n.campania?.titulo,n.tutor?.nombres,n.tutor?.apellidos,n.nino?.codigo_expediente,n.asunto,n.estado,n.canal].join(' '));
  return (!busqueda||txt.includes(norm(busqueda)))&&(estadoNotif==='TODAS'||n.estado===estadoNotif)&&(canalFiltro==='TODOS'||n.canal===canalFiltro);
 }),[notificaciones,busqueda,estadoNotif,canalFiltro]);
 const mostrar=(msj:string,ok=true)=>{setMensaje(msj);setExito(ok);};
 const ejecutar=async()=>{
  const f=confirmar;if(!f)return;setConfirmar(null);setProcesando(true);setMensaje(null);
  try{await f.ejecutar();refrescar();}catch(e){mostrar(e instanceof Error?e.message:'La operación no se pudo realizar.',false);}
  finally{setProcesando(false);}
 };
 const preguntar=(titulo:string,descripcion:string,fn:()=>Promise<void>)=>setConfirmar({titulo,descripcion,ejecutar:fn});
 const ver=async(c:Campania)=>{
  setCampaniaActual(c);setObjetivos(null);setVista('DETALLE');setMensaje(null);
  try{const r=await svc.campania(c.id_campania);if(r.success)setCampaniaActual(r.data);}catch(e){mostrar('No se pudo actualizar el detalle de la campaña.',false);}
 };
 const consultarObjetivos=async()=>{
  if(!campaniaActual)return;
  setCargandoObjetivos(true);
  try{const r=await svc.poblacion(campaniaActual.id_campania);if(!r.success)throw new Error(r.message);setObjetivos(r.data);}catch(e){mostrar(e instanceof Error?e.message:'No se pudo consultar la población.',false);}
  finally{setCargandoObjetivos(false);}
 };
 const generar=(c:Campania)=>preguntar('Generar notificaciones',`Se crearán registros pendientes para la población objetivo de «${c.titulo}». Este paso todavía NO envía mensajes.`,async()=>{
  const r=await svc.generar(c.id_campania);if(!r.success)throw new Error(r.message);
  mostrar(`Generadas: ${r.data.notificaciones_creadas}. Omitidas: ${r.data.notificaciones_omitidas}. Ahora puede enviar un lote.`);
  const detalle=await svc.campania(c.id_campania);if(detalle.success)setCampaniaActual(detalle.data);
 });
 const enviarLote=(c:Campania)=>preguntar('Confirmar envío real',`Se intentará enviar hasta 5 mensajes de «${c.titulo}» por ${labelCanal(c.canal)}. Esta acción contactará a padres/tutores. ¿Desea continuar?`,async()=>{
  const r=await svc.enviarLote(c.id_campania);if(!r.success)throw new Error(r.message);
  mostrar(`Lote: ${r.data.enviadas} enviadas, ${r.data.fallidas} fallidas, ${r.data.pendientes_sin_enviar} sin enviar. Revise el historial.`);
 });
 const transicion=(c:Campania,tipo:'finalizar'|'cancelar')=>preguntar(`${tipo==='finalizar'?'Finalizar':'Cancelar'} campaña`,
  tipo==='cancelar'?'Se bloquearán los envíos pendientes de esta campaña.':'La campaña quedará cerrada; no se permitirán nuevos envíos.',async()=>{
   const r=tipo==='finalizar'?await svc.finalizar(c.id_campania):await svc.cancelar(c.id_campania);
   if(!r.success)throw new Error(r.message);mostrar(`Campaña ${tipo==='finalizar'?'finalizada':'cancelada'}.`);
   if(vista==='DETALLE')setCampaniaActual(r.data);
  });
 const enviarUna=(n:Notificacion)=>preguntar('Enviar notificación',`Se contactará al tutor mediante ${labelCanal(n.canal)}. Esta acción es real y será registrada.`,async()=>{
   const r=await svc.procesarNotificacion(n.id_notificacion);if(!r.success)throw new Error(r.message);mostrar('Notificación enviada correctamente.');
 });
 const abiertas=campanias.filter(c=>c.estado==='PROGRAMADA').length;
 const enviadas=notificaciones.filter(n=>n.estado==='ENVIADA').length;
 const errores=notificaciones.filter(n=>n.estado==='ERROR').length;
 const pendientes=notificaciones.filter(n=>n.estado==='PENDIENTE').length;
 const detalleNotifs=campaniaActual?notifsDe(campaniaActual.id_campania):[];
 const gestor=puedeGestionar&&!procesando;
 return <ScreenContainer>
  <ScreenHeader title="Campañas y notificaciones" description="Comunicación con padres y tutores mediante correo electrónico y Telegram."/>
  <View style={[ui.fila,{justifyContent:'space-between'}]}>
   <View style={ui.fila}><Chip texto="Campañas" activo={tab==='CAMPAÑAS'} onPress={()=>abrirTab('CAMPAÑAS')}/><Chip texto="Notificaciones" activo={tab==='NOTIFICACIONES'} onPress={()=>abrirTab('NOTIFICACIONES')}/></View>
   <Boton texto={cargando?'Consultando...':'Actualizar'} icono="refresh-outline" secundario disabled={cargando||procesando} onPress={refrescar}/>
  </View>
  <View style={[s.kpis,{gap:12}]}>
   <View style={s.kpiWrap}><Medida titulo="Campañas registradas" valor={campanias.length} icono="megaphone-outline"/></View>
   <View style={s.kpiWrap}><Medida titulo="Programadas" valor={abiertas} icono="calendar-outline"/></View>
   <View style={s.kpiWrap}><Medida titulo="Notificaciones enviadas" valor={enviadas} icono="checkmark-circle-outline" color={colors.success}/></View>
   <View style={s.kpiWrap}><Medida titulo="Envíos con error" valor={errores} icono="alert-circle-outline" color={colors.danger}/></View>
  </View>
  {cargando?<ActivityIndicator size="large" color={colors.primary}/>:null}
  <Aviso mensaje={errorDatos}/>
  <Aviso mensaje={mensaje} exito={exito}/>
  {procesando?<View style={ui.fila}><ActivityIndicator color={colors.primary}/><Text style={ui.muted}>Procesando operación. No cierre esta pantalla.</Text></View>:null}
  {confirmar?<View style={[ui.bloque,{borderColor:colors.warning}]}><Text style={ui.titulo}>{confirmar.titulo}</Text><Text style={ui.muted}>{confirmar.descripcion}</Text><View style={ui.fila}><Boton texto="Confirmar" icono="checkmark-outline" onPress={()=>void ejecutar()}/><Boton texto="Volver" icono="close-outline" secundario onPress={()=>setConfirmar(null)}/></View></View>:null}
  {tab==='CAMPAÑAS'&&vista==='LISTADO'?<Bloque titulo="Listado de campañas">
   <View style={[ui.fila,{justifyContent:'space-between'}]}><Text style={ui.muted}>Campañas por centro y comunidad. No se envían mensajes automáticamente.</Text>
     {puedeGestionar?<Boton texto="Nueva campaña" icono="add" onPress={()=>{setCampaniaActual(null);setVista('NUEVA');}}/>:null}</View>
   <Campo etiqueta="Buscar campañas" value={busqueda} onChangeText={v=>{setBusqueda(v);setPagina(1);}} placeholder="Título, comunidad, mensaje, canal..."/>
   <View style={{gap:7}}><Text style={ui.etiqueta}>Estado</Text><View style={ui.fila}>{estadosCamp.map(v=><Chip key={v} texto={v==='TODAS'?'Todos':v.replaceAll('_',' ')} activo={estado===v} onPress={()=>{setEstado(v);setPagina(1);}}/>)}</View></View>
   <View style={{gap:7}}><Text style={ui.etiqueta}>Canal</Text><View style={ui.fila}>{(['TODOS','EMAIL','TELEGRAM'] as const).map(v=><Chip key={v} texto={v==='TODOS'?'Todos':v==='EMAIL'?'Correo':'Telegram'} activo={canalFiltro===v} onPress={()=>{setCanalFiltro(v);setPagina(1);}}/>)}</View></View>
   <View onLayout={e=>setAnchoTabla(e.nativeEvent.layout.width)} style={{width:'100%'}}>
    <ScrollView horizontal style={{width:'100%'}} showsHorizontalScrollIndicator={anchoTabla<1000}>
     <View style={{width:Math.max(1000,anchoTabla)}}>
      <EncabezadoTabla celdas={['Campaña','Centro / comunidad','Canal','Fecha','Estado','Acciones']} proporciones={[2.7,2,1.05,1.1,1.25,1.5]}/>
      {paginaDe(filtradas,pagina).map(c=><View key={String(c.id_campania)} style={s.tr}>
       <Col text={c.titulo} flex={2.7}/><Col muted text={`${c.centroSalud?.nombre??'#'+c.id_centro}\n${c.comunidad?.nombre??'Todo el centro'}`} flex={2}/>
       <Col text={labelCanal(c.canal)} flex={1.05}/><Col text={fecha(c.fecha_programada||c.fecha_creacion)} muted flex={1.1}/>
       <View style={[s.cellView,{flex:1.25}]}><ChipEstado nombre={c.estado}/></View>
       <View style={[s.cellView,ui.fila,{flex:1.5}]}>
        <Pressable accessibilityLabel="Ver campaña" onPress={()=>void ver(c)}><Ionicons name="eye-outline" size={21} color={colors.primary}/></Pressable>
        {gestor&&['BORRADOR','PROGRAMADA'].includes(c.estado)?<Pressable accessibilityLabel="Editar campaña" onPress={()=>{setCampaniaActual(c);setVista('EDITAR');}}><Ionicons name="create-outline" size={21} color={colors.primary}/></Pressable>:null}
       </View>
      </View>)}
      {!filtradas.length?<Text style={[ui.muted,{padding:20}]}>No hay campañas para los filtros seleccionados.</Text>:null}
     </View>
    </ScrollView>
   </View>
   <Paginacion pagina={pagina} total={filtradas.length} onPage={setPagina}/>
  </Bloque>:null}
  {tab==='CAMPAÑAS'&&(vista==='NUEVA'||vista==='EDITAR')?<Bloque titulo={vista==='EDITAR'?'Editar campaña':'Nueva campaña'}>
    <CampaniaForm key={String(campaniaActual?.id_campania??'nuevo')} campania={vista==='EDITAR'?campaniaActual:null} centros={centros} comunidades={comunidades} centroUsuario={catalogos?.id_centro??null} global={esGlobal} onClose={regresar} onSaved={()=>{mostrar('Campaña guardada correctamente.');regresar();}}/>
   </Bloque>:null}
  {tab==='CAMPAÑAS'&&vista==='DETALLE'&&campaniaActual?<Bloque titulo="Detalle de campaña">
    <Boton texto="Volver al listado" icono="arrow-back" secundario onPress={regresar}/>
    <Text style={{fontSize:22,fontWeight:'800',color:colors.text}}>{campaniaActual.titulo}</Text>
    <View style={ui.fila}><ChipEstado nombre={campaniaActual.estado}/><Text style={ui.muted}>Canal: {labelCanal(campaniaActual.canal)}</Text><Text style={ui.muted}>Programada: {fecha(campaniaActual.fecha_programada)}</Text></View>
    <Text style={ui.muted}>Destino: {campaniaActual.centroSalud?.nombre??`Centro #${campaniaActual.id_centro}`} · {campaniaActual.comunidad?.nombre??'Todas las comunidades'}</Text>
    <Text style={ui.muted}>Edad: {campaniaActual.edad_minima_meses??'sin mínimo'} a {campaniaActual.edad_maxima_meses??'sin máximo'} meses · Vacunación: {campaniaActual.estado_vacunacion_objetivo??'Sin filtro'}</Text>
    <View style={s.mensaje}><Text style={s.detalleMensaje}>{campaniaActual.mensaje}</Text></View>
    <View style={ui.fila}><Boton texto={cargandoObjetivos?'Consultando...':'Ver población objetivo'} icono="people-outline" secundario disabled={cargandoObjetivos} onPress={()=>void consultarObjetivos()}/>
      {gestor&&['BORRADOR','PROGRAMADA','EN_PROCESO'].includes(campaniaActual.estado)?<Boton texto="Generar notificaciones" icono="document-text-outline" onPress={()=>generar(campaniaActual)}/>:null}
      {gestor&&['BORRADOR','PROGRAMADA','EN_PROCESO'].includes(campaniaActual.estado)?<Boton texto="Enviar siguiente lote (máx. 5)" icono="send-outline" onPress={()=>enviarLote(campaniaActual)}/>:null}
    </View>
    {objetivos?<View style={{gap:8}}><Text style={ui.titulo}>Población objetivo: {objetivos.length} niños</Text><Text style={ui.muted}>Los responsables sin datos del canal seleccionado se omitirán al generar notificaciones.</Text>
      {objetivos.slice(0,12).map((o,i)=><Text key={`${o.id_nino}-${i}`} style={ui.muted}>{o.expediente??o.id_nino} · {o.nino} · Tutor: {o.tutor??'No vinculado'}</Text>)}
      {objetivos.length>12?<Text style={ui.muted}>Vista previa de 12 de {objetivos.length} registros.</Text>:null}</View>:null}
    <View style={{gap:8}}><Text style={ui.titulo}>Historial de notificaciones ({detalleNotifs.length})</Text>
      <View style={ui.fila}><Text style={ui.muted}>Pendientes: {detalleNotifs.filter(n=>n.estado==='PENDIENTE').length}</Text><Text style={ui.muted}>Enviadas: {detalleNotifs.filter(n=>n.estado==='ENVIADA').length}</Text><Text style={ui.muted}>Errores: {detalleNotifs.filter(n=>n.estado==='ERROR').length}</Text></View>
      {detalleNotifs.slice(0,10).map(n=><View key={String(n.id_notificacion)} style={s.historial}>
       <Text style={{flex:1,color:colors.text}}>{n.tutor?.nombres??'Tutor'} {n.tutor?.apellidos??''} · {n.nino?.codigo_expediente??'—'}</Text><ChipEstado nombre={n.estado}/><Text style={ui.muted}>Intentos: {n.numero_intentos}</Text>
      </View>)}
      {detalleNotifs.length>10?<Text style={ui.muted}>Mostrando 10. Consulte la pestaña Notificaciones para ver todos los registros.</Text>:null}
    </View>
    {gestor&&campaniaActual.estado!=='FINALIZADA'&&campaniaActual.estado!=='CANCELADA'?<View style={ui.fila}>
      <Boton texto="Finalizar campaña" icono="checkmark-done-outline" onPress={()=>transicion(campaniaActual,'finalizar')}/>
      <Boton texto="Cancelar campaña" peligro icono="close-circle-outline" onPress={()=>transicion(campaniaActual,'cancelar')}/>
    </View>:null}
   </Bloque>:null}
  {tab==='NOTIFICACIONES'?<Bloque titulo="Historial de notificaciones">
   <Text style={ui.muted}>Enviadas: {enviadas} · Pendientes: {pendientes} · Error: {errores}. Los envíos por correo y Telegram generan registros de auditoría.</Text>
   <Campo etiqueta="Buscar" value={busqueda} onChangeText={v=>{setBusqueda(v);setPagina(1);}} placeholder="Campaña, tutor, expediente..."/>
   <View style={{gap:8}}><Text style={ui.etiqueta}>Estado</Text><View style={ui.fila}>{estadosNotif.map(v=><Chip key={v} texto={v==='TODAS'?'Todos':v} activo={estadoNotif===v} onPress={()=>{setEstadoNotif(v);setPagina(1);}}/>)}</View></View>
   <View style={{gap:8}}><Text style={ui.etiqueta}>Canal</Text><View style={ui.fila}>{(['TODOS','EMAIL','TELEGRAM'] as const).map(v=><Chip key={v} texto={v==='TODOS'?'Todos':v==='EMAIL'?'Correo':'Telegram'} activo={canalFiltro===v} onPress={()=>{setCanalFiltro(v);setPagina(1);}}/>)}</View></View>
   <View onLayout={e=>setAnchoTabla(e.nativeEvent.layout.width)} style={{width:'100%'}}>
    <ScrollView horizontal style={{width:'100%'}} showsHorizontalScrollIndicator={anchoTabla<1000}>
     <View style={{width:Math.max(1000,anchoTabla)}}>
      <EncabezadoTabla celdas={['Campaña / origen','Responsable / niño','Canal','Intentos','Estado','Fecha / acción']} proporciones={[2.3,2.3,1,0.7,1,2.1]}/>
      {paginaDe(filtradasNot,pagina).map(n=><View key={String(n.id_notificacion)} style={s.tr}>
       <Col flex={2.3} text={n.campania?.titulo??'Alerta de seguimiento'}/>
       <Col flex={2.3} text={`${n.tutor?.nombres??'Tutor'} ${n.tutor?.apellidos??''}\n${n.nino?.codigo_expediente??'—'}`}/>
       <Col flex={1} text={labelCanal(n.canal)}/><Col flex={0.7} text={String(n.numero_intentos)}/>
       <View style={[s.cellView,{flex:1}]}><ChipEstado nombre={n.estado}/></View>
       <View style={[s.cellView,{flex:2.1,gap:7}]}><Text style={ui.muted}>{fecha(n.fecha_envio??n.fecha_creacion)}</Text>
        {n.estado==='ERROR'&&n.detalle_error?<Text numberOfLines={2} style={{color:colors.danger,fontSize:11}}>{n.detalle_error}</Text>:null}
        {gestor&&n.estado!=='ENVIADA'?<Pressable accessibilityRole="button" onPress={()=>enviarUna(n)}><Text style={{color:colors.primary,fontWeight:'700'}}>Procesar / reintentar</Text></Pressable>:null}
       </View>
      </View>)}
      {!filtradasNot.length?<Text style={[ui.muted,{padding:20}]}>No hay notificaciones para estos filtros.</Text>:null}
     </View>
    </ScrollView>
   </View>
   <Paginacion pagina={pagina} total={filtradasNot.length} onPage={setPagina}/>
   <Text style={ui.muted}>Si una notificación ya figura como ENVIADA, no se enviará nuevamente. Cada intento fallido se registra y está sujeto al máximo configurado.</Text>
  </Bloque>:null}
  <Text style={[ui.muted,{paddingBottom:18}]}>SCCVI · Información institucional de destinatarios. No comparta capturas ni exportaciones con datos personales de menores.</Text>
 </ScreenContainer>;
}
const s=StyleSheet.create({
 kpis:{flexDirection:'row',flexWrap:'wrap'},kpiWrap:{flexBasis:230,flexGrow:1,minWidth:180},
 kpi:{backgroundColor:'#FFFFFF',borderRadius:14,borderWidth:1,borderColor:colors.border,padding:18,gap:7,minHeight:120},
 kpiValue:{fontWeight:'800',fontSize:29,color:colors.text},
 tr:{flexDirection:'row',alignItems:'center',borderBottomWidth:1,borderColor:colors.border,minHeight:72,paddingVertical:12,paddingHorizontal:6},
 th:{backgroundColor:colors.canvas,minHeight:50},
 celda:{fontSize:12,paddingHorizontal:9,color:colors.text,minWidth:0},
 heading:{fontWeight:'800',color:colors.muted},
 cellView:{paddingHorizontal:7,alignItems:'flex-start',justifyContent:'center',minWidth:0},
 estado:{borderRadius:14,paddingHorizontal:10,paddingVertical:7,alignSelf:'flex-start'},
 mensaje:{backgroundColor:colors.canvas,borderRadius:12,padding:17},
 detalleMensaje:{color:colors.text,lineHeight:22,fontSize:14},
 historial:{borderBottomWidth:1,borderColor:colors.border,paddingVertical:12,flexDirection:'row',gap:12,alignItems:'center',flexWrap:'wrap'},
});
