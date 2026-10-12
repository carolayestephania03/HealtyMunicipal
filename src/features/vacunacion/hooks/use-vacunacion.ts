import { useCallback, useEffect, useState } from 'react';
import type { Id, Vacunacion, Esquema } from '../types';
import { vacunacionService } from '../services/vacunacion.service';
import { esquemasService } from '../../esquema-vacunacion/services/esquemas.service';

export function useVacunacion(idNino: Id) {
  const [registros, setRegistros] = useState<Vacunacion[]>([]);
  const [esquemas, setEsquemas] = useState<Esquema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((r) => r + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    const cargar = async () => {
      setLoading(true);
      setError(null);
      try {
        const [historial, catalogo] = await Promise.all([
          vacunacionService.historial(idNino, controller.signal),
          esquemasService.listar(controller.signal),
        ]);
        if (controller.signal.aborted) return;
        if (!historial.success || !Array.isArray(historial.data) ||
            !catalogo.success || !Array.isArray(catalogo.data)) {
          throw new Error('La API devolvió información de vacunación inválida.');
        }
        setRegistros(historial.data);
        setEsquemas(catalogo.data);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'No se pudo consultar la vacunación.');
        setRegistros([]);
        setEsquemas([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void cargar();
    return () => controller.abort();
  }, [idNino, revision]);

  return { registros, esquemas, loading, error, refresh };
}
