import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import type { Partida } from '../motor/tipos.ts';
import { C, S, colorJugador } from '../ui/tema.ts';

export default function Resultados({
  partida,
  onVotar,
  onSalir,
}: {
  partida: Partida;
  onVotar: () => void;
  onSalir: () => void;
}) {
  const huboAuto = partida.jugadores.some((j) => j.plantilla.some((a) => a.auto));

  return (
    <ScrollView style={S.pantalla} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={S.titulo}>Plantillas finales</Text>
      <Text style={S.subtitulo}>
        {huboAuto
          ? 'Los ítems marcados con ✱ se repartieron al quedarse la mesa sin dinero.'
          : 'Draft completado. Que empiece el debate.'}
      </Text>

      {partida.jugadores.map((j, i) => {
        const color = colorJugador(i);
        const gastado = j.plantilla.reduce((s, a) => s + a.precio, 0);
        return (
          <View key={j.id} style={[S.tarjeta, { borderColor: color }]}>
            <View style={[S.fila, { justifyContent: 'space-between', marginBottom: 10 }]}>
              <Text style={{ color, fontSize: 20, fontWeight: '800' }}>{j.nombre}</Text>
              <Text style={{ color: C.textoSuave, fontSize: 13 }}>
                {gastado} € gastados · {j.dinero} € sin usar
              </Text>
            </View>
            {j.plantilla.map((a, k) => (
              <View
                key={k}
                style={[S.fila, { justifyContent: 'space-between', paddingVertical: 6 }]}
              >
                <Text style={{ color: C.texto, fontSize: 16, flex: 1 }}>
                  {a.item.nombre}
                  {a.auto ? ' ✱' : ''}
                </Text>
                <Text style={{ color: a.auto ? C.textoSuave : C.texto, fontWeight: '700' }}>
                  {a.auto ? 'gratis' : `${a.precio} €`}
                </Text>
              </View>
            ))}
            {j.plantilla.length === 0 && (
              <Text style={{ color: C.textoSuave }}>Se fue de vacío.</Text>
            )}
          </View>
        );
      })}

      <TouchableOpacity style={S.boton} onPress={onVotar}>
        <Text style={S.botonTexto}>Votar la mejor plantilla →</Text>
      </TouchableOpacity>
      <View style={{ height: 8 }} />
      <TouchableOpacity style={S.botonSec} onPress={onSalir}>
        <Text style={S.botonSecTexto}>Nueva partida</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
