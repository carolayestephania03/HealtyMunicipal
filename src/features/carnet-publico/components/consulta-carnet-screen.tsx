import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams } from 'expo-router';
import { consultarCarnetPublico } from '../services/carnet-publico.service';
import { GraficaCrecimiento } from './grafica-crecimiento';
import type { ExpedientePublico, VacunacionPublica } from '../types';

type EstadoFiltro = 'TODAS' | 'APLICADA' | 'PENDIENTE' | 'ATRASADA';
const fecha = (valor: string | null | undefined) => valor ? String(valor).slice(0, 10) : 'Sin registro';
function edadActual(iso: string): string {
  const partes = /^([0-9]{4})-([0-9]{2})-([0-9]{2})/.exec(iso);
  if (!partes) return 'No disponible';
  const nacimiento = new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3]));
  const hoy = new Date();
  let meses = (hoy.getFullYear() - nacimiento.getFullYear()) * 12 + hoy.getMonth() - nacimiento.getMonth();
  if (hoy.getDate() < nacimiento.getDate()) meses -= 1;
  return meses < 12 ? `${Math.max(meses, 0)} meses` : `${Math.floor(meses / 12)} años y ${meses % 12} meses`;
}
const numero = (v: number | null | undefined, unidad = '') => v == null ? '—' : `${v}${unidad}`;

