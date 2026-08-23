import { ScrollView, Text, TextInput, View } from 'react-native';
import { divisaPorId, precioLargo } from '../datos/divisas.ts';
import { C, F, S, colorJugador } from '../ui/tema.ts';
import { Aparecer, Boton, Pulsable } from '../ui/componentes.tsx';
import Contador from '../ui/Contador.tsx';

export type Ajustes = {
  nombres: string[];
  presupuesto: number;
  huecos: number;
  incremento: number;
  monedaId: string;
};

export const AJUSTES_INICIALES: Ajustes = {
  nombres: ['', '', ''],
  presupuesto: 20,
  huecos: 3,
  incremento: 1,
  monedaId: 'cabras',
};

/** Nombre por defecto para quien no escriba el suyo. */
export const nombreDe = (nombre: string, i: number) =>
  nombre.trim() || `Jugador ${i + 1}`;

/**
 * Montar la mesa: quiénes juegan y cómo se llaman. Las reglas viven en
 * Ajustes, así que empezar una partida es escribir nombres y poco más.
 */
export default function Configuracion({
  ajustes,
  onCambiar,
  onContinuar,
  onAjustes,
  onVolver,
}: {
  ajustes: Ajustes;
  onCambiar: (a: Ajustes) => void;
  onContinuar: (a: Ajustes) => void;
  onAjustes: () => void;
  onVolver: () => void;
}) {
  const moneda = divisaPorId(ajustes.monedaId);
  const lotes = ajustes.nombres.length * ajustes.huecos;

  const cambiarNumJugadores = (n: number) => {
    const nombres = [...ajustes.nombres];
    while (nombres.length < n) nombres.push('');
    onCambiar({ ...ajustes, nombres: nombres.slice(0, n) });
  };

  const renombrar = (i: number, texto: string) =>
    onCambiar({
      ...ajustes,
      nombres: ajustes.nombres.map((n, k) => (k === i ? texto : n)),
    });

  return (
    <ScrollView style={S.pantalla} contentContainerStyle={[S.contenido, { paddingTop: 12 }]}>
      <Aparecer>
        <Text style={[S.eyebrow, { color: C.laton }]}>Paso 1 de 2</Text>
        <Text style={[S.cartel, { fontSize: 52, lineHeight: 54, marginTop: 6 }]}>
          ¿Quién juega?
        </Text>
        <Text style={[S.cuerpo, { marginTop: 8, marginBottom: 22 }]}>
          Un solo móvil hace de mesa. Sale un lote, y por turnos cada uno sube la
          puja o se planta. El último en pie se lo lleva.
        </Text>
      </Aparecer>

      <Aparecer retraso={80}>
        <View style={[S.tarjeta, { marginBottom: 12 }]}>
          <Text style={S.eyebrow}>La mesa</Text>
          <Contador
            etiqueta="Cuántos sois"
            valor={ajustes.nombres.length} min={2} max={10}
            onChange={cambiarNumJugadores}
          />
          <View style={{ height: 1, backgroundColor: C.lineaSuave, marginVertical: 10 }} />
          <View style={{ gap: 8 }}>
            {ajustes.nombres.map((nombre, i) => (
              <View key={i} style={S.fila}>
                <View
                  style={{ width: 3, height: 26, borderRadius: 2, backgroundColor: colorJugador(i) }}
                />
                <TextInput
                  value={nombre}
                  onChangeText={(t) => renombrar(i, t)}
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
        <Pulsable onPress={onAjustes}>
          <View style={[S.tarjeta, { marginBottom: 20 }]}>
            <View style={[S.fila, { justifyContent: 'space-between' }]}>
              <Text style={S.eyebrow}>Las reglas</Text>
              <Text style={{ fontFamily: F.fuerte, fontSize: 12, color: C.laton }}>
                Cambiar →
              </Text>
            </View>
            <Text style={[S.cuerpo, { fontSize: 13, marginTop: 8, lineHeight: 20 }]}>
              {precioLargo(ajustes.presupuesto, moneda)} {moneda.emoji} por cabeza ·{' '}
              {ajustes.huecos} huecos · subida mínima {ajustes.incremento}
            </Text>
            <Text style={[S.cuerpo, { fontSize: 12, marginTop: 6 }]}>
              Saldrán <Text style={{ color: C.laton }}>{lotes} lotes</Text>, uno por
              hueco de la mesa, sorteados entre todos los del tema.
            </Text>
          </View>
        </Pulsable>
      </Aparecer>

      <Aparecer retraso={200} style={{ gap: 10 }}>
        <Boton
          texto="Elegir el tema →"
          onPress={() => onContinuar({ ...ajustes, nombres: ajustes.nombres.map(nombreDe) })}
        />
        <Boton texto="← Menú" onPress={onVolver} variante="fantasma" />
      </Aparecer>
    </ScrollView>
  );
}
