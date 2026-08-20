import { ScrollView, Text, View } from 'react-native';
import { TEMAS } from '../datos/temas.ts';
import type { Tema } from '../motor/tipos.ts';
import { C, F, S } from '../ui/tema.ts';
import { Aparecer, Boton, Pulsable } from '../ui/componentes.tsx';

export default function SeleccionTema({
  itemsNecesarios,
  onElegir,
  onVolver,
}: {
  itemsNecesarios: number;
  onElegir: (t: Tema) => void;
  onVolver: () => void;
}) {
  return (
    <ScrollView style={S.pantalla} contentContainerStyle={[S.contenido, { paddingTop: 12 }]}>
      <Aparecer>
        <Text style={[S.eyebrow, { color: C.laton }]}>Catálogo</Text>
        <Text style={[S.cartel, { fontSize: 52, lineHeight: 54, marginTop: 6 }]}>
          ¿De qué va el draft?
        </Text>
        <Text style={[S.cuerpo, { marginTop: 8, marginBottom: 22 }]}>
          De la lista que elijáis se sortean {itemsNecesarios} lotes para esta partida.
        </Text>
      </Aparecer>

      <View style={{ gap: 10 }}>
        {TEMAS.map((t, i) => {
          const suficiente = t.items.length >= itemsNecesarios;
          return (
            <Aparecer key={t.id} retraso={60 + i * 45}>
              <Pulsable onPress={() => onElegir(t)} disabled={!suficiente}>
                <View style={[S.tarjeta, { paddingVertical: 15 }, !suficiente && S.desactivado]}>
                  <View style={[S.fila, { justifyContent: 'space-between' }]}>
                    <Text style={{ fontFamily: F.extra, fontSize: 17, color: C.texto, flex: 1 }}>
                      {t.titulo}
                    </Text>
                    <Text style={[S.cifra, { fontSize: 13, color: C.laton }]}>
                      {suficiente ? `${itemsNecesarios} de ${t.items.length}` : `solo ${t.items.length}`}
                    </Text>
                  </View>
                  <Text
                    numberOfLines={1}
                    style={{ fontFamily: F.texto, fontSize: 12, color: C.textoDebil, marginTop: 5 }}
                  >
                    {t.items.slice(0, 4).map((x) => x.nombre).join('  ·  ')}…
                  </Text>
                </View>
              </Pulsable>
            </Aparecer>
          );
        })}
      </View>

      <View style={{ height: 16 }} />
      <Boton texto="← Volver" onPress={onVolver} variante="fantasma" />
    </ScrollView>
  );
}
