import { useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { C, S, colorJugador } from '../ui/tema.ts';

export type Ajustes = {
  nombres: string[];
  presupuesto: number;
  huecos: number;
  pujaMin: number;
  incremento: number;
  ordenAleatorio: boolean;
};

const AJUSTES_INICIALES: Ajustes = {
  nombres: ['Jugador 1', 'Jugador 2', 'Jugador 3'],
  presupuesto: 20,
  huecos: 3,
  pujaMin: 1,
  incremento: 1,
  ordenAleatorio: true,
};

function Contador({
  etiqueta, valor, min, max, onChange,
}: {
  etiqueta: string; valor: number; min: number; max: number;
  onChange: (v: number) => void;
}) {
  const paso = (delta: number) => () =>
    onChange(Math.min(max, Math.max(min, valor + delta)));
  return (
    <View style={[S.fila, { justifyContent: 'space-between', marginBottom: 14 }]}>
      <Text style={{ color: C.texto, fontSize: 16, flex: 1 }}>{etiqueta}</Text>
      <View style={S.fila}>
        <TouchableOpacity
          onPress={paso(-1)}
          disabled={valor <= min}
          style={[
            { backgroundColor: C.panelAlt, borderRadius: 10, width: 44, height: 44,
              alignItems: 'center', justifyContent: 'center' },
            valor <= min && S.desactivado,
          ]}
        >
          <Text style={{ color: C.texto, fontSize: 22, fontWeight: '800' }}>−</Text>
        </TouchableOpacity>
        <Text
          style={{ color: C.texto, fontSize: 18, fontWeight: '800',
                   minWidth: 44, textAlign: 'center' }}
        >
          {valor}
        </Text>
        <TouchableOpacity
          onPress={paso(1)}
          disabled={valor >= max}
          style={[
            { backgroundColor: C.panelAlt, borderRadius: 10, width: 44, height: 44,
              alignItems: 'center', justifyContent: 'center' },
            valor >= max && S.desactivado,
          ]}
        >
          <Text style={{ color: C.texto, fontSize: 22, fontWeight: '800' }}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function Configuracion({
  onContinuar,
}: {
  onContinuar: (a: Ajustes) => void;
}) {
  const [a, setA] = useState<Ajustes>(AJUSTES_INICIALES);
  const set = <K extends keyof Ajustes>(k: K, v: Ajustes[K]) =>
    setA((prev) => ({ ...prev, [k]: v }));

  const cambiarNumJugadores = (n: number) => {
    const nombres = [...a.nombres];
    while (nombres.length < n) nombres.push(`Jugador ${nombres.length + 1}`);
    set('nombres', nombres.slice(0, n));
  };

  const renombrar = (i: number, nombre: string) =>
    set('nombres', a.nombres.map((n, k) => (k === i ? nombre : n)));

  return (
    <ScrollView style={S.pantalla} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={S.titulo}>Nueva partida</Text>
      <Text style={S.subtitulo}>
        Un móvil, un subastador. Tú lees los ítems y registras las pujas.
      </Text>

      <View style={S.tarjeta}>
        <Text style={S.etiqueta}>Jugadores</Text>
        <Contador
          etiqueta="Cuántos sois"
          valor={a.nombres.length}
          min={2}
          max={10}
          onChange={cambiarNumJugadores}
        />
        {a.nombres.map((nombre, i) => (
          <View key={i} style={[S.fila, { marginBottom: 8 }]}>
            <View
              style={{ width: 10, height: 10, borderRadius: 5,
                       backgroundColor: colorJugador(i) }}
            />
            <TextInput
              value={nombre}
              onChangeText={(t) => renombrar(i, t)}
              placeholder={`Jugador ${i + 1}`}
              placeholderTextColor={C.textoSuave}
              maxLength={14}
              style={{
                flex: 1, backgroundColor: C.panelAlt, borderRadius: 10,
                paddingHorizontal: 12, paddingVertical: 10, color: C.texto,
                fontSize: 16,
              }}
            />
          </View>
        ))}
      </View>

      <View style={S.tarjeta}>
        <Text style={S.etiqueta}>Reglas</Text>
        <Contador
          etiqueta="Presupuesto por jugador (€)"
          valor={a.presupuesto} min={3} max={200}
          onChange={(v) => set('presupuesto', v)}
        />
        <Contador
          etiqueta="Huecos por jugador"
          valor={a.huecos} min={1} max={11}
          onChange={(v) => set('huecos', v)}
        />
        <Contador
          etiqueta="Puja mínima (€)"
          valor={a.pujaMin} min={1} max={10}
          onChange={(v) => set('pujaMin', v)}
        />
        <Contador
          etiqueta="Subida mínima (€)"
          valor={a.incremento} min={1} max={10}
          onChange={(v) => set('incremento', v)}
        />
        <TouchableOpacity
          onPress={() => set('ordenAleatorio', !a.ordenAleatorio)}
          style={[S.fila, { justifyContent: 'space-between', marginTop: 4 }]}
        >
          <Text style={{ color: C.texto, fontSize: 16, flex: 1 }}>
            Orden aleatorio de los ítems
          </Text>
          <View
            style={{
              width: 52, height: 32, borderRadius: 16, padding: 3,
              backgroundColor: a.ordenAleatorio ? C.acento : C.panelAlt,
              alignItems: a.ordenAleatorio ? 'flex-end' : 'flex-start',
            }}
          >
            <View
              style={{ width: 26, height: 26, borderRadius: 13,
                       backgroundColor: a.ordenAleatorio ? '#06210F' : C.textoSuave }}
            />
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={S.boton} onPress={() => onContinuar(a)}>
        <Text style={S.botonTexto}>Elegir tema →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
