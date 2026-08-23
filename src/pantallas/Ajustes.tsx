import { ScrollView, Text, View } from 'react-native';
import { DIVISAS, divisaPorId } from '../datos/divisas.ts';
import type { Ajustes as Config } from './Configuracion.tsx';
import { C, F, S } from '../ui/tema.ts';
import { Aparecer, Boton, Pulsable } from '../ui/componentes.tsx';
import Contador from '../ui/Contador.tsx';

/**
 * Las reglas de la casa: valen para todas las partidas siguientes, así que
 * montar una mesa nueva se reduce a escribir los nombres.
 */
export default function Ajustes({
  ajustes,
  onCambiar,
  onVolver,
}: {
  ajustes: Config;
  onCambiar: (a: Config) => void;
  onVolver: () => void;
}) {
  const set = <K extends keyof Config>(k: K, v: Config[K]) =>
    onCambiar({ ...ajustes, [k]: v });
  const moneda = divisaPorId(ajustes.monedaId);

  return (
    <ScrollView style={S.pantalla} contentContainerStyle={[S.contenido, { paddingTop: 12 }]}>
      <Aparecer>
        <Text style={[S.eyebrow, { color: C.laton }]}>Reglas de la casa</Text>
        <Text style={[S.cartel, { fontSize: 52, lineHeight: 54, marginTop: 6 }]}>
          Ajustes
        </Text>
        <Text style={[S.cuerpo, { marginTop: 8, marginBottom: 22 }]}>
          Se guardan en el móvil y valen para todas las partidas siguientes.
        </Text>
      </Aparecer>

      <Aparecer retraso={80}>
        <View style={[S.tarjeta, { marginBottom: 12 }]}>
          <Text style={S.eyebrow}>Divisa</Text>
          <Text style={[S.cuerpo, { fontSize: 12, marginTop: 4, marginBottom: 10 }]}>
            ¿En qué se paga?
          </Text>
          <View style={[S.fila, { flexWrap: 'wrap', gap: 8 }]}>
            {DIVISAS.map((d) => {
              const elegida = d.id === ajustes.monedaId;
              return (
                <Pulsable key={d.id} onPress={() => set('monedaId', d.id)}>
                  <View
                    style={{
                      flexDirection: 'row', alignItems: 'center', gap: 6,
                      paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999,
                      borderWidth: 1,
                      borderColor: elegida ? C.laton : C.linea,
                      backgroundColor: elegida ? C.latonTenue : C.superficieAlta,
                    }}
                  >
                    <Text style={{ fontSize: 15 }}>{d.emoji}</Text>
                    <Text
                      style={{
                        fontFamily: F.fuerte, fontSize: 13,
                        color: elegida ? C.laton : C.textoSuave,
                      }}
                    >
                      {d.plural}
                    </Text>
                  </View>
                </Pulsable>
              );
            })}
          </View>
        </View>
      </Aparecer>

      <Aparecer retraso={140}>
        <View style={[S.tarjeta, { marginBottom: 12 }]}>
          <Text style={S.eyebrow}>La partida</Text>
          <Contador
            etiqueta="Presupuesto por jugador"
            ayuda={`${moneda.plural} para toda la partida`}
            valor={ajustes.presupuesto} min={3} max={200}
            onChange={(v) => set('presupuesto', v)}
          />
          <Contador
            etiqueta="Huecos por jugador"
            ayuda="cuántos lotes hay que llenar"
            valor={ajustes.huecos} min={1} max={11}
            onChange={(v) => set('huecos', v)}
          />
          <Contador
            etiqueta="Subida mínima"
            ayuda="lo que hay que superar al líder"
            valor={ajustes.incremento} min={1} max={10}
            onChange={(v) => set('incremento', v)}
          />
          <Text style={[S.cuerpo, { fontSize: 12, marginTop: 8 }]}>
            Abrir un lote cuesta siempre 1 {moneda.singular}; eso no se toca.
          </Text>
        </View>
      </Aparecer>

      <Boton texto="← Volver al menú" onPress={onVolver} variante="fantasma" />
    </ScrollView>
  );
}
