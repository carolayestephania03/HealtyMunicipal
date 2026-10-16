import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { colors } from '../../../constants/theme';
import { familiasCrudService } from '../services/familias-crud.service';
import type { ComunidadOpcion, FamiliaGestion } from '../services/familias-crud.service';
import { TablaRegistros, ResumenRegistros, EtiquetaEstado, AccionTabla } from './tabla-registros';
import type { ColumnaTabla } from './tabla-registros';

type Vista = 'busqueda' | 'crear' | 'editar' | 'detalle';
function Boton({ text, onPress, outline = false, disabled = false }: {
  text: string; onPress: () => void; outline?: boolean; disabled?: boolean;
}) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress}
    style={[styles.button, outline && styles.outline, disabled && { opacity: 0.5 }]}>
    <Text style={[styles.buttonText, outline && { color: colors.primary }]}>{text}</Text>
  </Pressable>;
}
function Campo({ label, value, onChangeText }: { label: string; value: string; onChangeText: (v: string) => void }) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text>
    <TextInput style={styles.input} value={value} onChangeText={onChangeText} placeholderTextColor={colors.muted}/>
  </View>;
}
export function FamiliasCrudSection() {
  const [familias, setFamilias] = useState<FamiliaGestion[]>([]);
  const [comunidades, setComunidades] = useState<ComunidadOpcion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [vista, setVista] = useState<Vista>('busqueda');
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [filtroEstado, setFiltroEstado] = useState<'TODOS' | 'ACTIVAS' | 'INACTIVAS'>('TODOS');
  const [seleccionada, setSeleccionada] = useState<FamiliaGestion | null>(null);
  const [codigo, setCodigo] = useState('');
  const [idComunidad, setIdComunidad] = useState('');
  const [direccion, setDireccion] = useState('');
  const [referencia, setReferencia] = useState('');
  const [confirmando, setConfirmando] = useState(false);

  const cargar = async () => {
    setCargando(true); setError(null);
    try {
      const [f, c] = await Promise.all([familiasCrudService.listar(), familiasCrudService.comunidades()]);
      if (!f.success || !c.success || !Array.isArray(f.data) || !Array.isArray(c.data)) {
        throw new Error('No se recibieron catálogos válidos.');
      }
      setFamilias(f.data); setComunidades(c.data);
    } catch (e) { setError(e instanceof Error ? e.message : 'Error al consultar familias.'); }
    finally { setCargando(false); }
  };
  useEffect(() => { void cargar(); }, []);
  const resultados = useMemo(() => {
    const q = busqueda.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim();
    return familias.filter(f => {
      const texto = [f.codigo_familia, f.comunidad?.nombre ?? '', f.direccion ?? '',
        f.comunidad?.municipio ?? '', f.comunidad?.departamento ?? '']
        .join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
      return (!q || texto.includes(q)) && (filtroEstado === 'TODOS' ||
        (filtroEstado === 'ACTIVAS' && f.activo) || (filtroEstado === 'INACTIVAS' && !f.activo));
    });
  }, [familias, busqueda, filtroEstado]);
  const paginaActual = Math.min(pagina, Math.max(1, Math.ceil(resultados.length / 7)));
  const visibles = resultados.slice((paginaActual - 1) * 7, paginaActual * 7);
  const activas = familias.filter(f => f.activo).length;
  const inactivas = familias.length - activas;
  const totalComunidades = new Set(familias.map(f => String(f.id_comunidad))).size;

  const verFamilia = async (familia: FamiliaGestion) => {
    setCargando(true); setError(null); setMensaje(null);
    try {
      const r = await familiasCrudService.detalle(familia.id_familia);
      if (!r.success || !r.data) throw new Error('No fue posible obtener la familia.');
      setSeleccionada(r.data); setVista('detalle');
    } catch(e) {setError(e instanceof Error ? e.message : 'Error consultando familia.');}
    finally {setCargando(false);}
  };
  const formulario = (familia: FamiliaGestion | null) => {
    setSeleccionada(familia); setVista(familia ? 'editar' : 'crear');
    setCodigo(familia?.codigo_familia ?? '');
    setIdComunidad(familia ? String(familia.id_comunidad) : '');
    setDireccion(familia?.direccion ?? '');
    setReferencia(familia?.referencia ?? '');
    setError(null); setMensaje(null);
  };
  const guardar = async () => {
    const id = Number(idComunidad);
    if (!codigo.trim() || codigo.trim().length > 50 || !Number.isSafeInteger(id) || id < 1) {
      setError('Ingrese un código de familia y seleccione una comunidad.'); return;
    }
    if (direccion.length > 255 || referencia.length > 255) {
      setError('La dirección o referencia excede 255 caracteres.'); return;
    }
    setProcesando(true); setError(null);
    try {
      const datos = { id_comunidad: id, codigo_familia: codigo.trim().toUpperCase(),
        direccion: direccion.trim() || null, referencia: referencia.trim() || null };
      const r = seleccionada
        ? await familiasCrudService.editar(seleccionada.id_familia, datos)
        : await familiasCrudService.crear(datos);
      if (!r.success) throw new Error(r.message || 'No se confirmó el guardado.');
      setMensaje(seleccionada ? 'Familia actualizada.' : 'Familia registrada.');
      setVista('busqueda'); setBusqueda(datos.codigo_familia); setPagina(1);
      await cargar();
    } catch (e) { setError(e instanceof Error ? e.message : 'No fue posible guardar.'); }
    finally { setProcesando(false); }
  };
  const cambiarEstado = async (familia: FamiliaGestion) => {
    setProcesando(true); setError(null);
    try {
      const r = await familiasCrudService.estado(familia.id_familia, !familia.activo);
      if (!r.success) throw new Error(r.message || 'Error al cambiar estado.');
      setMensaje(familia.activo ? 'Familia desactivada.' : 'Familia activada.');
      setConfirmando(false); await cargar();
    } catch (e) { setError(e instanceof Error ? e.message : 'Error al cambiar estado.'); }
    finally { setProcesando(false); }
  };

  const columnas: ColumnaTabla<FamiliaGestion>[] = [
    {key:'codigo', titulo:'Código de familia', ancho:185, render:f=><Text style={styles.name}>{f.codigo_familia}</Text>},
    {key:'comunidad', titulo:'Comunidad', ancho:190, render:f=><Text style={styles.hint}>{f.comunidad?.nombre ?? 'No disponible'}</Text>},
    {key:'municipio', titulo:'Municipio', ancho:170, render:f=><Text style={styles.hint}>{f.comunidad?.municipio ?? 'No disponible'}</Text>},
    {key:'direccion', titulo:'Dirección', ancho:265, render:f=><Text style={styles.hint}>{f.direccion || 'Sin dirección'}</Text>},
    {key:'estado', titulo:'Estado', ancho:135, render:f=><EtiquetaEstado activo={f.activo}/>},
    {key:'acciones', titulo:'Acciones', ancho:170, render:f=><View style={styles.top}>
      <AccionTabla icono="eye-outline" descripcion="Ver familia" onPress={() => void verFamilia(f)}/>
      <AccionTabla icono="create-outline" descripcion="Editar familia" onPress={() => formulario(f)}/>
      <AccionTabla icono="power-outline" descripcion={f.activo?'Desactivar familia':'Activar familia'} peligro
        onPress={() => {setSeleccionada(f);setConfirmando(true);}}/>
    </View>},
  ];

  return <View style={styles.panel}>
    <View style={styles.top}>
      <View style={{ flex: 1 }}><Text style={styles.title}>Administración de familias</Text>
        <Text style={styles.hint}>Busque por código o comunidad. Registre y actualice familias existentes.</Text></View>
      <Boton text="Nueva familia" onPress={() => formulario(null)} />
    </View>
    {mensaje ? <Text style={styles.success}>{mensaje}</Text> : null}
    {error ? <Text style={styles.error}>{error}</Text> : null}
    {cargando ? <ActivityIndicator color={colors.primary}/> : vista === 'busqueda' ? <>
      <ResumenRegistros elementos={[
        {titulo:'Familias registradas',cantidad:familias.length,icono:'home-outline',color:'azul'},
        {titulo:'Familias activas',cantidad:activas,icono:'checkmark-circle-outline',color:'verde'},
        {titulo:'Familias inactivas',cantidad:inactivas,icono:'alert-circle-outline',color:'naranja'},
        {titulo:'Comunidades con familias',cantidad:totalComunidades,icono:'business-outline',color:'azul'},
      ]}/>
      <View style={styles.top}>
        <TextInput style={[styles.input,{flex:1,minWidth:180}]}
          placeholder="Buscar por código, comunidad, municipio o dirección..."
          placeholderTextColor={colors.muted} value={busqueda}
          onChangeText={v => {setBusqueda(v);setPagina(1);}}/>
        <Boton text="Actualizar" outline onPress={() => void cargar()}/>
      </View>
      <View style={styles.top}>
        <Text style={styles.label}>Estado de familia:</Text>
        {(['TODOS','ACTIVAS','INACTIVAS'] as const).map(estado =>
          <Pressable key={estado} onPress={() => {setFiltroEstado(estado);setPagina(1);}}
            style={[styles.community,filtroEstado===estado && styles.selected]}>
            <Text style={styles.hint}>{estado==='TODOS'?'Todas':estado==='ACTIVAS'?'Activas':'Inactivas'}</Text>
          </Pressable>
        )}
      </View>
      <TablaRegistros columnas={columnas} filas={visibles}
        obtenerId={f=>String(f.id_familia)} pagina={paginaActual}
        totalPaginas={Math.max(1,Math.ceil(resultados.length/7))}
        totalRegistros={resultados.length} tamanioPagina={7}
        onCambiarPagina={setPagina}
        mensajeVacio="No se encontraron familias con los filtros seleccionados." />
      {confirmando && seleccionada ? <View style={styles.confirm}>
        <Text style={styles.error}>¿Confirmar {seleccionada.activo?'desactivación':'activación'} de {seleccionada.codigo_familia}?</Text>
        <Boton text="Confirmar" disabled={procesando} onPress={() => void cambiarEstado(seleccionada)}/>
        <Boton text="Cancelar" outline onPress={() => setConfirmando(false)}/>
      </View> : null}
    </> : vista === 'detalle' && seleccionada ? <>
      <Text style={styles.title}>{seleccionada.codigo_familia}</Text>
      <Text style={styles.hint}>Comunidad: {seleccionada.comunidad?.nombre ?? 'Sin información'} · {seleccionada.activo ? 'Activa' : 'Inactiva'}</Text>
      <Text style={styles.hint}>Dirección: {seleccionada.direccion || 'No registrada'}</Text>
      <Text style={styles.hint}>Referencia: {seleccionada.referencia || 'No registrada'}</Text>
      <Text style={styles.title}>Niños pertenecientes a la familia</Text>
      {!seleccionada.ninos?.length ? <Text style={styles.hint}>No se encontraron niños asociados a esta familia.</Text> :
        seleccionada.ninos.map(n => <View key={String(n.id_nino)} style={styles.result}>
          <View style={{ flex: 1, minWidth: 180 }}><Text style={styles.name}>{n.nombres} {n.apellidos}</Text>
            <Text style={styles.hint}>{n.codigo_expediente}</Text></View>
          <Boton text="Ver expediente" outline onPress={() => router.push({
            pathname: '/ninos/[id]', params: { id: String(n.id_nino) },
          })}/>
        </View>)}
      <View style={styles.top}><Boton text="Volver" outline onPress={() => setVista('busqueda')}/>
        <Boton text="Editar familia" onPress={() => formulario(seleccionada)}/></View>
    </> : <>
      <Text style={styles.title}>{vista === 'crear' ? 'Registrar familia' : 'Editar familia'}</Text>
      <View style={styles.fields}>
        <Campo label="Código de familia *" value={codigo} onChangeText={setCodigo}/>
        <View style={styles.field}><Text style={styles.label}>Comunidad *</Text>
          {comunidades.length === 0 ? <Text style={styles.error}>No existen comunidades disponibles.</Text> : <View style={styles.comunidades}>
            {comunidades.map(c => <Pressable key={String(c.id_comunidad)}
              onPress={() => setIdComunidad(String(c.id_comunidad))}
              style={[styles.community, idComunidad === String(c.id_comunidad) && styles.selected]}>
              <Ionicons name={idComunidad === String(c.id_comunidad) ? 'radio-button-on-outline':'radio-button-off-outline'}
                size={16} color={colors.primary}/>
              <Text style={styles.hint}>{c.nombre}</Text>
            </Pressable>)}
          </View>}
        </View>
        <Campo label="Dirección" value={direccion} onChangeText={setDireccion}/>
        <Campo label="Referencia de dirección" value={referencia} onChangeText={setReferencia}/>
      </View>
      <View style={styles.top}>
        <Boton text="Cancelar" outline onPress={() => setVista('busqueda')}/>
        <Boton text={procesando ? 'Guardando...' : 'Guardar familia'} disabled={procesando || comunidades.length === 0} onPress={() => void guardar()}/>
      </View>
    </>}
  </View>;
}

