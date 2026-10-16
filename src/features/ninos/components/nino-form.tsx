
import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { router } from 'expo-router';

import { ScreenContainer } from '../../../components/layout/screen-container';
import { ScreenHeader } from '../../../components/layout/screen-header';
import { ResponsiveGrid } from '../../../components/layout/responsive-grid';

import { FormPanel } from '../../../components/forms/form-panel';
import { SearchSelect } from '../../../components/forms/search-select';
import { DateField } from '../../../components/forms/date-field';
import { RadioGroup } from '../../../components/forms/radio-group';

import { TextField } from '../../../components/ui/text-field';
import { AppButton } from '../../../components/ui/app-button';

import { useFamilias } from '../../familias/hooks/use-familias';
import { ninosService } from '../services/ninos.service';

import type {
  CrearNinoDto,
  Sexo,
} from '../types';

import { colors } from '../../../constants/theme';

// ===========================================
// PROPIEDADES
// ===========================================

type Props = {
  id?: string;
};

type FormErrors = Partial<
  Record<
    | 'familia'
    | 'codigo'
    | 'nombres'
    | 'apellidos'
    | 'fecha'
    | 'sexo',
    string
  >
>;

// ===========================================
// VALIDACIÓN DE FECHA
// ===========================================

function fechaValida(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const fecha = new Date(
    `${value}T00:00:00.000Z`
  );

  if (
    Number.isNaN(fecha.getTime()) ||
    fecha.toISOString().slice(0, 10) !== value
  ) {
    return false;
  }

  const hoy = new Date();

  const fechaHoy = [
    hoy.getFullYear(),
    String(hoy.getMonth() + 1).padStart(2, '0'),
    String(hoy.getDate()).padStart(2, '0'),
  ].join('-');

  return value <= fechaHoy;
}

// ===========================================
// FORMULARIO
// ===========================================

