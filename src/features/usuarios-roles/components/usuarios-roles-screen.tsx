import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ScreenContainer } from '../../../components/layout/screen-container';
import { ScreenHeader } from '../../../components/layout/screen-header';
import { useResponsive } from '../../../hooks/use-responsive';
import { colors } from '../../../constants/theme';
import type { CentroSalud, Rol, Usuario } from '../types';
import { usuariosService } from '../services/usuarios.service';
import { rolesService } from '../services/roles.service';
import { centrosUsuariosService } from '../services/centros.service';
import { Accion, Aviso, Etiqueta, styles as ui } from './ui';
import { UsuarioForm } from './usuario-form';
import { UsuarioDetalle } from './usuario-detalle';
import { RolesSection } from './roles-section';

type Tab = 'usuarios' | 'roles';
type Vista = 'tabla' | 'crear' | 'editar' | 'detalle';
type Estado = 'TODOS' | 'ACTIVOS' | 'INACTIVOS';
function norm(s: string): string { return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim(); }

export default function UsuariosRolesScreen() {
  const { isMobile } = useResponsive();
  const [tab, setTab] = useState<Tab>('usuarios');
  const [vista, setVista] = useState<Vista>('tabla');
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [centros, setCentros] = useState<CentroSalud[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errores, setErrores] = useState<string[]>([]);
  const [catalogosError, setCatalogosError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState<Estado>('TODOS');
  const [rolFiltro, setRolFiltro] = useState('TODOS');
  const [centroFiltro, setCentroFiltro] = useState('TODOS');
  const [pagina, setPagina] = useState(1);
  const [anchoTabla, setAnchoTabla] = useState(0);
  const [confirmar, setConfirmar] = useState<Usuario | null>(null);
  const [cambiando, setCambiando] = useState(false);
  const [estadoError, setEstadoError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    setCargando(true); setErrores([]);
    void Promise.allSettled([usuariosService.listar(), rolesService.listar(), centrosUsuariosService.listar()])
      .then(resultados => {
        if (!activo) return;
        const [ru, rr, rc] = resultados;
        const fallos: string[] = [];
        if (ru.status === 'fulfilled' && ru.value.success && Array.isArray(ru.value.data)) setUsuarios(ru.value.data);
        else { setUsuarios([]); fallos.push('Usuarios: no se pudo obtener el listado. Compruebe sus permisos y la conexión.'); }
        if (rr.status === 'fulfilled' && rr.value.success && Array.isArray(rr.value.data)) setRoles(rr.value.data);
        else { setRoles([]); fallos.push('Roles: no se pudo cargar el catálogo.'); }
        if (rc.status === 'fulfilled' && rc.value.success && Array.isArray(rc.value.data)) setCentros(rc.value.data);
        else { setCentros([]); fallos.push('Centros: no se pudo obtener el catálogo (la ruta requiere ADMIN_GLOBAL).'); }
        setErrores(fallos); setCatalogosError(fallos.some(x => /Roles:|Centros:/.test(x)) ? fallos.filter(x => /Roles:|Centros:/.test(x)).join(' ') : null);
      }).finally(() => { if (activo) { setCargando(false); } });
    return () => { activo = false; };
  }, [revision]);

  const refrescar = useCallback(() => { setRevision(x => x + 1); }, []);
  const regresar = () => { setVista('tabla'); setUsuarioActual(null); refrescar(); };
  const editar = (u: Usuario) => { setUsuarioActual(u); setVista('editar'); };
  const ver = (u: Usuario) => { setUsuarioActual(u); setVista('detalle'); };
  const cambiarTab = (t: Tab) => { setTab(t); setVista('tabla'); setConfirmar(null); setEstadoError(null); };

  const filtrados = useMemo(() => usuarios.filter(u => {
    const c = u.centroSalud;
    const texto = norm([u.nombres, u.apellidos, u.nombre_usuario, u.correo, c?.nombre || '',
      ...(u.roles ?? []).map(r => r.nombre)].join(' '));
    return (!norm(busqueda) || texto.includes(norm(busqueda))) &&
      (estado === 'TODOS' || (estado === 'ACTIVOS' ? u.activo : !u.activo)) &&
      (rolFiltro === 'TODOS' || (u.roles ?? []).some(r => String(r.id_rol) === rolFiltro)) &&
      (centroFiltro === 'TODOS' || (centroFiltro === 'GLOBAL' ? u.id_centro == null : String(u.id_centro) === centroFiltro));
  }), [usuarios, busqueda, estado, rolFiltro, centroFiltro]);
  const paginas = Math.max(1, Math.ceil(filtrados.length / 7));
  const paginaReal = Math.min(pagina, paginas);
  const visibles = filtrados.slice((paginaReal - 1) * 7, paginaReal * 7);
  const activos = usuarios.filter(u => u.activo).length;
  const sinRoles = usuarios.filter(u => (u.roles ?? []).length === 0).length;

  const cambiarEstado = async () => {
    if (!confirmar || cambiando) return;
    setCambiando(true); setEstadoError(null);
    try {
      const r = await usuariosService.cambiarEstado(confirmar.id_usuario, !confirmar.activo);
      if (!r.success) throw new Error(r.message || 'No se pudo modificar el estado.');
      setConfirmar(null); refrescar();
    } catch(e) { setEstadoError(e instanceof Error ? e.message : 'No se pudo cambiar el estado.'); }
    finally { setCambiando(false); }
  };

  return <ScreenContainer>
    <ScreenHeader title="Usuarios y Roles" description="Administración de cuentas, centros asignados, roles y accesos del SCCVI." />
    <View style={s.tabs}>
      <Pressable onPress={() => cambiarTab('usuarios')} style={[s.tab, tab === 'usuarios' && s.tabActive]}>
        <Ionicons name="people-outline" color={tab === 'usuarios' ? '#FFFFFF' : colors.primary} size={19} />
        <Text style={[s.tabText, tab === 'usuarios' && { color: '#FFFFFF' }]}>Usuarios</Text>
      </Pressable>
      <Pressable onPress={() => cambiarTab('roles')} style={[s.tab, tab === 'roles' && s.tabActive]}>
        <Ionicons name="shield-checkmark-outline" color={tab === 'roles' ? '#FFFFFF' : colors.primary} size={19} />
        <Text style={[s.tabText, tab === 'roles' && { color: '#FFFFFF' }]}>Roles y permisos</Text>
      </Pressable>
    </View>
    {errores.map((msg, i) => <Aviso key={`${msg}-${i}`} mensaje={msg} />)}
    {tab === 'roles' ? <RolesSection roles={roles} usuarios={usuarios} cargando={cargando} onRefresh={refrescar} /> : (
      vista === 'crear' || vista === 'editar' ?
        <UsuarioForm key={vista === 'crear' ? 'nuevo' : `editar-${usuarioActual?.id_usuario}`}
          usuario={vista === 'editar' ? usuarioActual : null}
          centros={centros} roles={roles} onCancel={() => setVista('tabla')} onSaved={regresar} /> :
      vista === 'detalle' && usuarioActual ?
        <UsuarioDetalle id={usuarioActual.id_usuario} rolesDisponibles={roles} onBack={regresar}
          onEdit={editar} onSaved={refrescar} /> :
        <View style={{ gap: 15 }}>
          <View style={[ui.row, { justifyContent: 'space-between' }]}>
            <Text style={[s.subText, { flex: 1 }]}>Consulta, creación y actualización de cuentas del personal.</Text>
            <Accion icon="person-add-outline" texto="Nuevo usuario" disabled={cargando || !!catalogosError}
              onPress={() => { setUsuarioActual(null); setVista('crear'); }} />
          </View>
          <View style={[s.metrics, isMobile && { flexDirection: 'column' }]}>
            {([
              ['Usuarios registrados', usuarios.length, 'people-outline', colors.primary],
              ['Usuarios activos', activos, 'checkmark-circle-outline', colors.success],
              ['Usuarios inactivos', usuarios.length - activos, 'alert-circle-outline', colors.warning],
              ['Sin roles asignados', sinRoles, 'shield-outline', '#7960BD'],
            ] as const).map(([label, total, icon, color]) => <View key={label} style={s.metric}>
              <Ionicons name={icon} size={24} color={color} /><Text style={s.metricNum}>{cargando ? '—' : total}</Text>
              <Text style={s.subText}>{label}</Text>
            </View>)}
          </View>
          <View style={ui.panel}>
            <View style={[ui.row, { justifyContent: 'space-between' }]}>
              <Text style={ui.panelTitle}>Listado de usuarios</Text>
              <Accion icon="refresh-outline" texto="Actualizar" secundario onPress={refrescar} disabled={cargando} />
            </View>
            <View style={ui.row}>
              <TextInput style={s.search} value={busqueda} onChangeText={t => { setBusqueda(t); setPagina(1); }}
                placeholder="Buscar nombre, correo, usuario o rol..." placeholderTextColor="#8390A4" />
              {(['TODOS', 'ACTIVOS', 'INACTIVOS'] as Estado[]).map(e => <Pressable key={e}
                onPress={() => { setEstado(e); setPagina(1); }} style={[s.chip, estado === e && s.chipSelected]}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: estado === e ? '#FFFFFF' : colors.text }}>
                  {e === 'TODOS' ? 'Todos' : e === 'ACTIVOS' ? 'Activos' : 'Inactivos'}</Text>
              </Pressable>)}
            </View>
            <View style={s.filtrosSeparados}>
              <View style={s.filtroAncho}>
                <Text style={s.filterLabel}>Filtrar por rol</Text>
                <ScrollView horizontal style={s.scrollFiltros} showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.chipsContenedor}>
                  {[{ id_rol: 'TODOS', nombre: 'Todos' }, ...roles].map(r => <Pressable key={String(r.id_rol)}
                    onPress={() => { setRolFiltro(String(r.id_rol)); setPagina(1); }}
                    style={[s.chip, rolFiltro === String(r.id_rol) && s.chipSelected]}>
                    <Text style={{ color: rolFiltro === String(r.id_rol) ? '#FFFFFF' : colors.text, fontSize: 12 }}>
                      {r.nombre}
                    </Text>
                  </Pressable>)}
                </ScrollView>
              </View>
              <View style={s.filtroAncho}>
                <Text style={s.filterLabel}>Filtrar por centro</Text>
                <ScrollView horizontal style={s.scrollFiltros} showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.chipsContenedor}>
                  {[{ id_centro: 'TODOS', nombre: 'Todos' }, { id_centro: 'GLOBAL', nombre: 'Sin centro' }, ...centros].map(c => <Pressable key={String(c.id_centro)}
                    onPress={() => { setCentroFiltro(String(c.id_centro)); setPagina(1); }}
                    style={[s.chip, centroFiltro === String(c.id_centro) && s.chipSelected]}>
                    <Text style={{ color: centroFiltro === String(c.id_centro) ? '#FFFFFF' : colors.text, fontSize: 12 }}>
                      {c.nombre}
                    </Text>
                  </Pressable>)}
                </ScrollView>
              </View>
            </View>
            {cargando && <ActivityIndicator color={colors.primary} />}
            <View style={s.anchoTabla} onLayout={e => setAnchoTabla(e.nativeEvent.layout.width)}>
              <ScrollView horizontal style={{ width: '100%' }} showsHorizontalScrollIndicator={anchoTabla < 1040}>
                <View style={{ width: Math.max(1040, anchoTabla) }}>
                  <View style={[s.tr, s.th]}>
                    <Text style={[s.col, s.cNombre, s.heading]}>Nombre completo</Text>
                    <Text style={[s.col, s.cUsuario, s.heading]}>Usuario / correo</Text>
                    <Text style={[s.col, s.cCentro, s.heading]}>Centro de salud</Text>
                    <Text style={[s.col, s.cRoles, s.heading]}>Roles</Text>
                    <Text style={[s.col, s.cEstado, s.heading]}>Estado</Text>
                    <Text style={[s.col, s.cAcciones, s.heading]}>Acciones</Text>
                  </View>
                  {visibles.map(u => <View key={String(u.id_usuario)} style={s.tr}>
                    <Text style={[s.col, s.cNombre, { fontWeight: '700' }]}>{u.nombres} {u.apellidos}</Text>
                    <View style={[s.col, s.cUsuario, { gap: 4 }]}>
                      <Text style={s.primaryText}>{u.nombre_usuario}</Text>
                      <Text style={s.subText} numberOfLines={2}>{u.correo}</Text>
                    </View>
                    <Text style={[s.col, s.cCentro]} numberOfLines={3}>{u.centroSalud?.nombre ?? 'Sin centro'}</Text>
                    <View style={[s.col, s.cRoles, { gap: 5 }]}>
                      {(u.roles ?? []).length === 0 ?
                        <Text style={s.subText}>Sin roles</Text> :
                        (u.roles ?? []).map(r => <Text key={String(r.id_rol)} style={s.nombreRol}>
                          {r.nombre.replace(/_/g, '_\u200B')}
                        </Text>)}
                    </View>
                    <View style={[s.col, s.cEstado]}><Etiqueta activo={u.activo} /></View>
                    <View style={[s.col, s.cAcciones, s.botonesAccion]}>
                      <Pressable style={s.botonIcono} accessibilityRole="button" accessibilityLabel="Visualizar usuario" onPress={() => ver(u)}>
                        <Ionicons name="eye-outline" size={20} color={colors.primary} />
                      </Pressable>
                      <Pressable style={s.botonIcono} accessibilityRole="button" accessibilityLabel="Editar usuario" onPress={() => editar(u)}>
                        <Ionicons name="create-outline" size={20} color={colors.primary} />
                      </Pressable>
                      <Pressable style={s.botonIcono} accessibilityRole="button" accessibilityLabel={u.activo ? 'Desactivar usuario' : 'Activar usuario'}
                        onPress={() => { setConfirmar(u); setEstadoError(null); }}>
                        <Ionicons name={u.activo ? 'close-circle-outline' : 'checkmark-circle-outline'} color={u.activo ? colors.danger : colors.success} size={20} />
                      </Pressable>
                    </View>
                  </View>)}
                  {!cargando && visibles.length === 0 &&
                    <Text style={[s.subText, { padding: 18 }]}>No se encontraron usuarios con esos filtros.</Text>}
                </View>
              </ScrollView>
            </View>
            <View style={[ui.row, { justifyContent: 'space-between' }]}>
              <Text style={s.subText}>{filtrados.length} usuarios · Página {paginaReal} de {paginas}</Text>
              <View style={ui.row}><Accion icon="chevron-back-outline" texto="Anterior" secundario onPress={() => setPagina(p => Math.max(1, p - 1))} disabled={paginaReal <= 1} />
                <Accion icon="chevron-forward-outline" texto="Siguiente" secundario onPress={() => setPagina(p => Math.min(paginas, p + 1))} disabled={paginaReal >= paginas} /></View>
            </View>
          </View>
          {!!confirmar && <View style={ui.panel}>
            <Text style={ui.panelTitle}>¿{confirmar.activo ? 'Desactivar' : 'Activar'} usuario?</Text>
            <Text style={s.subText}>Cuenta: {confirmar.nombres} {confirmar.apellidos} ({confirmar.nombre_usuario}). La baja es lógica y no elimina el historial.</Text>
            <Aviso mensaje={estadoError} />
            <View style={ui.row}><Accion icon="close-outline" texto="Cancelar" secundario onPress={() => setConfirmar(null)} />
              <Accion icon="checkmark-circle-outline" texto={cambiando ? 'Procesando...' : 'Confirmar'} disabled={cambiando} onPress={() => void cambiarEstado()} /></View>
          </View>}
        </View>
    )}
  </ScreenContainer>;
}
const s = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: 10, marginBottom: 5, flexWrap: 'wrap' },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 15, paddingVertical: 13, borderRadius: 11, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { color: colors.primary, fontWeight: '800', fontSize: 13 },
  subText: { fontSize: 12, color: colors.muted, lineHeight: 18 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metric: { minWidth: 190, flexGrow: 1, flexBasis: 195, borderWidth: 1, borderColor: colors.border, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, gap: 7 },
  metricNum: { color: colors.text, fontWeight: '800', fontSize: 25 },
  search: { borderWidth: 1, borderColor: colors.border, borderRadius: 9, paddingVertical: 11, paddingHorizontal: 12, minWidth: 200, flexGrow: 1, fontSize: 13, color: colors.text },
  chip: { borderRadius: 9, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 10, paddingVertical: 10 },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  filtrosSeparados: { gap: 12, width: '100%', minWidth: 0 },
  filtroAncho: { width: '100%', minWidth: 0, gap: 8 },
  scrollFiltros: { width: '100%' },
  chipsContenedor: { gap: 8, paddingRight: 10, alignItems: 'center' },
  filterLabel: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  tr: { flexDirection: 'row', gap: 12, alignItems: 'center', paddingHorizontal: 15, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border, minHeight: 75 },
  th: { backgroundColor: colors.canvas }, heading: { fontWeight: '800', fontSize: 12, color: colors.muted },
  col: { minWidth: 0, color: colors.text, fontSize: 13 },
  cNombre: { flex: 1.25 }, cUsuario: { flex: 1.45 }, cCentro: { flex: 1.55 },
  cRoles: { flex: 1.5 }, cEstado: { flex: .75 }, cAcciones: { flex: 1.15 },
  anchoTabla: { width: '100%', minWidth: 0 },
  nombreRol: { color: colors.text, fontSize: 12, lineHeight: 18, flexShrink: 1 },
  botonesAccion: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center' },
  botonIcono: { width: 32, height: 34, borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ECF4FF' },
  primaryText: { fontWeight: '700', fontSize: 13, color: colors.text },
});
