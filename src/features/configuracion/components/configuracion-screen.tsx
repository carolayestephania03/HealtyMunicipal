import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View,
  useWindowDimensions,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from 'expo-router';

import { colors } from '../../../constants/theme';
import { ScreenContainer } from '../../../components/layout/screen-container';
import { ScreenHeader } from '../../../components/layout/screen-header';
import { perfilService } from '../services/perfil.service';
import type { EditarMiPerfilDto, PerfilUsuario } from '../types';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type AvisoTipo = 'error' | 'exito' | 'informacion';
function Aviso({ mensaje, tipo = 'error' }: { mensaje: string | null; tipo?: AvisoTipo }) {
  if (!mensaje) return null;
  const exito = tipo === 'exito';
  const informacion = tipo === 'informacion';
  const tinta = exito ? colors.success : informacion ? colors.primary : colors.danger;
  const fondo = exito ? colors.successLight : informacion ? colors.infoLight : colors.dangerLight;
  return (
    <View style={[styles.aviso, { backgroundColor: fondo }]}>
      <Ionicons name={exito ? 'checkmark-circle-outline' : informacion ? 'information-circle-outline' : 'alert-circle-outline'}
        color={tinta} size={19} />
      <Text style={[styles.avisoTexto, { color: tinta }]}>{mensaje}</Text>
    </View>
  );
}

function Accion({ texto, icono, onPress, secundario = false, disabled = false }: {
  texto: string; icono: IconName; onPress: () => void; secundario?: boolean; disabled?: boolean;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={texto} onPress={onPress} disabled={disabled}
      style={({ pressed }) => [styles.boton, secundario && styles.botonSecundario,
      (disabled || pressed) && { opacity: 0.57 }]}>
      <Ionicons name={icono} color={secundario ? colors.primary : '#FFFFFF'} size={17} />
      <Text style={[styles.botonTexto, secundario && { color: colors.primary }]}>{texto}</Text>
    </Pressable>
  );
}

