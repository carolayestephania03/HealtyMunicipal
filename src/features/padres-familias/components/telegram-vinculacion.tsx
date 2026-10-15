import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Pressable, Share, StyleSheet, Text, View
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../../constants/theme';
import { tutoresService } from '../services/tutores.service';
import type { Id, EstadoTelegramTutor, EnlaceTelegramTutor } from '../types';

type Props = { idTutor: Id; activo: boolean; onChange?: () => void };
function Boton({ title, onPress, disabled, outline = false, danger = false }: {
  title: string; onPress: () => void; disabled?: boolean; outline?: boolean; danger?: boolean;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={title} disabled={disabled}
      onPress={onPress} style={[estilos.boton, outline && estilos.botonAlterno,
        danger && estilos.botonPeligro, disabled && estilos.botonDeshabilitado]}>
      <Text style={[estilos.botonTexto, outline && estilos.textoAlterno]}>{title}</Text>
    </Pressable>
  );
}

export function TelegramVinculacion({ idTutor, activo, onChange }: Props) {
  const [estado, setEstado] = useState<EstadoTelegramTutor | null>(null);
  const [enlace, setEnlace] = useState<EnlaceTelegramTutor | null>(null);
  const [cargando, setCargando] = useState(false);
  const [operando, setOperando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [confirmar, setConfirmar] = useState(false);

  const actualizar = useCallback(async (silencioso = false) => {
    if (!silencioso) setCargando(true);
    try {
      const respuesta = await tutoresService.telegramEstado(idTutor);
      if (!respuesta.success) throw new Error(respuesta.message || 'Error al consultar Telegram');
      setEstado(respuesta.data);
      if (respuesta.data.vinculado) {
        setEnlace(null);
        onChange?.();
      }
      if (!silencioso) setError(null);
    } catch (err) {
      if (!silencioso) setError(err instanceof Error ? err.message : 'No fue posible consultar Telegram');
    } finally {
      if (!silencioso) setCargando(false);
    }
  }, [idTutor, onChange]);

  useEffect(() => {
    setEstado(null); setEnlace(null); setError(null); setAviso(null);
    void actualizar();
  }, [idTutor, actualizar]);

  // Mientras el enlace está visible se consulta el estado cada 6 s;
  // deja de consultar al vincular o al cerrar el detalle.
  useEffect(() => {
    if (!enlace || estado?.vinculado) return;
    const timer = setInterval(() => void actualizar(true), 6000);
    return () => clearInterval(timer);
  }, [enlace, estado?.vinculado, actualizar]);

  const ejecutar = async (accion: () => Promise<unknown>, texto: string) => {
    setOperando(true); setError(null); setAviso(null);
    try {
      await accion();
      setAviso(texto);
      await actualizar(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error');
    } finally { setOperando(false); }
  };

  const generar = () => void ejecutar(async () => {
    const r = await tutoresService.telegramGenerar(idTutor);
    if (!r.success) throw new Error(r.message);
    setEnlace(r.data);
  }, 'Enlace generado. Compártelo únicamente con el tutor identificado.');

  const probar = () => void ejecutar(async () => {
    const r = await tutoresService.telegramPrueba(idTutor);
    if (!r.success) throw new Error(r.message);
  }, 'Mensaje de prueba enviado correctamente.');

  const desvincular = () => void ejecutar(async () => {
    const r = await tutoresService.telegramDesvincular(idTutor);
    if (!r.success) throw new Error(r.message);
    setConfirmar(false); setEnlace(null);
    onChange?.();
  }, 'Telegram desvinculado. Las notificaciones pendientes anteriores se bloquearon.');

  const compartir = async () => {
    if (!enlace?.url) return;
    try { await Share.share({ message: enlace.url, url: enlace.url }); }
    catch (err) { setError(err instanceof Error ? err.message : 'No se pudo compartir el enlace.'); }
  };

  return (
    <View style={estilos.panel}>
      <View style={estilos.encabezado}>
        <Ionicons name="send-outline" size={22} color="#229ED9" />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={estilos.titulo}>Vinculación de Telegram</Text>
          <Text style={estilos.ayuda}>Vincule el chat del tutor sin introducir identificadores manualmente.</Text>
        </View>
        <View style={[estilos.insignia, estado?.vinculado && estilos.insigniaActiva]}>
          <Text style={estilos.textoInsignia}>{estado?.vinculado ? 'Vinculado' : 'No vinculado'}</Text>
        </View>
      </View>

      {cargando ? <ActivityIndicator color={colors.primary} /> : null}
      {error ? <Text style={estilos.error}>{error}</Text> : null}
      {aviso ? <Text style={estilos.exito}>{aviso}</Text> : null}

      {estado?.vinculado ? (
        <>
          <Text style={estilos.ayuda}>Chat confirmado: {estado.chat_id_mascara || '****'}</Text>
          <Text style={estilos.ayuda}>El tutor puede recibir avisos de vacunación y campañas.</Text>
          <View style={estilos.acciones}>
            <Boton title="Enviar prueba" onPress={probar} disabled={operando || !activo} />
            <Boton title="Actualizar estado" outline onPress={() => void actualizar()} disabled={operando} />
            {!confirmar ? <Boton title="Desvincular" outline onPress={() => setConfirmar(true)} disabled={operando} /> : null}
          </View>
          {confirmar ? (
            <View style={estilos.confirmacion}>
              <Text style={estilos.ayuda}>¿Desvincular Telegram? Los envíos pendientes al chat anterior quedarán bloqueados.</Text>
              <View style={estilos.acciones}>
                <Boton title="Sí, desvincular" danger onPress={desvincular} disabled={operando} />
                <Boton title="Cancelar" outline onPress={() => setConfirmar(false)} disabled={operando} />
              </View>
            </View>
          ) : null}
        </>
      ) : (
        <>
          <Text style={estilos.ayuda}>1. Verifique presencialmente la identidad del tutor.</Text>
          <Text style={estilos.ayuda}>2. Genere y comparta el enlace temporal de un solo uso.</Text>
          <Text style={estilos.ayuda}>3. El tutor abre el bot y presiona Iniciar. El sistema confirma la vinculación automáticamente.</Text>
          {estado?.solicitud_pendiente && !enlace ?
            <Text style={estilos.ayuda}>Ya existe una solicitud pendiente. Puede generar otra; la anterior quedará revocada.</Text> : null}
          {enlace ? (
            <View style={estilos.cajaEnlace}>
              <Text style={estilos.enlace} selectable>{enlace.url}</Text>
              <Text style={estilos.ayuda}>Vence: {new Date(enlace.expira_en).toLocaleString()}</Text>
              <View style={estilos.acciones}>
                <Boton title="Compartir enlace" onPress={() => void compartir()} />
              </View>
            </View>
          ) : null}
          <View style={estilos.acciones}>
            <Boton title={enlace ? 'Generar nuevo enlace' : 'Generar enlace'} onPress={generar} disabled={operando || !activo} />
            <Boton title="Actualizar estado" outline onPress={() => void actualizar()} disabled={operando} />
          </View>
          {!activo ? <Text style={estilos.error}>Active el tutor antes de vincular Telegram.</Text> : null}
        </>
      )}
      {operando ? <ActivityIndicator color={colors.primary} /> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  panel: { padding: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 12, gap: 12 },
  encabezado: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10 },
  titulo: { color: colors.text, fontSize: 17, fontWeight: '800' },
  ayuda: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  insignia: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: colors.canvas, borderRadius: 12 },
  insigniaActiva: { backgroundColor: colors.successLight },
  textoInsignia: { fontSize: 12, fontWeight: '700', color: colors.text },
  acciones: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  boton: { backgroundColor: colors.primary, paddingHorizontal: 13, paddingVertical: 10, borderRadius: 8, borderColor: colors.primary, borderWidth: 1 },
  botonAlterno: { backgroundColor: colors.surface },
  botonPeligro: { backgroundColor: colors.danger, borderColor: colors.danger },
  botonDeshabilitado: { opacity: 0.55 },
  botonTexto: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  textoAlterno: { color: colors.primary },
  cajaEnlace: { backgroundColor: colors.canvas, borderRadius: 8, padding: 12, gap: 10 },
  enlace: { color: colors.primary, fontSize: 12, lineHeight: 19 },
  confirmacion: { padding: 12, borderColor: colors.border, borderWidth: 1, borderRadius: 8, gap: 10 },
  error: { color: colors.danger, fontSize: 13 },
  exito: { color: colors.success, fontSize: 13, fontWeight: '700' }
});
