import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import type { Partida } from '../motor/tipos.ts';
import { divisaPorId, gastadas, precio } from '../datos/divisas.ts';
import { C, F, S, colorJugador } from '../ui/tema.ts';
import { Aparecer, Boton, Pulsable } from '../ui/componentes.tsx';

/**
 * El veredicto: todas las plantillas juntas en una pantalla y alguien —quien
 * lleve el móvil, con el grupo debatiendo alrededor— señala la ganadora.
 */
export default function Votacion({
  partida,
  onVolver,
  onSalir,
}: {
  partida: Partida;
  onVolver: () => void;
  onSalir: () => void;
}) {
  const [ganadorId, setGanadorId] = useState<string | null>(null);
  const moneda = divisaPorId(partida.config.monedaId);

  if (ganadorId) {
    const i = partida.jugadores.findIndex((j) => j.id === ganadorId);
    const ganador = partida.jugadores[i];
    const color = colorJugador(i);
    return (
      <ScrollView style={S.pantalla} contentContainerStyle={[S.contenido, { paddingTop: 12 }]}>
        <Aparecer>
          <Text style={[S.eyebrow, { color: C.laton }]}>Veredicto</Text>
          <Text style={[S.cartel, { fontSize: 56, lineHeight: 58, marginTop: 6, color }]}>
            Gana {ganador.nombre}
          </Text>
        </Aparecer>

        <Aparecer retraso={140}>
          <View style={[S.tarjeta, { borderColor: color, marginTop: 20, paddingVertical: 18 }]}>
            {ganador.plantilla.map((a, k) => (
              <View
                key={k}
                style={[S.fila, { justifyContent: 'space-between', paddingVertical: 7 }]}
              >
                <Text style={{ fontFamily: F.extra, fontSize: 18, color: C.texto, flex: 1 }}>
                  {a.item.nombre}
                </Text>
                <Text style={[S.cifra, { fontSize: 14, color: C.textoSuave }]}>
                  {a.modo === 'relleno' ? 'gratis' : precio(a.precio, moneda)}
                </Text>
              </View>
            ))}
          </View>
        </Aparecer>

        <View style={{ height: 20 }} />
        <Aparecer retraso={220} style={{ gap: 10 }}>
          <Boton texto="Elegir otra" onPress={() => setGanadorId(null)} variante="secundario" />
          <Boton texto="Nueva partida" onPress={onSalir} />
        </Aparecer>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={S.pantalla} contentContainerStyle={[S.contenido, { paddingTop: 12 }]}>
      <Aparecer>
        <Text style={[S.eyebrow, { color: C.laton }]}>El veredicto</Text>
        <Text style={[S.cartel, { fontSize: 52, lineHeight: 54, marginTop: 6 }]}>
          ¿Cuál es la mejor?
        </Text>
        <Text style={[S.cuerpo, { marginTop: 8, marginBottom: 22 }]}>
          Debatidlo entre todos y tocad la plantilla ganadora.
        </Text>
      </Aparecer>

      <View style={{ gap: 10 }}>
        {partida.jugadores.map((j, i) => {
          const color = colorJugador(i);
          const gastado = j.plantilla.reduce((s, a) => s + a.precio, 0);
          return (
            <Aparecer key={j.id} retraso={60 + i * 70}>
              <Pulsable onPress={() => setGanadorId(j.id)}>
                <View style={[S.tarjeta, { borderColor: color }]}>
                  <View style={[S.fila, { justifyContent: 'space-between', marginBottom: 8 }]}>
                    <Text style={{ fontFamily: F.extra, fontSize: 18, color }}>{j.nombre}</Text>
                    <Text style={[S.cifra, { fontSize: 12, color: C.textoDebil }]}>
                      {precio(gastado, moneda)} {gastadas(moneda)}
                    </Text>
                  </View>
                  {j.plantilla.map((a, k) => (
                    <View
                      key={k}
                      style={[S.fila, { justifyContent: 'space-between', paddingVertical: 3 }]}
                    >
                      <Text style={{ fontFamily: F.fuerte, fontSize: 15, color: C.texto, flex: 1 }}>
                        {a.item.nombre}
                      </Text>
                      <Text style={[S.cifra, { fontSize: 13, color: C.textoDebil }]}>
                        {a.modo === 'relleno' ? 'gratis' : precio(a.precio, moneda)}
                      </Text>
                    </View>
                  ))}
                </View>
              </Pulsable>
            </Aparecer>
          );
        })}
      </View>

      <View style={{ height: 16 }} />
      <Boton texto="← Volver a los resultados" onPress={onVolver} variante="fantasma" />
    </ScrollView>
  );
}
