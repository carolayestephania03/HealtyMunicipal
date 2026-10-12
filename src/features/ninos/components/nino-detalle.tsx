
import React, {
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { router } from 'expo-router';

// ======================================================
// COMPONENTES DE LAYOUT
// ======================================================

import {
  ScreenContainer,
} from '../../../components/layout/screen-container';

import {
  ScreenHeader,
} from '../../../components/layout/screen-header';

import {
  ResponsiveGrid,
} from '../../../components/layout/responsive-grid';

// ======================================================
// COMPONENTES UI
// ======================================================

import {
  SectionCard,
} from '../../../components/ui/section-card';

import {
  StatusBadge,
} from '../../../components/ui/status-badge';

import {
  AppButton,
} from '../../../components/ui/app-button';

// ======================================================
// MÓDULO DE CRECIMIENTO
// ======================================================

import {
  CrecimientoSection,
} from '../../crecimiento/components/crecimiento-section';

// ======================================================
// MÓDULO DE VACUNACIÓN
// ======================================================

import {
  VacunacionSection,
} from '../../vacunacion/components/vacunacion-section';

// ======================================================
// MÓDULO DE CARNET DIGITAL QR
// ======================================================

import {
  CarnetQrSection,
} from '../../carnet-qr/components/carnet-qr-section';

// ======================================================
// SERVICIOS Y TIPOS
// ======================================================

import {
  ninosService,
} from '../services/ninos.service';

import type {
  Nino,
} from '../types';

import {
  colors,
} from '../../../constants/theme';

// ======================================================
// PROPIEDADES
// ======================================================

type Props = {
  id: string;
};

// ======================================================
// FORMATO DE EDAD
// ======================================================

function calcularEdad(
  fechaNacimiento: string
): string {
  const fechaTexto = fechaNacimiento.slice(0, 10);

  const partes = fechaTexto.split('-').map(Number);

  if (
    partes.length !== 3 ||
    partes.some((valor) => !Number.isInteger(valor))
  ) {
    return 'No disponible';
  }

  const [anio, mes, dia] = partes;

  const nacimiento = new Date(anio, mes - 1, dia);
  const hoy = new Date();

  if (
    nacimiento.getFullYear() !== anio ||
    nacimiento.getMonth() !== mes - 1 ||
    nacimiento.getDate() !== dia ||
    nacimiento > hoy
  ) {
    return 'No disponible';
  }

  let meses =
    (hoy.getFullYear() - anio) * 12 +
    (hoy.getMonth() - (mes - 1));

  if (hoy.getDate() < dia) {
    meses--;
  }

  if (meses < 12) {
    return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
  }

  const anios = Math.floor(meses / 12);
  const mesesRestantes = meses % 12;

  if (mesesRestantes === 0) {
    return `${anios} ${anios === 1 ? 'año' : 'años'}`;
  }

  return (
    `${anios} ${anios === 1 ? 'año' : 'años'} ` +
    `y ${mesesRestantes} ` +
    `${mesesRestantes === 1 ? 'mes' : 'meses'}`
  );
}

// ======================================================
// CAMPO DE INFORMACIÓN
// ======================================================

function Info({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.label}>
        {label}
      </Text>

      <Text style={styles.value}>
        {value === null ||
        value === undefined ||
        value === ''
          ? 'No disponible'
          : String(value)}
      </Text>
    </View>
  );
}

// ======================================================
// EXPEDIENTE DEL NIÑO
// ======================================================

