import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, Text, View } from 'react-native';
import { huecosLibres, puedePasar, pujaMinimaActual } from '../motor/motor.ts';
import type { Partida } from '../motor/tipos.ts';
import { usePartida } from '../estado/partida.ts';
import { articulo, divisaPorId, gastadas, precio, precioLargo } from '../datos/divisas.ts';
import { C, F, S, colorJugador, sombra } from '../ui/tema.ts';
import {
  Aparecer, Boton, Cifra, Confirmacion, Progreso, Pulsable,
} from '../ui/componentes.tsx';

type Remate = { item: string; jugador: string; precio: string; color: string };

/** Huecos de un jugador como muescas: llenas en su color, vacías en hueco. */
function Huecos({ llenos, total, color }: { llenos: number; total: number; color: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 3 }}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={{
            width: 12, height: 4, borderRadius: 2,
            backgroundColor: i < llenos ? color : C.linea,
          }}
        />
      ))}
    </View>
  );
}

/** El sello de "adjudicado" que cae sobre el lote al cerrarse la puja. */
function SelloRemate({ remate, onFin }: { remate: Remate; onFin: () => void }) {
  const v = useRef(new Animated.Value(0)).current;
  // El callback vive en una ref para que la animación no se reinicie en cada
  // repintado del padre: al interrumpirse avisaría de un final que no ha sido.
  const fin = useRef(onFin);
  fin.current = onFin;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(v, {
        toValue: 1, duration: 260,
        easing: Easing.out(Easing.back(2.2)), useNativeDriver: true,
      }),
      Animated.delay(680),
      Animated.timing(v, {
        toValue: 2, duration: 220,
        easing: Easing.in(Easing.cubic), useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) fin.current();
    });
  }, [v]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        alignItems: 'center', justifyContent: 'center',
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
          borderWidth: 3, borderColor: remate.color, borderRadius: 14,
          paddingHorizontal: 26, paddingVertical: 16, alignItems: 'center',
        }}
      >
        <Text style={[S.eyebrow, { color: remate.color, letterSpacing: 4 }]}>Adjudicado</Text>
        <Text style={[S.cartel, { fontSize: 40, lineHeight: 42, marginTop: 4 }]}>
          {remate.item}
        </Text>
        <Text style={{ fontFamily: F.fuerte, color: remate.color, fontSize: 16, marginTop: 6 }}>
          {remate.jugador} · {remate.precio}
        </Text>
      </View>
    </Animated.View>
  );
}

