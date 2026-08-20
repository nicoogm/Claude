import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { C, F, S, colorJugador } from '../ui/tema.ts';
import { Aparecer, Boton, Pulsable } from '../ui/componentes.tsx';

export type Ajustes = {
  nombres: string[];
  presupuesto: number;
  huecos: number;
  pujaMin: number;
  incremento: number;
  /** Cuántos ítems se sortean de la lista del tema para esta partida. */
  itemsEnJuego: number;
};

const AJUSTES_INICIALES: Ajustes = {
  nombres: ['', '', ''],
  presupuesto: 20,
  huecos: 3,
  pujaMin: 1,
  incremento: 1,
  itemsEnJuego: 18,
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
  const set = <K extends keyof Ajustes>(k: K, v: Ajustes[K]) =>
    setA((prev) => ({ ...prev, [k]: v }));

  const minimoItems = a.nombres.length * a.huecos;

  const cambiarNumJugadores = (n: number) => {
    const nombres = [...a.nombres];
    while (nombres.length < n) nombres.push('');
    setA((prev) => ({
      ...prev,
      nombres: nombres.slice(0, n),
      itemsEnJuego: Math.max(prev.itemsEnJuego, n * prev.huecos),
    }));
  };

  const cambiarHuecos = (h: number) =>
    setA((prev) => ({
      ...prev,
      huecos: h,
      itemsEnJuego: Math.max(prev.itemsEnJuego, prev.nombres.length * h),
    }));

  return (
    <ScrollView style={S.pantalla} contentContainerStyle={[S.contenido, { paddingTop: 12 }]}>
      <Aparecer>
        <Text style={[S.eyebrow, { color: C.laton }]}>Draft por subasta</Text>
        <Text style={[S.cartel, { fontSize: 52, lineHeight: 54, marginTop: 6 }]}>
          Abrimos la sala
        </Text>
        <Text style={[S.cuerpo, { marginTop: 8, marginBottom: 22 }]}>
          Un solo móvil hace de mesa. Tú cantas los lotes en voz alta y registras
          las pujas que griten los demás.
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
          <Contador
            etiqueta="Presupuesto por jugador"
            ayuda="euros para toda la partida"
            valor={a.presupuesto} min={3} max={200}
            onChange={(v) => set('presupuesto', v)}
          />
          <Contador
            etiqueta="Huecos por jugador"
            ayuda="cuántos lotes hay que llenar"
            valor={a.huecos} min={1} max={11}
            onChange={cambiarHuecos}
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
          <Contador
            etiqueta="Lotes que salen a subasta"
            valor={a.itemsEnJuego} min={minimoItems} max={60}
            onChange={(v) => set('itemsEnJuego', v)}
          />
          <Text style={[S.cuerpo, { fontSize: 12, marginTop: 4 }]}>
            Se eligen al azar de la lista del tema, así que dos partidas nunca
            salen iguales. Con {a.nombres.length} jugadores y {a.huecos} huecos
            hacen falta {minimoItems} como mínimo.
          </Text>
        </View>
      </Aparecer>

      <Aparecer retraso={250}>
        <Boton
          texto="Elegir el tema →"
          onPress={() => onContinuar({ ...a, nombres: a.nombres.map(nombreDe) })}
        />
      </Aparecer>
    </ScrollView>
  );
}
