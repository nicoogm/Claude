import { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { DIVISAS, divisaPorId } from '../datos/divisas.ts';
import { guardarAjustes, leerAjustes } from '../estado/preferencias.ts';
import { C, F, S, colorJugador } from '../ui/tema.ts';
import { Aparecer, Boton, Pulsable } from '../ui/componentes.tsx';

export type Ajustes = {
  nombres: string[];
  presupuesto: number;
  huecos: number;
  pujaMin: number;
  incremento: number;
  monedaId: string;
};

const AJUSTES_INICIALES: Ajustes = {
  nombres: ['', '', ''],
  presupuesto: 20,
  huecos: 3,
  pujaMin: 1,
  incremento: 1,
  monedaId: 'cabras',
};

/** Nombre por defecto para quien no escriba el suyo. */
export const nombreDe = (nombre: string, i: number) =>
  nombre.trim() || `Jugador ${i + 1}`;

function Contador({
  etiqueta, ayuda, valor, min, max, onChange,
}: {
  etiqueta: string; ayuda?: string; valor: number; min: number; max: number;
  onChange: (v: number) => void;
}) {
  const paso = (d: number) => () => onChange(Math.min(max, Math.max(min, valor + d)));
  const Redondo = ({ signo, onPress, off }: { signo: string; onPress: () => void; off: boolean }) => (
    <Pulsable onPress={onPress} disabled={off}>
      <View
        style={[
          {
            width: 40, height: 40, borderRadius: 20, alignItems: 'center',
            justifyContent: 'center', backgroundColor: C.superficieAlta,
            borderWidth: 1, borderColor: C.linea,
          },
          off && S.desactivado,
        ]}
      >
        <Text style={{ fontFamily: F.extra, fontSize: 19, color: C.texto }}>{signo}</Text>
      </View>
    </Pulsable>
  );

  return (
    <View style={[S.fila, { justifyContent: 'space-between', paddingVertical: 8 }]}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={{ fontFamily: F.texto, fontSize: 15, color: C.texto }}>{etiqueta}</Text>
        {ayuda && (
          <Text style={{ fontFamily: F.texto, fontSize: 12, color: C.textoDebil, marginTop: 2 }}>
            {ayuda}
          </Text>
        )}
      </View>
      <View style={[S.fila, { gap: 12 }]}>
        <Redondo signo="−" onPress={paso(-1)} off={valor <= min} />
        <Text style={[S.cifra, { fontSize: 19, minWidth: 34, textAlign: 'center' }]}>{valor}</Text>
        <Redondo signo="+" onPress={paso(1)} off={valor >= max} />
      </View>
    </View>
  );
}

export default function Configuracion({ onContinuar }: { onContinuar: (a: Ajustes) => void }) {
  const [a, setA] = useState<Ajustes>(AJUSTES_INICIALES);

  // Al abrir, se recupera la última mesa: los nombres son lo que más cansa
  // reescribir cuando se encadenan partidas.
  useEffect(() => {
    let vivo = true;
    leerAjustes().then((guardado) => {
      if (vivo && guardado) setA((prev) => ({ ...prev, ...guardado }));
    });
    return () => {
      vivo = false;
    };
  }, []);

  const set = <K extends keyof Ajustes>(k: K, v: Ajustes[K]) =>
    setA((prev) => ({ ...prev, [k]: v }));

  // Salen a subasta exactamente tantos lotes como huecos hay en la mesa: todos
  // acaban adjudicados, así que no hay nada que sobre ni que configurar.
  const lotes = a.nombres.length * a.huecos;

  const cambiarNumJugadores = (n: number) => {
    const nombres = [...a.nombres];
    while (nombres.length < n) nombres.push('');
    set('nombres', nombres.slice(0, n));
  };

  return (
    <ScrollView style={S.pantalla} contentContainerStyle={[S.contenido, { paddingTop: 12 }]}>
      <Aparecer>
        <Text style={[S.eyebrow, { color: C.laton }]}>Draft por subasta</Text>
        <Text style={[S.cartel, { fontSize: 52, lineHeight: 54, marginTop: 6 }]}>
          Abrimos la sala
        </Text>
        <Text style={[S.cuerpo, { marginTop: 8, marginBottom: 22 }]}>
          Un solo móvil hace de mesa. Sale un lote, y por turnos cada uno sube
          la puja o se planta. El último en pie se lo lleva.
        </Text>
      </Aparecer>

      <Aparecer retraso={80}>
        <View style={[S.tarjeta, { marginBottom: 12 }]}>
          <Text style={S.eyebrow}>La mesa</Text>
          <Contador
            etiqueta="Cuántos sois"
            valor={a.nombres.length} min={2} max={10}
            onChange={cambiarNumJugadores}
          />
          <View style={{ height: 1, backgroundColor: C.lineaSuave, marginVertical: 10 }} />
          <View style={{ gap: 8 }}>
            {a.nombres.map((nombre, i) => (
              <View key={i} style={S.fila}>
                <View
                  style={{ width: 3, height: 26, borderRadius: 2, backgroundColor: colorJugador(i) }}
                />
                <TextInput
                  value={nombre}
                  onChangeText={(t) =>
                    set('nombres', a.nombres.map((n, k) => (k === i ? t : n)))
                  }
                  placeholder={`Nombre del jugador ${i + 1}`}
                  placeholderTextColor={C.textoDebil}
                  maxLength={14}
                  style={{
                    flex: 1, backgroundColor: C.superficieAlta, borderRadius: 10,
                    borderWidth: 1, borderColor: C.lineaSuave,
                    paddingHorizontal: 12, paddingVertical: 11,
                    color: C.texto, fontFamily: F.fuerte, fontSize: 15,
                  }}
                />
              </View>
            ))}
          </View>
        </View>
      </Aparecer>

      <Aparecer retraso={140}>
        <View style={[S.tarjeta, { marginBottom: 12 }]}>
          <Text style={S.eyebrow}>Las reglas</Text>
          <Text style={[S.cuerpo, { fontSize: 12, marginTop: 2, marginBottom: 6 }]}>
            ¿En qué se paga?
          </Text>
          <View style={[S.fila, { flexWrap: 'wrap', gap: 8, marginBottom: 6 }]}>
            {DIVISAS.map((d) => {
              const elegida = d.id === a.monedaId;
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
          <Contador
            etiqueta="Presupuesto por jugador"
            ayuda={`${divisaPorId(a.monedaId).plural} para toda la partida`}
            valor={a.presupuesto} min={3} max={200}
            onChange={(v) => set('presupuesto', v)}
          />
          <Contador
            etiqueta="Huecos por jugador"
            ayuda="cuántos lotes hay que llenar"
            valor={a.huecos} min={1} max={11}
            onChange={(v) => set('huecos', v)}
          />
          <Contador
            etiqueta="Puja mínima" ayuda="para abrir un lote" 
            valor={a.pujaMin} min={1} max={10}
            onChange={(v) => set('pujaMin', v)}
          />
          <Contador
            etiqueta="Subida mínima" ayuda="lo que hay que superar al líder"
            valor={a.incremento} min={1} max={10}
            onChange={(v) => set('incremento', v)}
          />
        </View>
      </Aparecer>

      <Aparecer retraso={200}>
        <View style={[S.tarjeta, { marginBottom: 20 }]}>
          <Text style={S.eyebrow}>El sorteo</Text>
          <Text style={[S.cuerpo, { fontSize: 13, marginTop: 6 }]}>
            Saldrán <Text style={{ color: C.laton }}>{lotes} lotes</Text>, uno por
            hueco de la mesa, elegidos al azar entre todos los del tema. Cada uno
            acaba en manos de alguien, así que dos partidas nunca salen iguales.
          </Text>
        </View>
      </Aparecer>

      <Aparecer retraso={250}>
        <Boton
          texto="Elegir el tema →"
          onPress={() => {
            const listos = { ...a, nombres: a.nombres.map(nombreDe) };
            guardarAjustes(listos);
            onContinuar(listos);
          }}
        />
      </Aparecer>
    </ScrollView>
  );
}
