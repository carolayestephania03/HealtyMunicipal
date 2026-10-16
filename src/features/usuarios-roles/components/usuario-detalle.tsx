import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../../constants/theme';
import type { Id, Rol, Usuario } from '../types';
import { usuariosService } from '../services/usuarios.service';
import { Accion, Aviso, Dato, Etiqueta, styles as ui } from './ui';

type Props = { id: Id; rolesDisponibles: Rol[]; onBack: () => void; onEdit: (v: Usuario) => void; onSaved: () => void };
export function UsuarioDetalle({ id, rolesDisponibles, onBack, onEdit, onSaved }: Props) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const [edicionRoles, setEdicionRoles] = useState(false);
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    setCargando(true); setError(null); setMensaje(null);
    void usuariosService.detalle(id).then(r => {
      if (!activo) return;
      if (!r.success || !r.data) throw new Error(r.message || 'No se encontró el usuario.');
      setUsuario(r.data); setSeleccionados((r.data.roles ?? []).map(x => Number(x.id_rol)));
    }).catch(e => { if (activo) setError(e instanceof Error ? e.message : 'No se pudo consultar el usuario.'); })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, [id, revision]);

  const guardarRoles = async () => {
    if (!usuario || guardando) return;
    if (seleccionados.length === 0) return setError('El usuario debe conservar al menos un rol.');
    if (rolesDisponibles.some(r => seleccionados.includes(Number(r.id_rol)) && !r.activo)) {
      return setError('No puede asignar roles inactivos; desmárquelos antes de guardar.');
    }
    setGuardando(true); setError(null);
    try {
      const r = await usuariosService.reemplazarRoles(usuario.id_usuario, seleccionados);
      if (!r.success) throw new Error(r.message || 'No se pudo guardar la asignación.');
      setEdicionRoles(false); setMensaje('Roles actualizados correctamente.');
      setRevision(x => x + 1); onSaved();
    } catch (e) { setError(e instanceof Error ? e.message : 'Ocurrió un error al guardar roles.'); }
    finally { setGuardando(false); }
  };
  return <View style={ui.panel}>
    <View style={ui.row}>
      <Accion icon="arrow-back-outline" texto="Volver al listado" secundario onPress={onBack} />
      <Text style={ui.panelTitle}>Expediente de usuario</Text>
    </View>
    {cargando && <ActivityIndicator color={colors.primary} />}
    <Aviso mensaje={error} /><Aviso mensaje={mensaje} error={false} />
    {!!usuario && !cargando && <>
      <View style={ui.row}><Text style={s.name}>{usuario.nombres} {usuario.apellidos}</Text><Etiqueta activo={usuario.activo} />
        <Accion icon="create-outline" texto="Editar perfil" onPress={() => onEdit(usuario)} />
      </View>
      <View style={ui.row}>
        <Dato titulo="Nombre de usuario" valor={usuario.nombre_usuario} />
        <Dato titulo="Correo" valor={usuario.correo} />
        <Dato titulo="Centro de salud" valor={usuario.centroSalud ? `${usuario.centroSalud.codigo} · ${usuario.centroSalud.nombre}` : 'Administración global / no asignado'} />
        <Dato titulo="Identificador" valor={usuario.id_usuario} />
      </View>
      <View style={s.separator} />
      <View style={ui.row}><Text style={ui.panelTitle}>Roles asignados</Text>
        {!edicionRoles && <Accion icon="shield-checkmark-outline" texto="Administrar roles" secundario onPress={() => { setEdicionRoles(true); setError(null); }} />}
      </View>
      {!edicionRoles ? <View style={ui.row}>
        {(usuario.roles ?? []).map(r => <View key={String(r.id_rol)} style={s.pill}><Text style={s.pillText}>{r.nombre}{!r.activo ? ' · inactivo' : ''}</Text></View>)}
        {(usuario.roles ?? []).length === 0 && <Text style={{ color: colors.danger }}>El usuario no tiene roles asociados.</Text>}
      </View> : <View style={{ gap: 11 }}>
        <Aviso error={false} mensaje="Esta acción reemplaza el conjunto actual de roles. Los roles inactivos no pueden asignarse." />
        {rolesDisponibles.map(r => <Pressable key={String(r.id_rol)} style={s.checkRow}
          onPress={() => { if (r.activo) setSeleccionados(prev => prev.includes(Number(r.id_rol)) ? prev.filter(n => n !== Number(r.id_rol)) : [...prev, Number(r.id_rol)]); }}>
          <Ionicons name={seleccionados.includes(Number(r.id_rol)) ? 'checkbox' : 'square-outline'} color={r.activo ? colors.primary : colors.muted} size={23} />
          <Text style={{ color: r.activo ? colors.text : colors.muted, flex: 1, fontWeight: '600' }}>{r.nombre}{!r.activo ? ' (inactivo)' : ''}</Text>
        </Pressable>)}
        <View style={ui.row}>
          <Accion icon="close-outline" texto="Cancelar" secundario onPress={() => { setEdicionRoles(false); setError(null); setSeleccionados((usuario.roles ?? []).map(x => Number(x.id_rol))); }} disabled={guardando} />
          <Accion icon="save-outline" texto={guardando ? 'Guardando...' : 'Guardar roles'} onPress={() => void guardarRoles()} disabled={guardando} />
        </View>
      </View>}
    </>}
  </View>;
}
const s = StyleSheet.create({
  name: { color: colors.text, fontWeight: '800', fontSize: 19 },
  separator: { height: 1, backgroundColor: colors.border },
  pill: { backgroundColor: colors.infoLight, paddingVertical: 7, paddingHorizontal: 12, borderRadius: 15 },
  pillText: { fontSize: 12, color: colors.primary, fontWeight: '700' },
  checkRow: { padding: 12, flexDirection: 'row', gap: 11, alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 9 },
});
