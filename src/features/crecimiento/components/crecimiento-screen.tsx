import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';

import { ScreenContainer } from '../../../components/layout/screen-container';
import { ScreenHeader } from '../../../components/layout/screen-header';
import { CrecimientoSection } from './crecimiento-section';
import { crecimientoService } from '../services/crecimiento.service';
import { ninosService } from '../../ninos/services/ninos.service';
import type { RegistroCrecimiento } from '../types';
import type { Nino } from '../../ninos/types';
import { colors } from '../../../constants/theme';

type Filtro = 'todos' | 'con' | 'sin' | 'sin90';

type Fila = {
  nino: Nino;
  ultimo: RegistroCrecimiento | null;
  sinControl90: boolean;
};

const TAMANO_PAGINA = 10;

function textoNormalizado(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
    .trim();
}

function fechaCorta(fecha?: string | null): string {
  return fecha ? fecha.slice(0, 10) : '—';
}

function fechaLocal(fecha?: string | null): Date | null {
  const texto = fechaCorta(fecha);
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto);
  if (!partes) return null;

  const anio = Number(partes[1]);
  const mes = Number(partes[2]);
  const dia = Number(partes[3]);
  const resultado = new Date(anio, mes - 1, dia, 12);

  if (
    resultado.getFullYear() !== anio ||
    resultado.getMonth() !== mes - 1 ||
    resultado.getDate() !== dia
  ) {
    return null;
  }

  return resultado;
}

function mostrarEdad(fechaNacimiento: string): string {
  const nacimiento = fechaLocal(fechaNacimiento);
  if (!nacimiento) return '—';

  const hoy = new Date();
  if (nacimiento > hoy) return '—';

  let meses =
    (hoy.getFullYear() - nacimiento.getFullYear()) * 12 +
    hoy.getMonth() - nacimiento.getMonth();

  if (hoy.getDate() < nacimiento.getDate()) meses -= 1;
  meses = Math.max(0, meses);

  if (meses < 12) return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
  const anios = Math.floor(meses / 12);
  const resto = meses % 12;
  return resto
    ? `${anios} ${anios === 1 ? 'año' : 'años'}, ${resto} m`
    : `${anios} ${anios === 1 ? 'año' : 'años'}`;
}

function decimal(
  valor: number | string | null | undefined,
  unidad: string
): string {
  if (valor === null || valor === undefined || valor === '') return '—';
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return '—';
  return `${numero.toFixed(2)} ${unidad}`;
}

function TarjetaIndicador({
  titulo,
  valor,
  subtitulo,
  compacta,
}: {
  titulo: string;
  valor: number | string;
  subtitulo: string;
  compacta: boolean;
}) {
  return (
    <View style={[styles.tarjetaIndicador, compacta && styles.tarjetaCompacta]}>
      <Text style={styles.indicadorTitulo}>{titulo}</Text>
      <Text style={styles.indicadorValor}>{valor}</Text>
      <Text style={styles.indicadorSubtitulo}>{subtitulo}</Text>
    </View>
  );
}

function Accion({
  texto,
  onPress,
  secundaria = false,
  disabled = false,
}: {
  texto: string;
  onPress: () => void;
  secundaria?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.boton,
        secundaria ? styles.botonSecundario : styles.botonPrimario,
        (pressed || disabled) && styles.botonOpaco,
      ]}
    >
      <Text style={secundaria ? styles.botonTextoSecundario : styles.botonTextoPrimario}>
        {texto}
      </Text>
    </Pressable>
  );
}