export function NinoDetalle({ id }: Props) {

  // --------------------------------------------------
  // ESTADOS
  // --------------------------------------------------

  const [nino, setNino] =
    useState<Nino | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [reloadKey, setReloadKey] =
    useState(0);

  // --------------------------------------------------
  // CONSULTAR EXPEDIENTE DESDE LA API
  // --------------------------------------------------

  useEffect(() => {
    let active = true;

    const cargar = async () => {
      setLoading(true);
      setError(null);
      setNino(null);

      try {
        const respuesta =
          await ninosService.obtenerPorId(id);

        if (!active) {
          return;
        }

        if (
          respuesta.success !== true ||
          !respuesta.data
        ) {
          throw new Error(
            'La API no devolvió el expediente del niño.'
          );
        }

        setNino(respuesta.data);

      } catch (err) {

        if (!active) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : 'No fue posible consultar el expediente.'
        );

        setNino(null);

      } finally {

        if (active) {
          setLoading(false);
        }
      }
    };

    void cargar();

    return () => {
      active = false;
    };

  }, [id, reloadKey]);

  // --------------------------------------------------
  // ACTUALIZAR EXPEDIENTE
  // --------------------------------------------------

  const recargarExpediente = () => {
    setReloadKey((actual) => actual + 1);
  };

  // --------------------------------------------------
  // IR A EDICIÓN
  // --------------------------------------------------

  const editarNino = () => {
    if (!nino) {
      return;
    }

    router.push({
      pathname: '/ninos/[id]/editar',
      params: {
        id: String(nino.id_nino),
      },
    });
  };

  // ======================================================
  // INTERFAZ
  // ======================================================

  return (
    <ScreenContainer>

      {/* ================================================ */}
      {/* ENCABEZADO DEL EXPEDIENTE                        */}
      {/* ================================================ */}

      <ScreenHeader
        title="Expediente del niño"
        description="Información personal, familiar, crecimiento, vacunación y carnet digital."
      />

      {/* ================================================ */}
      {/* CARGA INICIAL                                    */}
      {/* ================================================ */}

      {loading ? (

        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />

          <Text style={styles.helper}>
            Cargando expediente del niño...
          </Text>
        </View>

      ) : error ? (

        /* ============================================== */
        /* ERROR AL CONSULTAR EXPEDIENTE                  */
        /* ============================================== */

        <SectionCard
          title="Error de consulta"
        >
          <Text style={styles.error}>
            {error}
          </Text>

          <AppButton
            label="Reintentar"
            icon="refresh-outline"
            onPress={recargarExpediente}
          />
        </SectionCard>

      ) : nino ? (

        <>

          {/* ============================================ */}
          {/* 1. INFORMACIÓN PERSONAL                      */}
          {/* ============================================ */}

          <SectionCard
            title={`${nino.nombres} ${nino.apellidos}`}
            icon="person-outline"
            action={
              <AppButton
                label="Editar"
                icon="create-outline"
                size="small"
                onPress={editarNino}
              />
            }
          >

            <View style={styles.estadoContainer}>
              <StatusBadge
                label={
                  nino.activo
                    ? 'Activo'
                    : 'Inactivo'
                }
                tone={
                  nino.activo
                    ? 'success'
                    : 'neutral'
                }
              />
            </View>

            <ResponsiveGrid
              maxColumns={2}
              minItemWidth={230}
            >

              <Info
                label="Código de expediente"
                value={nino.codigo_expediente}
              />

              <Info
                label="Identificador del niño"
                value={nino.id_nino}
              />

              <Info
                label="Nombres"
                value={nino.nombres}
              />

              <Info
                label="Apellidos"
                value={nino.apellidos}
              />

              <Info
                label="Fecha de nacimiento"
                value={
                  nino.fecha_nacimiento.slice(0, 10)
                }
              />

              <Info
                label="Edad actual"
                value={
                  calcularEdad(nino.fecha_nacimiento)
                }
              />

              <Info
                label="Sexo"
                value={
                  nino.sexo === 'M'
                    ? 'Masculino'
                    : 'Femenino'
                }
              />

              <Info
                label="Estado del registro"
                value={
                  nino.activo
                    ? 'Activo'
                    : 'Inactivo'
                }
              />

            </ResponsiveGrid>

          </SectionCard>

          {/* ============================================ */}
          {/* 2. INFORMACIÓN FAMILIAR                      */}
          {/* ============================================ */}

          <SectionCard
            title="Información familiar"
            icon="people-outline"
          >

            <ResponsiveGrid
              maxColumns={2}
              minItemWidth={230}
            >

              <Info
                label="Código de familia"
                value={
                  nino.familia?.codigo_familia
                }
              />

              <Info
                label="Identificador de familia"
                value={
                  nino.id_familia
                }
              />

              <Info
                label="Comunidad"
                value={
                  nino.familia?.comunidad?.nombre
                }
              />

              <Info
                label="Municipio"
                value={
                  nino.familia?.comunidad?.municipio
                }
              />

              <Info
                label="Departamento"
                value={
                  nino.familia?.comunidad?.departamento
                }
              />

            </ResponsiveGrid>

          </SectionCard>

          {/* ============================================ */}
          {/* 3. PADRES Y TUTORES                          */}
          {/* ============================================ */}

          <SectionCard
            title="Padres y tutores vinculados"
            icon="people-circle-outline"
          >

            {nino.tutores &&
            nino.tutores.length > 0 ? (

              nino.tutores.map((tutor) => (

                <View
                  key={String(tutor.id_tutor)}
                  style={styles.tutor}
                >

                  <Text style={styles.tutorName}>
                    {tutor.nombres} {tutor.apellidos}
                  </Text>

                  <ResponsiveGrid
                    maxColumns={2}
                    minItemWidth={220}
                  >

                    <Info
                      label="Identificador del tutor"
                      value={tutor.id_tutor}
                    />

                    <Info
                      label="Teléfono"
                      value={tutor.telefono}
                    />

                    <Info
                      label="Correo electrónico"
                      value={tutor.correo}
                    />

                    <Info
                      label="Canal de comunicación"
                      value={tutor.canal_preferido}
                    />

                  </ResponsiveGrid>

                </View>

              ))

            ) : (

              <Text style={styles.helper}>
                El expediente no tiene padres o
                tutores vinculados en la respuesta
                actual.
              </Text>

            )}

          </SectionCard>

          {/* ============================================ */}
          {/* 4. SEGUIMIENTO DEL CRECIMIENTO               */}
          {/* ============================================ */}

          <CrecimientoSection
            key={`crecimiento-${nino.id_nino}`}
            idNino={nino.id_nino}
            sexo={nino.sexo}
            fechaNacimiento={nino.fecha_nacimiento}
          />

          {/* ============================================ */}
          {/* 5. VACUNACIÓN                                */}
          {/* ============================================ */}

          <VacunacionSection
            key={`vacunacion-${nino.id_nino}`}
            idNino={nino.id_nino}
            fechaNacimiento={nino.fecha_nacimiento}
          />

          {/* ============================================ */}
          {/* 6. CARNET DIGITAL QR                         */}
          {/* ============================================ */}

          <CarnetQrSection
            key={`carnet-${nino.id_nino}`}
            idNino={nino.id_nino}
          />

        </>

      ) : (

        /* ============================================== */
        /* EXPEDIENTE NO DISPONIBLE                       */
        /* ============================================== */

        <SectionCard
          title="Expediente no disponible"
        >
          <Text style={styles.helper}>
            No se encontró información para
            el niño solicitado.
          </Text>

          <AppButton
            label="Volver a consultar"
            icon="refresh-outline"
            onPress={recargarExpediente}
          />
        </SectionCard>

      )}

    </ScreenContainer>
  );
}

// ======================================================
// ESTILOS
// ======================================================

const styles = StyleSheet.create({

  center: {
    paddingVertical: 35,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },

  estadoContainer: {
    marginBottom: 10,
    alignSelf: 'flex-start',
  },

  infoItem: {
    gap: 5,
    paddingVertical: 4,
    minWidth: 0,
  },

  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted,
  },

  value: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    flexShrink: 1,
  },

  helper: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 20,
  },

  error: {
    fontSize: 13,
    color: colors.danger,
    lineHeight: 20,
  },

  tutor: {
    gap: 10,
    padding: 13,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
    marginBottom: 8,
  },

  tutorName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },

});
