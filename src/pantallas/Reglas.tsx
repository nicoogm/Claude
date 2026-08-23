import { ScrollView, Text, View } from 'react-native';
import { divisaPorId } from '../datos/divisas.ts';
import { C, F, S } from '../ui/tema.ts';
import { Aparecer, Boton } from '../ui/componentes.tsx';

const PASOS = (moneda: string, plural: string) => [
  {
    titulo: 'Sale un lote',
    texto: `Un nombre de la lista aparece en pantalla. Quien lleva el móvil lo lee en alto.`,
  },
  {
    titulo: 'Se puja por turnos',
    texto: `Le toca a uno: sube la puja o se planta. Abrir cuesta 1 ${moneda}; para superar al líder hay que ir por encima.`,
  },
  {
    titulo: 'Plantarse es solo por ese lote',
    texto: 'Sales de la puja actual, no de la partida. En el lote siguiente vuelves a entrar.',
  },
  {
    titulo: 'El último en pie se lo lleva',
    texto: 'Cuando todos los rivales se plantan, el lote es del que iba ganando y paga lo que pujó.',
  },
  {
    titulo: 'Nadie escurre el bulto',
    texto: `Si nadie ha pujado y solo queda uno por decidir, el lote es suyo por 1 ${moneda}. Los lotes malos también tienen dueño.`,
  },
  {
    titulo: 'Sin ${plural} te quedas fuera',
    texto: `Si no llegas a la puja mínima, no puedes seguir en ese lote. Y si a nadie le quedan ${plural}, los lotes que falten se reparten gratis por orden.`,
  },
  {
    titulo: 'Gana el que convenza',
    texto: 'Al final salen todas las plantillas juntas y el grupo decide cuál es la mejor. No hay puntos: hay debate.',
  },
];

export default function Reglas({
  monedaId,
  onVolver,
}: {
  monedaId: string;
  onVolver: () => void;
}) {
  const d = divisaPorId(monedaId);
  const pasos = PASOS(d.singular, d.plural);

  return (
    <ScrollView style={S.pantalla} contentContainerStyle={[S.contenido, { paddingTop: 12 }]}>
      <Aparecer>
        <Text style={[S.eyebrow, { color: C.laton }]}>En un minuto</Text>
        <Text style={[S.cartel, { fontSize: 52, lineHeight: 54, marginTop: 6 }]}>
          Cómo se juega
        </Text>
        <Text style={[S.cuerpo, { marginTop: 8, marginBottom: 22 }]}>
          Cada uno tiene sus {d.plural} y unos huecos que llenar. Se trata de
          montar la mejor plantilla sin arruinarse por el camino.
        </Text>
      </Aparecer>

      <View style={{ gap: 10 }}>
        {pasos.map((p, i) => (
          <Aparecer key={p.titulo} retraso={60 + i * 55}>
            <View style={[S.tarjeta, { paddingVertical: 14 }]}>
              <View style={[S.fila, { alignItems: 'flex-start', gap: 12 }]}>
                <Text style={[S.cifra, { fontSize: 15, color: C.laton, minWidth: 20 }]}>
                  {i + 1}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: F.extra, fontSize: 16, color: C.texto }}>
                    {p.titulo.replace('${plural}', d.plural)}
                  </Text>
                  <Text style={[S.cuerpo, { fontSize: 13, marginTop: 3 }]}>{p.texto}</Text>
                </View>
              </View>
            </View>
          </Aparecer>
        ))}
      </View>

      <View style={{ height: 16 }} />
      <Boton texto="← Volver al menú" onPress={onVolver} variante="fantasma" />
    </ScrollView>
  );
}
