import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, Text, View } from 'react-native';
import { huecosLibres, puedePujar, pujaMinimaActual } from '../motor/motor.ts';
import type { Partida } from '../motor/tipos.ts';
import { usePartida } from '../estado/partida.ts';
import { C, F, S, colorJugador, sombra } from '../ui/tema.ts';
import { Aparecer, Boton, Cifra, Progreso, Pulsable } from '../ui/componentes.tsx';

type Remate = { item: string; jugador: string; precio: number; color: string };

/** Huecos de un jugador como muescas: llenas en su color, vacías en hueco. */
function Huecos({ llenos, total, color }: { llenos: number; total: number; color: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 3 }}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={{
            width: 14,
            height: 4,
            borderRadius: 2,
            backgroundColor: i < llenos ? color : C.linea,
          }}
        />
      ))}
    </View>
  );
}

/** El sello de "adjudicado" que cae sobre el ítem al cerrar la puja. */
function SelloRemate({ remate, onFin }: { remate: Remate; onFin: () => void }) {
  const v = useRef(new Animated.Value(0)).current;
  // El callback vive en una ref para que la animación no se reinicie en cada
  // repintado del padre: al interrumpirse avisaría de un final que no ha sido.
  const fin = useRef(onFin);
  fin.current = onFin;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(v, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.back(2.2)),
        useNativeDriver: true,
      }),
      Animated.delay(620),
      Animated.timing(v, {
        toValue: 2,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) fin.current();
    });
  }, [v]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: C.fondo + 'F2',
        opacity: v.interpolate({ inputRange: [0, 1, 2], outputRange: [0, 1, 0] }),
        transform: [
          { scale: v.interpolate({ inputRange: [0, 1, 2], outputRange: [1.6, 1, 1.05] }) },
          { rotate: v.interpolate({ inputRange: [0, 1, 2], outputRange: ['-14deg', '-4deg', '-4deg'] }) },
        ],
      }}
    >
      <View
        style={{
          borderWidth: 3,
          borderColor: remate.color,
          borderRadius: 14,
          paddingHorizontal: 26,
          paddingVertical: 16,
          alignItems: 'center',
        }}
      >
        <Text style={[S.eyebrow, { color: remate.color, letterSpacing: 4 }]}>Adjudicado</Text>
        <Text style={[S.cartel, { fontSize: 40, lineHeight: 42, marginTop: 4 }]}>
          {remate.item}
        </Text>
        <Text style={{ fontFamily: F.fuerte, color: remate.color, fontSize: 16, marginTop: 6 }}>
          {remate.jugador} · {remate.precio} €
        </Text>
      </View>
    </Animated.View>
  );
}

