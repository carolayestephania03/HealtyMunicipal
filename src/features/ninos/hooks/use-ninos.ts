
import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ninosService,
} from '../services/ninos.service';

import type {
  Nino,
  NinoFiltrosApi,
} from '../types';

export function useNinos(
  filtros: NinoFiltrosApi = {}
) {
  const [ninos, setNinos] = useState<Nino[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  const idFamilia = filtros.id_familia;
  const soloActivos = filtros.solo_activos;

  const refresh = useCallback(() => {
    setRefreshKey((value) => value + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const cargar = async () => {
      setLoading(true);
      setError(null);

      try {
        const respuesta = await ninosService.listar(
          {
            id_familia: idFamilia,
            solo_activos: soloActivos,
          },
          controller.signal
        );

        if (controller.signal.aborted) return;

        if (
          respuesta.success !== true ||
          !Array.isArray(respuesta.data)
        ) {
          throw new Error(
            'La API devolvió un listado de niños inválido.'
          );
        }

        setNinos(respuesta.data);
      } catch (err) {
        if (controller.signal.aborted) return;

        setNinos([]);

        setError(
          err instanceof Error
            ? err.message
            : 'No fue posible consultar los niños.'
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void cargar();

    return () => {
      controller.abort();
    };
  }, [
    idFamilia,
    soloActivos,
    refreshKey,
  ]);

  return {
    ninos,
    loading,
    error,
    refresh,
  };
}
