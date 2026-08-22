import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import type { Partida } from '../motor/tipos.ts';
import { C, F, S, colorJugador } from '../ui/tema.ts';
import { Aparecer, Boton, Pulsable } from '../ui/componentes.tsx';

type Recuento = Record<string, number>;

/**
 * Votación por turnos en el mismo móvil. Cada jugador vota la plantilla que
 * más le guste —la suya incluida, que para eso la ha montado— y si hay empate
 * se juega una segunda vuelta solo entre las empatadas.
 */
export default function Votacion({
  partida,
  onSalir,
}: {
  partida: Partida;
  onSalir: () => void;
}) {
  // `candidatos` se estrecha en cada ronda de desempate.
  const [candidatos, setCandidatos] = useState(partida.jugadores.map((j) => j.id));
  const [ronda, setRonda] = useState(1);
  const [turno, setTurno] = useState(0);
  const [votos, setVotos] = useState<Recuento>({});

  const indiceDe = (id: string) => partida.jugadores.findIndex((j) => j.id === id);
  const jugadorDe = (id: string) => partida.jugadores[indiceDe(id)];

  const votar = (id: string) => {
    setVotos((v) => ({ ...v, [id]: (v[id] ?? 0) + 1 }));
    setTurno((t) => t + 1);
  };

  const terminada = turno >= partida.jugadores.length;

  if (terminada) {
    const orden = [...candidatos].sort((a, b) => (votos[b] ?? 0) - (votos[a] ?? 0));
    const maximo = votos[orden[0]] ?? 0;
    const empatados = orden.filter((id) => (votos[id] ?? 0) === maximo);
    const hayEmpate = empatados.length > 1;

    const segundaVuelta = () => {
      setCandidatos(empatados);
      setVotos({});
      setTurno(0);
      setRonda((r) => r + 1);
    };

    return (
      <ScrollView style={S.pantalla} contentContainerStyle={[S.contenido, { paddingTop: 12 }]}>
        <Aparecer>
          <Text style={[S.eyebrow, { color: C.laton }]}>
            {ronda === 1 ? 'Recuento' : `Recuento · ronda ${ronda}`}
          </Text>
          <Text style={[S.cartel, { fontSize: 52, lineHeight: 54, marginTop: 6 }]}>
            {hayEmpate
              ? `Empate entre ${empatados.map((id) => jugadorDe(id).nombre).join(' y ')}`
              : `Gana ${jugadorDe(empatados[0]).nombre}`}
          </Text>
        </Aparecer>

        <View style={{ gap: 8, marginTop: 22 }}>
          {orden.map((id, k) => {
            const n = votos[id] ?? 0;
            return (
              <Aparecer key={id} retraso={120 + k * 90}>
                <View
                  style={[
                    S.tarjeta, S.fila,
                    {
                      justifyContent: 'space-between', paddingVertical: 14,
                      borderColor: n === maximo ? C.laton : C.lineaSuave,
                    },
                  ]}
                >
                  <Text style={{ fontFamily: F.extra, fontSize: 17, color: colorJugador(indiceDe(id)) }}>
                    {jugadorDe(id).nombre}
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
        <Aparecer retraso={220} style={{ gap: 10 }}>
          {hayEmpate && <Boton texto="Segunda vuelta →" onPress={segundaVuelta} />}
          <Boton
            texto="Nueva partida"
            onPress={onSalir}
            variante={hayEmpate ? 'fantasma' : 'principal'}
          />
        </Aparecer>
      </ScrollView>
    );
  }

  const votante = partida.jugadores[turno];
  return (
    <ScrollView style={S.pantalla} contentContainerStyle={[S.contenido, { paddingTop: 12 }]}>
      <Aparecer key={`${ronda}-${votante.id}`}>
        <Text style={[S.eyebrow, { color: C.laton }]}>
          {ronda === 1 ? '' : `Segunda vuelta · `}Voto {turno + 1} de {partida.jugadores.length}
        </Text>
        <Text style={[S.cartel, { fontSize: 52, lineHeight: 54, marginTop: 6 }]}>
          Turno de {votante.nombre}
        </Text>
        <Text style={[S.cuerpo, { marginTop: 8, marginBottom: 22 }]}>
          Pásale el móvil. ¿Cuál es la mejor plantilla? Vale votar la tuya, así
          que tendrás que defenderla.
        </Text>
      </Aparecer>

      <View style={{ gap: 10 }}>
        {candidatos.map((id, i) => {
          const j = jugadorDe(id);
          const color = colorJugador(indiceDe(id));
          const propia = id === votante.id;
          return (
            <Aparecer key={id} retraso={60 + i * 60}>
              <Pulsable onPress={() => votar(id)}>
                <View style={[S.tarjeta, { borderColor: color }]}>
                  <Text style={{ fontFamily: F.extra, fontSize: 17, color }}>
                    {j.nombre}
                    {propia ? ' · la tuya' : ''}
                  </Text>
                  <Text
                    style={{
                      fontFamily: F.texto, fontSize: 14, color: C.texto,
                      marginTop: 6, lineHeight: 21,
                    }}
                  >
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
