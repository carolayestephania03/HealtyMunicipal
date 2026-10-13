import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput,
  View, useWindowDimensions,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ScreenContainer } from '../../../components/layout/screen-container';
import { ScreenHeader } from '../../../components/layout/screen-header';
import { colors } from '../../../constants/theme';
import { reportesService } from '../services/reportes.service';
import { guardarPdf } from '../utils/guardar-pdf';
import type {
  CatalogoReportes, CategoriaReporte, GenerarReporteDto, ReporteCatalogo, TipoReporte,
} from '../types';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
const CATEGORIAS: { id: CategoriaReporte; titulo: string; icono: IconName }[] = [
  { id:'GENERAL',titulo:'Información institucional y territorial',icono:'business-outline' },
  { id:'VACUNACION',titulo:'Cobertura operativa y vacunación',icono:'medkit-outline' },
  { id:'CRECIMIENTO',titulo:'Crecimiento y seguimiento',icono:'analytics-outline' },
  { id:'SEGUIMIENTO',titulo:'Alertas y atención',icono:'alert-circle-outline' },
  { id:'GESTION',titulo:'Campañas y comunicación',icono:'megaphone-outline' },
];
const ICONOS: Record<TipoReporte, IconName> = {
  RESUMEN:'stats-chart-outline', VACUNACION:'medkit-outline', DOSIS_PENDIENTES:'calendar-outline',
  CRECIMIENTO:'trending-up-outline',SEGUIMIENTO:'time-outline',ALERTAS:'alert-circle-outline',
  COMUNIDADES:'map-outline',CAMPANIAS:'megaphone-outline',NOTIFICACIONES:'notifications-outline',
};
function fechaLocal(fecha: Date): string {
  return `${fecha.getFullYear()}-${String(fecha.getMonth()+1).padStart(2,'0')}-${String(fecha.getDate()).padStart(2,'0')}`;
}
function rangoInicial(){const hoy=new Date();const antes=new Date(hoy.getFullYear()-1,hoy.getMonth(),1);
  return {desde:fechaLocal(antes),hasta:fechaLocal(hoy)};}
