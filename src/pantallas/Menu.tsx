import { Text, View } from 'react-native';
import { C, F, S } from '../ui/tema.ts';
import { Aparecer, Pulsable } from '../ui/componentes.tsx';

type Entrada = {
  clave: string;
  titulo: string;
  ayuda: string;
  icono: string;
  destacada?: boolean;
};

const entradas = (continuar: string | null): Entrada[] => [
  ...(continuar
    ? [{ clave: 'continuar', titulo: 'Continuar partida', ayuda: continuar, icono: '⏳', destacada: true }]
    : []),
  {
    clave: 'jugar',
    titulo: continuar ? 'Partida nueva' : 'Jugar',
    ayuda: 'Montar la mesa y abrir la sala',
    icono: '🔨',
    destacada: !continuar,
  },
  { clave: 'reglas', titulo: 'Cómo se juega', ayuda: 'Las reglas en un minuto', icono: '📜' },
  { clave: 'ajustes', titulo: 'Ajustes', ayuda: 'Divisa, presupuesto y huecos', icono: '⚙️' },
];

export default function Menu({
  continuar,
  onIr,
}: {
  /** Resumen de la partida guardada, o null si no hay ninguna. */
  continuar: string | null;
  onIr: (clave: string) => void;
}) {
  const ENTRADAS = entradas(continuar);
  return (
    <View style={[S.pantalla, { paddingHorizontal: 20, justifyContent: 'center' }]}>
      <Aparecer desplazamiento={18}>
        <Text style={[S.eyebrow, { color: C.laton }]}>Draft por subasta</Text>
        <Text style={[S.cartel, { fontSize: 68, lineHeight: 66, marginTop: 8 }]}>
          Sala de{'\n'}subastas
        </Text>
        <Text style={[S.cuerpo, { marginTop: 12, marginBottom: 30 }]}>
          Un móvil, una mesa y un puñado de cabras. Sale un lote, se puja por
          turnos y el último en pie se lo lleva.
        </Text>
      </Aparecer>

      <View style={{ gap: 10 }}>
        {ENTRADAS.map((e, i) => (
          <Aparecer key={e.clave} retraso={100 + i * 70}>
            <Pulsable onPress={() => onIr(e.clave)}>
              <View
                style={[
                  S.tarjeta,
                  {
                    paddingVertical: e.destacada ? 20 : 15,
                    backgroundColor: e.destacada ? C.laton : C.superficie,
                    borderColor: e.destacada ? C.laton : C.lineaSuave,
                  },
                ]}
              >
                <View style={[S.fila, { gap: 14 }]}>
                  <Text style={{ fontSize: e.destacada ? 26 : 20 }}>{e.icono}</Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: F.extra,
                        fontSize: e.destacada ? 22 : 17,
                        color: e.destacada ? C.tinta : C.texto,
                      }}
                    >
                      {e.titulo}
                    </Text>
                    <Text
                      style={{
                        fontFamily: F.texto,
                        fontSize: 12,
                        marginTop: 2,
                        color: e.destacada ? C.latonTenue : C.textoDebil,
                      }}
                    >
                      {e.ayuda}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontFamily: F.extra,
                      fontSize: 18,
                      color: e.destacada ? C.tinta : C.textoDebil,
                    }}
                  >
                    →
                  </Text>
                </View>
              </View>
            </Pulsable>
          </Aparecer>
        ))}
      </View>
    </View>
  );
}