function Campo({ titulo, valor, onChangeText, placeholder, autoCapitalize = 'words',
  keyboardType = 'default', maxLength, password = false, mostrarPassword = false,
  onTogglePassword }: {
  titulo: string; valor: string; onChangeText: (texto: string) => void;
  placeholder?: string; autoCapitalize?: 'none' | 'words' | 'sentences';
  keyboardType?: 'default' | 'email-address'; maxLength?: number;
  password?: boolean; mostrarPassword?: boolean; onTogglePassword?: () => void;
}) {
  return (
    <View style={styles.campo}>
      <Text style={styles.etiqueta}>{titulo}</Text>
      <View style={styles.inputGrupo}>
        <TextInput
          style={styles.input} value={valor} onChangeText={onChangeText}
          placeholder={placeholder} placeholderTextColor="#8795A9"
          maxLength={maxLength} autoCapitalize={autoCapitalize}
          keyboardType={keyboardType} autoCorrect={false}
          secureTextEntry={password && !mostrarPassword}
        />
        {password ? (
          <Pressable accessibilityRole="button" accessibilityLabel={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onPress={onTogglePassword} style={styles.ojo}>
            <Ionicons name={mostrarPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function Icono({ nombre, color = colors.primary }: { nombre: IconName; color?: string }) {
  return (
    <View style={[styles.icono, { backgroundColor: color === colors.success ? colors.successLight : colors.infoLight }]}>
      <Ionicons name={nombre} color={color} size={20} />
    </View>
  );
}

function Seccion({ titulo, descripcion, icono, children }: {
  titulo: string; descripcion?: string; icono: IconName; children: React.ReactNode;
}) {
  return (
    <View style={styles.panel}>
      <View style={styles.panelEncabezado}>
        <Icono nombre={icono} />
        <View style={{ flex: 1 }}>
          <Text style={styles.panelTitulo}>{titulo}</Text>
          {descripcion ? <Text style={styles.panelDescripcion}>{descripcion}</Text> : null}
        </View>
      </View>
      {children}
    </View>
  );
}

function Dato({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <View style={styles.dato}>
      <Text style={styles.etiqueta}>{titulo}</Text>
      <Text style={styles.datoValor}>{valor}</Text>
    </View>
  );
}

function fechaVisible(valor: string | null | undefined): string {
  if (!valor) return 'No disponible';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return 'No disponible';
  return fecha.toLocaleDateString('es-GT', { day: '2-digit', month: 'long', year: 'numeric' });
}

const inicioVacio: EditarMiPerfilDto = {
  nombres: '', apellidos: '', nombre_usuario: '', correo: '',
};

export default function ConfiguracionScreen() {
  const { width } = useWindowDimensions();
  const pantallaAncha = width >= 1050;
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [form, setForm] = useState<EditarMiPerfilDto>(inicioVacio);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [errorDatos, setErrorDatos] = useState<string | null>(null);
  const [exitoDatos, setExitoDatos] = useState<string | null>(null);

  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [guardandoPassword, setGuardandoPassword] = useState(false);
  const [errorPassword, setErrorPassword] = useState<string | null>(null);
  const [exitoPassword, setExitoPassword] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setErrorCarga(null);
    try {
      const respuesta = await perfilService.obtener();
      if (!respuesta.success || !respuesta.data) throw new Error(respuesta.message || 'No se pudo consultar el perfil.');
      const actual = respuesta.data;
      setPerfil(actual);
      setForm({ nombres: actual.nombres ?? '', apellidos: actual.apellidos ?? '',
        nombre_usuario: actual.nombre_usuario ?? '', correo: actual.correo ?? '' });
    } catch (error) {
      setErrorCarga(error instanceof Error ? error.message : 'No se pudo cargar la cuenta.');
    } finally {
      setCargando(false);
    }
  }, []);

  // Actualiza el perfil cuando se vuelve a la pantalla desde otro módulo.
  useFocusEffect(useCallback(() => { void cargar(); }, [cargar]));

  const cambiarCampo = (campo: keyof EditarMiPerfilDto, texto: string) => {
    setForm(anterior => ({ ...anterior, [campo]: texto }));
    setExitoDatos(null);
  };

  const guardarDatos = async () => {
    if (guardando || !perfil) return;
    setErrorDatos(null); setExitoDatos(null);
    const dto: EditarMiPerfilDto = {
      nombres: form.nombres.trim(),
      apellidos: form.apellidos.trim(),
      nombre_usuario: form.nombre_usuario.trim(),
      correo: form.correo.trim().toLowerCase(),
    };
    if (dto.nombres.length < 2 || dto.nombres.length > 100 ||
      dto.apellidos.length < 2 || dto.apellidos.length > 100) {
      setErrorDatos('Nombres y apellidos deben tener entre 2 y 100 caracteres.'); return;
    }
    if (!/^[a-zA-Z0-9._-]{3,60}$/.test(dto.nombre_usuario)) {
      setErrorDatos('El nombre de usuario debe contener entre 3 y 60 caracteres válidos.'); return;
    }
    if (dto.correo.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dto.correo)) {
      setErrorDatos('Ingrese una dirección de correo electrónico válida.'); return;
    }
    if (Object.keys(dto).every(campo => dto[campo as keyof EditarMiPerfilDto] ===
      perfil[campo as keyof EditarMiPerfilDto])) {
      setErrorDatos('No hay cambios pendientes por guardar.'); return;
    }
    setGuardando(true);
    try {
      const respuesta = await perfilService.actualizar(dto);
      if (!respuesta.success || !respuesta.data) throw new Error(respuesta.message || 'No se pudo actualizar el perfil.');
      setPerfil(respuesta.data);
      setForm({ nombres: respuesta.data.nombres, apellidos: respuesta.data.apellidos,
        nombre_usuario: respuesta.data.nombre_usuario, correo: respuesta.data.correo });
      setExitoDatos('Tu información se actualizó correctamente. Si la cabecera muestra datos anteriores, vuelve a iniciar sesión.');
    } catch (error) {
      setErrorDatos(error instanceof Error ? error.message : 'Ocurrió un error al guardar.');
    } finally { setGuardando(false); }
  };

  const guardarPassword = async () => {
    if (guardandoPassword) return;
    setErrorPassword(null); setExitoPassword(null);
    if (!passwordActual) { setErrorPassword('Ingresa tu contraseña actual.'); return; }
    if (passwordNueva.length < 8 || passwordNueva.length > 72) {
      setErrorPassword('La nueva contraseña debe tener entre 8 y 72 caracteres.'); return;
    }
    if (passwordNueva === passwordActual) {
      setErrorPassword('La contraseña nueva debe ser diferente de la actual.'); return;
    }
    if (passwordNueva !== confirmarPassword) {
      setErrorPassword('La confirmación no coincide con la contraseña nueva.'); return;
    }
    setGuardandoPassword(true);
    try {
      const respuesta = await perfilService.cambiarPassword({
        password_actual: passwordActual, password_nueva: passwordNueva,
        confirmar_password: confirmarPassword,
      });
      if (!respuesta.success) throw new Error(respuesta.message || 'No se pudo cambiar la contraseña.');
      setPasswordActual(''); setPasswordNueva(''); setConfirmarPassword('');
      setMostrarPassword(false);
      setExitoPassword('Contraseña cambiada correctamente. Cierra sesión y vuelve a ingresar con la contraseña nueva.');
    } catch (error) {
      setErrorPassword(error instanceof Error ? error.message : 'No se pudo cambiar la contraseña.');
    } finally { setGuardandoPassword(false); }
  };

  const nombre = [perfil?.nombres, perfil?.apellidos].filter(Boolean).join(' ');
  const iniciales = [perfil?.nombres?.[0], perfil?.apellidos?.[0]].filter(Boolean).join('').toUpperCase() || 'U';
  const roles = perfil?.roles?.filter(x => x.activo !== false) ?? [];

  return (
    <ScreenContainer>
      <ScreenHeader title="Configuración de mi perfil"
        description="Consulta y actualiza tus datos personales y la seguridad de tu cuenta." />

      {cargando && !perfil ? (
        <View style={styles.cargando}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.secundario}>Consultando tu cuenta...</Text>
        </View>
      ) : null}
      <Aviso mensaje={errorCarga} />
      {errorCarga ? (
        <Accion icono="refresh-outline" texto="Reintentar" onPress={() => void cargar()} secundario />
      ) : null}

      {perfil ? (
        <>
          <View style={styles.resumen}>
            <View style={styles.avatar}><Text style={styles.iniciales}>{iniciales}</Text></View>
            <View style={{ flex: 1, minWidth: 190, gap: 4 }}>
              <Text style={styles.nombre}>{nombre}</Text>
              <Text style={styles.usuario}>@{perfil.nombre_usuario} · {perfil.correo}</Text>
              <View style={styles.rolesFila}>
                {(roles.length ? roles : []).map(x => (
                  <View key={String(x.id_rol)} style={styles.etiquetaRol}>
                    <Text style={styles.textoRol}>{x.nombre}</Text>
                  </View>
                ))}
                {!roles.length && <Text style={styles.secundario}>Sin roles activos asignados</Text>}
              </View>
            </View>
            <View style={styles.estado}>
              <Ionicons name={perfil.activo ? 'checkmark-circle' : 'close-circle'}
                color={perfil.activo ? colors.success : colors.danger} size={17} />
              <Text style={[styles.estadoTexto, { color: perfil.activo ? colors.success : colors.danger }]}>
                {perfil.activo ? 'Cuenta activa' : 'Cuenta inactiva'}
              </Text>
            </View>
          </View>

          <View style={[styles.columnas, { flexDirection: pantallaAncha ? 'row' : 'column' }]}>
            <View style={[styles.columna, !pantallaAncha && { width: '100%' }]}>
              <Seccion titulo="Datos personales" descripcion="Actualiza los datos que aparecen en tu cuenta."
                icono="person-outline">
                <View style={styles.dosCampos}>
                  <Campo titulo="Nombres *" valor={form.nombres} onChangeText={t => cambiarCampo('nombres', t)} maxLength={100} />
                  <Campo titulo="Apellidos *" valor={form.apellidos} onChangeText={t => cambiarCampo('apellidos', t)} maxLength={100} />
                </View>
                <View style={styles.dosCampos}>
                  <Campo titulo="Nombre de usuario *" valor={form.nombre_usuario}
                    onChangeText={t => cambiarCampo('nombre_usuario', t)} maxLength={60} autoCapitalize="none" />
                  <Campo titulo="Correo electrónico *" valor={form.correo}
                    onChangeText={t => cambiarCampo('correo', t)} maxLength={150}
                    autoCapitalize="none" keyboardType="email-address" />
                </View>
                <Aviso mensaje={errorDatos} />
                <Aviso tipo="exito" mensaje={exitoDatos} />
                <View style={styles.botones}>
                  <Accion texto="Restablecer campos" icono="arrow-undo-outline" secundario
                    onPress={() => { setForm({ nombres: perfil.nombres, apellidos: perfil.apellidos,
                      nombre_usuario: perfil.nombre_usuario, correo: perfil.correo });
                      setErrorDatos(null); setExitoDatos(null); }} disabled={guardando} />
                  <Accion texto={guardando ? 'Guardando...' : 'Guardar cambios'} icono="save-outline"
                    onPress={() => void guardarDatos()} disabled={guardando} />
                  {guardando && <ActivityIndicator color={colors.primary} />}
                </View>
              </Seccion>

              <Seccion titulo="Información institucional" descripcion="Datos asignados por el administrador del SCCVI."
                icono="business-outline">
                <View style={styles.dosCampos}>
                  <Dato titulo="Centro de salud" valor={perfil.centroSalud
                    ? `${perfil.centroSalud.codigo} · ${perfil.centroSalud.nombre}`
                    : perfil.id_centro === null ? 'Administración general' : `Centro #${perfil.id_centro}`} />
                </View>
                <View style={styles.dosCampos}>
                  <Dato titulo="Fecha de registro" valor={fechaVisible(perfil.fecha_creacion)} />
                  <Dato titulo="Última actualización" valor={fechaVisible(perfil.fecha_actualizacion)} />
                </View>
                <Aviso tipo="informacion" mensaje="El centro de salud, tus roles y el estado de la cuenta solo pueden modificarse desde la administración autorizada." />
              </Seccion>
            </View>

            <View style={[styles.columna, !pantallaAncha && { width: '100%' }]}>
              <Seccion titulo="Seguridad de la cuenta" descripcion="Protege el acceso a tu información y a los registros clínicos."
                icono="lock-closed-outline">
                <View style={styles.seguridadTitulo}>
                  <Ionicons name="key-outline" color={colors.primary} size={21} />
                  <Text style={styles.subtitulo}>Cambiar contraseña</Text>
                </View>
                <Campo titulo="Contraseña actual *" valor={passwordActual} onChangeText={setPasswordActual}
                  autoCapitalize="none" password mostrarPassword={mostrarPassword}
                  onTogglePassword={() => setMostrarPassword(v => !v)} />
                <Campo titulo="Contraseña nueva *" valor={passwordNueva} onChangeText={setPasswordNueva}
                  autoCapitalize="none" password mostrarPassword={mostrarPassword}
                  onTogglePassword={() => setMostrarPassword(v => !v)} />
                <Campo titulo="Confirmar contraseña nueva *" valor={confirmarPassword}
                  onChangeText={setConfirmarPassword} autoCapitalize="none" password
                  mostrarPassword={mostrarPassword} onTogglePassword={() => setMostrarPassword(v => !v)} />
                <Text style={styles.nota}>Utiliza entre 8 y 72 caracteres. Se recomienda una contraseña única y difícil de adivinar.</Text>
                <Aviso mensaje={errorPassword} />
                <Aviso tipo="exito" mensaje={exitoPassword} />
                <View style={styles.botones}>
                  <Accion texto={guardandoPassword ? 'Actualizando...' : 'Actualizar contraseña'}
                    icono="shield-checkmark-outline" onPress={() => void guardarPassword()}
                    disabled={guardandoPassword} />
                  {guardandoPassword && <ActivityIndicator color={colors.primary} />}
                </View>
              </Seccion>

              <Seccion titulo="Privacidad y permisos" descripcion="Información sobre el acceso de tu cuenta."
                icono="shield-checkmark-outline">
                <View style={styles.elementoInfo}>
                  <Icono nombre="people-outline" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.subtitulo}>Roles asignados</Text>
                    <Text style={styles.secundario}>
                      {roles.length ? roles.map(r => r.nombre).join(', ') : 'Sin roles activos'}
                    </Text>
                  </View>
                </View>
                <View style={styles.separador} />
                <View style={styles.elementoInfo}>
                  <Icono nombre="medical-outline" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.subtitulo}>Acceso a información clínica</Text>
                    <Text style={styles.secundario}>
                      Tu acceso a los módulos depende de los permisos autorizados en el servidor.
                    </Text>
                  </View>
                </View>
                <View style={styles.separador} />
                <View style={styles.elementoInfo}>
                  <Icono nombre="information-circle-outline" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.subtitulo}>Seguridad de sesión</Text>
                    <Text style={styles.secundario}>
                      Después de cambiar tu contraseña, cierra sesión y vuelve a ingresar.
                    </Text>
                  </View>
                </View>
              </Seccion>
              <Accion texto={cargando ? 'Actualizando...' : 'Actualizar mi información'} icono="refresh-outline"
                secundario disabled={cargando} onPress={() => void cargar()} />
            </View>
          </View>
        </>
      ) : !cargando && !errorCarga ? <Aviso mensaje="No se encontró un perfil asociado a tu sesión." /> : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  cargando: { alignItems: 'center', padding: 35, gap: 12 },
  secundario: { fontSize: 13, color: colors.muted, lineHeight: 19 },
  resumen: { backgroundColor: '#FFFFFF', borderColor: colors.border, borderWidth: 1,
    padding: 22, borderRadius: 15, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 17 },
  avatar: { width: 69, height: 69, borderRadius: 35, backgroundColor: colors.sidebar,
    alignItems: 'center', justifyContent: 'center' },
  iniciales: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
  nombre: { color: colors.text, fontSize: 21, fontWeight: '800' },
  usuario: { color: colors.muted, fontSize: 13 },
  rolesFila: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 4 },
  etiquetaRol: { backgroundColor: colors.infoLight, borderRadius: 7, paddingHorizontal: 9, paddingVertical: 5 },
  textoRol: { color: colors.primary, fontSize: 11, fontWeight: '700' },
  estado: { backgroundColor: colors.successLight, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8, gap: 5, borderRadius: 20 },
  estadoTexto: { fontSize: 12, fontWeight: '700' },
  columnas: { gap: 16, alignItems: 'flex-start' },
  columna: { flex: 1, minWidth: 0, gap: 16 },
  panel: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1,
    padding: 20, borderRadius: 14, gap: 15 },
  panelEncabezado: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 2 },
  panelTitulo: { color: colors.text, fontSize: 18, fontWeight: '800' },
  panelDescripcion: { color: colors.muted, fontSize: 12, marginTop: 3, lineHeight: 18 },
  icono: { width: 41, height: 41, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.infoLight },
  dosCampos: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  campo: { flex: 1, minWidth: 210, gap: 7, paddingBottom: 3 },
  etiqueta: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  inputGrupo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: colors.border, borderRadius: 9 },
  input: { paddingHorizontal: 12, paddingVertical: 12, fontSize: 14, color: colors.text,
    flex: 1, minWidth: 0 },
  ojo: { paddingHorizontal: 12, paddingVertical: 11 },
  dato: { minWidth: 170, flex: 1, gap: 7, paddingVertical: 5 },
  datoValor: { color: colors.text, fontSize: 14, fontWeight: '600' },
  botones: { flexDirection: 'row', gap: 9, flexWrap: 'wrap', alignItems: 'center', marginTop: 4 },
  boton: { backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 9, flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start' },
  botonSecundario: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.border },
  botonTexto: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  aviso: { padding: 12, borderRadius: 9, flexDirection: 'row', gap: 8, alignItems: 'center' },
  avisoTexto: { flex: 1, fontSize: 12, lineHeight: 18 },
  seguridadTitulo: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  subtitulo: { color: colors.text, fontSize: 13, fontWeight: '700' },
  nota: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  elementoInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  separador: { height: 1, backgroundColor: colors.border },
});
