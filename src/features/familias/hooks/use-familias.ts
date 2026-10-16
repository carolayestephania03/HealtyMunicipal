
import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  familiasService,
} from '../services/familias.service';

import type {
  Familia,
} from '../types';

export function useFamilias() {
  const [familias, setFamilias] =
    useState<Familia[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [refreshKey, setRefreshKey] =
    useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((value) => value + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const cargar = async () => {
      setLoading(true);
      setError(null);

      try {
        const respuesta =
          await familiasService.listar(
            controller.signal
          );

        if (controller.signal.aborted) return;

        if (
          respuesta.success !== true ||
          !Array.isArray(respuesta.data)
        ) {
          throw new Error(
            'La API devolvió un listado de familias inválido.'
          );
        }

        setFamilias(respuesta.data);
      } catch (err) {
        if (controller.signal.aborted) return;

        setFamilias([]);
        setError(
          err instanceof Error
            ? err.message
            : 'No se pudieron consultar las familias.'
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void cargar();

    return () => controller.abort();
  }, [refreshKey]);

  return {
    familias,
    loading,
    error,
    refresh,
  };
}
