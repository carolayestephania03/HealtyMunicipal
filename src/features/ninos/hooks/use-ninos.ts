
import {
  useEffect,
  useState,
} from 'react';

import { ninosService } from '../services/ninos.service';

export function useNinos(accessToken?: string) {
  const [data, setData] = useState<unknown>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const controller = new AbortController();

    const cargarNinos = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await ninosService.listar(
          accessToken,
          controller.signal
        );

        if (active) {
          setData(response);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Error al consultar los niños.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    cargarNinos();

    return () => {
      active = false;
      controller.abort();
    };
  }, [accessToken]);

  return {
    data,
    loading,
    error,
  };
}
