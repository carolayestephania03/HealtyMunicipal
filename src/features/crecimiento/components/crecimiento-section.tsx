import React, {
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  SectionCard,
} from '../../../components/ui/section-card';

import {
  AppButton,
} from '../../../components/ui/app-button';

import {
  ResponsiveGrid,
} from '../../../components/layout/responsive-grid';

import {
  useCrecimiento,
} from '../hooks/use-crecimiento';

import {
  crecimientoService,
} from '../services/crecimiento.service';

import {
  GraficaCrecimiento,
} from './grafica-crecimiento';

import {
  ControlCrecimientoForm,
} from './control-crecimiento-form';

import {
  fechaCorta,
  numeroSeguro,
} from '../types';

import type {
  RegistroCrecimiento,
  RegistroId,
  ValorDecimal,
} from '../types';

import type {
  SexoOms,
} from '../../referencias-oms/types';

type Props = {
  idNino: RegistroId;
  sexo: SexoOms;
  fechaNacimiento: string;

  // Permite notificar cuando se guarda un control
  onSaved?: () => void;
};

function mostrarNumero(
  valor: ValorDecimal | undefined,
  decimales = 2
): string {
  const numero = numeroSeguro(valor);

  return numero === null
    ? 'No disponible'
    : numero.toFixed(decimales);
}

function Indicador({
  titulo,
  valor,
  detalle,
}: {
  titulo: string;
  valor: string;
  detalle?: string;
}) {
  return (
    <View style={styles.indicador}>
      <Text style={styles.indicadorTitulo}>
        {titulo}
      </Text>

      <Text style={styles.indicadorValor}>
        {valor}
      </Text>

      {detalle && (
        <Text style={styles.indicadorDetalle}>
          {detalle}
        </Text>
      )}
    </View>
  );
}