const styles = StyleSheet.create({
  panel: { backgroundColor:colors.surface,borderColor:colors.border,borderWidth:1,borderRadius:12,padding:18,gap:15 },
  top: {flexDirection:'row',flexWrap:'wrap',gap:10,alignItems:'center'},
  title: {fontSize:18,fontWeight:'800',color:colors.text},
  hint: {fontSize:12,color:colors.muted,lineHeight:19},
  label: {fontSize:12,color:colors.text,fontWeight:'700'},
  name: {fontSize:14,fontWeight:'700',color:colors.text},
  result: {flexDirection:'row',flexWrap:'wrap',alignItems:'center',gap:10,paddingVertical:12,borderBottomWidth:1,borderColor:colors.border},
  field: {flex:1,minWidth:230,gap:6},fields: {flexDirection:'row',flexWrap:'wrap',gap:12},
  input: {height:44,borderColor:colors.border,borderWidth:1,borderRadius:8,paddingHorizontal:12,color:colors.text,minWidth:0},
  button: {backgroundColor:colors.primary,borderWidth:1,borderColor:colors.primary,borderRadius:8,paddingHorizontal:14,minHeight:42,justifyContent:'center'},
  buttonText: {fontSize:12,fontWeight:'700',color:'#FFFFFF'},
  outline: {backgroundColor:colors.surface},
  error: {fontSize:12,color:colors.danger},success:{fontSize:12,color:colors.success,fontWeight:'700'},
  confirm:{flexDirection:'row',flexWrap:'wrap',alignItems:'center',gap:12,padding:12,backgroundColor:colors.dangerLight},
  comunidades: {gap:6,maxHeight:220,overflow:'scroll'},
  community:{borderWidth:1,borderColor:colors.border,borderRadius:7,padding:8,flexDirection:'row',alignItems:'center',gap:8},
  selected:{borderColor:colors.primary,backgroundColor:colors.infoLight},
});