function fechaValida(t: string): boolean {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(t))return false;
  const d=new Date(`${t}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0,10)===t;
}
function Aviso({texto,exito=false}:{texto:string;exito?:boolean}){
  return <View style={[styles.aviso,{backgroundColor:exito?colors.successLight:colors.dangerLight}]}>
    <Ionicons name={exito?'checkmark-circle-outline':'alert-circle-outline'} size={19} color={exito?colors.success:colors.danger}/>
    <Text style={{color:exito?colors.success:colors.danger,flex:1,lineHeight:19}}>{texto}</Text>
  </View>;
}
function Etiqueta({titulo,icono}:{titulo:string;icono:IconName}){
  return <View style={{flexDirection:'row',alignItems:'center',gap:8}}>
    <Ionicons name={icono} size={19} color={colors.primary}/>
    <Text style={styles.subtitulo}>{titulo}</Text>
  </View>;
}
function Chip({titulo,activo,onPress,disabled=false}:{titulo:string;activo:boolean;onPress:()=>void;disabled?:boolean}){
  return <Pressable accessibilityRole="button" accessibilityState={{selected:activo,disabled}} disabled={disabled} onPress={onPress}
    style={[styles.chip,activo&&styles.chipActivo,disabled&&{opacity:.48}]}>
    <Text style={[styles.chipTexto,activo&&{color:'#FFFFFF'}]} numberOfLines={1}>{titulo}</Text>
  </Pressable>;
}
function TarjetaReporte({reporte,activo,onPress,ancho}:{reporte:ReporteCatalogo;activo:boolean;onPress:()=>void;ancho:'100%'|'48%'}){
  return <Pressable accessibilityRole="button" accessibilityLabel={`Seleccionar ${reporte.titulo}`} onPress={onPress}
    style={({pressed})=>[styles.tarjeta,{width:ancho},activo&&styles.tarjetaSeleccionada,pressed&&{opacity:.75}]}>
    <View style={styles.tarjetaEncabezado}>
      <View style={[styles.iconoTarjeta,activo&&{backgroundColor:'#DCEBFF'}]}>
        <Ionicons name={ICONOS[reporte.id]} size={22} color={colors.primary}/>
      </View>
      <Ionicons name={activo?'radio-button-on':'radio-button-off'} size={22} color={activo?colors.primary:colors.border}/>
    </View>
    <Text style={styles.tarjetaTitulo}>{reporte.titulo}</Text>
    <Text style={styles.tarjetaDescripcion}>{reporte.descripcion}</Text>
    <View style={styles.etiquetaPdf}><Ionicons name="document-text-outline" size={14} color={colors.success}/>
      <Text style={{color:colors.success,fontWeight:'700',fontSize:11}}>PDF</Text>
      <Text style={{color:colors.muted,fontSize:11}}>• {reporte.usaPeriodo?'Por fechas':'Estado al corte'}</Text>
    </View>
  </Pressable>;
}
export default function ReportesScreen(){
  const {width}=useWindowDimensions();const movil=width<860;
  const [catalogo,setCatalogo]=useState<CatalogoReportes|null>(null);
  const [cargando,setCargando]=useState(true);const [error,setError]=useState<string|null>(null);
  const [recargar,setRecargar]=useState(0);
  const [tipo,setTipo]=useState<TipoReporte>('RESUMEN');
  const [fechas,setFechas]=useState(rangoInicial);
  const [centro,setCentro]=useState<number|null>(null);
  const [comunidad,setComunidad]=useState<number|null>(null);
  const [generando,setGenerando]=useState(false);
  const [resultado,setResultado]=useState<string|null>(null);
  const [errorGeneracion,setErrorGeneracion]=useState<string|null>(null);
  useEffect(()=>{
    let vivo=true;setCargando(true);setError(null);
    void reportesService.catalogo().then(r=>{
      if(!vivo)return;
      if(!r.success || !r.data || !Array.isArray(r.data.reportes))throw new Error('No se obtuvo un catálogo válido.');
      setCatalogo(r.data);
      if(!r.data.es_global)setCentro(r.data.centro_asignado);
    }).catch(e=>{if(vivo)setError(e instanceof Error?e.message:'Error al consultar catálogo.');})
    .finally(()=>{if(vivo)setCargando(false);});
    return()=>{vivo=false;};
  },[recargar]);
  const elegido=useMemo(()=>catalogo?.reportes.find(r=>r.id===tipo)??null,[catalogo,tipo]);
  const comunidades=useMemo(()=>catalogo?.comunidades.filter(c=>centro==null||Number(c.id_centro)===centro)??[],[catalogo,centro]);
  const agrupar=useCallback((categoria:CategoriaReporte)=>catalogo?.reportes.filter(r=>r.categoria===categoria)??[],[catalogo]);
  const generar=async()=>{
    if(!elegido||generando)return;
    setErrorGeneracion(null);setResultado(null);
    if(!fechaValida(fechas.desde)||!fechaValida(fechas.hasta)){
      setErrorGeneracion('Las fechas deben existir y tener el formato AAAA-MM-DD.');return;
    }
    if(fechas.desde>fechas.hasta){setErrorGeneracion('La fecha inicial no puede ser posterior a la final.');return;}
    const dias=(new Date(fechas.hasta+'T00:00:00Z').getTime()-new Date(fechas.desde+'T00:00:00Z').getTime())/86400000;
    if(dias>1096){setErrorGeneracion('El intervalo máximo es de tres años.');return;}
    const dto:GenerarReporteDto={tipo,desde:fechas.desde,hasta:fechas.hasta,id_centro:centro,id_comunidad:comunidad};
    setGenerando(true);
    try{
      const respuesta=await reportesService.generar(dto);
      if(!respuesta.success||!respuesta.data?.contenido_base64){throw new Error(respuesta.message||'El servidor no generó el PDF.');}
      await guardarPdf(respuesta.data.nombre_archivo,respuesta.data.contenido_base64);
      setResultado(`Se generó ${respuesta.data.nombre_archivo}. ${respuesta.data.filas} filas de detalle${respuesta.data.recortado?' (límite alcanzado: reduzca los filtros)':''}.`);
    }catch(e){setErrorGeneracion(e instanceof Error?e.message:'No fue posible descargar el archivo PDF.');}
    finally{setGenerando(false);}
  };
  return <ScreenContainer>
    <ScreenHeader title="Reportes" description="Generación y descarga de documentos PDF a partir de los registros reales del SCCVI." actionLabel="Actualizar catálogo" onAction={()=>setRecargar(x=>x+1)} />
    <View style={styles.bienvenida}>
      <View style={{flex:1,gap:8}}><Text style={styles.heroEyebrow}>CENTRO DE DOCUMENTACIÓN · SCCVI</Text>
        <Text style={styles.heroTitulo}>Informes institucionales en PDF</Text>
        <Text style={styles.heroSubtitulo}>Seleccione un informe, ajuste el período y el ámbito de consulta, y genere un documento descargable con información actualizada de PostgreSQL.</Text>
      </View>
      <View style={styles.heroIcono}><Ionicons name="document-text-outline" color="#D2EEFF" size={46}/></View>
    </View>
    <View style={styles.informaciones}>
      {[
        {icono:'document-text-outline' as IconName,titulo:'9 formatos',descripcion:'Estadísticos y operativos'},
        {icono:'shield-checkmark-outline' as IconName,titulo:'Acceso protegido',descripcion:'Por usuario y centro'},
        {icono:'calendar-outline' as IconName,titulo:'Fechas y comunidad',descripcion:'Filtros desde el servidor'},
        {icono:'download-outline' as IconName,titulo:'PDF listo',descripcion:'Web, Android e iOS'},
      ].map(k=><View key={k.titulo} style={[styles.informacion,{width:movil?'48%':'24%'}]}>
        <Ionicons name={k.icono} color={colors.primary} size={22}/><Text style={styles.informacionTitulo}>{k.titulo}</Text>
        <Text style={styles.informacionDescripcion}>{k.descripcion}</Text>
      </View>)}
    </View>
    {cargando?<View style={styles.cargando}><ActivityIndicator color={colors.primary}/><Text style={styles.muted}>Cargando formatos y centros de salud...</Text></View>:null}
    {error?<Aviso texto={error}/>:null}
    {!cargando&&error?<Pressable onPress={()=>setRecargar(x=>x+1)} style={styles.botonSecundario}><Text style={styles.botonSecundarioTexto}>Reintentar</Text></Pressable>:null}
    {catalogo? <>
      <View style={styles.panel}>
        <Etiqueta titulo="1. Seleccione el tipo de reporte" icono="grid-outline"/>
        {CATEGORIAS.map(cat=>{
          const lista=agrupar(cat.id);if(!lista.length)return null;
          return <View key={cat.id} style={{gap:12}}>
            <View style={styles.categoria}><Ionicons name={cat.icono} size={17} color={colors.muted}/>
              <Text style={styles.categoriaTitulo}>{cat.titulo}</Text></View>
            <View style={styles.tarjetas}>{lista.map(rep=><TarjetaReporte key={rep.id} reporte={rep} activo={tipo===rep.id}
              ancho={movil?'100%':'48%'} onPress={()=>{setTipo(rep.id);setErrorGeneracion(null);setResultado(null);}}/>)}</View>
          </View>;
        })}
      </View>
      <View style={styles.panel}>
        <Etiqueta titulo="2. Configure el alcance del informe" icono="options-outline"/>
        <View style={styles.dosCampos}>
          <View style={[styles.campo,{width:movil?'100%':'48%'}]}><Text style={styles.label}>{elegido?.usaPeriodo?'Fecha inicial':'Fecha inicial (referencia)'}</Text>
            <TextInput value={fechas.desde} onChangeText={v=>setFechas(f=>({...f,desde:v}))} style={styles.input}
              accessibilityLabel="Fecha inicial" placeholder="AAAA-MM-DD" maxLength={10} autoCapitalize="none"/></View>
          <View style={[styles.campo,{width:movil?'100%':'48%'}]}><Text style={styles.label}>{elegido?.usaPeriodo?'Fecha final':'Fecha de corte'}</Text>
            <TextInput value={fechas.hasta} onChangeText={v=>setFechas(f=>({...f,hasta:v}))} style={styles.input}
              accessibilityLabel="Fecha final" placeholder="AAAA-MM-DD" maxLength={10} autoCapitalize="none"/></View>
        </View>
        {!elegido?.usaPeriodo?<Text style={styles.muted}>Este informe muestra el estado al corte; la fecha inicial no modifica el resultado.</Text>:null}
        <Text style={styles.label}>Centro de salud</Text>
        {catalogo.es_global?<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtros}>
          <Chip titulo="Todos los centros" activo={centro===null} onPress={()=>{setCentro(null);setComunidad(null);}}/>
          {catalogo.centros.map(c=><Chip key={c.id_centro} titulo={c.nombre} activo={centro===c.id_centro}
            onPress={()=>{setCentro(c.id_centro);setComunidad(null);}}/>)}
        </ScrollView>:<View style={styles.campoBloqueado}><Ionicons name="lock-closed-outline" size={16} color={colors.muted}/>
            <Text style={styles.muted}>{catalogo.centros[0]?.nombre??'Centro asignado a su cuenta'}</Text></View>}
        <Text style={styles.label}>Comunidad</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtros}>
          <Chip titulo="Todas las comunidades" activo={comunidad===null} onPress={()=>setComunidad(null)}/>
          {comunidades.map(c=><Chip key={c.id_comunidad} titulo={c.nombre} activo={comunidad===c.id_comunidad} onPress={()=>setComunidad(c.id_comunidad)}/>) }
        </ScrollView>
      </View>
      <View style={styles.panel}>
        <Etiqueta titulo="3. Generar y descargar PDF" icono="download-outline"/>
        <Text style={styles.resumenTitulo}>{elegido?.titulo}</Text>
        <Text style={styles.muted}>{elegido?.descripcion}</Text>
        <View style={styles.advertencia}><Ionicons name="information-circle-outline" size={19} color={colors.primary}/>
          <Text style={styles.avisoDescripcion}>Los informes se generan con los registros existentes. Las métricas de dosis registradas no equivalen a cobertura poblacional oficial. Los listados nominales contienen información personal: guárdelos y compártalos solo con personal autorizado.</Text>
        </View>
        {errorGeneracion?<Aviso texto={errorGeneracion}/>:null}
        {resultado?<Aviso texto={resultado} exito/>:null}
        <Pressable accessibilityRole="button" disabled={generando} onPress={()=>void generar()}
          style={({pressed})=>[styles.botonGenerar,(generando||pressed)&&{opacity:.65}]}>
          {generando?<ActivityIndicator color="#FFFFFF"/>:<Ionicons name="document-text-outline" color="#FFFFFF" size={21}/>}
          <Text style={styles.botonGenerarTexto}>{generando?'Generando reporte...':'Generar y descargar PDF'}</Text>
        </Pressable>
        <Text style={styles.pie}>El PDF incluye datos de emisión, filtros, indicadores, tablas con páginas numeradas y advertencias de interpretación. No se almacena una copia en el servidor.</Text>
      </View>
    </>:null}
  </ScreenContainer>;
}
const styles=StyleSheet.create({
  bienvenida:{backgroundColor:'#07546B',padding:24,borderRadius:16,flexDirection:'row',alignItems:'center',gap:18},
  heroEyebrow:{color:'#B9E7F8',fontSize:11,fontWeight:'800',letterSpacing:1},
  heroTitulo:{color:'#FFFFFF',fontSize:24,fontWeight:'800'},
  heroSubtitulo:{color:'#D8EFF6',fontSize:13,lineHeight:20,maxWidth:800},
  heroIcono:{width:78,height:78,borderRadius:18,backgroundColor:'#166B82',alignItems:'center',justifyContent:'center'},
  informaciones:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',gap:8},
  informacion:{padding:16,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface,borderRadius:13,gap:6,minWidth:130},
  informacionTitulo:{fontSize:15,fontWeight:'800',color:colors.text},
  informacionDescripcion:{fontSize:12,color:colors.muted},
  panel:{padding:22,borderWidth:1,borderColor:colors.border,borderRadius:15,backgroundColor:'#FFFFFF',gap:18},
  subtitulo:{fontWeight:'800',fontSize:18,color:colors.text},
  categoria:{flexDirection:'row',alignItems:'center',gap:8,marginTop:4},
  categoriaTitulo:{fontWeight:'700',fontSize:14,color:colors.muted},
  tarjetas:{flexDirection:'row',flexWrap:'wrap',gap:12,justifyContent:'space-between'},
  tarjeta:{borderWidth:1,borderColor:colors.border,borderRadius:13,padding:17,backgroundColor:'#FFFFFF',gap:10,minWidth:230},
  tarjetaSeleccionada:{borderColor:colors.primary,backgroundColor:'#F4F9FF',borderWidth:2},
  tarjetaEncabezado:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  iconoTarjeta:{backgroundColor:colors.infoLight,width:42,height:42,borderRadius:11,alignItems:'center',justifyContent:'center'},
  tarjetaTitulo:{color:colors.text,fontWeight:'800',fontSize:16},
  tarjetaDescripcion:{color:colors.muted,lineHeight:19,fontSize:13,flexGrow:1},
  etiquetaPdf:{flexDirection:'row',alignItems:'center',gap:6},
  dosCampos:{flexDirection:'row',flexWrap:'wrap',gap:12,justifyContent:'space-between'},
  campo:{gap:7},label:{fontWeight:'700',fontSize:13,color:colors.text},
  input:{paddingHorizontal:14,paddingVertical:13,borderWidth:1,borderColor:colors.border,borderRadius:10,color:colors.text,backgroundColor:'#FFFFFF',fontSize:14},
  campoBloqueado:{borderWidth:1,borderColor:colors.border,backgroundColor:colors.canvas,padding:13,borderRadius:10,flexDirection:'row',alignItems:'center',gap:8},
  filtros:{gap:8,paddingVertical:3,alignItems:'center'},
  chip:{borderWidth:1,borderColor:colors.border,paddingVertical:11,paddingHorizontal:13,borderRadius:10,backgroundColor:'#FFFFFF',maxWidth:330},
  chipActivo:{backgroundColor:colors.primary,borderColor:colors.primary},
  chipTexto:{color:colors.text,fontSize:12,fontWeight:'700'},
  aviso:{flexDirection:'row',alignItems:'flex-start',gap:10,padding:14,borderRadius:10},
  muted:{fontSize:13,color:colors.muted,lineHeight:19},
  resumenTitulo:{fontSize:19,fontWeight:'800',color:colors.text},
  advertencia:{flexDirection:'row',gap:9,backgroundColor:colors.infoLight,padding:14,borderRadius:10},
  avisoDescripcion:{flex:1,color:colors.text,fontSize:12,lineHeight:19},
  botonGenerar:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:12,backgroundColor:colors.primary,borderRadius:11,paddingVertical:17},
  botonGenerarTexto:{color:'#FFFFFF',fontWeight:'800',fontSize:15},
  pie:{color:colors.muted,fontSize:12,lineHeight:19},
  cargando:{flexDirection:'row',alignItems:'center',gap:12,padding:24},
  botonSecundario:{alignSelf:'flex-start',borderWidth:1,borderColor:colors.primary,borderRadius:10,padding:12},
  botonSecundarioTexto:{color:colors.primary,fontWeight:'700'},
});
