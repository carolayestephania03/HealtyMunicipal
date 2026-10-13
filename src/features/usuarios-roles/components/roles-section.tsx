import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../../constants/theme';
import type { Rol, Usuario } from '../types';
import { rolesService } from '../services/roles.service';
import { Accion, Aviso, Etiqueta, styles as ui } from './ui';

type Props = {
  roles: Rol[];
  usuarios: Usuario[];
  cargando: boolean;
  onRefresh: () => void;
};
type Estado = 'TODOS' | 'ACTIVOS' | 'INACTIVOS';

const POR_PAGINA = 7;
const ANCHO_MIN_TABLA = 740;
const normalizar = (valor: string) => valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
// Permite quebrar nombres largos (DEMO_PERSONAL_SALUD) sin cambiar su texto visible.
const nombreAdaptable = (valor: string) => valor.replace(/_/g, '_\u200B');

export function RolesSection({ roles, usuarios, cargando, onRefresh }: Props) {
  const [texto, setTexto] = useState('');
  const [estado, setEstado] = useState<Estado>('TODOS');
  const [pagina, setPagina] = useState(1);
  const [anchoPanel, setAnchoPanel] = useState(0);
  const [seleccionado, setSeleccionado] = useState<Rol | null>(null);
  const [detalle, setDetalle] = useState<Rol | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState<string | null>(null);

  const filtrados = useMemo(() => roles.filter((rol) => {
    const coincideTexto = normalizar(`${rol.nombre} ${rol.descripcion ?? ''}`).includes(normalizar(texto));
    const coincideEstado = estado === 'TODOS' || (estado === 'ACTIVOS' ? rol.activo : !rol.activo);
    return coincideTexto && coincideEstado;
  }), [roles, estado, texto]);
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtrados.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);
  const cantidadUsuarios = (rol: Rol) => usuarios.filter((usuario) =>
    (usuario.roles ?? []).some((r) => String(r.id_rol) === String(rol.id_rol))
  ).length;
  const rolesEnUso = roles.filter((rol) => cantidadUsuarios(rol) > 0).length;

  const verRol = async (rol: Rol) => {
    setSeleccionado(rol);
    setDetalle(null);
    setErrorDetalle(null);
    setCargandoDetalle(true);
    try {
      const respuesta = await rolesService.usuarios(rol.id_rol);
      if (!respuesta.success) throw new Error(respuesta.message || 'No se pudieron consultar los usuarios.');
      setDetalle(respuesta.data);
    } catch (error) {
      setErrorDetalle(error instanceof Error ? error.message : 'Error al consultar los usuarios asignados.');
    } finally {
      setCargandoDetalle(false);
    }
  };

  if (seleccionado) {
    return <View style={ui.panel}>
      <View style={s.headerDetail}>
        <Accion icon="arrow-back-outline" texto="Volver a roles" secundario onPress={() => {
          setSeleccionado(null);
          setDetalle(null);
          setErrorDetalle(null);
        }} />
      </View>
      <View style={s.detailHeading}>
        <View style={{ flex: 1, gap: 6, minWidth: 0 }}>
          <Text style={ui.panelTitle}>{nombreAdaptable(seleccionado.nombre)}</Text>
          <Text style={s.hint}>{seleccionado.descripcion || 'Sin descripción registrada.'}</Text>
        </View>
        <Etiqueta activo={seleccionado.activo} />
      </View>
      <Aviso mensaje={errorDetalle} />
      <Text style={s.subTitle}>Usuarios asociados</Text>
      {cargandoDetalle ? <ActivityIndicator color={colors.primary} /> : <>
        <Text style={s.hint}>Total de usuarios con este rol: {detalle?.usuarios?.length ?? (errorDetalle ? '—' : 0)}</Text>
        {(detalle?.usuarios ?? []).map((usuario) => <View key={String(usuario.id_usuario)} style={s.userRow}>
          <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
            <Text style={s.bold}>{usuario.nombres} {usuario.apellidos}</Text>
            <Text style={s.hint}>{usuario.nombre_usuario} · {usuario.correo}</Text>
          </View>
          <Etiqueta activo={usuario.activo} />
        </View>)}
        {!errorDetalle && (detalle?.usuarios?.length ?? 0) === 0 &&
          <Text style={s.hint}>Este rol no tiene usuarios asociados.</Text>}
      </>}
    </View>;
  }

  return <View style={s.contenido}>
    <View style={s.encabezado}>
      <View style={{ flex: 1, minWidth: 230, gap: 5 }}>
        <Text style={s.subTitle}>Catálogo de roles</Text>
        <Text style={s.hint}>Consulta de roles existentes y usuarios asociados. Los roles no se crean, modifican ni desactivan desde esta pantalla.</Text>
      </View>
      <Accion icon="refresh-outline" texto="Actualizar" secundario onPress={onRefresh} disabled={cargando} />
    </View>

    <View style={s.indicadores}>
      {([
        ['Total de roles', roles.length, 'shield-outline'],
        ['Roles activos', roles.filter((r) => r.activo).length, 'checkmark-circle-outline'],
        ['Roles inactivos', roles.filter((r) => !r.activo).length, 'alert-circle-outline'],
        ['Roles en uso', rolesEnUso, 'people-outline'],
      ] as const).map(([titulo, valor, icono]) => <View key={titulo} style={s.indicador}>
        <Ionicons name={icono} size={22} color={colors.primary} />
        <Text style={s.valor}>{cargando ? '—' : valor}</Text>
        <Text style={s.hint}>{titulo}</Text>
      </View>)}
    </View>

    <View style={ui.panel}>
      <Text style={ui.panelTitle}>Listado de roles</Text>
      <View style={s.filtros}>
        <TextInput
          style={s.search}
          value={texto}
          onChangeText={(valor) => { setTexto(valor); setPagina(1); }}
          placeholder="Buscar por nombre o descripción..."
          placeholderTextColor="#8390A4"
        />
        <View style={s.estados}>
          {(['TODOS', 'ACTIVOS', 'INACTIVOS'] as Estado[]).map((opcion) => <Pressable
            key={opcion}
            accessibilityRole="button"
            onPress={() => { setEstado(opcion); setPagina(1); }}
            style={[s.chip, estado === opcion && s.chipSeleccionado]}
          >
            <Text style={[s.chipTexto, estado === opcion && { color: '#FFFFFF' }]}>
              {opcion === 'TODOS' ? 'Todos' : opcion === 'ACTIVOS' ? 'Activos' : 'Inactivos'}
            </Text>
          </Pressable>)}
        </View>
      </View>
      {cargando && <ActivityIndicator color={colors.primary} />}
      <View style={s.medidor} onLayout={(evento) => setAnchoPanel(evento.nativeEvent.layout.width)}>
        <ScrollView horizontal style={s.tablaScroll} showsHorizontalScrollIndicator={anchoPanel < ANCHO_MIN_TABLA}>
          <View style={{ width: Math.max(ANCHO_MIN_TABLA, anchoPanel) }}>
            <View style={[s.fila, s.cabecera]}>
              <Text style={[s.celda, s.cRol, s.tituloColumna]}>Rol</Text>
              <Text style={[s.celda, s.cDescripcion, s.tituloColumna]}>Descripción</Text>
              <Text style={[s.celda, s.cUsuarios, s.tituloColumna]}>Usuarios</Text>
              <Text style={[s.celda, s.cEstado, s.tituloColumna]}>Estado</Text>
              <Text style={[s.celda, s.cAccion, s.tituloColumna]}>Consultar</Text>
            </View>
            {visibles.map((rol) => <View key={String(rol.id_rol)} style={s.fila}>
              <Text style={[s.celda, s.cRol, s.bold]}>{nombreAdaptable(rol.nombre)}</Text>
              <Text style={[s.celda, s.cDescripcion, s.hint]}>{rol.descripcion || 'Sin descripción'}</Text>
              <Text style={[s.celda, s.cUsuarios]}>{cantidadUsuarios(rol)}</Text>
              <View style={[s.celda, s.cEstado]}><Etiqueta activo={rol.activo} /></View>
              <View style={[s.celda, s.cAccion]}>
                <Pressable accessibilityRole="button" accessibilityLabel={`Ver usuarios del rol ${rol.nombre}`}
                  onPress={() => void verRol(rol)} style={s.iconButton}>
                  <Ionicons name="eye-outline" color={colors.primary} size={20} />
                </Pressable>
              </View>
            </View>)}
            {!cargando && visibles.length === 0 &&
              <Text style={[s.hint, { padding: 18 }]}>No se encontraron roles con esos filtros.</Text>}
          </View>
        </ScrollView>
      </View>
      <View style={s.pieTabla}>
        <Text style={s.hint}>Mostrando {filtrados.length === 0 ? 0 : (paginaActual - 1) * POR_PAGINA + 1}–{Math.min(paginaActual * POR_PAGINA, filtrados.length)} de {filtrados.length} roles</Text>
        <View style={s.estados}>
          <Accion icon="chevron-back-outline" texto="Anterior" secundario disabled={paginaActual <= 1} onPress={() => setPagina((p) => Math.max(1, p - 1))} />
          <Text style={[s.bold, { alignSelf: 'center' }]}>{paginaActual} / {totalPaginas}</Text>
          <Accion icon="chevron-forward-outline" texto="Siguiente" secundario disabled={paginaActual >= totalPaginas} onPress={() => setPagina((p) => Math.min(totalPaginas, p + 1))} />
        </View>
      </View>
    </View>
  </View>;
}

