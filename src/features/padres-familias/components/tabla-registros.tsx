import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../../constants/theme';

export type ColumnaTabla<T> = {
  key: string;
  titulo: string;
  ancho: number;
  render: (fila: T) => React.ReactNode;
};

type Props<T> = {
  columnas: ColumnaTabla<T>[];
  filas: T[];
  obtenerId: (fila: T) => string;
  pagina: number;
  totalPaginas: number;
  totalRegistros: number;
  tamanioPagina: number;
  onCambiarPagina: (pagina: number) => void;
  mensajeVacio?: string;
};

export function TablaRegistros<T>({
  columnas, filas, obtenerId, pagina, totalPaginas,
  totalRegistros, tamanioPagina, onCambiarPagina,
  mensajeVacio = 'No se encontraron registros.',
}: Props<T>) {
  const inicio = totalRegistros ? (pagina - 1) * tamanioPagina + 1 : 0;
  const fin = Math.min(pagina * tamanioPagina, totalRegistros);
  const paginas = Array.from({ length: Math.min(3, totalPaginas) }, (_, i) => {
    const primera = Math.max(1, Math.min(pagina - 1, totalPaginas - 2));
    return primera + i;
  });

  return (
    <View style={styles.contenedor}>
      <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={styles.horizontal}>
        <View>
          <View style={styles.cabecera}>
            {columnas.map((col) => (
              <View key={col.key} style={[styles.celda, { width: col.ancho }]}>
                <Text style={styles.tituloColumna}>{col.titulo}</Text>
              </View>
            ))}
          </View>
          {filas.length === 0 ? (
            <View style={styles.vacio}><Text style={styles.vacioTexto}>{mensajeVacio}</Text></View>
          ) : filas.map((fila, i) => (
            <View key={obtenerId(fila)} style={[styles.fila, i % 2 === 1 && styles.filaAlterna]}>
              {columnas.map((col) => (
                <View key={col.key} style={[styles.celda, { width: col.ancho }]}>
                  {col.render(fila)}
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.pie}>
        <Text style={styles.contador}>
          Mostrando {inicio}–{fin} de {totalRegistros} registros
        </Text>
        <View style={styles.paginas}>
          <Pagina icono="chevron-back" deshabilitado={pagina <= 1}
            onPress={() => onCambiarPagina(pagina - 1)} />
          {paginas.map((numero) => (
            <Pagina key={numero} numero={numero} activo={numero === pagina}
              onPress={() => onCambiarPagina(numero)} />
          ))}
          <Pagina icono="chevron-forward" deshabilitado={pagina >= totalPaginas}
            onPress={() => onCambiarPagina(pagina + 1)} />
        </View>
      </View>
    </View>
  );
}

function Pagina({numero, icono, activo, deshabilitado, onPress}: {
  numero?: number;
  icono?: 'chevron-back' | 'chevron-forward';
  activo?: boolean;
  deshabilitado?: boolean;
  onPress: () => void;
}) {
  return <Pressable disabled={deshabilitado} accessibilityRole="button"
    accessibilityLabel={numero ? `Página ${numero}` : icono === 'chevron-back' ? 'Página anterior' : 'Página siguiente'}
    onPress={onPress} style={[styles.pagina, activo && styles.paginaActiva, deshabilitado && styles.deshabilitado]}>
    {icono ? <Ionicons name={icono} size={17} color={activo ? '#FFFFFF' : colors.primary}/> :
      <Text style={[styles.textoPagina, activo && styles.textoPaginaActivo]}>{numero}</Text>}
  </Pressable>;
}

export function AccionTabla({ icono, descripcion, onPress, peligro = false }: {
  icono: 'eye-outline' | 'create-outline' | 'power-outline';
  descripcion: string;
  onPress: () => void;
  peligro?: boolean;
}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={descripcion}
    onPress={onPress} style={[styles.accion, peligro && styles.accionPeligro]}>
    <Ionicons name={icono} size={19} color={peligro ? colors.danger : colors.primary}/>
  </Pressable>;
}

export function EtiquetaEstado({ activo }: { activo: boolean }) {
  return <View style={[styles.etiqueta, activo ? styles.etiquetaVerde : styles.etiquetaGris]}>
    <View style={[styles.punto, { backgroundColor: activo ? colors.success : colors.muted }]}/>
    <Text style={[styles.etiquetaTexto, {color: activo ? colors.success : colors.muted}]}>
      {activo ? 'Activo' : 'Inactivo'}
    </Text>
  </View>;
}

export function ResumenRegistros({ elementos }: {
  elementos: Array<{
    titulo: string; cantidad: number | string;
    icono: 'people-outline' | 'checkmark-circle-outline' | 'alert-circle-outline' | 'home-outline' | 'person-outline' | 'business-outline';
    color: 'azul' | 'verde' | 'naranja';
  }>;
}) {
  return <View style={styles.resumen}>
    {elementos.map((item) => {
      const tono = item.color === 'verde' ? colors.success : item.color === 'naranja' ? colors.warning : colors.primary;
      const fondo = item.color === 'verde' ? colors.successLight : item.color === 'naranja' ? colors.warningLight : colors.infoLight;
      return <View key={item.titulo} style={[styles.tarjeta, {backgroundColor: fondo}]}>
        <View style={[styles.circulo,{backgroundColor: colors.surface}]}>
          <Ionicons name={item.icono} size={25} color={tono}/>
        </View>
        <View style={styles.tarjetaInfo}>
          <Text style={styles.cantidad}>{item.cantidad}</Text>
          <Text style={styles.tarjetaTitulo}>{item.titulo}</Text>
        </View>
      </View>;
    })}
  </View>;
}

const styles = StyleSheet.create({
  contenedor: {gap:14},
  horizontal: {flexGrow:1},
  cabecera: { flexDirection:'row', backgroundColor:'#EDF3F9', borderColor:colors.border, borderWidth:1, borderTopLeftRadius:9,borderTopRightRadius:9 },
  tituloColumna: {fontWeight:'700', fontSize:12, color:colors.text},
  celda:{paddingVertical:14,paddingHorizontal:12,justifyContent:'center'},
  fila:{flexDirection:'row',minHeight:65,borderBottomWidth:1,borderLeftWidth:1,borderRightWidth:1,borderColor:colors.border,backgroundColor:colors.surface},
  filaAlterna:{backgroundColor:'#FAFCFF'},
  vacio:{padding:26,borderWidth:1,borderColor:colors.border,alignItems:'center',minWidth:300},
  vacioTexto:{fontSize:13,color:colors.muted},
  pie:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',alignItems:'center',gap:12},
  contador:{fontSize:12,color:colors.muted},
  paginas:{flexDirection:'row',gap:6,alignItems:'center'},
  pagina:{minWidth:35,minHeight:38,paddingHorizontal:8,borderWidth:1,borderColor:colors.border,borderRadius:8,alignItems:'center',justifyContent:'center'},
  paginaActiva:{backgroundColor:colors.primary,borderColor:colors.primary},
  deshabilitado:{opacity:0.4},
  textoPagina:{fontSize:12,fontWeight:'700',color:colors.primary},
  textoPaginaActivo:{color:'#FFFFFF'},
  accion:{width:38,height:38,alignItems:'center',justifyContent:'center',backgroundColor:colors.infoLight,borderRadius:8},
  accionPeligro:{backgroundColor:colors.dangerLight},
  etiqueta:{alignSelf:'flex-start',flexDirection:'row',alignItems:'center',gap:6,paddingVertical:6,paddingHorizontal:10,borderRadius:16},
  etiquetaVerde:{backgroundColor:colors.successLight},
  etiquetaGris:{backgroundColor:'#EEF2F7'},
  punto:{width:7,height:7,borderRadius:4},
  etiquetaTexto:{fontSize:12,fontWeight:'700'},
  resumen:{flexDirection:'row',flexWrap:'wrap',gap:14},
  tarjeta:{flexGrow:1,flexBasis:220,minWidth:185,borderRadius:13,padding:18,minHeight:105,flexDirection:'row',alignItems:'center',gap:14,borderWidth:1,borderColor:colors.border},
  circulo:{width:55,height:55,borderRadius:30,alignItems:'center',justifyContent:'center'},
  tarjetaInfo:{gap:5,flex:1},
  cantidad:{fontSize:29,fontWeight:'800',color:colors.text},
  tarjetaTitulo:{fontSize:12,color:colors.muted},
});
