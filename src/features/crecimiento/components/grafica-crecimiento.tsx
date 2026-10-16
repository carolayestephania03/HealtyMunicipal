import React, { useMemo } from 'react';

import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Svg, {
  Circle,
  Line,
  Polyline,
  Text as SvgText,
} from 'react-native-svg';

import type {
  RegistroCrecimiento,
} from '../types';

import {
  numeroSeguro,
} from '../types';

import type {
  IndicadorOms,
  ReferenciaOms,
} from '../../referencias-oms/types';

type Props = {
  indicador: 'PESO_EDAD' | 'TALLA_EDAD';
  registros: RegistroCrecimiento[];
  referencias: ReferenciaOms[];
};

type Punto = {
  x: number;
  y: number;
};

const W = 360;
const H = 235;

const IZQ = 43;
const DER = 13;
const ARRIBA = 15;
const ABAJO = 35;

export function GraficaCrecimiento({
  indicador,
  registros,
  referencias,
}: Props) {
  const esPeso = indicador === 'PESO_EDAD';

  const titulo = esPeso
    ? 'Peso (kg) frente a edad'
    : 'Talla (cm) frente a edad';

  const unidad = esPeso ? 'kg' : 'cm';
  const color = esPeso ? '#2769D8' : '#089879';

  const grafica = useMemo(() => {
    const puntos = registros
      .map((registro) => ({
        x: numeroSeguro(registro.edad_meses),
        y: numeroSeguro(
          esPeso
            ? registro.peso_kg
            : registro.talla_cm
        ),
      }))
      .filter(
        (p): p is Punto =>
          p.x !== null &&
          p.y !== null &&
          p.x >= 0 &&
          p.y > 0
      )
      .sort((a, b) => a.x - b.x);

    if (puntos.length === 0) {
      return null;
    }

    const maxEdad = Math.max(
      12,
      ...puntos.map((p) => p.x)
    );

    // Evita combinar distintas versiones.
    const versiones = new Set(
      referencias.map(
        (ref) => ref.version_referencia || 'sin-version'
      )
    );

    const mismaVersion = versiones.size <= 1;

    const medianas = mismaVersion
      ? referencias
          .map((ref) => ({
            x: numeroSeguro(ref.edad_meses),
            y: numeroSeguro(ref.parametro_m),
          }))
          .filter(
            (p): p is Punto =>
              p.x !== null &&
              p.y !== null &&
              p.x >= 0 &&
              p.x <= maxEdad &&
              p.y > 0
          )
          .sort((a, b) => a.x - b.x)
      : [];

    const valores = [
      ...puntos.map((p) => p.y),
      ...medianas.map((p) => p.y),
    ];

    let minimo = Math.min(...valores);
    let maximo = Math.max(...valores);

    const margen = Math.max(
      1,
      (maximo - minimo) * 0.12
    );

    minimo = Math.max(0, minimo - margen);
    maximo += margen;

    const areaAncho = W - IZQ - DER;
    const areaAlto = H - ARRIBA - ABAJO;

    const convertir = (p: Punto): Punto => ({
      x: IZQ + (p.x / maxEdad) * areaAncho,
      y:
        ARRIBA +
        ((maximo - p.y) / (maximo - minimo)) *
          areaAlto,
    });

    const mediciones = puntos.map(convertir);

    const referencia = medianas.map(convertir);

    const puntosSvg = (items: Punto[]) =>
      items.map(
        (p) => `${p.x},${p.y}`
      ).join(' ');

    return {
      mediciones,
      referencia,
      medicionesSvg: puntosSvg(mediciones),
      referenciaSvg: puntosSvg(referencia),
      minimo,
      maximo,
      maxEdad,
      versionMultiple: versiones.size > 1,
    };
  }, [registros, referencias, esPeso]);

  if (!grafica) {
    return (
      <View style={styles.card}>
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.mensaje}>
          Todavía no existen mediciones para
          construir esta gráfica.
        </Text>
      </View>
    );
  }

  const { minimo, maximo, maxEdad } = grafica;

  const escalaY = (fraccion: number) =>
    ARRIBA + fraccion * (H - ARRIBA - ABAJO);

  return (
    <View style={styles.card}>
      <Text style={styles.titulo}>
        {titulo}
      </Text>

      <Svg
        width="100%"
        height={235}
        viewBox={`0 0 ${W} ${H}`}
      >
        {[0, 0.5, 1].map((fraccion) => {
          const y = escalaY(fraccion);
          const valor =
            maximo - (maximo - minimo) * fraccion;

          return (
            <React.Fragment key={fraccion}>
              <Line
                x1={IZQ}
                y1={y}
                x2={W - DER}
                y2={y}
                stroke="#E2E8F0"
                strokeWidth={1}
              />

              <SvgText
                x={IZQ - 6}
                y={y + 4}
                fontSize={10}
                fill="#64748B"
                textAnchor="end"
              >
                {valor.toFixed(1)}
              </SvgText>
            </React.Fragment>
          );
        })}

        <Line
          x1={IZQ}
          y1={ARRIBA}
          x2={IZQ}
          y2={H - ABAJO}
          stroke="#94A3B8"
        />

        <Line
          x1={IZQ}
          y1={H - ABAJO}
          x2={W - DER}
          y2={H - ABAJO}
          stroke="#94A3B8"
        />

        {[0, 0.5, 1].map((fraccion) => (
          <SvgText
            key={`x-${fraccion}`}
            x={
              IZQ +
              fraccion * (W - IZQ - DER)
            }
            y={H - 18}
            fontSize={10}
            fill="#64748B"
            textAnchor="middle"
          >
            {Math.round(
              maxEdad * fraccion
            )}
          </SvgText>
        ))}

        {grafica.referencia.length > 1 && (
          <Polyline
            points={grafica.referenciaSvg}
            fill="none"
            stroke="#E58C35"
            strokeWidth={2}
            strokeDasharray="5,4"
          />
        )}

        {grafica.mediciones.length > 1 && (
          <Polyline
            points={grafica.medicionesSvg}
            fill="none"
            stroke={color}
            strokeWidth={2.5}
          />
        )}

        {grafica.mediciones.map((p, index) => (
          <Circle
            key={index}
            cx={p.x}
            cy={p.y}
            r={4}
            fill={color}
            stroke="#FFFFFF"
            strokeWidth={1}
          />
        ))}
      </Svg>

      <Text style={styles.eje}>
        Edad en meses · Medición en {unidad}
      </Text>

      <View style={styles.leyenda}>
        <Text style={styles.mediciones}>
          ● Mediciones registradas
        </Text>

        {grafica.referencia.length > 1 && (
          <Text style={styles.referencia}>
            ┄ Mediana de referencia cargada
          </Text>
        )}
      </View>

      {grafica.versionMultiple && (
        <Text style={styles.aviso}>
          No se muestra la mediana porque
          existen referencias de distintas versiones.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },

  titulo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#14213D',
  },

  mensaje: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 19,
    paddingVertical: 15,
  },

  eje: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },

  leyenda: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  mediciones: {
    fontSize: 11,
    color: '#2769D8',
  },

  referencia: {
    fontSize: 11,
    color: '#BD7427',
  },

  aviso: {
    fontSize: 11,
    color: '#A16207',
    lineHeight: 17,
  },
});