const s = StyleSheet.create({
  contenido: { gap: 16, width: '100%' },
  encabezado: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' },
  subTitle: { fontWeight: '800', fontSize: 16, color: colors.text },
  hint: { fontSize: 12, color: colors.muted, lineHeight: 19 },
  bold: { fontSize: 13, fontWeight: '700', color: colors.text },
  indicadores: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  indicador: { flex: 1, flexBasis: 200, minWidth: 190, backgroundColor: '#FFFFFF', borderColor: colors.border, borderWidth: 1, padding: 16, borderRadius: 12, gap: 7 },
  valor: { fontSize: 26, fontWeight: '800', color: colors.text },
  filtros: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  search: { flexGrow: 1, flexBasis: 270, minWidth: 220, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 11, fontSize: 13, borderRadius: 9, color: colors.text },
  estados: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 9, paddingVertical: 10, paddingHorizontal: 12 },
  chipSeleccionado: { borderColor: colors.primary, backgroundColor: colors.primary },
  chipTexto: { color: colors.text, fontSize: 12, fontWeight: '700' },
  medidor: { width: '100%', minWidth: 0 },
  tablaScroll: { width: '100%' },
  fila: { flexDirection: 'row', gap: 14, paddingHorizontal: 16, paddingVertical: 14, minHeight: 68, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border },
  cabecera: { backgroundColor: colors.canvas },
  tituloColumna: { color: colors.muted, fontWeight: '800', fontSize: 12 },
  celda: { fontSize: 13, color: colors.text, minWidth: 0 },
  cRol: { flex: 1.4 }, cDescripcion: { flex: 2.2 }, cUsuarios: { flex: .65 }, cEstado: { flex: .9 }, cAccion: { flex: .65 },
  iconButton: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#EAF3FF', alignItems: 'center', justifyContent: 'center' },
  pieTabla: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 12 },
  headerDetail: { flexDirection: 'row' },
  detailHeading: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12 },
});
