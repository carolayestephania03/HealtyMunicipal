
import React, { useState } from 'react';

import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  TextField,
} from '../../components/ui/text-field';

import {
  AppButton,
} from '../../components/ui/app-button';

import {
  useAuth,
} from '../../features/auth/hooks/use-auth';

import {
  colors,
} from '../../constants/theme';

// ===========================================
// LOGIN SCCVI
// ===========================================

export default function LoginScreen() {
  const { signIn } = useAuth();

  const [identificador, setIdentificador] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  // =========================================
  // INICIAR SESIÓN
  // =========================================

  const handleLogin = async () => {
    if (loading) return;

    const usuario = identificador.trim();

    if (!usuario || !password) {
      setError(
        'Debe ingresar su usuario o correo electrónico y contraseña.'
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signIn({
        identificador: usuario,
        password,
      });

      // AuthLayout detectará la sesión
      // y redirigirá automáticamente a Inicio.
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No fue posible iniciar sesión.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>

          {/* Identificación del sistema */}
          <View style={styles.brand}>
            <View style={styles.iconCircle}>
              <Ionicons
                name="medical-outline"
                size={37}
                color="#FFFFFF"
              />
            </View>

            <Text style={styles.brandTitle}>
              SCCVI
            </Text>

            <Text style={styles.brandSubtitle}>
              Sistema de Control de Crecimiento
              y Vacunación Infantil
            </Text>
          </View>

          {/* Formulario */}
          <View style={styles.form}>
            <Text style={styles.formTitle}>
              Iniciar sesión
            </Text>

            <Text style={styles.formDescription}>
              Ingrese sus credenciales para
              acceder al sistema.
            </Text>

            <TextField
              label="Usuario o correo electrónico"
              placeholder="Ingrese usuario o correo"
              value={identificador}
              onChangeText={setIdentificador}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              editable={!loading}
              required
            />

            <TextField
              label="Contraseña"
              placeholder="Ingrese su contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="password"
              editable={!loading}
              returnKeyType="go"
              onSubmitEditing={() => {
                void handleLogin();
              }}
              required
            />

            {/* Errores */}
            {error && (
              <View
                style={styles.errorContainer}
                accessibilityRole="alert"
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={20}
                  color={colors.danger}
                />

                <Text style={styles.errorText}>
                  {error}
                </Text>
              </View>
            )}

            {/* Botón de acceso */}
            <AppButton
              label="Iniciar sesión"
              icon="log-in-outline"
              fullWidth
              size="large"
              loading={loading}
              onPress={() => {
                void handleLogin();
              }}
            />
          </View>

          <Text style={styles.footer}>
            Acceso exclusivo para personal autorizado
            del sistema de salud.
          </Text>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  card: {
    width: '100%',
    maxWidth: 450,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },

  brand: {
    alignItems: 'center',
    backgroundColor: colors.sidebar,
    paddingHorizontal: 25,
    paddingVertical: 32,
    gap: 10,
  },

  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.17)',
  },

  brandTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },

  brandSubtitle: {
    color: '#D9F1F4',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },

  form: {
    padding: 25,
    gap: 17,
  },

  formTitle: {
    color: colors.text,
    fontSize: 23,
    fontWeight: '800',
    textAlign: 'center',
  },

  formDescription: {
    color: colors.muted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 7,
  },

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: '#F9D8DE',
    padding: 12,
    borderRadius: 9,
  },

  errorText: {
    flex: 1,
    color: colors.danger,
    fontSize: 12,
    lineHeight: 18,
  },

  footer: {
    color: colors.muted,
    fontSize: 11,
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingBottom: 23,
    lineHeight: 17,
  },
});