export default function Subasta({
  partida,
  onSalir,
}: {
  partida: Partida;
  onSalir: () => void;
}) {
  const { pujar, pasar, deshacer, pasado } = usePartida();
  const subasta = partida.subasta!;
  const moneda = divisaPorId(partida.config.monedaId);
  const minimo = pujaMinimaActual(partida);

  const deTurno = partida.jugadores.find((j) => j.id === subasta.turno)!;
  const indiceTurno = partida.jugadores.indexOf(deTurno);
  const colorTurno = colorJugador(indiceTurno);
  const lider = partida.jugadores.find((j) => j.id === subasta.lider);
  const indiceLider = lider ? partida.jugadores.indexOf(lider) : -1;

  const tope = Math.min(deTurno.dinero, minimo + 30);
  const [importe, setImporte] = useState(minimo);
  const [remate, setRemate] = useState<Remate | null>(null);
  const [preguntandoSalida, setPreguntandoSalida] = useState(false);

  // Cada turno nuevo arranca en la puja mínima que toca.
  useEffect(() => setImporte(minimo), [subasta.turno, subasta.item.id, minimo]);

  // Latido del importe cada vez que sube la puja.
  const latido = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.timing(latido, { toValue: 1.1, duration: 110, useNativeDriver: true }),
      Animated.spring(latido, { toValue: 1, speed: 20, bounciness: 10, useNativeDriver: true }),
    ]).start();
  }, [subasta.pujaActual, latido]);

  const totalItems = partida.config.huecos * partida.jugadores.length;
  const adjudicados = partida.jugadores.reduce((s, j) => s + j.plantilla.length, 0);

  /** Antes de plantarse hay que saber si eso cierra el lote, para el sello. */
  const cierraElLote = (() => {
    if (!lider) return false;
    const rivales = subasta.activos.filter(
      (id) => id !== subasta.lider && id !== deTurno.id,
    );
    return rivales.length === 0;
  })();

  // Quien abre el lote no puede plantarse: está obligado a poner la mínima.
  const puedePlantarse = puedePasar(partida, deTurno.id);

  const plantarse = () => {
    if (cierraElLote && lider) {
      setRemate({
        item: subasta.item.nombre,
        jugador: lider.nombre,
        precio: precio(subasta.pujaActual, moneda),
        color: colorJugador(indiceLider),
      });
    }
    pasar(deTurno.id);
  };

  const subir = () => pujar(deTurno.id, importe);
  const puedeSubir = deTurno.dinero >= minimo;

  return (
    <View style={S.pantalla}>
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 }}>
        <View style={[S.fila, { justifyContent: 'space-between', marginBottom: 10 }]}>
          <Pulsable onPress={() => setPreguntandoSalida(true)}>
            <View
              style={{
                width: 30, height: 30, borderRadius: 15, alignItems: 'center',
                justifyContent: 'center', borderWidth: 1, borderColor: C.linea,
                backgroundColor: C.superficie,
              }}
            >
              <Text style={{ fontFamily: F.extra, fontSize: 14, color: C.textoSuave }}>✕</Text>
            </View>
          </Pulsable>
          <Text style={[S.eyebrow, { flex: 1, textAlign: 'center' }]}>
            {adjudicados} de {totalItems} · {partida.mazo.length} por salir
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

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12 }}>
        {/* Quién decide ahora: lo primero que se ve al mirar el móvil. */}
        <Aparecer key={subasta.turno + subasta.item.id} desplazamiento={16}>
          <View
            style={[
              S.tarjeta, sombra(1),
              { borderColor: colorTurno, borderWidth: 2, paddingVertical: 16, marginBottom: 12 },
            ]}
          >
            <View style={[S.fila, { justifyContent: 'space-between' }]}>
              <View>
                <Text style={[S.eyebrow, { color: colorTurno }]}>Le toca a</Text>
                <Text style={{ fontFamily: F.extra, fontSize: 26, color: C.texto, marginTop: 2 }}>
                  {deTurno.nombre}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 6 }}>
                <Text style={[S.cifra, { fontSize: 20, color: colorTurno }]}>
                  {precio(deTurno.dinero, moneda)}
                </Text>
                <Huecos
                  llenos={deTurno.plantilla.length}
                  total={partida.config.huecos}
                  color={colorTurno}
                />
              </View>
            </View>
          </View>
        </Aparecer>

        {/* El lote que se está subastando. */}
        <Aparecer key={subasta.item.id} desplazamiento={20}>
          <View style={[S.tarjeta, { alignItems: 'center', paddingVertical: 22, marginBottom: 14 }]}>
            <Text style={[S.eyebrow, { color: C.laton }]}>Sale a subasta</Text>
            <Text style={[S.cartel, { textAlign: 'center', marginTop: 8 }]}>
              {subasta.item.nombre}
            </Text>
            <View style={{ height: 1, alignSelf: 'stretch', backgroundColor: C.lineaSuave, marginVertical: 14 }} />
            {lider ? (
              <Text style={{ fontFamily: F.texto, fontSize: 14, color: C.textoSuave }}>
                Va por{' '}
                <Text style={[S.cifra, { color: colorJugador(indiceLider), fontSize: 15 }]}>
                  {precio(subasta.pujaActual, moneda)}
                </Text>
                {'  ·  '}
                {lider.nombre}
              </Text>
            ) : (
              <Text style={{ fontFamily: F.texto, fontSize: 14, color: C.textoDebil }}>
                Nadie ha pujado · sale por {precioLargo(partida.config.pujaMin, moneda)}
              </Text>
            )}
          </View>
        </Aparecer>

        {/* Cuánto ofrece quien tiene el turno. */}
        {puedeSubir && (
          <View style={[S.fila, { justifyContent: 'center', gap: 18, marginBottom: 14 }]}>
            <Pulsable onPress={() => setImporte((x) => Math.max(minimo, x - 1))} disabled={importe <= minimo}>
              <View
                style={[
                  {
                    width: 46, height: 46, borderRadius: 23, alignItems: 'center',
                    justifyContent: 'center', borderWidth: 1, borderColor: C.linea,
                    backgroundColor: C.superficie,
                  },
                  importe <= minimo && S.desactivado,
                ]}
              >
                <Text style={{ fontFamily: F.extra, fontSize: 21, color: C.texto }}>−</Text>
              </View>
            </Pulsable>

            <Animated.View style={{ alignItems: 'center', transform: [{ scale: latido }], minWidth: 110 }}>
              <View style={S.fila}>
                <Cifra valor={importe} style={[S.cifra, { fontSize: 40, color: colorTurno }]} />
                <Text style={{ fontSize: 26 }}>{moneda.emoji}</Text>
              </View>
              <Text style={[S.eyebrow, { marginTop: 2 }]}>mínimo {minimo}</Text>
            </Animated.View>

            <Pulsable onPress={() => setImporte((x) => Math.min(tope, x + 1))} disabled={importe >= tope}>
              <View
                style={[
                  {
                    width: 46, height: 46, borderRadius: 23, alignItems: 'center',
                    justifyContent: 'center', borderWidth: 1, borderColor: C.linea,
                    backgroundColor: C.superficie,
                  },
                  importe >= tope && S.desactivado,
                ]}
              >
                <Text style={{ fontFamily: F.extra, fontSize: 21, color: C.texto }}>+</Text>
              </View>
            </Pulsable>
          </View>
        )}

        {/* Estado de la mesa en este lote. */}
        <Text style={[S.eyebrow, { marginBottom: 8 }]}>La mesa</Text>
        <View style={{ gap: 6 }}>
          {partida.jugadores.map((j, i) => {
            const color = colorJugador(i);
            const esTurno = j.id === subasta.turno;
            const esLider = j.id === subasta.lider;
            const sigue = subasta.activos.includes(j.id);
            // Fuera del lote hay dos motivos muy distintos: te has plantado tú,
            // o se te ha ido de precio. Conviene que se vea cuál.
            const sinDinero = j.dinero < minimo;
            const estado = esLider
              ? 'lleva la puja'
              : esTurno
                ? 'decidiendo…'
                : sigue
                  ? 'sigue vivo'
                  : huecosLibres(j, partida.config) === 0
                    ? 'plantilla completa'
                    : sinDinero
                      ? `no le llega · faltan ${minimo - j.dinero}`
                      : 'se plantó';
            return (
              <View
                key={j.id}
                style={[
                  S.tarjeta,
                  {
                    paddingVertical: 10,
                    borderColor: esTurno ? color : C.lineaSuave,
                    backgroundColor: esTurno ? C.superficieAlta : C.superficie,
                  },
                  !sigue && !esLider && S.desactivado,
                ]}
              >
                <View style={[S.fila, { justifyContent: 'space-between' }]}>
                  <View style={{ width: 3, height: 26, borderRadius: 2, backgroundColor: color }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: F.fuerte, fontSize: 15, color: C.texto }}>
                      {j.nombre}
                    </Text>
                    <Text
                      style={{
                        fontFamily: F.texto, fontSize: 11, marginTop: 2,
                        color: !sigue && sinDinero ? C.peligro : C.textoDebil,
                      }}
                    >
                      {estado}
                    </Text>
                  </View>
                  <Huecos llenos={j.plantilla.length} total={partida.config.huecos} color={color} />
                  <Text
                    style={[
                      S.cifra,
                      {
                        fontSize: 14, minWidth: 54, textAlign: 'right',
                        color: !sigue && sinDinero ? C.peligro : C.textoSuave,
                      },
                    ]}
                  >
                    {precio(j.dinero, moneda)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={{ padding: 20, paddingTop: 10, gap: 10 }}>
        {puedeSubir ? (
          <Boton texto={`${deTurno.nombre} sube a ${precio(importe, moneda)}`} onPress={subir} />
        ) : (
          <Text style={[S.cuerpo, { textAlign: 'center' }]}>
            {deTurno.nombre} no llega a {precioLargo(minimo, moneda)}.
          </Text>
        )}
        {puedePlantarse ? (
          <Boton
            texto={`Me planto · ${cierraElLote ? 'cierra el lote' : 'no sigo'}`}
            onPress={plantarse}
            variante="secundario"
          />
        ) : (
          <Text style={[S.cuerpo, { textAlign: 'center', fontSize: 12 }]}>
            {deTurno.nombre} abre el lote: hay que pujar, no se puede pasar.
          </Text>
        )}
      </View>

      {remate && <SelloRemate remate={remate} onFin={() => setRemate(null)} />}

      {preguntandoSalida && (
        <Confirmacion
          titulo="¿Dejar la partida?"
          texto={
            `Vais por el lote ${adjudicados + 1} de ${totalItems}. Si sales ahora se ` +
            `pierde entera: las plantillas, las pujas y ${articulo(moneda)} ` +
            `${moneda.plural} ${gastadas(moneda)}.`
          }
          confirmar="Salir al menú"
          cancelar="Seguir jugando"
          onConfirmar={onSalir}
          onCancelar={() => setPreguntandoSalida(false)}
        />
      )}
    </View>
  );
}