export function ConsultaCarnetScreen() {
  const parametros = useLocalSearchParams<{ token?: string }>();
  const [token, setToken] = useState('');
  const [pin, setPin] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expediente, setExpediente] = useState<ExpedientePublico | null>(null);
  const [filtroVacunas, setFiltroVacunas] = useState<EstadoFiltro>('TODAS');

  useEffect(() => {
    let recibido = '';
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // El fragmento (#token=...) no se envía al servidor al abrir el enlace.
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const query = new URLSearchParams(window.location.search);
      recibido = hash.get('token') || query.get('token') || '';
      // Borrar inmediatamente el token de la barra de direcciones y del historial actual.
      if (recibido) window.history.replaceState(window.history.state, '', window.location.pathname);
      // Evitar que un sitio externo conozca el token por el encabezado Referer.
      let meta = document.querySelector('meta[name="referrer"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'referrer');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', 'no-referrer');
    } else {
      recibido = typeof parametros.token === 'string' ? parametros.token : '';
    }
    if (/^[a-fA-F0-9]{64}$/.test(recibido)) setToken(recibido);
    else setError('El enlace no contiene un código válido. Solicite al centro de salud un nuevo QR.');
    // Captura una sola vez al abrir la página, no almacena el secreto permanentemente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const comprobar = async () => {
    if (cargando || !token) return;
    if (!/^\d{4,8}$/.test(pin)) {
      setError('Ingrese el PIN de 4 a 8 números entregado por el centro de salud.');
      return;
    }
    setCargando(true);
    setError(null);
    try {
      const respuesta = await consultarCarnetPublico(token, pin);
      setExpediente(respuesta.data);
      setPin('');
      setToken(''); // El secreto deja de estar en memoria del formulario después de verificar.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible verificar el carnet.');
    } finally {
      setCargando(false);
    }
  };

  const vacunas = useMemo(() => (expediente?.vacunaciones ?? []).filter((v) =>
    filtroVacunas === 'TODAS' || v.estado === filtroVacunas), [expediente, filtroVacunas]);
  const contar = (e: EstadoFiltro) => expediente?.vacunaciones.filter((v) => e === 'TODAS' || v.estado === e).length ?? 0;

  return <View style={s.fondo}>
    <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
      <View style={s.barra}>
        <View style={s.marca}><Ionicons name="medical" size={21} color="#FFFFFF" /></View>
        <View style={{ flex: 1 }}>
          <Text style={s.marcaTitulo}>SCCVI</Text>
          <Text style={s.marcaSub}>Sistema de Control de Crecimiento y Vacunación Infantil</Text>
        </View>
        <View style={s.etiqueta}><Ionicons name="shield-checkmark-outline" size={15} color="#0F8C64" /><Text style={s.etiquetaTexto}>Consulta segura</Text></View>
      </View>
      {!expediente ? (
        <View style={s.panelAcceso}>
          <View style={s.iconoCentro}><Ionicons name="qr-code-outline" size={40} color="#0865E8" /></View>
          <Text style={s.titulo}>Consulta del carnet digital</Text>
          <Text style={s.parrafoCentro}>Ingrese el número de acceso (PIN) entregado por el personal de salud para consultar el expediente del niño asociado a este QR.</Text>
          <View style={s.separacion} />
          <Text style={s.etiquetaCampo}>PIN de acceso</Text>
          <TextInput
            accessibilityLabel="PIN de acceso al carnet"
            value={pin}
            onChangeText={(valor) => { setPin(valor.replace(/\D/g, '').slice(0, 8)); setError(null); }}
            placeholder="Ingrese de 4 a 8 números"
            placeholderTextColor="#8291A6"
            keyboardType="number-pad"
            secureTextEntry
            maxLength={8}
            editable={!cargando && !!token}
            onSubmitEditing={() => void comprobar()}
            style={s.campo}
          />
          {error ? <View style={s.errorFondo}><Ionicons name="alert-circle-outline" color="#B32632" size={17}/><Text style={s.errorTexto}>{error}</Text></View> : null}
          <Pressable accessibilityRole="button" onPress={() => void comprobar()} disabled={cargando || !token}
            style={({ pressed }) => [s.boton, (pressed || cargando || !token) && s.desactivado]}>
            {cargando ? <ActivityIndicator color="#FFFFFF"/> : <Ionicons name="lock-open-outline" color="#FFFFFF" size={17}/>} 
            <Text style={s.botonTexto}>{cargando ? 'Validando acceso...' : 'Consultar expediente'}</Text>
          </Pressable>
          <View style={s.aviso}><Ionicons name="information-circle-outline" size={18} color="#586C86"/><Text style={s.avisoTexto}>Su consulta es privada. No comparta su QR ni el PIN y utilice un dispositivo de confianza.</Text></View>
        </View>
      ) : (
        <View style={s.cuerpo}>
          <View style={[s.panel, s.cabeceraExpediente]}>
            <View style={{ flex: 1, gap: 5 }}>
              <Text style={s.mini}>EXPEDIENTE INFANTIL</Text>
              <Text style={s.titulo}>{expediente.nino.nombres} {expediente.nino.apellidos}</Text>
              <Text style={s.muted}>Código de expediente: {expediente.nino.codigo_expediente}</Text>
            </View>
            <View style={s.estadoActivo}><Ionicons name="checkmark-circle-outline" size={16} color="#0B9465"/><Text style={{color: '#0B9465', fontWeight: '700'}}>Carnet activo</Text></View>
          </View>
          <View style={[s.panel, s.grid]}>
            <Dato label="Fecha de nacimiento" valor={fecha(expediente.nino.fecha_nacimiento)}/>
            <Dato label="Edad" valor={edadActual(expediente.nino.fecha_nacimiento)}/>
            <Dato label="Sexo" valor={expediente.nino.sexo === 'M' ? 'Masculino' : 'Femenino'}/>
            <Dato label="Vencimiento del carnet" valor={expediente.carnet.fecha_expiracion ? fecha(expediente.carnet.fecha_expiracion) : 'No establecido'}/>
          </View>
          <Text style={s.tituloSeccion}>Crecimiento</Text>
          <View style={s.grid}>
            <GraficaCrecimiento registros={expediente.crecimiento} tipo="peso_kg" />
            <GraficaCrecimiento registros={expediente.crecimiento} tipo="talla_cm" />
          </View>
          <View style={s.panel}>
            <Text style={s.panelTitulo}>Últimos controles registrados</Text>
            {expediente.crecimiento.length === 0 ? <Text style={s.muted}>Todavía no existen controles de crecimiento.</Text> :
              [...expediente.crecimiento].reverse().slice(0, 10).map((c, i) =>
                <View key={`${c.fecha_medicion}-${i}`} style={s.fila}>
                  <View style={{flex: 1}}>
                    <Text style={s.registro}>{fecha(c.fecha_medicion)} · {c.edad_meses ?? '—'} meses</Text>
                    <Text style={s.muted}>Peso: {numero(c.peso_kg, ' kg')} (P{numero(c.percentil_peso_edad)}) · Talla: {numero(c.talla_cm, ' cm')} (P{numero(c.percentil_talla_edad)})</Text>
                  </View>
                </View>)}
            <Text style={s.nota}>Los percentiles mostrados corresponden a los datos registrados por el centro de salud. No sustituyen una evaluación profesional.</Text>
          </View>
          <Text style={s.tituloSeccion}>Vacunación</Text>
          <View style={[s.panel, {gap: 12}]}>
            <View style={s.grid}>
              <Metrica valor={contar('APLICADA')} etiqueta="Aplicadas" color="#0B9465"/>
              <Metrica valor={contar('PENDIENTE')} etiqueta="Pendientes" color="#D08B10"/>
              <Metrica valor={contar('ATRASADA')} etiqueta="Atrasadas" color="#C33447"/>
            </View>
            <View style={s.filtros}>{(['TODAS', 'APLICADA', 'PENDIENTE', 'ATRASADA'] as const).map((e) =>
              <Pressable key={e} onPress={() => setFiltroVacunas(e)} style={[s.filtro, filtroVacunas === e && s.filtroActivo]}>
                <Text style={[s.filtroTexto, filtroVacunas === e && {color:'#FFFFFF'}]}>{e === 'TODAS' ? 'Todas' : e === 'APLICADA' ? 'Aplicadas' : e === 'PENDIENTE' ? 'Pendientes' : 'Atrasadas'}</Text>
              </Pressable>)}</View>
            {vacunas.length === 0 ? <Text style={s.muted}>No hay vacunaciones para este filtro.</Text> : vacunas.map((v, i) =>
              <VacunaFila key={`${v.vacuna}-${v.dosis}-${i}`} vacuna={v}/>)}
          </View>
          <View style={s.aviso}><Ionicons name="medical-outline" size={19} color="#586C86"/><Text style={s.avisoTexto}>Esta información es únicamente de consulta. Si requiere actualizarla o tiene dudas, acuda al centro de salud.</Text></View>
        </View>
      )}
      <Text style={s.pie}>SCCVI · Consulta de carnet digital infantil</Text>
    </ScrollView>
  </View>;
}

