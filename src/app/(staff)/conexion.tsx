
import React, { useState } from 'react';

import {
  Text,
  View,
  StyleSheet,
} from 'react-native';

import { ScreenContainer } from '../../components/layout/screen-container';
import { ScreenHeader } from '../../components/layout/screen-header';
import { SectionCard } from '../../components/ui/section-card';
import { AppButton } from '../../components/ui/app-button';

import { env } from '../../config/env';

import {
  api,
  ApiError,
} from '../../services/api/api-client';

import { endpoints } from '../../services/api/endpoints';

import { ninosService } from '../../features/ninos/services/ninos.service';

// =========================================
// TIPOS DE RESPUESTA
// =========================================

type HealthResponse = {
  success: boolean;

  data: {
    status: string;
    uptime: number;
    environment: string;
  };

  timestamp: string;
};

// =========================================
// PANTALLA
// =========================================

export default function ConexionScreen() {
  const [loading, setLoading] = useState(false);

  const [resultado, setResultado] = useState(
    'Todavía no se ha comprobado la conexión.'
  );

  const [estado, setEstado] = useState<
    'inicial' | 'success' | 'error'
  >('inicial');

  // =======================================
  // PRUEBA PÚBLICA
  // =======================================

  const probarServidor = async () => {
    setLoading(true);
    setEstado('inicial');

    try {
      const respuesta =
        await api.get<HealthResponse>(
          endpoints.health
        );

      if (
        respuesta.success &&
        respuesta.data?.status === 'OK'
      ) {
        setEstado('success');

        setResultado(
          'Conexión con Express exitosa.\n\n' +
          `Estado: ${respuesta.data.status}\n` +
          `Entorno: ${respuesta.data.environment}\n` +
          `Tiempo activo: ${respuesta.data.uptime} segundos`
        );
      } else {
        setEstado('error');

        setResultado(
          'El servidor respondió, pero el resultado del healthcheck no fue el esperado.'
        );
      }
    } catch (error) {
      setEstado('error');

      setResultado(
        error instanceof Error
          ? error.message
          : 'Error desconocido de conexión.'
      );
    } finally {
      setLoading(false);
    }
  };

  // =======================================
  // PRUEBA PROTEGIDA
  // =======================================

  const probarNinos = async () => {
    setLoading(true);
    setEstado('inicial');

    try {
      await ninosService.listar();

      setEstado('success');

      setResultado(
        'El endpoint de Niños respondió correctamente.'
      );
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          setEstado('success');

          setResultado(
            'La API respondió HTTP 401.\n\n' +
            'El endpoint de Niños es accesible, ' +
            'pero la solicitud no está autenticada.\n\n' +
            'Debemos implementar el inicio de sesión JWT.'
          );

          return;
        }
      }

      setEstado('error');

      setResultado(
        error instanceof Error
          ? error.message
          : 'Error desconocido.'
      );
    } finally {
      setLoading(false);
    }
  };

  // =======================================
  // INTERFAZ
  // =======================================

  return (
    <ScreenContainer>

      <ScreenHeader
        title="Conexión con la API"
        description="Comprobación de comunicación y autenticación del SCCVI."
      />

      <SectionCard
        title="Servidor configurado"
        icon="server-outline"
      >
        <Text style={styles.label}>
          URL base
        </Text>

        <Text style={styles.value}>
          {env.apiUrl}
        </Text>

        <View style={styles.actions}>
          <AppButton
            label="Probar servidor"
            icon="cloud-outline"
            onPress={probarServidor}
            loading={loading}
          />

          <AppButton
            label="Probar Niños (JWT)"
            icon="shield-checkmark-outline"
            variant="outline"
            onPress={probarNinos}
            disabled={loading}
          />
        </View>
      </SectionCard>

      <SectionCard
        title="Resultado de la conexión"
        icon="information-circle-outline"
      >
        <Text
          style={[
            styles.status,
            estado === 'success' && styles.success,
            estado === 'error' && styles.error,
          ]}
        >
          {estado === 'success'
            ? 'Respuesta recibida'
            : estado === 'error'
              ? 'Error de conexión o respuesta'
              : 'Sin verificar'}
        </Text>

        <Text style={styles.result}>
          {resultado}
        </Text>
      </SectionCard>

    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#14213D',
  },

  value: {
    fontSize: 14,
    color: '#536582',
  },

  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },

  status: {
    fontSize: 15,
    fontWeight: '800',
    color: '#64748B',
  },

  success: {
    color: '#07966A',
  },

  error: {
    color: '#D92848',
  },

  result: {
    fontSize: 13,
    lineHeight: 22,
    color: '#536582',
    marginTop: 8,
  },
});
