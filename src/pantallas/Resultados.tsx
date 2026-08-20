import { ScrollView, Text, View } from 'react-native';
import type { Partida } from '../motor/tipos.ts';
import { divisaPorId, precio } from '../datos/divisas.ts';
import { C, F, S, colorJugador } from '../ui/tema.ts';
import { Aparecer, Boton } from '../ui/componentes.tsx';

export default function Resultados({
  partida,
  onVotar,
  onSalir,
}: {
  partida: Partida;
  onVotar: () => void;
  onSalir: () => void;
}) {
  const moneda = divisaPorId(partida.config.monedaId);
  const huboAuto = partida.jugadores.some((j) => j.plantilla.some((a) => a.auto));

  return (
    <ScrollView style={S.pantalla} contentContainerStyle={[S.contenido, { paddingTop: 12 }]}>
      <Aparecer>
        <Text style={[S.eyebrow, { color: C.laton }]}>Sala cerrada</Text>
        <Text style={[S.cartel, { fontSize: 52, lineHeight: 54, marginTop: 6 }]}>
          Las plantillas
        </Text>
        <Text style={[S.cuerpo, { marginTop: 8, marginBottom: 22 }]}>
          {huboAuto
            ? 'Los lotes con ✱ se repartieron al quedarse la mesa sin dinero.'
            : 'Draft completado. Que empiece el debate.'}
        </Text>
      </Aparecer>

      <View style={{ gap: 12 }}>
        {partida.jugadores.map((j, i) => {
          const color = colorJugador(i);
          const gastado = j.plantilla.reduce((s, a) => s + a.precio, 0);
          return (
            <Aparecer key={j.id} retraso={80 + i * 90}>
              <View style={[S.tarjeta, { borderColor: color, paddingVertical: 16 }]}>
                <View style={[S.fila, { justifyContent: 'space-between', marginBottom: 12 }]}>
                  <Text style={{ fontFamily: F.extra, fontSize: 19, color }}>{j.nombre}</Text>
                  <Text style={[S.cifra, { fontSize: 13, color: C.textoDebil }]}>
                    {precio(gastado, moneda)} gastadas · {precio(j.dinero, moneda)} sin usar
                  </Text>
                </View>
                <View style={{ gap: 2 }}>
                  {j.plantilla.map((a, k) => (
                    <View key={k} style={[S.fila, { justifyContent: 'space-between', paddingVertical: 5 }]}>
                      <Text style={{ fontFamily: F.fuerte, fontSize: 15, color: C.texto, flex: 1 }}>
                        {a.item.nombre}
                        {a.auto ? ' ✱' : ''}
                      </Text>
                      <Text
                        style={[
                          S.cifra,
                          { fontSize: 14, color: a.auto ? C.textoDebil : C.laton },
                        ]}
                      >
                        {a.auto ? 'gratis' : precio(a.precio, moneda)}
                      </Text>
                    </View>
                  ))}
                  {j.plantilla.length === 0 && (
                    <Text style={S.cuerpo}>Se fue de vacío.</Text>
                  )}
                </View>
              </View>
            </Aparecer>
          );
        })}
      </View>

      <View style={{ height: 20 }} />
      <Aparecer retraso={200} style={{ gap: 10 }}>
        <Boton texto="Votar la mejor plantilla →" onPress={onVotar} />
        <Boton texto="Nueva partida" onPress={onSalir} variante="fantasma" />
      </Aparecer>
    </ScrollView>
  );
}
