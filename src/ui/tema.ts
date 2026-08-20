import { Platform, StyleSheet } from 'react-native';

/**
 * Identidad visual: sala de subastas. Tinta azul muy oscura, latón para lo que
 * se remata y una condensada de cartel para los ítems que salen a puja.
 */
export const C = {
  tinta: '#080B13',
  fondo: '#0C111C',
  superficie: '#141B29',
  superficieAlta: '#1B2434',
  linea: '#28324a',
  lineaSuave: '#1E2738',
  laton: '#E8B65A',
  latonTenue: '#4A3A1C',
  texto: '#EDF1F8',
  textoSuave: '#8A97AD',
  textoDebil: '#5C6880',
  exito: '#4CC38A',
  peligro: '#E5533D',
  // Un color por jugador, todos legibles sobre la tinta.
  jugadores: ['#5FA8FF', '#F472B6', '#E8B65A', '#4CC38A', '#B79CFF',
              '#FF9A5A', '#4CD4E0', '#FF7A7A', '#A8D45A', '#F08CE8'],
};

export const colorJugador = (i: number) => C.jugadores[i % C.jugadores.length];

export const F = {
  cartel: 'BebasNeue_400Regular',
  texto: 'Manrope_500Medium',
  fuerte: 'Manrope_700Bold',
  extra: 'Manrope_800ExtraBold',
};

/** Elevación coherente; en web se traduce a box-shadow. */
export const sombra = (intensidad = 1) =>
  Platform.select({
    web: { boxShadow: `0 ${8 * intensidad}px ${24 * intensidad}px rgba(0,0,0,${0.35 * intensidad})` },
    default: {
      shadowColor: '#000',
      shadowOpacity: 0.35 * intensidad,
      shadowRadius: 12 * intensidad,
      shadowOffset: { width: 0, height: 6 * intensidad },
      elevation: 6 * intensidad,
    },
  }) as object;

export const S = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: C.fondo },
  contenido: { paddingHorizontal: 20, paddingBottom: 32 },

  cartel: {
    fontFamily: F.cartel,
    color: C.texto,
    fontSize: 44,
    letterSpacing: 1,
    lineHeight: 46,
  },
  titulo: { fontFamily: F.extra, color: C.texto, fontSize: 24, letterSpacing: -0.4 },
  cuerpo: { fontFamily: F.texto, color: C.textoSuave, fontSize: 14, lineHeight: 21 },
  eyebrow: {
    fontFamily: F.fuerte,
    color: C.textoDebil,
    fontSize: 11,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
  },
  cifra: {
    fontFamily: F.extra,
    color: C.texto,
    fontVariant: ['tabular-nums'],
  },

  tarjeta: {
    backgroundColor: C.superficie,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.lineaSuave,
    padding: 18,
  },

  fila: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pila: { gap: 12 },
  desactivado: { opacity: 0.32 },
});