export default function Subasta({ partida }: { partida: Partida }) {
  const { pujar, adjudicar, descartar, deshacer, pasado } = usePartida();
  const subasta = partida.subasta!;
  const minimo = pujaMinimaActual(partida);
  const [importe, setImporte] = useState(minimo);
  const [remate, setRemate] = useState<Remate | null>(null);

  // Cada ítem nuevo y cada puja reinician el importe al mínimo que toca.
  useEffect(() => setImporte(minimo), [subasta.item.id, minimo]);

  // Latido del importe cada vez que sube la puja.
  const latido = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.timing(latido, { toValue: 1.12, duration: 110, useNativeDriver: true }),
      Animated.spring(latido, { toValue: 1, speed: 20, bounciness: 10, useNativeDriver: true }),
    ]).start();
  }, [subasta.pujaActual, latido]);

  const lider = partida.jugadores.find((j) => j.id === subasta.lider);
  const indiceLider = lider ? partida.jugadores.indexOf(lider) : -1;
  const maximoPosible = Math.max(
    minimo,
    ...partida.jugadores.filter((j) => puedePujar(partida, j.id)).map((j) => j.dinero),
  );
  const totalItems = partida.config.huecos * partida.jugadores.length;
  const adjudicados = partida.jugadores.reduce((s, j) => s + j.plantilla.length, 0);

  const rematar = () => {
    if (!lider) return;
    setRemate({
      item: subasta.item.nombre,
      jugador: lider.nombre,
      precio: subasta.pujaActual,
      color: colorJugador(indiceLider),
    });
    adjudicar();
  };

  return (
    <View style={S.pantalla}>
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14 }}>
        <View style={[S.fila, { justifyContent: 'space-between', marginBottom: 10 }]}>
          <Text style={S.eyebrow}>
            Lote {partida.config.huecos * partida.jugadores.length - (totalItems - adjudicados) + 1}
            {'  ·  '}
            {partida.mazo.length} por salir
          </Text>
          <Pulsable onPress={deshacer} disabled={pasado.length === 0}>
            <Text
              style={[
                { fontFamily: F.fuerte, fontSize: 13, color: C.laton },
                pasado.length === 0 && S.desactivado,
              ]}
            >
              ↺ Deshacer
            </Text>
          </Pulsable>
        </View>
        <Progreso hechos={adjudicados} total={totalItems} />
      </View>

      <View style={{ paddingHorizontal: 20 }}>
        {/* El ítem: lo lee en voz alta quien lleva el móvil. */}
        <Aparecer key={subasta.item.id} desplazamiento={22}>
          <View
            style={[
              S.tarjeta,
              sombra(1),
              {
                alignItems: 'center',
                paddingVertical: 30,
                borderColor: lider ? colorJugador(indiceLider) : C.linea,
                backgroundColor: C.superficie,
              },
            ]}
          >
            <Text style={[S.eyebrow, { color: C.laton }]}>Sale a subasta</Text>
            <Text style={[S.cartel, { textAlign: 'center', marginTop: 10 }]}>
              {subasta.item.nombre}
            </Text>
            <View
              style={{ height: 1, alignSelf: 'stretch', backgroundColor: C.lineaSuave, marginVertical: 16 }}
            />
            {lider ? (
              <View style={{ alignItems: 'center' }}>
                <Text style={[S.cifra, { fontSize: 30, color: colorJugador(indiceLider) }]}>
                  {subasta.pujaActual} €
                </Text>
                <Text style={{ fontFamily: F.texto, color: C.textoSuave, fontSize: 13, marginTop: 2 }}>
                  va para {lider.nombre}
                </Text>
              </View>
            ) : (
              <Text style={{ fontFamily: F.texto, color: C.textoDebil, fontSize: 14 }}>
                Nadie ha pujado todavía
              </Text>
            )}
          </View>
        </Aparecer>
      </View>

      {/* Importe que se va a registrar. */}
      <View style={[S.fila, { justifyContent: 'center', paddingVertical: 18, gap: 20 }]}>
        <Pulsable onPress={() => setImporte((x) => Math.max(minimo, x - 1))} disabled={importe <= minimo}>
          <View
            style={[
              {
                width: 48, height: 48, borderRadius: 24, alignItems: 'center',
                justifyContent: 'center', borderWidth: 1, borderColor: C.linea,
                backgroundColor: C.superficie,
              },
              importe <= minimo && S.desactivado,
            ]}
          >
            <Text style={{ fontFamily: F.extra, fontSize: 22, color: C.texto }}>−</Text>
          </View>
        </Pulsable>

        <Animated.View style={{ alignItems: 'center', transform: [{ scale: latido }], minWidth: 108 }}>
          <Cifra valor={importe} sufijo=" €" style={[S.cifra, { fontSize: 40, color: C.laton }]} />
          <Text style={[S.eyebrow, { marginTop: 2 }]}>mínimo {minimo} €</Text>
        </Animated.View>

        <Pulsable
          onPress={() => setImporte((x) => Math.min(maximoPosible, x + 1))}
          disabled={importe >= maximoPosible}
        >
          <View
            style={[
              {
                width: 48, height: 48, borderRadius: 24, alignItems: 'center',
                justifyContent: 'center', borderWidth: 1, borderColor: C.linea,
                backgroundColor: C.superficie,
              },
              importe >= maximoPosible && S.desactivado,
            ]}
          >
            <Text style={{ fontFamily: F.extra, fontSize: 22, color: C.texto }}>+</Text>
          </View>
        </Pulsable>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
        <Text style={[S.eyebrow, { marginBottom: 2 }]}>Toca a quien acaba de pujar</Text>
        {partida.jugadores.map((j, i) => {
          const color = colorJugador(i);
          const activo = puedePujar(partida, j.id) && j.dinero >= importe;
          const esLider = subasta.lider === j.id;
          const motivo =
            huecosLibres(j, partida.config) === 0
              ? 'plantilla completa'
              : esLider
                ? 'lleva la puja más alta'
                : j.dinero < minimo
                  ? 'sin dinero'
                  : 'no le llega';
          return (
            <Pulsable key={j.id} onPress={() => pujar(j.id, importe)} disabled={!activo}>
              <View
                style={[
                  S.tarjeta,
                  {
                    paddingVertical: 14,
                    borderColor: esLider ? color : activo ? C.linea : C.lineaSuave,
                    backgroundColor: esLider ? C.superficieAlta : C.superficie,
                  },
                  !activo && S.desactivado,
                ]}
              >
                <View style={[S.fila, { justifyContent: 'space-between' }]}>
                  <View style={{ width: 3, height: 34, borderRadius: 2, backgroundColor: color }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: F.extra, fontSize: 17, color: C.texto }}>
                      {j.nombre}
                    </Text>
                    <View style={[S.fila, { marginTop: 5, gap: 8 }]}>
                      <Huecos llenos={j.plantilla.length} total={partida.config.huecos} color={color} />
                      <Text style={{ fontFamily: F.texto, fontSize: 12, color: C.textoDebil }}>
                        {activo ? `${j.dinero} € disponibles` : motivo}
                      </Text>
                    </View>
                  </View>
                  <Text style={[S.cifra, { fontSize: 20, color: activo ? color : C.textoDebil }]}>
                    {activo ? `${importe} €` : '—'}
                  </Text>
                </View>
              </View>
            </Pulsable>
          );
        })}
      </ScrollView>

      <View style={{ padding: 20, paddingTop: 12, gap: 10 }}>
        <Boton
          texto={lider ? `Martillo · ${subasta.pujaActual} € a ${lider.nombre}` : 'Esperando pujas'}
          onPress={rematar}
          disabled={!lider}
        />
        <Boton texto="Nadie lo quiere · siguiente" onPress={descartar} variante="fantasma" />
      </View>

      {remate && <SelloRemate remate={remate} onFin={() => setRemate(null)} />}
    </View>
  );
}
