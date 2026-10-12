import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { colors } from '../../../constants/theme';
import { useAuth } from '../../auth/hooks/use-auth';
import { Panel, Boton, Campo, Estado, uiStyles } from '../../vacunacion/components/ui-vacunacion';
import type { Id } from '../../vacunacion/types';
import { carnetService } from '../services/carnet.service';
import type { CarnetDigital, EstadoCarnet } from '../types';

type Props = { idNino: Id };

export function CarnetQrSection({ idNino }: Props) {
  const { session } = useAuth();
  const puedeAdministrar = !!session?.usuario.roles.some((rol: string) =>
    rol === 'ADMIN_GLOBAL' || rol === 'ADMIN_CENTRO');
  const [carnet, setCarnet] = useState<CarnetDigital | null>(null);
  // El token nunca se escribe en almacenamiento local ni se imprime en consola.
  const [tokenEmitido, setTokenEmitido] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [confirmarRegeneracion, setConfirmarRegeneracion] = useState(false);

  useEffect(() => {
    let active = true;
    setTokenEmitido(null);
    setPin('');
    setCarnet(null);
    setLoading(true);
    setError(null);
    const cargar = async () => {
      try {
        const respuesta = await carnetService.obtenerPorNino(idNino);
        if (active) setCarnet(respuesta.data);
      } catch (err) {
        if (!active) return;
        if ((err as { status?: number })?.status !== 404) {
          setError(err instanceof Error ? err.message : 'No fue posible consultar el carnet.');
        }
      } finally { if (active) setLoading(false); }
    };
    void cargar();
    return () => { active = false; };
  }, [idNino]);

  const vencimientoPasado = !!carnet?.fecha_expiracion &&
    new Date(carnet.fecha_expiracion).getTime() <= Date.now();

  const crear = async () => {
    if (busy) return;
    if (!Number.isSafeInteger(Number(idNino)) || Number(idNino) <= 0) {
      setError('Identificador de niño inválido.');
      return;
    }
    if (!/^\d{4,8}$/.test(pin)) {
      setError('Ingrese un PIN numérico de 4 a 8 dígitos para proteger el carnet.');
      return;
    }
    setBusy(true);
    setError(null);
    setMensaje(null);
    try {
      const respuesta = await carnetService.crear(idNino, pin);
      if (!respuesta.success || !respuesta.data?.token || !respuesta.data?.carnet) {
        throw new Error('La API no devolvió el carnet y su token.');
      }
      setCarnet(respuesta.data.carnet);
      setTokenEmitido(respuesta.data.token);
      setPin('');
      setMensaje('Carnet creado. Conserve ahora el QR; el token no se podrá recuperar posteriormente.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el carnet.');
    } finally { setBusy(false); }
  };

  const regenerar = async () => {
    if (!carnet || !puedeAdministrar || busy) return;
    setConfirmarRegeneracion(false);
    setBusy(true);
    setError(null);
    setTokenEmitido(null);
    try {
      const respuesta = await carnetService.regenerar(carnet.id_carnet);
      if (!respuesta.success || !respuesta.data?.token || !respuesta.data?.carnet) {
        throw new Error('La API no confirmó la regeneración del token.');
      }
      setCarnet(respuesta.data.carnet);
      setTokenEmitido(respuesta.data.token);
      setMensaje('Token regenerado. El QR anterior dejó de ser válido. Guarde el nuevo QR ahora.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo regenerar el token.');
    } finally { setBusy(false); }
  };

  const cambiarEstado = async (nuevo: EstadoCarnet) => {
    if (!carnet || !puedeAdministrar || busy) return;
    setBusy(true);
    setError(null);
    try {
      const respuesta = await carnetService.cambiarEstado(carnet.id_carnet, nuevo);
      if (!respuesta.success || !respuesta.data) throw new Error('No se pudo cambiar el estado del carnet.');
      setCarnet(respuesta.data);
      setTokenEmitido(null);
      setMensaje(`Estado del carnet actualizado a ${nuevo}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cambiar el estado.');
    } finally { setBusy(false); }
  };

  return <Panel title="Carnet Digital QR" right={loading ? <ActivityIndicator color={colors.primary} /> :
    carnet ? <Estado estado={carnet.estado} /> : undefined}>
    {error ? <Text style={uiStyles.error}>{error}</Text> : null}
    {mensaje ? <Text style={uiStyles.muted}>{mensaje}</Text> : null}
    {!loading && !carnet && <>
      <Text style={uiStyles.muted}>Este niño todavía no tiene un carnet digital registrado.</Text>
      <Campo label="PIN del carnet (obligatorio para este formulario)" value={pin}
        onChange={setPin} keyboardType="number-pad" secureTextEntry placeholder="4 a 8 dígitos" />
      <Boton label="Crear carnet y generar QR" onPress={() => void crear()} loading={busy} />
    </>}
    {carnet && <>
      <Text style={uiStyles.body}>Identificador del carnet: {String(carnet.id_carnet)}</Text>
      <Text style={uiStyles.muted}>Vencimiento: {carnet.fecha_expiracion?.slice(0, 10) ?? 'No establecido'}</Text>
      {tokenEmitido && carnet.estado === 'ACTIVO' && !vencimientoPasado ? <View style={s.qrBlock}>
        <QRCode value={tokenEmitido} size={210} backgroundColor="#FFFFFF" color="#111827" />
        <Text style={s.warning}>QR de acceso sensible. Muéstrelo únicamente a personal autorizado. El PIN no está incluido en el QR.</Text>
        <Text style={uiStyles.muted}>Tome una copia segura del QR ahora. No se guardará el token en el dispositivo.</Text>
      </View> : <Text style={uiStyles.muted}>
        El QR original no puede recuperarse del servidor. {puedeAdministrar
          ? 'Puede regenerarlo; el token anterior quedará invalidado.'
          : 'Solicite a un administrador que regenere el token si se necesita otra copia.'}
      </Text>}
      {puedeAdministrar && <View style={s.actions}>
        {carnet.estado === 'ACTIVO' && !vencimientoPasado ? <Boton label="Bloquear" danger disabled={busy}
          onPress={() => void cambiarEstado('BLOQUEADO')} />
          : carnet.estado === 'BLOQUEADO' && !vencimientoPasado ? <Boton label="Activar" disabled={busy} onPress={() => void cambiarEstado('ACTIVO')} />
          : <Text style={uiStyles.muted}>Carnet vencido: debe revisarse su fecha de expiración en el backend antes de reactivarlo.</Text>}
        <Boton label="Regenerar token QR" outline disabled={busy}
          onPress={() => setConfirmarRegeneracion(true)} />
      </View>}
    </>}
    <Text style={uiStyles.muted}>
      El QR contiene un token opaco, no datos médicos. Para validarlo con un escáner se necesita el endpoint de verificación y solicitar PIN cuando corresponda.
    </Text>
    <Modal visible={confirmarRegeneracion} transparent animationType="fade"
      onRequestClose={() => setConfirmarRegeneracion(false)}>
      <View style={s.overlay}><View style={s.dialog}>
        <Text style={s.headline}>¿Regenerar el token?</Text>
        <Text style={uiStyles.body}>El QR anterior dejará de funcionar. Esta acción no se puede deshacer.</Text>
        <View style={s.actions}>
          <Boton label="Cancelar" outline onPress={() => setConfirmarRegeneracion(false)} />
          <Boton label="Regenerar" danger loading={busy} onPress={() => void regenerar()} />
        </View>
      </View></View>
    </Modal>
  </Panel>;
}

const s = StyleSheet.create({
  qrBlock: { padding: 15, backgroundColor: colors.canvas, borderRadius: 10,
    gap: 12, alignItems: 'center' },
  warning: { color: colors.danger, textAlign: 'center', lineHeight: 19, fontSize: 12 },
  actions: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,.5)', justifyContent: 'center', padding: 15 },
  dialog: { padding: 20, borderRadius: 10, backgroundColor: '#FFFFFF', gap: 15 },
  headline: { fontWeight: '700', color: colors.text, fontSize: 16 },
});