export function CrecimientoSection({
  idNino,
  sexo,
  fechaNacimiento,
  onSaved,
}: Props) {
  const {
    registros,
    referenciasPeso,
    referenciasTalla,
    loading,
    loadingOms,
    error,
    errorOms,
    refresh,
  } = useCrecimiento(idNino, sexo);

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [registroEdicion, setRegistroEdicion] =
    useState<RegistroCrecimiento | null>(null);

  const ordenados = useMemo(
    () =>
      [...registros].sort((a, b) =>
        a.fecha_medicion.localeCompare(
          b.fecha_medicion
        )
      ),
    [registros]
  );

  const ultimo =
    ordenados.length > 0
      ? ordenados[ordenados.length - 1]
      : null;

  // =========================================
  // NUEVO CONTROL
  // =========================================

  const nuevoControl = () => {
    setRegistroEdicion(null);
    setMostrarFormulario(true);
  };

  // =========================================
  // EDITAR CONTROL
  // =========================================

  const editarControl = (
    registro: RegistroCrecimiento
  ) => {
    setRegistroEdicion(registro);
    setMostrarFormulario(true);
  };

  // =========================================
  // CANCELAR
  // =========================================

  const cancelar = () => {
    setMostrarFormulario(false);
    setRegistroEdicion(null);
  };

  // =========================================
  // GUARDAR EN EXPRESS
  // =========================================

  const guardarControl = async (
    valores: {
      fecha_medicion: string;
      peso_kg: number;
      talla_cm: number;
      observaciones: string | null;
    }
  ) => {
    if (registroEdicion) {
      const respuesta =
        await crecimientoService.actualizar(
          registroEdicion.id_registro,
          valores
        );

      if (!respuesta.success) {
        throw new Error(
          respuesta.message ||
          'No se pudo actualizar el control.'
        );
      }
    } else {
      const id = Number(idNino);

      if (
        !Number.isSafeInteger(id) ||
        id <= 0
      ) {
        throw new Error(
          'El identificador del niño es inválido.'
        );
      }

      const respuesta =
        await crecimientoService.registrar({
          id_nino: id,
          ...valores,
        });

      if (!respuesta.success) {
        throw new Error(
          respuesta.message ||
          'No se pudo registrar el control.'
        );
      }
    }

// Cerrar formulario
cancelar();

// Actualizar historial y gráficas del niño
refresh();

// Actualizar el listado general de Crecimiento
onSaved?.();
  };

  return (
    <SectionCard
      title="Seguimiento del crecimiento"
      icon="trending-up-outline"
      action={
        <AppButton
          label="Nuevo control"
          icon="add-outline"
          size="small"
          onPress={nuevoControl}
          disabled={loading}
        />
      }
    >
      {/* ===================================== */}
      {/* FORMULARIO REGISTRO / EDICIÓN        */}
      {/* ===================================== */}

      {mostrarFormulario && (
        <ControlCrecimientoForm
          key={
            registroEdicion
              ? String(registroEdicion.id_registro)
              : 'nuevo'
          }
          fechaNacimiento={fechaNacimiento}
          registro={registroEdicion}
          onSave={guardarControl}
          onCancel={cancelar}
        />
      )}

      {/* ===================================== */}
      {/* CARGA Y ERRORES                      */}
      {/* ===================================== */}

      {loading && (
        <View style={styles.cargando}>
          <ActivityIndicator color="#1768D8" />

          <Text style={styles.auxiliar}>
            Consultando historial de crecimiento...
          </Text>
        </View>
      )}

      {!loading && error && (
        <View style={styles.cargando}>
          <Text style={styles.error}>
            {error}
          </Text>

          <AppButton
            label="Reintentar"
            variant="outline"
            size="small"
            onPress={refresh}
          />
        </View>
      )}

      {/* ===================================== */}
      {/* HISTORIAL REAL                       */}
      {/* ===================================== */}

      {!loading && !error && (
        <>
          {!ultimo ? (
            <Text style={styles.auxiliar}>
              El niño todavía no tiene controles
              de crecimiento registrados.
              Utilice «Nuevo control» para
              ingresar la primera medición.
            </Text>
          ) : (
            <>
              <Text style={styles.subtitulo}>
                Último control:
                {' '}
                {fechaCorta(ultimo.fecha_medicion)}
              </Text>

              {/* Indicadores generales */}

              <ResponsiveGrid
                maxColumns={4}
                minItemWidth={170}
              >
                <Indicador
                  titulo="Edad en el control"
                  valor={
                    `${ultimo.edad_meses} meses`
                  }
                />

                <Indicador
                  titulo="Peso"
                  valor={
                    `${mostrarNumero(ultimo.peso_kg)} kg`
                  }
                />

                <Indicador
                  titulo="Talla"
                  valor={
                    `${mostrarNumero(ultimo.talla_cm)} cm`
                  }
                />

                <Indicador
                  titulo="IMC"
                  valor={mostrarNumero(ultimo.imc)}
                />
              </ResponsiveGrid>

              {/* Gráficas */}

              <Text style={styles.subtitulo}>
                Evolución de peso y talla
              </Text>

              <ResponsiveGrid
                maxColumns={2}
                minItemWidth={300}
                gap={16}
              >
                <GraficaCrecimiento
                  indicador="PESO_EDAD"
                  registros={ordenados}
                  referencias={referenciasPeso}
                />

                <GraficaCrecimiento
                  indicador="TALLA_EDAD"
                  registros={ordenados}
                  referencias={referenciasTalla}
                />
              </ResponsiveGrid>

              {loadingOms && (
                <Text style={styles.auxiliar}>
                  Consultando las referencias OMS...
                </Text>
              )}

              {errorOms && (
                <Text style={styles.aviso}>
                  Las mediciones están disponibles,
                  pero no se pudieron cargar
                  las curvas de referencia:
                  {' '}
                  {errorOms}
                </Text>
              )}

              {/* Percentiles y valores Z */}

              <Text style={styles.subtitulo}>
                Indicadores del último control
              </Text>

              <ResponsiveGrid
                maxColumns={3}
                minItemWidth={200}
              >
                <Indicador
                  titulo="Peso para la edad"
                  valor={
                    mostrarNumero(
                      ultimo.percentil_peso_edad
                    )
                  }
                  detalle={
                    'Percentil · Z: ' +
                    mostrarNumero(
                      ultimo.zscore_peso_edad,
                      3
                    )
                  }
                />

                <Indicador
                  titulo="Talla para la edad"
                  valor={
                    mostrarNumero(
                      ultimo.percentil_talla_edad
                    )
                  }
                  detalle={
                    'Percentil · Z: ' +
                    mostrarNumero(
                      ultimo.zscore_talla_edad,
                      3
                    )
                  }
                />

                <Indicador
                  titulo="IMC para la edad"
                  valor={
                    mostrarNumero(
                      ultimo.percentil_imc_edad
                    )
                  }
                  detalle={
                    'Percentil · Z: ' +
                    mostrarNumero(
                      ultimo.zscore_imc_edad,
                      3
                    )
                  }
                />
              </ResponsiveGrid>

              <Text style={styles.notaClinica}>
                Los percentiles y valores Z mostrados
                corresponden a los resultados
                calculados y almacenados por la API.
                La ausencia de un indicador no
                equivale a un percentil cero.
              </Text>

              {/* Registros históricos */}

              <Text style={styles.subtitulo}>
                Historial de controles
              </Text>

              {ordenados
                .slice()
                .reverse()
                .map((registro) => (
                  <View
                    key={String(registro.id_registro)}
                    style={styles.registro}
                  >
                    <View style={styles.registroContenido}>
                      <Text style={styles.registroFecha}>
                        {fechaCorta(
                          registro.fecha_medicion
                        )}
                      </Text>

                      <Text style={styles.registroDetalle}>
                        Edad: {registro.edad_meses} meses
                      </Text>

                      <Text style={styles.registroDetalle}>
                        Peso:
                        {' '}
                        {mostrarNumero(
                          registro.peso_kg
                        )} kg
                        {'  ·  '}
                        Talla:
                        {' '}
                        {mostrarNumero(
                          registro.talla_cm
                        )} cm
                      </Text>

                      {registro.observaciones ? (
                        <Text style={styles.registroDetalle}>
                          {registro.observaciones}
                        </Text>
                      ) : null}
                    </View>

                    <AppButton
                      label="Editar"
                      icon="create-outline"
                      variant="outline"
                      size="small"
                      onPress={() =>
                        editarControl(registro)
                      }
                    />
                  </View>
                ))}
            </>
          )}
        </>
      )}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  subtitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#14213D',
    marginTop: 12,
    marginBottom: 6,
  },

  cargando: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 10,
  },

  auxiliar: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 20,
  },

  error: {
    color: '#DC2626',
    fontSize: 13,
    lineHeight: 20,
  },

  aviso: {
    color: '#A16207',
    fontSize: 12,
    lineHeight: 19,
  },

  indicador: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 7,
  },

  indicadorTitulo: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },

  indicadorValor: {
    color: '#14213D',
    fontSize: 20,
    fontWeight: '800',
  },

  indicadorDetalle: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 17,
  },

  notaClinica: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 17,
  },

  registro: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },

  registroContenido: {
    flex: 1,
    minWidth: 180,
    gap: 5,
  },

  registroFecha: {
    color: '#14213D',
    fontWeight: '700',
    fontSize: 13,
  },

  registroDetalle: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
  },
});