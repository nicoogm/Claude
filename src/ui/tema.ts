import { StyleSheet } from 'react-native';

export const C = {
  fondo: '#0B1020',
  panel: '#161C31',
  panelAlt: '#1F2740',
  borde: '#2C3550',
  texto: '#F2F5FF',
  textoSuave: '#939CBB',
  acento: '#4ADE80',
  acentoOscuro: '#166534',
  aviso: '#FBBF24',
  peligro: '#F87171',
  jugadores: ['#60A5FA', '#F472B6', '#FBBF24', '#4ADE80', '#C084FC',
              '#FB923C', '#22D3EE', '#F87171', '#A3E635', '#E879F9'],
};

export const colorJugador = (indice: number) =>
  C.jugadores[indice % C.jugadores.length];

export const S = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: C.fondo, padding: 20 },
  titulo: { color: C.texto, fontSize: 28, fontWeight: '800', marginBottom: 4 },
  subtitulo: { color: C.textoSuave, fontSize: 15, marginBottom: 20 },
  etiqueta: {
    color: C.textoSuave,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  tarjeta: {
    backgroundColor: C.panel,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.borde,
    padding: 16,
    marginBottom: 12,
  },
  boton: {
    backgroundColor: C.acento,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  botonTexto: { color: '#06210F', fontSize: 17, fontWeight: '800' },
  botonSec: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: C.borde,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botonSecTexto: { color: C.texto, fontSize: 15, fontWeight: '700' },
  desactivado: { opacity: 0.35 },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
