import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import type { Partida } from '../motor/tipos.ts';
import { C, S, colorJugador } from '../ui/tema.ts';

/**
 * Votación por turnos en el mismo móvil: cada jugador vota la mejor plantilla
 * ajena (no puede votarse a sí mismo) y al final se muestra el recuento.
 */
export default function Votacion({
  partida,
  onSalir,
}: {
  partida: Partida;
  onSalir: () => void;
}) {
  const [turno, setTurno] = useState(0);
  const [votos, setVotos] = useState<Record<string, number>>({});

  const votante = partida.jugadores[turno];
  const terminada = turno >= partida.jugadores.length;

  const votar = (id: string) => {
    setVotos((v) => ({ ...v, [id]: (v[id] ?? 0) + 1 }));
    setTurno((t) => t + 1);
  };

  if (terminada) {
    const orden = [...partida.jugadores].sort(
      (a, b) => (votos[b.id] ?? 0) - (votos[a.id] ?? 0),
    );
    const maximo = votos[orden[0].id] ?? 0;
    const ganadores = orden.filter((j) => (votos[j.id] ?? 0) === maximo);

    return (
      <ScrollView style={S.pantalla} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={S.titulo}>Recuento</Text>
        <Text style={S.subtitulo}>
          {ganadores.length > 1
            ? `Empate entre ${ganadores.map((j) => j.nombre).join(' y ')}.`
            : `Gana ${ganadores[0].nombre}.`}
        </Text>
        {orden.map((j) => {
          const i = partida.jugadores.indexOf(j);
          return (
            <View
              key={j.id}
              style={[S.tarjeta, S.fila, { justifyContent: 'space-between' }]}
            >
              <Text style={{ color: colorJugador(i), fontSize: 18, fontWeight: '700' }}>
                {j.nombre}
              </Text>
              <Text style={{ color: C.texto, fontSize: 18, fontWeight: '800' }}>
                {votos[j.id] ?? 0} {(votos[j.id] ?? 0) === 1 ? 'voto' : 'votos'}
              </Text>
            </View>
          );
        })}
        <TouchableOpacity style={S.boton} onPress={onSalir}>
          <Text style={S.botonTexto}>Nueva partida</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={S.pantalla} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={S.titulo}>Turno de {votante.nombre}</Text>
      <Text style={S.subtitulo}>
        Pásale el móvil. ¿Qué plantilla es la mejor? No vale votarse a uno mismo.
      </Text>

      {partida.jugadores.map((j, i) => {
        const propio = j.id === votante.id;
        return (
          <TouchableOpacity
            key={j.id}
            disabled={propio}
            onPress={() => votar(j.id)}
            style={[S.tarjeta, { borderColor: colorJugador(i) }, propio && S.desactivado]}
          >
            <Text style={{ color: colorJugador(i), fontSize: 18, fontWeight: '800' }}>
              {j.nombre}
              {propio ? ' (tú)' : ''}
            </Text>
            <Text style={{ color: C.texto, marginTop: 6, fontSize: 15 }}>
              {j.plantilla.map((a) => a.item.nombre).join(' · ') || '—'}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
