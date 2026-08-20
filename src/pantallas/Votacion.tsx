import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import type { Partida } from '../motor/tipos.ts';
import { C, F, S, colorJugador } from '../ui/tema.ts';
import { Aparecer, Boton, Pulsable } from '../ui/componentes.tsx';

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

  const votar = (id: string) => {
    setVotos((v) => ({ ...v, [id]: (v[id] ?? 0) + 1 }));
    setTurno((t) => t + 1);
  };

  if (turno >= partida.jugadores.length) {
    const orden = [...partida.jugadores].sort(
      (a, b) => (votos[b.id] ?? 0) - (votos[a.id] ?? 0),
    );
    const maximo = votos[orden[0].id] ?? 0;
    const ganadores = orden.filter((j) => (votos[j.id] ?? 0) === maximo);

    return (
      <ScrollView style={S.pantalla} contentContainerStyle={[S.contenido, { paddingTop: 12 }]}>
        <Aparecer>
          <Text style={[S.eyebrow, { color: C.laton }]}>Recuento</Text>
          <Text style={[S.cartel, { fontSize: 52, lineHeight: 54, marginTop: 6 }]}>
            {ganadores.length > 1
              ? `Empate: ${ganadores.map((j) => j.nombre).join(' y ')}`
              : `Gana ${ganadores[0].nombre}`}
          </Text>
        </Aparecer>

        <View style={{ gap: 8, marginTop: 22 }}>
          {orden.map((j, k) => {
            const i = partida.jugadores.indexOf(j);
            const n = votos[j.id] ?? 0;
            return (
              <Aparecer key={j.id} retraso={120 + k * 90}>
                <View
                  style={[
                    S.tarjeta,
                    S.fila,
                    {
                      justifyContent: 'space-between',
                      paddingVertical: 14,
                      borderColor: n === maximo ? C.laton : C.lineaSuave,
                    },
                  ]}
                >
                  <Text style={{ fontFamily: F.extra, fontSize: 17, color: colorJugador(i) }}>
                    {j.nombre}
                  </Text>
                  <Text style={[S.cifra, { fontSize: 17 }]}>
                    {n} {n === 1 ? 'voto' : 'votos'}
                  </Text>
                </View>
              </Aparecer>
            );
          })}
        </View>

        <View style={{ height: 20 }} />
        <Boton texto="Nueva partida" onPress={onSalir} />
      </ScrollView>
    );
  }

  const votante = partida.jugadores[turno];
  return (
    <ScrollView style={S.pantalla} contentContainerStyle={[S.contenido, { paddingTop: 12 }]}>
      <Aparecer key={votante.id}>
        <Text style={[S.eyebrow, { color: C.laton }]}>
          Voto {turno + 1} de {partida.jugadores.length}
        </Text>
        <Text style={[S.cartel, { fontSize: 52, lineHeight: 54, marginTop: 6 }]}>
          Turno de {votante.nombre}
        </Text>
        <Text style={[S.cuerpo, { marginTop: 8, marginBottom: 22 }]}>
          Pásale el móvil. ¿Qué plantilla es la mejor? No vale votarse a uno mismo.
        </Text>
      </Aparecer>

      <View style={{ gap: 10 }}>
        {partida.jugadores.map((j, i) => {
          const propio = j.id === votante.id;
          return (
            <Aparecer key={j.id} retraso={60 + i * 60}>
              <Pulsable onPress={() => votar(j.id)} disabled={propio}>
                <View
                  style={[
                    S.tarjeta,
                    { borderColor: propio ? C.lineaSuave : colorJugador(i) },
                    propio && S.desactivado,
                  ]}
                >
                  <Text style={{ fontFamily: F.extra, fontSize: 17, color: colorJugador(i) }}>
                    {j.nombre}
                    {propio ? ' · tú' : ''}
                  </Text>
                  <Text style={{ fontFamily: F.texto, fontSize: 14, color: C.texto, marginTop: 6, lineHeight: 21 }}>
                    {j.plantilla.map((a) => a.item.nombre).join('  ·  ') || '—'}
                  </Text>
                </View>
              </Pulsable>
            </Aparecer>
          );
        })}
      </View>
    </ScrollView>
  );
}