function Dato({label, valor}: {label:string;valor:string}) {
  return <View style={s.dato}><Text style={s.muted}>{label}</Text><Text style={s.registro}>{valor}</Text></View>;
}
function Metrica({valor,etiqueta,color}: {valor:number;etiqueta:string;color:string}) {
  return <View style={s.metrica}><Text style={[s.metricaNum,{color}]}>{valor}</Text><Text style={s.muted}>{etiqueta}</Text></View>;
}
function VacunaFila({vacuna}: {vacuna:VacunacionPublica}) {
  const color = vacuna.estado === 'APLICADA' ? '#0B9465' : vacuna.estado === 'ATRASADA' ? '#BE3146' : '#B78015';
  return <View style={s.fila}>
    <View style={{flex:1,gap:5}}>
      <Text style={s.registro}>{vacuna.vacuna} · Dosis {vacuna.dosis ?? '—'}</Text>
      <Text style={s.muted}>Programada: {fecha(vacuna.fecha_programada)} · Aplicada: {fecha(vacuna.fecha_aplicacion)}</Text>
    </View>
    <View style={{backgroundColor:'#F5F7FB',borderRadius:15,paddingVertical:5,paddingHorizontal:9}}><Text style={{fontSize:11,color,fontWeight:'700'}}>{vacuna.estado}</Text></View>
  </View>;
}
const s = StyleSheet.create({
  fondo: {flex:1,backgroundColor:'#F2F6FB'},
  scroll: {flexGrow:1,padding:16,alignItems:'center',gap:19},
  barra: {width:'100%',maxWidth:1070,flexDirection:'row',alignItems:'center',gap:12,paddingVertical:9,flexWrap:'wrap'},
  marca: {height:42,width:42,borderRadius:11,backgroundColor:'#0C5D74',alignItems:'center',justifyContent:'center'},
  marcaTitulo: {fontSize:22,fontWeight:'900',color:'#0C294B'},
  marcaSub: {fontSize:11,color:'#5F708A'},
  etiqueta: {backgroundColor:'#EAF7F2',padding:10,borderRadius:22,flexDirection:'row',gap:5,alignItems:'center'},
  etiquetaTexto: {color:'#0F8C64',fontSize:11,fontWeight:'700'},
  panelAcceso: {width:'100%',maxWidth:520,backgroundColor:'#FFFFFF',borderRadius:17,borderWidth:1,borderColor:'#E0E8F2',padding:26,gap:13,marginTop:35},
  iconoCentro: {alignSelf:'center',backgroundColor:'#ECF4FF',padding:17,borderRadius:20,marginBottom:5},
  titulo: {fontSize:25,fontWeight:'800',color:'#0B2345'},
  parrafoCentro: {fontSize:14,color:'#64748B',textAlign:'center',lineHeight:23},
  separacion: {height:1,backgroundColor:'#E5ECF5',marginVertical:8},
  etiquetaCampo: {fontSize:13,fontWeight:'700',color:'#233D5A'},
  campo: {borderWidth:1,borderColor:'#D5E0EE',borderRadius:10,minHeight:50,paddingHorizontal:14,fontSize:18,color:'#0B2345',letterSpacing:4},
  boton: {backgroundColor:'#0865E8',borderRadius:9,minHeight:48,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:9,paddingHorizontal:12},
  botonTexto: {color:'#FFFFFF',fontWeight:'700',fontSize:14},
  desactivado: {opacity:0.55},
  errorFondo: {flexDirection:'row',gap:8,padding:12,backgroundColor:'#FFF1F1',borderRadius:9,alignItems:'center'},
  errorTexto: {flex:1,color:'#A92A35',fontSize:12,lineHeight:18},
  aviso: {flexDirection:'row',gap:9,padding:13,backgroundColor:'#EAF0F8',borderRadius:9,alignItems:'center'},
  avisoTexto: {flex:1,fontSize:12,color:'#526884',lineHeight:18},
  cuerpo: {width:'100%',maxWidth:1070,gap:14},
  panel: {borderWidth:1,borderColor:'#DFE7F2',backgroundColor:'#FFFFFF',borderRadius:12,padding:17,gap:9},
  cabeceraExpediente: {flexDirection:'row',alignItems:'center',flexWrap:'wrap',gap:15},
  mini: {fontSize:11,color:'#0865E8',fontWeight:'800',letterSpacing:1},
  muted: {fontSize:12,color:'#667A94',lineHeight:19},
  registro: {fontSize:14,color:'#142A49',fontWeight:'600'},
  estadoActivo: {flexDirection:'row',gap:6,alignItems:'center',padding:10,backgroundColor:'#E5F8EF',borderRadius:15},
  grid: {flexDirection:'row',flexWrap:'wrap',gap:12},
  dato: {minWidth:180,flexGrow:1,flexBasis:200,gap:5},
  tituloSeccion: {fontSize:18,color:'#10274B',fontWeight:'800',marginTop:10},
  panelTitulo: {fontSize:15,fontWeight:'700',color:'#10274B'},
  fila: {borderTopWidth:1,borderColor:'#E9EDF4',paddingVertical:11,flexDirection:'row',alignItems:'center',gap:10,flexWrap:'wrap'},
  nota: {fontSize:11,color:'#63758C',lineHeight:18},
  metrica: {flexGrow:1,flexBasis:120,minWidth:100,backgroundColor:'#F6F9FD',padding:14,borderRadius:10,alignItems:'center',gap:5},
  metricaNum: {fontSize:24,fontWeight:'800'},
  filtros: {flexDirection:'row',flexWrap:'wrap',gap:7},
  filtro: {paddingVertical:9,paddingHorizontal:12,borderRadius:8,borderWidth:1,borderColor:'#C9D8EA'},
  filtroActivo: {backgroundColor:'#0865E8',borderColor:'#0865E8'},
  filtroTexto: {color:'#0865E8',fontSize:12,fontWeight:'700'},
  pie: {fontSize:11,color:'#7F90A5',textAlign:'center',marginTop:13},
});