export function NinoForm({ id }: Props) {
  const editando = id !== undefined;

  const {
    familias,
    loading: cargandoFamilias,
    error: errorFamilias,
    refresh: recargarFamilias,
  } = useFamilias();

  // Campos
  const [familiaId, setFamiliaId] =
    useState<string | null>(null);

  const [codigo, setCodigo] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [fecha, setFecha] = useState('');
  const [sexo, setSexo] = useState('');

  // Estados del formulario
  const [cargandoNino, setCargandoNino] =
    useState(editando);

  const [guardando, setGuardando] =
    useState(false);

  const [errorCarga, setErrorCarga] =
    useState<string | null>(null);

  const [errorGuardar, setErrorGuardar] =
    useState<string | null>(null);

  const [errors, setErrors] =
    useState<FormErrors>({});

  // =========================================
  // CARGAR NIÑO EN MODO EDICIÓN
  // =========================================

  useEffect(() => {
    if (!id) {
      setCargandoNino(false);
      return;
    }

    let active = true;

    const cargar = async () => {
      setCargandoNino(true);
      setErrorCarga(null);

      try {
        const respuesta =
          await ninosService.obtenerPorId(id);

        if (!active) return;

        if (
          !respuesta.success ||
          !respuesta.data
        ) {
          throw new Error(
            'No se obtuvo la información del niño.'
          );
        }

        const nino = respuesta.data;

        setFamiliaId(String(nino.id_familia));
        setCodigo(nino.codigo_expediente);
        setNombres(nino.nombres);
        setApellidos(nino.apellidos);

        setFecha(
          nino.fecha_nacimiento.slice(0, 10)
        );

        setSexo(nino.sexo);
      } catch (err) {
        if (!active) return;

        setErrorCarga(
          err instanceof Error
            ? err.message
            : 'No se pudo cargar el expediente.'
        );
      } finally {
        if (active) {
          setCargandoNino(false);
        }
      }
    };

    void cargar();

    return () => {
      active = false;
    };
  }, [id]);

  // =========================================
  // FAMILIAS PARA EL SELECTOR
  // =========================================

  const opcionesFamilias = useMemo(
    () =>
      familias
        .filter(
          (familia) =>
            familia.activo !== false ||
            String(familia.id_familia) === familiaId
        )
        .map((familia) => {
          const comunidad =
            familia.comunidad?.nombre ??
            'Comunidad no disponible';

          return {
            value: String(familia.id_familia),
            label: familia.codigo_familia,
            description:
              `${comunidad}` +
              (familia.activo === false
                ? ' · Familia inactiva'
                : ''),
            disabled:
              familia.activo === false &&
              String(familia.id_familia) !== familiaId,
          };
        }),
    [familias, familiaId]
  );

  // =========================================
  // VALIDAR DATOS
  // =========================================

  const validarFormulario = ():
    CrearNinoDto | null => {
    const nuevosErrores: FormErrors = {};

    const idFamilia = Number(familiaId);

    if (
      !familiaId ||
      !Number.isSafeInteger(idFamilia) ||
      idFamilia <= 0
    ) {
      nuevosErrores.familia =
        'Seleccione una familia válida.';
    }

    const codigoLimpio =
      codigo.trim().toUpperCase();

    if (
      codigoLimpio.length < 1 ||
      codigoLimpio.length > 50
    ) {
      nuevosErrores.codigo =
        'Ingrese un código de 1 a 50 caracteres.';
    }

    const nombresLimpios = nombres.trim();

    if (
      nombresLimpios.length < 2 ||
      nombresLimpios.length > 100
    ) {
      nuevosErrores.nombres =
        'Ingrese nombres de 2 a 100 caracteres.';
    }

    const apellidosLimpios = apellidos.trim();

    if (
      apellidosLimpios.length < 2 ||
      apellidosLimpios.length > 100
    ) {
      nuevosErrores.apellidos =
        'Ingrese apellidos de 2 a 100 caracteres.';
    }

    if (!fechaValida(fecha)) {
      nuevosErrores.fecha =
        'Ingrese una fecha válida que no sea futura.';
    }

    if (sexo !== 'M' && sexo !== 'F') {
      nuevosErrores.sexo =
        'Seleccione el sexo.';
    }

    setErrors(nuevosErrores);

    if (Object.keys(nuevosErrores).length > 0) {
      return null;
    }

    return {
      id_familia: idFamilia,
      codigo_expediente: codigoLimpio,
      nombres: nombresLimpios,
      apellidos: apellidosLimpios,
      fecha_nacimiento: fecha,
      sexo: sexo as Sexo,
    };
  };

  // =========================================
  // GUARDAR REGISTRO
  // =========================================

  const guardar = async () => {
    if (
      guardando ||
      cargandoNino ||
      cargandoFamilias ||
      errorFamilias ||
      errorCarga
    ) {
      return;
    }

    const datos = validarFormulario();

    if (!datos) return;

    setGuardando(true);
    setErrorGuardar(null);

    try {
      const respuesta = editando && id
        ? await ninosService.actualizar(
            id,
            datos
          )
        : await ninosService.crear(datos);

      if (
        respuesta.success !== true ||
        !respuesta.data
      ) {
        throw new Error(
          'La API no confirmó el guardado.'
        );
      }

      // Regresar al listado después de guardar.
      router.replace('/ninos');
    } catch (err) {
      setErrorGuardar(
        err instanceof Error
          ? err.message
          : 'No fue posible guardar el registro.'
      );
    } finally {
      setGuardando(false);
    }
  };

  const titulo = editando
    ? 'Editar niño'
    : 'Registrar niño';

  // =========================================
  // INTERFAZ
  // =========================================

  return (
    <ScreenContainer>
      <ScreenHeader
        title={titulo}
        description={
          editando
            ? 'Actualice la información personal del niño.'
            : 'Complete los campos para registrar un niño en el SCCVI.'
        }
      />

      <FormPanel
        title="Información personal"
        description="Los campos marcados con * son obligatorios."
        icon="person-outline"
        footer={
          <>
            <AppButton
              label="Cancelar"
              variant="outline"
              disabled={guardando}
              onPress={() => router.back()}
            />

            <AppButton
              label={
                editando
                  ? 'Guardar cambios'
                  : 'Registrar niño'
              }
              icon="save-outline"
              loading={guardando}
              disabled={
                cargandoNino ||
                cargandoFamilias ||
                !!errorCarga ||
                !!errorFamilias
              }
              onPress={() => {
                void guardar();
              }}
            />
          </>
        }
      >
        {/* Cargando expediente */}
        {cargandoNino && (
          <View style={styles.messageRow}>
            <ActivityIndicator
              color={colors.primary}
            />
            <Text style={styles.info}>
              Cargando información del niño...
            </Text>
          </View>
        )}

        {/* Error al obtener expediente */}
        {errorCarga && (
          <Text style={styles.error}>
            {errorCarga}
          </Text>
        )}

        {/* Catálogo de familias */}
        {cargandoFamilias && (
          <View style={styles.messageRow}>
            <ActivityIndicator
              color={colors.primary}
            />
            <Text style={styles.info}>
              Consultando familias...
            </Text>
          </View>
        )}

        {errorFamilias && (
          <View style={styles.messageBlock}>
            <Text style={styles.error}>
              {errorFamilias}
            </Text>

            <AppButton
              label="Reintentar familias"
              variant="outline"
              onPress={recargarFamilias}
            />
          </View>
        )}

        {/* Campos */}
        {!cargandoNino && !errorCarga && (
          <>
            <ResponsiveGrid
              maxColumns={2}
              minItemWidth={240}
              gap={16}
            >
              <TextField
                label="Código de expediente"
                value={codigo}
                onChangeText={setCodigo}
                placeholder="Ej. EXP-0001"
                autoCapitalize="characters"
                maxLength={50}
                required
                error={errors.codigo}
              />

              <SearchSelect
                label="Familia"
                value={familiaId}
                onChange={setFamiliaId}
                options={opcionesFamilias}
                placeholder={
                  cargandoFamilias
                    ? 'Cargando familias...'
                    : 'Buscar por código o comunidad...'
                }
                disabled={
                  cargandoFamilias ||
                  !!errorFamilias ||
                  guardando
                }
                loading={cargandoFamilias}
                required
                error={errors.familia}
              />

              <TextField
                label="Nombres"
                value={nombres}
                onChangeText={setNombres}
                placeholder="Ingrese los nombres"
                maxLength={100}
                required
                error={errors.nombres}
              />

              <TextField
                label="Apellidos"
                value={apellidos}
                onChangeText={setApellidos}
                placeholder="Ingrese los apellidos"
                maxLength={100}
                required
                error={errors.apellidos}
              />

              <DateField
                label="Fecha de nacimiento"
                value={fecha}
                onChangeText={setFecha}
                required
                error={errors.fecha}
              />

              <RadioGroup
                label="Sexo"
                value={sexo}
                onChange={setSexo}
                required
                error={errors.sexo}
                options={[
                  {
                    value: 'M',
                    label: 'Masculino',
                  },
                  {
                    value: 'F',
                    label: 'Femenino',
                  },
                ]}
              />
            </ResponsiveGrid>

            {errorGuardar && (
              <View style={styles.errorBox}>
                <Text style={styles.error}>
                  {errorGuardar}
                </Text>
              </View>
            )}

            {familias.length === 0 &&
              !cargandoFamilias &&
              !errorFamilias && (
                <Text style={styles.info}>
                  No hay familias disponibles.
                  Registre una familia antes de crear
                  un niño.
                </Text>
              )}
          </>
        )}
      </FormPanel>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },

  messageBlock: {
    gap: 10,
  },

  info: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 19,
  },

  error: {
    fontSize: 13,
    color: colors.danger,
    lineHeight: 20,
  },

  errorBox: {
    padding: 12,
    backgroundColor: colors.dangerLight,
    borderRadius: 9,
  },
});