export default function CrecimientoScreen() {
  const [ninos, setNinos] = useState<Nino[]>([]);
  const [controles, setControles] = useState<RegistroCrecimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [pagina, setPagina] = useState(1);
  const [idSeleccionado, setIdSeleccionado] = useState<string | null>(null);
  const [anchoContenido, setAnchoContenido] = useState(0);

  const actualizar = useCallback(() => {
    setRevision((actual) => actual + 1);
  }, []);

  // Se vuelve a consultar al entrar a la pantalla, al guardar un
  // control desde esta misma pantalla y al pulsar «Actualizar».
  useFocusEffect(
    useCallback(() => {
      let activo = true;
      setLoading(true);
      setError(null);

      const cargar = async () => {
        try {
          const [respuestaNinos, respuestaCrecimiento] = await Promise.all([
            ninosService.listar(),
            crecimientoService.listar(),
          ]);

          if (!activo) return;

          if (
            respuestaNinos.success !== true ||
            !Array.isArray(respuestaNinos.data) ||
            respuestaCrecimiento.success !== true ||
            !Array.isArray(respuestaCrecimiento.data)
          ) {
            throw new Error('La API devolvió datos con un formato inesperado.');
          }

          setNinos(respuestaNinos.data);
          setControles(respuestaCrecimiento.data);
        } catch (err) {
          if (!activo) return;
          setError(
            err instanceof Error
              ? err.message
              : 'No fue posible consultar los controles de crecimiento.'
          );
        } finally {
          if (activo) setLoading(false);
        }
      };

      void cargar();
      return () => {
        activo = false;
      };
    }, [revision])
  );

  const filas = useMemo<Fila[]>(() => {
    const ultimos = new Map<string, RegistroCrecimiento>();

    for (const control of controles) {
      const id = String(control.id_nino);
      const previo = ultimos.get(id);
      if (
        !previo ||
        String(control.fecha_medicion) > String(previo.fecha_medicion)
      ) {
        ultimos.set(id, control);
      }
    }

    const limite = new Date();
    limite.setHours(12, 0, 0, 0);
    limite.setDate(limite.getDate() - 90);

    return ninos
      .map((nino) => {
        const ultimo = ultimos.get(String(nino.id_nino)) ?? null;
        const fechaUltima = fechaLocal(ultimo?.fecha_medicion);
        return {
          nino,
          ultimo,
          sinControl90: !fechaUltima || fechaUltima < limite,
        };
      })
      .sort((a, b) =>
        `${a.nino.apellidos} ${a.nino.nombres}`.localeCompare(
          `${b.nino.apellidos} ${b.nino.nombres}`,
          'es'
        )
      );
  }, [controles, ninos]);

  const estadisticas = useMemo(() => ({
    total: filas.length,
    con: filas.filter((fila) => fila.ultimo !== null).length,
    sin: filas.filter((fila) => fila.ultimo === null).length,
    sin90: filas.filter((fila) => fila.sinControl90).length,
  }), [filas]);

  const filtradas = useMemo(() => {
    const termino = textoNormalizado(busqueda);

    return filas.filter((fila) => {
      if (filtro === 'con' && !fila.ultimo) return false;
      if (filtro === 'sin' && fila.ultimo) return false;
      if (filtro === 'sin90' && !fila.sinControl90) return false;

      if (!termino) return true;
      const contenido = textoNormalizado([
        fila.nino.codigo_expediente,
        fila.nino.nombres,
        fila.nino.apellidos,
        fila.nino.familia?.codigo_familia ?? '',
      ].join(' '));

      return contenido.includes(termino);
    });
  }, [busqueda, filas, filtro]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / TAMANO_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtradas.slice(
    (paginaActual - 1) * TAMANO_PAGINA,
    paginaActual * TAMANO_PAGINA
  );

  const seleccionada = filas.find(
    (fila) => String(fila.nino.id_nino) === idSeleccionado
  ) ?? null;

  const compacto = anchoContenido < 980;

  const cambiarFiltro = (valor: Filtro) => {
    setFiltro(valor);
    setPagina(1);
  };

  const seleccionar = (id: string) => {
    setIdSeleccionado((actual) => actual === id ? null : id);
  };

  const irAlExpediente = (id: string) => {
    router.push({
      pathname: '/ninos/[id]',
      params: { id },
    });
  };

  const filtros: { id: Filtro; titulo: string }[] = [
    { id: 'todos', titulo: 'Todos' },
    { id: 'con', titulo: 'Con controles' },
    { id: 'sin', titulo: 'Sin controles' },
    { id: 'sin90', titulo: 'Sin control en 90 días' },
  ];

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Crecimiento"
        description="Consulta y seguimiento de peso, talla e indicadores de crecimiento infantil."
      />

      <View
        style={styles.contenido}
        onLayout={(evento) => setAnchoContenido(evento.nativeEvent.layout.width)}
      >
        <View style={styles.indicadores}>
          <TarjetaIndicador
            titulo="Niños registrados"
            valor={loading ? '—' : estadisticas.total}
            subtitulo="Registros de Niños"
            compacta={compacto}
          />
          <TarjetaIndicador
            titulo="Con controles"
            valor={loading ? '—' : estadisticas.con}
            subtitulo="Con alguna medición"
            compacta={compacto}
          />
          <TarjetaIndicador
            titulo="Sin controles"
            valor={loading ? '—' : estadisticas.sin}
            subtitulo="Sin historial registrado"
            compacta={compacto}
          />
          <TarjetaIndicador
            titulo="Sin control en 90 días"
            valor={loading ? '—' : estadisticas.sin90}
            subtitulo="Incluye niños sin mediciones"
            compacta={compacto}
          />
        </View>

        <View style={styles.panel}>
          <View style={styles.encabezado}>
            <View style={styles.encabezadoTextos}>
              <Text style={styles.tituloPanel}>Seguimiento por niño</Text>
              <Text style={styles.subtituloPanel}>
                Datos consultados desde PostgreSQL mediante la API.
              </Text>
            </View>
            <Accion texto="Actualizar" secundaria onPress={actualizar} disabled={loading} />
          </View>

          <TextInput
            value={busqueda}
            onChangeText={(valor) => {
              setBusqueda(valor);
              setPagina(1);
            }}
            placeholder="Buscar por nombre, apellido, expediente o familia..."
            placeholderTextColor="#94A3B8"
            style={styles.buscador}
            autoCapitalize="none"
          />

          <View style={styles.filtros}>
            {filtros.map((opcion) => (
              <Pressable
                key={opcion.id}
                accessibilityRole="button"
                onPress={() => cambiarFiltro(opcion.id)}
                style={[
                  styles.filtro,
                  filtro === opcion.id && styles.filtroActivo,
                ]}
              >
                <Text style={[
                  styles.filtroTexto,
                  filtro === opcion.id && styles.filtroTextoActivo,
                ]}>
                  {opcion.titulo}
                </Text>
              </Pressable>
            ))}
          </View>

          {loading ? (
            <View style={styles.mensajeCentro}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.textoSecundario}>Consultando registros de crecimiento...</Text>
            </View>
          ) : error ? (
            <View style={styles.mensajeCentro}>
              <Text style={styles.textoError}>{error}</Text>
              <Accion texto="Reintentar" onPress={actualizar} />
            </View>
          ) : filtradas.length === 0 ? (
            <View style={styles.mensajeCentro}>
              <Text style={styles.textoSecundario}>
                {ninos.length === 0
                  ? 'No hay niños registrados para consultar.'
                  : 'No se encontraron niños con los filtros seleccionados.'}
              </Text>
            </View>
          ) : (
            <>
              {!compacto && (
                <View style={styles.tablaEncabezado}>
                  <Text style={[styles.celdaTitulo, styles.colNino]}>Niño / expediente</Text>
                  <Text style={[styles.celdaTitulo, styles.colFamilia]}>Familia</Text>
                  <Text style={[styles.celdaTitulo, styles.colEdad]}>Edad</Text>
                  <Text style={[styles.celdaTitulo, styles.colFecha]}>Último control</Text>
                  <Text style={[styles.celdaTitulo, styles.colPeso]}>Peso</Text>
                  <Text style={[styles.celdaTitulo, styles.colTalla]}>Talla</Text>
                  <Text style={[styles.celdaTitulo, styles.colAccion]}>Acciones</Text>
                </View>
              )}

              {visibles.map(({ nino, ultimo, sinControl90 }) => {
                const id = String(nino.id_nino);
                const activo = idSeleccionado === id;

                if (compacto) {
                  return (
                    <View key={id} style={[styles.ficha, activo && styles.seleccionado]}>
                      <Text style={styles.nombre}>{nino.nombres} {nino.apellidos}</Text>
                      <Text style={styles.expediente}>{nino.codigo_expediente}</Text>
                      <Text style={styles.detalle}>Familia: {nino.familia?.codigo_familia ?? nino.id_familia}</Text>
                      <Text style={styles.detalle}>Edad: {mostrarEdad(nino.fecha_nacimiento)}</Text>
                      <Text style={styles.detalle}>Último control: {fechaCorta(ultimo?.fecha_medicion)}</Text>
                      <Text style={styles.detalle}>
                        Peso: {decimal(ultimo?.peso_kg, 'kg')}  ·  Talla: {decimal(ultimo?.talla_cm, 'cm')}
                      </Text>
                      {sinControl90 && (
                        <Text style={styles.advertencia}>Sin control registrado durante los últimos 90 días</Text>
                      )}
                      <View style={styles.acciones}>
                        <Accion
                          texto={activo ? 'Ocultar seguimiento' : 'Ver seguimiento'}
                          onPress={() => seleccionar(id)}
                        />
                        <Accion texto="Expediente" secundaria onPress={() => irAlExpediente(id)} />
                      </View>
                    </View>
                  );
                }

                return (
                  <View key={id} style={[styles.fila, activo && styles.seleccionado]}>
                    <View style={styles.colNino}>
                      <Text style={styles.nombre}>{nino.nombres} {nino.apellidos}</Text>
                      <Text style={styles.expediente}>{nino.codigo_expediente}</Text>
                    </View>
                    <Text style={[styles.celda, styles.colFamilia]}>
                      {nino.familia?.codigo_familia ?? String(nino.id_familia)}
                    </Text>
                    <Text style={[styles.celda, styles.colEdad]}>{mostrarEdad(nino.fecha_nacimiento)}</Text>
                    <View style={styles.colFecha}>
                      <Text style={styles.celda}>{fechaCorta(ultimo?.fecha_medicion)}</Text>
                      {sinControl90 && <Text style={styles.advertencia}>Sin control reciente</Text>}
                    </View>
                    <Text style={[styles.celda, styles.colPeso]}>{decimal(ultimo?.peso_kg, 'kg')}</Text>
                    <Text style={[styles.celda, styles.colTalla]}>{decimal(ultimo?.talla_cm, 'cm')}</Text>
                    <View style={[styles.accionesColumna, styles.colAccion]}>
                      <Accion
                        texto={activo ? 'Ocultar' : 'Seguimiento'}
                        onPress={() => seleccionar(id)}
                      />
                      <Accion texto="Expediente" secundaria onPress={() => irAlExpediente(id)} />
                    </View>
                  </View>
                );
              })}

              <View style={styles.paginacion}>
                <Text style={styles.textoSecundario}>
                  Mostrando {(paginaActual - 1) * TAMANO_PAGINA + 1}–
                  {Math.min(paginaActual * TAMANO_PAGINA, filtradas.length)} de {filtradas.length}
                </Text>
                <View style={styles.botonesPaginacion}>
                  <Accion
                    texto="Anterior"
                    secundaria
                    disabled={paginaActual <= 1}
                    onPress={() => setPagina(paginaActual - 1)}
                  />
                  <Text style={styles.textoSecundario}>{paginaActual} / {totalPaginas}</Text>
                  <Accion
                    texto="Siguiente"
                    secundaria
                    disabled={paginaActual >= totalPaginas}
                    onPress={() => setPagina(paginaActual + 1)}
                  />
                </View>
              </View>
            </>
          )}
        </View>

        {seleccionada && (
          <View style={styles.panelSeguimiento}>
            <View style={styles.encabezado}>
              <View style={styles.encabezadoTextos}>
                <Text style={styles.tituloPanel}>
                  Seguimiento: {seleccionada.nino.nombres} {seleccionada.nino.apellidos}
                </Text>
                <Text style={styles.subtituloPanel}>{seleccionada.nino.codigo_expediente}</Text>
              </View>
              <Accion texto="Cerrar" secundaria onPress={() => setIdSeleccionado(null)} />
            </View>
            <CrecimientoSection
              key={String(seleccionada.nino.id_nino)}
              idNino={seleccionada.nino.id_nino}
              sexo={seleccionada.nino.sexo}
              fechaNacimiento={seleccionada.nino.fecha_nacimiento}
              onSaved={actualizar}
            />
          </View>
        )}

        <Text style={styles.nota}>
          «Sin control en 90 días» es un indicador operativo, no un diagnóstico.
          Los percentiles precargados por el seed son demostrativos; la interpretación
          clínica requiere referencias OMS oficiales validadas.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  contenido: { width: '100%', gap: 18, paddingBottom: 26 },
  indicadores: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tarjetaIndicador: {
    flexGrow: 1, flexBasis: 210, minWidth: 175,
    padding: 17, gap: 7, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface, borderRadius: 12,
  },
  tarjetaCompacta: { flexBasis: '45%', minWidth: 150 },
  indicadorTitulo: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  indicadorValor: { color: colors.text, fontSize: 27, fontWeight: '800' },
  indicadorSubtitulo: { color: colors.muted, fontSize: 11 },
  panel: {
    borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface, borderRadius: 12,
    padding: 16, gap: 15,
  },
  panelSeguimiento: { gap: 14 },
  encabezado: {
    flexDirection: 'row', flexWrap: 'wrap',
    alignItems: 'center', justifyContent: 'space-between', gap: 12,
  },
  encabezadoTextos: { flex: 1, minWidth: 190, gap: 5 },
  tituloPanel: { color: colors.text, fontSize: 18, fontWeight: '800' },
  subtituloPanel: { color: colors.muted, fontSize: 12 },
  buscador: {
    borderWidth: 1, borderColor: colors.border,
    backgroundColor: '#FFFFFF', borderRadius: 9,
    paddingHorizontal: 13, height: 44,
    fontSize: 14, color: colors.text,
  },
  filtros: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filtro: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 20,
    paddingVertical: 8, paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  filtroActivo: { borderColor: colors.primary, backgroundColor: '#EAF2FF' },
  filtroTexto: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  filtroTextoActivo: { color: colors.primary },
  tablaEncabezado: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 11,
    backgroundColor: '#F1F5F9', borderRadius: 8, gap: 8,
  },
  celdaTitulo: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  fila: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 13, paddingHorizontal: 10,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  celda: { color: colors.text, fontSize: 12, lineHeight: 18 },
  colNino: { flex: 2.2, minWidth: 0 },
  colFamilia: { flex: 1.3, minWidth: 0 },
  colEdad: { flex: 1.15, minWidth: 0 },
  colFecha: { flex: 1.4, minWidth: 0 },
  colPeso: { flex: 1.0, minWidth: 0 },
  colTalla: { flex: 1.0, minWidth: 0 },
  colAccion: { flex: 1.35, minWidth: 0 },
  nombre: { color: colors.text, fontWeight: '700', fontSize: 13 },
  expediente: { color: colors.primary, fontSize: 11, marginTop: 3 },
  advertencia: { color: '#A16207', fontSize: 10, marginTop: 3 },
  ficha: { gap: 7, borderWidth: 1, borderColor: colors.border, padding: 13, borderRadius: 9 },
  seleccionado: { backgroundColor: '#F0F7FF' },
  detalle: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  acciones: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 6 },
  accionesColumna: { gap: 5, alignItems: 'flex-start' },
  boton: {
    paddingHorizontal: 11, paddingVertical: 8, borderRadius: 7,
    alignItems: 'center', justifyContent: 'center',
  },
  botonPrimario: { backgroundColor: colors.primary },
  botonSecundario: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.border },
  botonOpaco: { opacity: 0.5 },
  botonTextoPrimario: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  botonTextoSecundario: { color: colors.text, fontSize: 11, fontWeight: '700' },
  mensajeCentro: { alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 32 },
  textoSecundario: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  textoError: { color: colors.danger, fontSize: 12, lineHeight: 19, textAlign: 'center' },
  paginacion: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    flexWrap: 'wrap', gap: 10, marginTop: 3,
  },
  botonesPaginacion: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  nota: { fontSize: 11, color: colors.muted, lineHeight: 17 },
});
