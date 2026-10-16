import { useCallback, useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboard.service';
import type { DashboardEstado } from '../types';

export function useDashboard() {
  const [estado, setEstado] = useState<DashboardEstado>({ datos: {}, errores: {} });
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((v) => v + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    const cargar = async () => {
      setLoading(true);
      try {
        const resultado = await dashboardService.obtener(controller.signal);
        if (!controller.signal.aborted) setEstado(resultado);
      } catch (error) {
        if (!controller.signal.aborted) {
          setEstado({ datos: {}, errores: { ninos: error instanceof Error ? error.message : 'Error general de conexión.' } });
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void cargar();
    return () => controller.abort();
  }, [revision]);

  return { ...estado, loading, refresh };
}
