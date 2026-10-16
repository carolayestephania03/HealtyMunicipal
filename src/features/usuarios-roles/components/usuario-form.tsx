import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../../constants/theme';
import type { CentroSalud, Rol, Usuario } from '../types';
import { usuariosService } from '../services/usuarios.service';
import { Accion, Aviso, Campo, styles as ui } from './ui';

type Props = { usuario?: Usuario | null; centros: CentroSalud[]; roles: Rol[];
  onCancel: () => void; onSaved: () => void; };
export function UsuarioForm({ usuario, centros, roles, onCancel, onSaved }: Props) {
  const editando = !!usuario;
  const [nombres, setNombres] = useState(usuario?.nombres ?? '');
  const [apellidos, setApellidos] = useState(usuario?.apellidos ?? '');
  const [nombreUsuario, setNombreUsuario] = useState(usuario?.nombre_usuario ?? '');
  const [correo, setCorreo] = useState(usuario?.correo ?? '');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [idCentro, setIdCentro] = useState(String(usuario?.id_centro ?? ''));
  const [rolesElegidos, setRolesElegidos] = useState<number[]>([]);
  const [centrosAbiertos, setCentrosAbiertos] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNombres(usuario?.nombres ?? ''); setApellidos(usuario?.apellidos ?? '');
    setNombreUsuario(usuario?.nombre_usuario ?? ''); setCorreo(usuario?.correo ?? '');
    setPassword(''); setPassword2(''); setIdCentro(String(usuario?.id_centro ?? ''));
    setRolesElegidos([]); setError(null);
  }, [usuario]);
  const activos = useMemo(() => roles.filter(x => x.activo), [roles]);
  const centro = centros.find(x => String(x.id_centro) === idCentro);
  const toggle = (id: number) => setRolesElegidos(old => old.includes(id) ? old.filter(v => v !== id) : [...old, id]);

  const guardar = async () => {
    if (guardando) return;
    setError(null);
    const n = nombres.trim(), a = apellidos.trim(), u = nombreUsuario.trim(), c = correo.trim().toLowerCase();
    if (n.length < 2 || n.length > 100 || a.length < 2 || a.length > 100) return setError('Nombres y apellidos deben tener entre 2 y 100 caracteres.');
    if (!/^[a-zA-Z0-9._-]{3,60}$/.test(u)) return setError('El usuario debe tener de 3 a 60 caracteres: letras, números, punto, guion o guion bajo.');
    if (c.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c)) return setError('Ingrese un correo electrónico válido.');
    const centroId = idCentro === '' ? null : Number(idCentro);
    if (centroId !== null && (!Number.isSafeInteger(centroId) || centroId <= 0 || !centro)) return setError('Seleccione un centro de salud válido.');
    if (centro && centro.activo === false && String(usuario?.id_centro ?? '') !== idCentro) return setError('No se puede asignar un centro inactivo.');
    if (!editando) {
      if (password.length < 8 || password.length > 72) return setError('La contraseña debe tener entre 8 y 72 caracteres.');
      if (password !== password2) return setError('Las contraseñas no coinciden.');
      if (rolesElegidos.length === 0) return setError('Seleccione al menos un rol.');
      const seleccionados = activos.filter(r => rolesElegidos.includes(Number(r.id_rol)));
      const soloGlobal = seleccionados.length > 0 && seleccionados.every(r => r.nombre === 'ADMIN_GLOBAL');
      if (centroId === null && !soloGlobal) return setError('Los usuarios no globales deben estar asignados a un centro de salud.');
    }
    setGuardando(true);
    try {
      const dto = { id_centro: centroId, nombres: n, apellidos: a, nombre_usuario: u, correo: c };
      const respuesta = editando
        ? await usuariosService.editar(usuario.id_usuario, dto)
        : await usuariosService.crear({ ...dto, password, roles: rolesElegidos });
      if (!respuesta.success) throw new Error(respuesta.message || 'No se pudo guardar el usuario.');
      onSaved();
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo completar el registro.'); }
    finally { setGuardando(false); }
  };

  return <View style={ui.panel}>
    <Text style={ui.panelTitle}>{editando ? 'Editar información del usuario' : 'Registrar nuevo usuario'}</Text>
    <Text style={s.help}>Los campos marcados con * son obligatorios. Las contraseñas se transmiten al backend por HTTPS en producción y nunca se muestran al consultar usuarios.</Text>
    <View style={ui.row}>
      <Campo label="Nombres *" value={nombres} onChangeText={setNombres} maxLength={100} />
      <Campo label="Apellidos *" value={apellidos} onChangeText={setApellidos} maxLength={100} />
      <Campo label="Nombre de usuario *" value={nombreUsuario} onChangeText={setNombreUsuario} maxLength={60} autoCapitalize="none" />
      <Campo label="Correo electrónico *" value={correo} onChangeText={setCorreo} keyboardType="email-address" maxLength={150} autoCapitalize="none" />
    </View>
    <View style={{ gap: 9 }}>
      <Text style={s.label}>Centro de salud</Text>
      <Pressable style={s.selector} onPress={() => setCentrosAbiertos(x => !x)} accessibilityRole="button">
        <Text style={{ color: colors.text, flex: 1 }}>{centro ? `${centro.codigo} · ${centro.nombre}` : 'Sin centro (solo administrador global)'}</Text>
        <Ionicons name={centrosAbiertos ? 'chevron-up' : 'chevron-down'} color={colors.primary} size={18} />
      </Pressable>
      {centrosAbiertos && <View style={s.options}>
        <Pressable style={s.option} onPress={() => { setIdCentro(''); setCentrosAbiertos(false); }}><Text>Sin centro de salud</Text></Pressable>
        {centros.filter(x => x.activo !== false || String(usuario?.id_centro ?? '') === String(x.id_centro)).map(x =>
          <Pressable key={String(x.id_centro)} style={s.option} onPress={() => { setIdCentro(String(x.id_centro)); setCentrosAbiertos(false); }}>
            <Text style={{ color: colors.text }}>{x.codigo} · {x.nombre}</Text>
          </Pressable>)}
      </View>}
    </View>
    {!editando && <>
      <View style={ui.row}>
        <Campo label="Contraseña *" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" />
        <Campo label="Confirmar contraseña *" value={password2} onChangeText={setPassword2} secureTextEntry autoCapitalize="none" />
      </View>
      <View style={{ gap: 9 }}>
        <Text style={s.label}>Roles iniciales *</Text>
        <Text style={s.help}>Puedes seleccionar varios roles. Solo se muestran los activos.</Text>
        {activos.length === 0 && <Aviso mensaje="No existen roles activos. Registra o activa un rol antes de crear usuarios." />}
        {activos.map(r => <Pressable key={String(r.id_rol)} onPress={() => toggle(Number(r.id_rol))} style={s.roleRow}>
          <Ionicons name={rolesElegidos.includes(Number(r.id_rol)) ? 'checkbox' : 'square-outline'} size={23} color={colors.primary} />
          <View style={{ flex: 1 }}><Text style={{ color: colors.text, fontWeight: '700' }}>{r.nombre}</Text>
            {!!r.descripcion && <Text style={s.help}>{r.descripcion}</Text>}</View>
        </Pressable>)}
      </View>
    </>}
    {editando && <Aviso error={false} mensaje="La modificación de roles está disponible en Ver usuario → Administrar roles. La edición de perfil no cambia permisos ni contraseña." />}
    <Aviso mensaje={error} />
    <View style={ui.row}>
      <Accion icon="arrow-back-outline" texto="Cancelar" secundario onPress={onCancel} disabled={guardando} />
      <Accion icon="save-outline" texto={guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear usuario'} onPress={() => void guardar()} disabled={guardando || (!editando && activos.length === 0)} />
      {guardando && <ActivityIndicator color={colors.primary} />}
    </View>
  </View>;
}
const s = StyleSheet.create({
  help: { fontSize: 12, color: colors.muted, lineHeight: 18 },
  label: { fontSize: 12, color: colors.muted, fontWeight: '700' },
  selector: { borderWidth: 1, borderColor: colors.border, padding: 13, borderRadius: 9, flexDirection: 'row', gap: 10 },
  options: { borderColor: colors.border, borderWidth: 1, borderRadius: 9, overflow: 'hidden' },
  option: { padding: 11, borderBottomColor: colors.border, borderBottomWidth: 1 },
  roleRow: { borderColor: colors.border, borderWidth: 1, padding: 12, borderRadius: 9, flexDirection: 'row', alignItems: 'center', gap: 10 },
});
