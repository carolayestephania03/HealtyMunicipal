import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';

import { ScreenContainer } from '../../../components/layout/screen-container';
import { ScreenHeader } from '../../../components/layout/screen-header';
import { FamiliasCrudSection } from './familias-crud-section';
import { TelegramVinculacion } from './telegram-vinculacion';
import { TablaRegistros, EtiquetaEstado, AccionTabla, ResumenRegistros } from './tabla-registros';
import type { ColumnaTabla } from './tabla-registros';
import { colors } from '../../../constants/theme';
import { tutoresService } from '../services/tutores.service';
import type {
  Canal,
  CrearTutorDto,
  Parentesco,
  NinoBusqueda,
  EditarTutorDto,
  Id,
  NinoVinculado,
  RelacionTutorNino,
  TutorPerfil,
  TutorResumen,
  FiltroEstadoTabla,
} from '../types';

type Vista = 'buscar' | 'detalle' | 'editar' | 'nuevo';

function TextoDato({ etiqueta, valor }: { etiqueta: string; valor: unknown }) {
  const texto = valor == null || valor === '' ? 'No disponible' : String(valor);
  return (
    <View style={styles.dato}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <Text style={styles.valor}>{texto}</Text>
    </View>
  );
}

function Boton({
  texto,
  onPress,
  alterno = false,
  peligro = false,
  disabled = false,
  icono,
}: {
  texto: string;
  onPress: () => void;
  alterno?: boolean;
  peligro?: boolean;
  disabled?: boolean;
  icono?: React.ComponentProps<typeof Ionicons>['name'];
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={texto}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.boton,
        alterno && styles.botonAlterno,
        peligro && styles.botonPeligro,
        (disabled || pressed) && styles.botonAtenuado,
      ]}
    >
      {icono ? (
        <Ionicons
          name={icono}
          size={16}
          color={alterno ? colors.primary : '#FFFFFF'}
        />
      ) : null}
      <Text style={[styles.botonTexto, alterno && styles.botonTextoAlterno]}>
        {texto}
      </Text>
    </Pressable>
  );
}

function Entrada({
  etiqueta,
  valor,
  onChange,
  placeholder,
  keyboardType = 'default',
  multiline = false,
}: {
  etiqueta: string;
  valor: string;
  onChange: (texto: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'phone-pad' | 'email-address';
  multiline?: boolean;
}) {
  return (
    <View style={styles.campo}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMulti]}
        value={valor}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#8A9AB0"
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        multiline={multiline}
      />
    </View>
  );
}

function fechaNacimientoEdad(fechaISO: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(fechaISO || '');
  if (!match) return 'Edad no disponible';
  const anio = Number(match[1]);
  const mes = Number(match[2]);
  const dia = Number(match[3]);
  const nacimiento = new Date(anio, mes - 1, dia);
  const hoy = new Date();
  if (
    nacimiento.getFullYear() !== anio ||
    nacimiento.getMonth() !== mes - 1 ||
    nacimiento.getDate() !== dia || nacimiento > hoy
  ) return 'Edad no disponible';
  let meses = (hoy.getFullYear() - anio) * 12 + hoy.getMonth() - (mes - 1);
  if (hoy.getDate() < dia) meses--;
  if (meses < 12) return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
  const anios = Math.floor(meses / 12);
  return `${anios} ${anios === 1 ? 'año' : 'años'}`;
}

function obtenerRelacion(nino: NinoVinculado): RelacionTutorNino | null {
  return nino.TutorNino ?? nino.tutor_nino ?? null;
}

