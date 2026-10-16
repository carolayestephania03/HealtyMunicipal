import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  crecimientoService,
} from '../services/crecimiento.service';

import {
  referenciasOmsService,
} from '../../referencias-oms/services/referencias-oms.service';

import type {
  RegistroCrecimiento,
  RegistroId,
} from '../types';

import type {
  ReferenciaOms,
  SexoOms,
} from '../../referencias-oms/types';

export function useCrecimiento(
  idNino: RegistroId,
  sexo: SexoOms
) {
  const [registros, setRegistros] =
    useState<RegistroCrecimiento[]>([]);

  const [referenciasPeso, setReferenciasPeso] =
    useState<ReferenciaOms[]>([]);

  const [referenciasTalla, setReferenciasTalla] =
    useState<ReferenciaOms[]>([]);

  const [loading, setLoading] = useState(true);

  const [loadingOms, setLoadingOms] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [errorOms, setErrorOms] =
    useState<string | null>(null);

  const [revision, setRevision] = useState(0);

  const refresh = useCallback(() => {
    setRevision((actual) => actual + 1);
  }, []);

  // =========================================
  // HISTORIAL CLÍNICO
  // =========================================

  useEffect(() => {
    const controller = new AbortController();

    const cargar = async () => {
      setLoading(true);
      setError(null);

      try {
        const respuesta =
          await crecimientoService.historial(
            idNino,
            controller.signal
          );

        if (controller.signal.aborted) return;

        if (
          !respuesta.success ||
          !Array.isArray(respuesta.data)
        ) {
          throw new Error(
            'El historial de crecimiento no es válido.'
          );
        }

        setRegistros(respuesta.data);
      } catch (err) {
        if (controller.signal.aborted) return;

        setRegistros([]);

        setError(
          err instanceof Error
            ? err.message
            : 'No se pudo cargar el historial.'
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void cargar();

    return () => controller.abort();
  }, [idNino, revision]);

  // =========================================
  // REFERENCIAS OMS
  // =========================================

  useEffect(() => {
    const controller = new AbortController();

    const cargar = async () => {
      setLoadingOms(true);
      setErrorOms(null);
      setReferenciasPeso([]);
      setReferenciasTalla([]);

      try {
        const [peso, talla] = await Promise.all([
          referenciasOmsService.listar(
            sexo,
            'PESO_EDAD',
            controller.signal
          ),

          referenciasOmsService.listar(
            sexo,
            'TALLA_EDAD',
            controller.signal
          ),
        ]);

        if (controller.signal.aborted) return;

        if (
          !peso.success ||
          !talla.success ||
          !Array.isArray(peso.data) ||
          !Array.isArray(talla.data)
        ) {
          throw new Error(
            'No se pudieron interpretar las referencias OMS.'
          );
        }

        setReferenciasPeso(peso.data);
        setReferenciasTalla(talla.data);
      } catch (err) {
        if (controller.signal.aborted) return;

        setErrorOms(
          err instanceof Error
            ? err.message
            : 'No se pudieron cargar las referencias OMS.'
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoadingOms(false);
        }
      }
    };

    void cargar();

    return () => controller.abort();
  }, [sexo, revision]);

  return {
    registros,
    referenciasPeso,
    referenciasTalla,
    loading,
    loadingOms,
    error,
    errorOms,
    refresh,
  };
}