export function PadresFamiliasScreen() {
  const [vista, setVista] = useState<Vista>('buscar');
  const [seccion, setSeccion] = useState<'tutores' | 'familias'>('tutores');
  const [consulta, setConsulta] = useState('');
  const [textoAplicado, setTextoAplicado] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstadoTabla>('TODOS');
  const [pagina, setPagina] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [resumen, setResumen] = useState({total: 0, activos: 0, inactivos: 0, conHijos: 0});
  const [revision, setRevision] = useState(0);
  const [resultados, setResultados] = useState<TutorResumen[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null);

  const [perfil, setPerfil] = useState<TutorPerfil | null>(null);
  const [idPerfilSolicitado, setIdPerfilSolicitado] = useState<Id | null>(null);
  const [cargandoPerfil, setCargandoPerfil] = useState(false);
  const [errorPerfil, setErrorPerfil] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);
  const [confirmarEstado, setConfirmarEstado] = useState(false);

  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [canal, setCanal] = useState<Canal | 'NINGUNO'>('NINGUNO');
  const [dpi, setDpi] = useState('');
  const [asociando, setAsociando] = useState(false);
  const [busquedaNino, setBusquedaNino] = useState('');
  const [coincidenciasNinos, setCoincidenciasNinos] = useState<NinoBusqueda[]>([]);
  const [buscandoNino, setBuscandoNino] = useState(false);
  const [ninoSeleccionado, setNinoSeleccionado] = useState<NinoBusqueda | null>(null);
  const [parentesco, setParentesco] = useState<Parentesco>('MADRE');
  const [principal, setPrincipal] = useState(false);
  const [autorizarQr, setAutorizarQr] = useState(true);
  const [confirmarFinalizacion, setConfirmarFinalizacion] = useState<Id | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  // La primera carga muestra una tabla real, igual que Niños.
  // DPI permanece en POST y el servidor no devuelve identificaciones.
  const buscar = useCallback(() => {
    const q = consulta.trim();
    if (q && q.length < 2) {
      setErrorBusqueda('Ingrese al menos dos caracteres o un DPI completo.');
      return;
    }
    setErrorBusqueda(null);
    setPagina(1);
    setTextoAplicado(q);
    setRevision((n) => n + 1);
  }, [consulta]);

  useEffect(() => {
    if (seccion !== 'tutores' || vista !== 'buscar') return;
    let cancelado = false;
    const cargar = async () => {
      setBuscando(true);
      setErrorBusqueda(null);
      try {
        const respuesta = await tutoresService.tabla({
          q: textoAplicado,
          estado: filtroEstado,
          pagina,
          limite: 7,
        });
        if (cancelado) return;
        if (!respuesta.success || !respuesta.data || !Array.isArray(respuesta.data.registros)) {
          throw new Error('La API no devolvió un listado válido de responsables.');
        }
        setResultados(respuesta.data.registros);
        setResumen(respuesta.data.resumen);
        setTotalRegistros(respuesta.data.paginacion.total);
        setTotalPaginas(respuesta.data.paginacion.totalPaginas);
      } catch (error) {
        if (cancelado) return;
        setResultados([]);
        setErrorBusqueda(error instanceof Error ? error.message : 'No se pudo consultar tutores.');
      } finally {
        if (!cancelado) setBuscando(false);
      }
    };
    void cargar();
    return () => { cancelado = true; };
  }, [seccion, vista, textoAplicado, filtroEstado, pagina, revision]);

  const abrirPerfil = useCallback(async (id: Id, siguienteVista: Vista = 'detalle') => {
    setVista(siguienteVista);
    setIdPerfilSolicitado(id);
    setCargandoPerfil(true);
    setErrorPerfil(null);
    setPerfil(null);
    setConfirmarEstado(false);
    setAsociando(false);
    setConfirmarFinalizacion(null);
    try {
      const respuesta = await tutoresService.perfil(id);
      if (!respuesta.success || !respuesta.data) {
        throw new Error('La API no devolvió el tutor.');
      }
      setPerfil(respuesta.data);
      if (siguienteVista === 'editar') {
        const t = respuesta.data;
        setNombres(t.nombres);setApellidos(t.apellidos);
        setTelefono(t.telefono ?? '');setCorreo(t.correo ?? '');
        setCanal(t.canal_preferido === 'TELEGRAM' || t.canal_preferido === 'EMAIL' ? t.canal_preferido : 'NINGUNO');
      }
    } catch (err) {
      setErrorPerfil(err instanceof Error ? err.message : 'No se pudo consultar el tutor.');
    } finally {
      setCargandoPerfil(false);
    }
  }, []);

  const volver = () => {
    setVista('buscar');
    setRevision((n) => n + 1);
    setErrorGuardar(null);
    setConfirmarEstado(false);
  };

  const iniciarCreacion = () => {
    setNombres(''); setApellidos(''); setTelefono(''); setCorreo('');
    setCanal('NINGUNO'); setDpi('');
    setErrorGuardar(null); setMensaje(null); setVista('nuevo');
  };

  const iniciarEdicion = () => {
    if (!perfil) return;
    setNombres(perfil.nombres);
    setApellidos(perfil.apellidos);
    setTelefono(perfil.telefono ?? '');
    setCorreo(perfil.correo ?? '');
    setCanal(perfil.canal_preferido === 'TELEGRAM' && perfil.telegram_chat_id ? 'TELEGRAM' : perfil.canal_preferido === 'EMAIL' ? 'EMAIL' : 'NINGUNO');
    setErrorGuardar(null);
    setMensaje(null);
    setVista('editar');
  };

  const guardar = async () => {
    if (guardando || (vista === 'editar' && !perfil)) return;
    const nombresLimpios = nombres.trim();
    const apellidosLimpios = apellidos.trim();
    const correoLimpio = correo.trim().toLowerCase();
    const telefonoLimpio = telefono.trim();
    const dpiLimpio = dpi.trim();
    if (vista === 'nuevo' && dpiLimpio && !/^\d{13}$/.test(dpiLimpio)) {
      setErrorGuardar('El DPI debe contener exactamente 13 dígitos.');
      return;
    }

    if (nombresLimpios.length < 2 || nombresLimpios.length > 100 ||
      apellidosLimpios.length < 2 || apellidosLimpios.length > 100) {
      setErrorGuardar('Nombres y apellidos deben tener entre 2 y 100 caracteres.');
      return;
    }
    if (telefonoLimpio.length > 30) {
      setErrorGuardar('El teléfono supera el límite permitido.');
      return;
    }
    if (correoLimpio && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio)) {
      setErrorGuardar('Ingrese un correo electrónico válido.');
      return;
    }
    if (correoLimpio.length > 150) {
      setErrorGuardar('El correo electrónico no puede superar 150 caracteres.');
      return;
    }

    const payload: EditarTutorDto = {
      nombres: nombresLimpios,
      apellidos: apellidosLimpios,
      telefono: telefonoLimpio || null,
      correo: correoLimpio || null,
      canal_preferido: canal === 'NINGUNO' ? null : canal,
    };

    setGuardando(true);
    setErrorGuardar(null);
    try {
      const respuesta = vista === 'nuevo'
        ? await tutoresService.crear({
            ...payload,
            nombres: nombresLimpios,
            apellidos: apellidosLimpios,
            ...(dpiLimpio ? { dpi: dpiLimpio } : {}),
          } as CrearTutorDto)
        : await tutoresService.editar(perfil!.id_tutor, payload);
      if (!respuesta.success || !respuesta.data) throw new Error('La API no confirmó los cambios.');
      setPerfil(respuesta.data);
      setIdPerfilSolicitado(respuesta.data.id_tutor);
      setVista('detalle');
      setRevision((n) => n + 1);
      setMensaje(vista === 'nuevo' ? 'Responsable registrado correctamente.' : 'Datos actualizados.');
      // Sin conservar una copia del perfil en el listado de búsqueda.
      setResultados((actual) => actual.map((t) =>
        String(t.id_tutor) === String(respuesta.data.id_tutor)
          ? respuesta.data
          : t
      ));
    } catch (err) {
      setErrorGuardar(err instanceof Error ? err.message : 'No se pudieron guardar los cambios.');
    } finally {
      setGuardando(false);
    }
  };

  const buscarNinos = async () => {
    if (busquedaNino.trim().length < 2) {setErrorGuardar('Escriba al menos 2 caracteres para buscar un niño.');return;}
    setBuscandoNino(true); setErrorGuardar(null); setCoincidenciasNinos([]);
    try {
      const respuesta = await tutoresService.buscarNinos(busquedaNino);
      if (!respuesta.success || !Array.isArray(respuesta.data)) throw new Error('La API devolvió una respuesta inválida.');
      setCoincidenciasNinos(respuesta.data);
    } catch (e) {setErrorGuardar(e instanceof Error ? e.message : 'Error consultando niños.');}
    finally {setBuscandoNino(false);}
  };
  const vincularNino = async () => {
    if (!perfil || !ninoSeleccionado || guardando) return;
    setGuardando(true); setErrorGuardar(null);
    try {
      const respuesta = await tutoresService.asociarNino(perfil.id_tutor, ninoSeleccionado.id_nino, {
        parentesco, responsable_principal: principal, autorizado_consulta_qr: autorizarQr,
        fecha_inicio: [new Date().getFullYear(), String(new Date().getMonth()+1).padStart(2,'0'),
          String(new Date().getDate()).padStart(2,'0')].join('-'),
      });
      if (!respuesta.success) throw new Error(respuesta.message || 'Error al vincular niño.');
      setPerfil(respuesta.data); setRevision((n) => n + 1); setAsociando(false); setNinoSeleccionado(null);
      setBusquedaNino(''); setCoincidenciasNinos([]); setMensaje('Niño vinculado correctamente.');
    } catch(e) {setErrorGuardar(e instanceof Error ? e.message : 'No se pudo vincular el niño.');}
    finally {setGuardando(false);}
  };
  const finalizarVinculo = async (idNino: Id) => {
    if (!perfil || guardando) return;
    setGuardando(true); setErrorGuardar(null);
    try {
      const respuesta = await tutoresService.finalizarRelacion(perfil.id_tutor, idNino);
      if (!respuesta.success) throw new Error(respuesta.message || 'No se pudo finalizar la relación.');
      setPerfil(respuesta.data); setRevision((n) => n + 1); setConfirmarFinalizacion(null); setMensaje('Relación finalizada.');
    } catch(e) {setErrorGuardar(e instanceof Error ? e.message : 'No se pudo finalizar la relación.');}
    finally {setGuardando(false);}
  };

  const cambiarEstado = async () => {
    if (!perfil || guardando) return;
    setGuardando(true);
    setErrorPerfil(null);
    try {
      const respuesta = await tutoresService.cambiarEstado(perfil.id_tutor, !perfil.activo);
      if (!respuesta.success || !respuesta.data) throw new Error('La API no confirmó el cambio de estado.');
      setPerfil(respuesta.data);
      setRevision((n) => n + 1);
      setResultados((actual) => actual.map((t) =>
        String(t.id_tutor) === String(respuesta.data.id_tutor) ? respuesta.data : t
      ));
      setConfirmarEstado(false);
    } catch (err) {
      setErrorPerfil(err instanceof Error ? err.message : 'No se pudo cambiar el estado.');
    } finally {
      setGuardando(false);
    }
  };

  const columnasTutores: ColumnaTabla<TutorResumen>[] = [
    { key: 'id', titulo: 'ID', ancho: 75,
      render: (t) => <Text style={styles.secundario}>{t.id_tutor}</Text> },
    { key: 'nombre', titulo: 'Nombre del responsable', ancho: 275,
      render: (t) => <Text style={styles.nombre}>{t.nombres} {t.apellidos}</Text> },
    { key: 'telefono', titulo: 'Teléfono', ancho: 145,
      render: (t) => <Text style={styles.secundario}>{t.telefono || 'Sin teléfono'}</Text> },
    { key: 'correo', titulo: 'Correo electrónico', ancho: 245,
      render: (t) => <Text style={styles.secundario}>{t.correo || 'No registrado'}</Text> },
    { key: 'hijos', titulo: 'Hijos vinculados', ancho: 135,
      render: (t) => <Text style={styles.secundario}>{t.total_hijos ?? 0}</Text> },
    { key: 'estado', titulo: 'Estado', ancho: 135,
      render: (t) => <EtiquetaEstado activo={t.activo} /> },
    { key: 'acciones', titulo: 'Acciones', ancho: 115,
      render: (t) => <View style={styles.filaAcciones}>
        <AccionTabla icono="eye-outline" descripcion="Visualizar tutor" onPress={() => void abrirPerfil(t.id_tutor)} />
        <AccionTabla icono="create-outline" descripcion="Editar tutor" onPress={() => void abrirPerfil(t.id_tutor, 'editar')} />
      </View> },
  ];

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Padres y familias"
        description="Registre, busque, edite y gestione responsables, familias e hijos vinculados."
      />
      <View style={styles.filaAcciones}>
        <Boton texto="Padres y tutores" alterno={seccion !== 'tutores'}
          icono="people-outline" onPress={() => setSeccion('tutores')} />
        <Boton texto="Familias" alterno={seccion !== 'familias'}
          icono="home-outline" onPress={() => setSeccion('familias')} />
      </View>
      {seccion === 'familias' ? <FamiliasCrudSection /> : <>
      {vista === 'buscar' ? (
        <>
          <ResumenRegistros elementos={[
            {titulo:'Tutores registrados', cantidad:resumen.total, icono:'people-outline', color:'azul'},
            {titulo:'Tutores activos', cantidad:resumen.activos, icono:'checkmark-circle-outline', color:'verde'},
            {titulo:'Tutores inactivos', cantidad:resumen.inactivos, icono:'alert-circle-outline', color:'naranja'},
            {titulo:'Con hijos vinculados', cantidad:resumen.conHijos, icono:'person-outline', color:'azul'},
          ]} />
          <View style={styles.panel}>
            <View style={[styles.encabezadoPanel,{flexWrap:'wrap'}]}>
              <Ionicons name="list-outline" size={22} color={colors.primary} />
              <Text style={[styles.tituloPanel,{flex:1}]}>Listado de padres y tutores</Text>
              <Boton texto="Nuevo responsable" icono="person-add-outline" onPress={iniciarCreacion} />
              <Boton texto="Actualizar" alterno icono="refresh-outline" onPress={() => setRevision(n=>n+1)} />
            </View>
            <View style={styles.filaBusqueda}>
              <TextInput
                value={consulta}
                onChangeText={setConsulta}
                onSubmitEditing={buscar}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="search"
                maxLength={120}
                placeholder="Buscar por nombre, apellido o DPI completo..."
                placeholderTextColor="#8A9AB0"
                style={styles.inputBusqueda}
              />
              <Boton texto="Buscar" icono="search-outline" onPress={buscar} />
              {consulta.length > 0 ? <Boton texto="Limpiar" alterno onPress={() => {
                setConsulta(''); setTextoAplicado(''); setPagina(1); setRevision(n=>n+1);
              }} /> : null}
            </View>
            <View style={styles.filaAcciones}>
              <Text style={styles.etiqueta}>Estado del tutor:</Text>
              {(['TODOS','ACTIVOS','INACTIVOS'] as const).map(estado =>
                <Pressable key={estado} onPress={() => {setFiltroEstado(estado);setPagina(1);}}
                  style={[styles.opcionCanal,filtroEstado===estado && styles.opcionCanalActiva]}>
                  <Text style={styles.opcionTexto}>
                    {estado==='TODOS'?'Todos':estado==='ACTIVOS'?'Activos':'Inactivos'}
                  </Text>
                </Pressable>
              )}
            </View>
            {errorBusqueda ? <Text style={styles.error}>{errorBusqueda}</Text> : null}
            {buscando ? <View style={styles.cargando}>
              <ActivityIndicator color={colors.primary}/>
              <Text style={styles.ayuda}>Consultando responsables...</Text>
            </View> : <TablaRegistros
              columnas={columnasTutores}
              filas={resultados}
              obtenerId={(t) => String(t.id_tutor)}
              pagina={pagina}
              totalPaginas={totalPaginas}
              totalRegistros={totalRegistros}
              tamanioPagina={7}
              onCambiarPagina={setPagina}
              mensajeVacio="No se encontraron responsables con los filtros seleccionados."
            />}
            <Text style={styles.notaPrivacidad}>
              El listado no expone DPI ni valores cifrados. El DPI se consulta por coincidencia segura desde Express.
            </Text>
          </View>
        </>
      ) : (
        <>
          <View style={styles.filaAcciones}>
            <Boton texto="Volver a buscar" icono="arrow-back-outline" alterno onPress={volver} />
            {perfil && vista === 'detalle' ? (
              <Boton texto="Editar información" icono="create-outline" onPress={iniciarEdicion} />
            ) : null}
          </View>

          {vista === 'nuevo' ? (
            <View style={styles.panel}>
              <Text style={styles.tituloPanel}>Registrar padre, madre o tutor</Text>
              <Text style={styles.ayuda}>Ingrese los datos personales. El DPI es opcional, pero cuando se proporciona se procesa exclusivamente en el backend.</Text>
              <View style={styles.camposGrid}>
                <Entrada etiqueta="Nombres *" valor={nombres} onChange={setNombres}/>
                <Entrada etiqueta="Apellidos *" valor={apellidos} onChange={setApellidos}/>
                <Entrada etiqueta="DPI (13 dígitos)" valor={dpi} onChange={setDpi} keyboardType="phone-pad"/>
                <Entrada etiqueta="Teléfono" valor={telefono} onChange={setTelefono} keyboardType="phone-pad"/>
                <Entrada etiqueta="Correo electrónico" valor={correo} onChange={setCorreo} keyboardType="email-address"/>
              </View>
              <Text style={styles.etiqueta}>Canal preferido</Text>
              <View style={styles.filaOpciones}>
                {(['NINGUNO','EMAIL'] as const).map(opcion => (
                  <Pressable key={opcion} onPress={() => setCanal(opcion)}
                    style={[styles.opcionCanal, canal===opcion && styles.opcionCanalActiva]}>
                    <Text style={[styles.opcionTexto, canal===opcion && styles.opcionTextoActivo]}>{opcion==='NINGUNO'?'Sin preferencia':opcion}</Text>
                  </Pressable>
                ))}
              </View>
              {errorGuardar ? <Text style={styles.error}>{errorGuardar}</Text> : null}
              <View style={styles.filaAcciones}>
                <Boton texto="Cancelar" alterno disabled={guardando} onPress={volver}/>
                <Boton texto={guardando ? 'Guardando...' : 'Registrar responsable'}
                  icono="save-outline" disabled={guardando} onPress={() => void guardar()}/>
              </View>
            </View>
          ) : cargandoPerfil ? (
            <View style={styles.panel}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.ayuda}>Consultando responsable e hijos vinculados...</Text>
            </View>
          ) : errorPerfil && !perfil ? (
            <View style={styles.panel}>
              <Text style={styles.error}>{errorPerfil}</Text>
              <Boton texto="Reintentar" alterno onPress={() => {
                if (idPerfilSolicitado != null) void abrirPerfil(idPerfilSolicitado);
              }} />
            </View>
          ) : perfil && vista === 'detalle' ? (
            <>
              <View style={styles.panel}>
                {mensaje ? <Text style={{ color: colors.success, fontWeight: '700' }}>{mensaje}</Text> : null}
                <View style={styles.filaCabeceraDetalle}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={styles.tituloPanel}>{perfil.nombres} {perfil.apellidos}</Text>
                    <Text style={styles.secundario}>Identificador del tutor: {perfil.id_tutor}</Text>
                  </View>
                  <View style={[styles.etiquetaEstado, perfil.activo ? styles.etiquetaActivo : styles.etiquetaInactivo]}>
                    <Text style={styles.textoEstado}>{perfil.activo ? 'Activo' : 'Inactivo'}</Text>
                  </View>
                </View>
                <View style={styles.datosGrid}>
                  <TextoDato etiqueta="Teléfono" valor={perfil.telefono} />
                  <TextoDato etiqueta="Correo electrónico" valor={perfil.correo} />
                  <TextoDato etiqueta="Canal preferido" valor={perfil.canal_preferido} />
                  <TextoDato etiqueta="Telegram" valor={perfil.telegram_chat_id ? "Vinculado" : "No vinculado"} />
                </View>
                <View style={styles.filaAcciones}>
                  {confirmarEstado ? (
                    <>
                      <Text style={styles.ayuda}>
                        ¿Confirmar {perfil.activo ? 'desactivación' : 'activación'} del tutor?
                      </Text>
                      <Boton texto="Sí, confirmar" peligro disabled={guardando} onPress={() => void cambiarEstado()} />
                      <Boton texto="Cancelar" alterno onPress={() => setConfirmarEstado(false)} />
                    </>
                  ) : (
                    <Boton
                      texto={perfil.activo ? 'Desactivar tutor' : 'Activar tutor'}
                      alterno
                      disabled={guardando}
                      onPress={() => setConfirmarEstado(true)}
                    />
                  )}
                </View>
                {errorPerfil ? <Text style={styles.error}>{errorPerfil}</Text> : null}
              </View>

              <TelegramVinculacion idTutor={perfil.id_tutor} activo={perfil.activo} />

              <View style={styles.panel}>
                <View style={styles.encabezadoPanel}>
                  <Ionicons name="people-outline" size={22} color={colors.primary} />
                  <Text style={[styles.tituloPanel, { flex: 1 }]}>Hijos vinculados ({perfil.ninos?.length ?? 0})</Text>
                  <Boton texto="Asociar niño" icono="person-add-outline"
                    onPress={() => {setAsociando(v => !v);setErrorGuardar(null);setMensaje(null);}}/>
                </View>
                {asociando ? <View style={styles.vinculoPanel}>
                  <Text style={styles.subtitulo}>Vincular un niño al responsable</Text>
                  <View style={styles.filaBusqueda}>
                    <TextInput style={styles.inputBusqueda} value={busquedaNino}
                      onChangeText={v => {setBusquedaNino(v);setCoincidenciasNinos([]);setNinoSeleccionado(null);}}
                      placeholder="Código de expediente o nombre del niño" placeholderTextColor={colors.muted}/>
                    <Boton texto={buscandoNino ? 'Buscando...' : 'Buscar niño'} disabled={buscandoNino}
                      onPress={() => void buscarNinos()}/>
                  </View>
                  {coincidenciasNinos.map(n => <Pressable key={String(n.id_nino)}
                    onPress={() => setNinoSeleccionado(n)}
                    style={[styles.opcionCanal, String(ninoSeleccionado?.id_nino) === String(n.id_nino) && styles.opcionCanalActiva]}>
                    <Text style={styles.nombre}>{n.nombres} {n.apellidos}</Text>
                    <Text style={styles.secundario}>{n.codigo_expediente}</Text>
                  </Pressable>)}
                  {ninoSeleccionado ? <>
                    <Text style={styles.etiqueta}>Parentesco</Text>
                    <View style={styles.filaOpciones}>{(['MADRE','PADRE','TUTOR','OTRO'] as const).map(p =>
                      <Pressable key={p} style={[styles.opcionCanal,parentesco===p && styles.opcionCanalActiva]}
                        onPress={() => setParentesco(p)}><Text style={styles.opcionTexto}>{p}</Text></Pressable>)}</View>
                    <Pressable onPress={() => setPrincipal(v => !v)} style={styles.filaAcciones}>
                      <Ionicons name={principal ? 'checkbox-outline' : 'square-outline'} size={23} color={colors.primary}/>
                      <Text style={styles.secundario}>Responsable principal</Text>
                    </Pressable>
                    <Pressable onPress={() => setAutorizarQr(v => !v)} style={styles.filaAcciones}>
                      <Ionicons name={autorizarQr ? 'checkbox-outline' : 'square-outline'} size={23} color={colors.primary}/>
                      <Text style={styles.secundario}>Autorizado para consulta QR</Text>
                    </Pressable>
                    <View style={styles.filaAcciones}>
                      <Boton texto={guardando ? 'Vinculando...' : 'Confirmar vinculación'}
                        disabled={guardando} onPress={() => void vincularNino()}/>
                      <Boton texto="Cancelar" alterno onPress={() => setAsociando(false)}/>
                    </View>
                  </> : null}
                  {errorGuardar ? <Text style={styles.error}>{errorGuardar}</Text> : null}
                </View> : null}
                {!perfil.ninos || perfil.ninos.length === 0 ? (
                  <Text style={styles.ayuda}>Este tutor no tiene niños asociados.</Text>
                ) : perfil.ninos.map((nino) => {
                  const relacion = obtenerRelacion(nino);
                  return (
                    <View style={styles.filaHijo} key={String(nino.id_nino)}>
                      <View style={styles.infoHijo}>
                        <Text style={styles.nombre}>{nino.nombres} {nino.apellidos}</Text>
                        <Text style={styles.secundario}>
                          {nino.codigo_expediente} · {fechaNacimientoEdad(nino.fecha_nacimiento)}
                        </Text>
                        <Text style={styles.secundario}>
                          {relacion?.parentesco ?? 'Parentesco no disponible'}
                          {relacion?.responsable_principal ? ' · Responsable principal' : ''}
                          {relacion?.fecha_fin ? ' · Relación finalizada' : ' · Relación vigente'}
                        </Text>
                        <Text style={styles.secundario}>
                          Familia: {nino.familia?.codigo_familia ?? 'No disponible'}
                          {' · '}Comunidad: {nino.familia?.comunidad?.nombre ?? 'No disponible'}
                        </Text>
                      </View>
                      <View style={styles.filaAcciones}>
                        <Boton texto="Ver expediente" alterno icono="eye-outline"
                          onPress={() => router.push({pathname:'/ninos/[id]',params:{id:String(nino.id_nino)}})}/>
                        {!relacion?.fecha_fin ? (String(confirmarFinalizacion) === String(nino.id_nino) ? <>
                          <Boton texto="Confirmar finalización" peligro disabled={guardando}
                            onPress={() => void finalizarVinculo(nino.id_nino)}/>
                          <Boton texto="Cancelar" alterno onPress={() => setConfirmarFinalizacion(null)}/>
                        </> : <Boton texto="Finalizar vínculo" alterno
                          onPress={() => setConfirmarFinalizacion(nino.id_nino)}/>) : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            </>
          ) : perfil && vista === 'editar' ? (
            <View style={styles.panel}>
              <Text style={styles.tituloPanel}>Editar información del tutor</Text>
              <Text style={styles.ayuda}>
                Puede actualizar información personal y contacto. La identificación se gestiona de forma segura desde el backend.
              </Text>
              <View style={styles.camposGrid}>
                <Entrada etiqueta="Nombres *" valor={nombres} onChange={setNombres} />
                <Entrada etiqueta="Apellidos *" valor={apellidos} onChange={setApellidos} />
                <Entrada etiqueta="Teléfono" valor={telefono} onChange={setTelefono} keyboardType="phone-pad" />
                <Entrada etiqueta="Correo electrónico" valor={correo} onChange={setCorreo} keyboardType="email-address" />
              </View>
              <Text style={styles.etiqueta}>Canal preferido</Text>
              <View style={styles.filaOpciones}>
                {(['NINGUNO', 'EMAIL', 'TELEGRAM'] as const).filter(opcion => opcion !== 'TELEGRAM' || Boolean(perfil?.telegram_chat_id)).map((opcion) => (
                  <Pressable
                    key={opcion}
                    onPress={() => setCanal(opcion)}
                    style={[styles.opcionCanal, canal === opcion && styles.opcionCanalActiva]}
                  >
                    <Text style={[styles.opcionTexto, canal === opcion && styles.opcionTextoActivo]}>
                      {opcion === 'NINGUNO' ? 'Sin preferencia' : opcion}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {errorGuardar ? <Text style={styles.error}>{errorGuardar}</Text> : null}
              <View style={styles.filaAcciones}>
                <Boton texto="Cancelar" alterno disabled={guardando} onPress={() => setVista('detalle')} />
                <Boton texto={guardando ? 'Guardando...' : 'Guardar cambios'} icono="save-outline" disabled={guardando} onPress={() => void guardar()} />
              </View>
            </View>
          ) : null}
        </>
      )}
      </>}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 18,
    gap: 15,
  },
  encabezadoPanel: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tituloPanel: { color: colors.text, fontSize: 18, fontWeight: '800' },
  subtitulo: { color: colors.text, fontSize: 14, fontWeight: '700' },
  ayuda: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  secundario: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  nombre: { color: colors.text, fontSize: 14, fontWeight: '700' },
  filaBusqueda: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  inputBusqueda: {
    flex: 1, minWidth: 210, minHeight: 43, borderWidth: 1,
    borderColor: colors.border, borderRadius: 8, paddingHorizontal: 12,
    fontSize: 14, color: colors.text, backgroundColor: colors.surface,
  },
  boton: {
    backgroundColor: colors.primary, borderColor: colors.primary, borderWidth: 1,
    paddingHorizontal: 14, minHeight: 40, borderRadius: 8,
    flexDirection: 'row', gap: 7, justifyContent: 'center', alignItems: 'center',
  },
  botonAlterno: { backgroundColor: colors.surface },
  botonPeligro: { backgroundColor: colors.danger, borderColor: colors.danger },
  botonAtenuado: { opacity: 0.55 },
  botonTexto: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  botonTextoAlterno: { color: colors.primary },
  cargando: { alignItems: 'center', padding: 12, gap: 8 },
  vacio: { alignItems: 'center', paddingVertical: 34, gap: 10 },
  error: { color: colors.danger, fontSize: 13, lineHeight: 20 },
  advertencia: { color: colors.warning, fontSize: 12 },
  notaPrivacidad: { color: colors.muted, fontSize: 11, lineHeight: 17 },
  resultados: { gap: 8 },
  filaResultado: {
    borderTopWidth: 1, borderColor: colors.border,
    paddingTop: 12, paddingBottom: 8,
    flexDirection: 'row', gap: 12, alignItems: 'center', flexWrap: 'wrap',
  },
  avatar: {
    width: 39, height: 39, borderRadius: 20,
    backgroundColor: colors.infoLight, alignItems: 'center', justifyContent: 'center',
  },
  resultadoTexto: { flex: 1, minWidth: 190, gap: 5 },
  filaAcciones: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 9 },
  filaCabeceraDetalle: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  etiquetaEstado: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  etiquetaActivo: { backgroundColor: colors.successLight },
  etiquetaInactivo: { backgroundColor: colors.dangerLight },
  textoEstado: { fontSize: 12, fontWeight: '700', color: colors.text },
  datosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  dato: { flexGrow: 1, flexBasis: 220, gap: 5, paddingVertical: 4 },
  etiqueta: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  valor: { color: colors.text, fontSize: 14, fontWeight: '600' },
  filaHijo: {
    flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center',
    justifyContent: 'space-between', gap: 12,
    paddingVertical: 13, borderTopWidth: 1, borderColor: colors.border,
  },
  infoHijo: { flex: 1, minWidth: 220, gap: 5 },
  campo: { minWidth: 210, flexGrow: 1, flexBasis: 260, gap: 5 },
  camposGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'flex-start' },
  input: {
    minHeight: 42, borderWidth: 1, borderColor: colors.border,
    borderRadius: 8, backgroundColor: colors.surface,
    color: colors.text, paddingHorizontal: 12, fontSize: 14,
  },
  inputMulti: { minHeight: 70 },
  filaOpciones: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  opcionCanal: {
    borderRadius: 8, borderWidth: 1, borderColor: colors.border,
    paddingVertical: 9, paddingHorizontal: 12,
  },
  opcionCanalActiva: { borderColor: colors.primary, backgroundColor: colors.infoLight },
  opcionTexto: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  opcionTextoActivo: { color: colors.primary },
  vinculoPanel: {padding:14,gap:10,borderWidth:1,borderColor:colors.border,borderRadius:10,backgroundColor:colors.canvas},
});
