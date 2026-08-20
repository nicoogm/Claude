import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { huecosLibres, puedePujar, pujaMinimaActual } from '../motor/motor.ts';
import type { Partida } from '../motor/tipos.ts';
import { usePartida } from '../estado/partida.ts';
import { C, S, colorJugador } from '../ui/tema.ts';

/** Huecos de un jugador dibujados como puntos llenos/vacíos. */
function Huecos({ llenos, total, color }: { llenos: number; total: number; color: string }) {
  return (
    <View style={[S.fila, { gap: 4 }]}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={{
            width: 8, height: 8, borderRadius: 4,
            backgroundColor: i < llenos ? color : 'transparent',
            borderWidth: 1, borderColor: color,
          }}
        />
      ))}
    </View>
  );
}

export default function Subasta({ partida }: { partida: Partida }) {
  const { pujar, adjudicar, descartar, deshacer, pasado } = usePartida();
  const minimo = pujaMinimaActual(partida);
  const [importe, setImporte] = useState(minimo);
  const subasta = partida.subasta!;

  // Cada vez que cambia el ítem o sube la puja, el importe vuelve al mínimo.
  useEffect(() => setImporte(minimo), [subasta.item.id, minimo]);

  const maximoPosible = Math.max(
    ...partida.jugadores
      .filter((j) => puedePujar(partida, j.id))
      .map((j) => j.dinero),
    minimo,
  );
  const lider = partida.jugadores.find((j) => j.id === subasta.lider);
  const restantes = partida.mazo.length;

  return (
    <View style={S.pantalla}>
      <View style={[S.fila, { justifyContent: 'space-between', marginBottom: 12 }]}>
        <Text style={{ color: C.textoSuave, fontSize: 13 }}>
          Quedan {restantes} ítems
        </Text>
        <TouchableOpacity
          onPress={deshacer}
          disabled={pasado.length === 0}
          style={pasado.length === 0 ? S.desactivado : undefined}
        >
          <Text style={{ color: C.aviso, fontWeight: '700' }}>↺ Deshacer</Text>
        </TouchableOpacity>
      </View>

      {/* El ítem a subastar: lo lee en alto quien lleva el móvil. */}
      <View style={[S.tarjeta, { alignItems: 'center', paddingVertical: 28 }]}>
        <Text style={S.etiqueta}>A subasta</Text>
        <Text
          style={{ color: C.texto, fontSize: 34, fontWeight: '900',
                   textAlign: 'center' }}
        >
          {subasta.item.nombre}
        </Text>
        <Text style={{ color: lider ? C.acento : C.textoSuave, marginTop: 12, fontSize: 16 }}>
          {lider
            ? `${subasta.pujaActual} € · va para ${lider.nombre}`
            : 'Sin pujas todavía'}
        </Text>
      </View>

      {/* Selector del importe que se va a registrar. */}
      <View style={[S.tarjeta, { paddingVertical: 12 }]}>
        <View style={[S.fila, { justifyContent: 'space-between' }]}>
          <TouchableOpacity
            onPress={() => setImporte((v) => Math.max(minimo, v - 1))}
            disabled={importe <= minimo}
            style={[{ paddingHorizontal: 22, paddingVertical: 8 },
                    importe <= minimo && S.desactivado]}
          >
            <Text style={{ color: C.texto, fontSize: 26, fontWeight: '800' }}>−</Text>
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: C.texto, fontSize: 32, fontWeight: '900' }}>
              {importe} €
            </Text>
            <Text style={{ color: C.textoSuave, fontSize: 12 }}>mínimo {minimo} €</Text>
          </View>
          <TouchableOpacity
            onPress={() => setImporte((v) => Math.min(maximoPosible, v + 1))}
            disabled={importe >= maximoPosible}
            style={[{ paddingHorizontal: 22, paddingVertical: 8 },
                    importe >= maximoPosible && S.desactivado]}
          >
            <Text style={{ color: C.texto, fontSize: 26, fontWeight: '800' }}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Toca al jugador que acaba de cantar la puja. */}
      <Text style={S.etiqueta}>Puja de</Text>
      <ScrollView style={{ flex: 1 }}>
        {partida.jugadores.map((j, i) => {
          const color = colorJugador(i);
          const activo = puedePujar(partida, j.id) && j.dinero >= importe;
          const motivo =
            huecosLibres(j, partida.config) === 0
              ? 'plantilla llena'
              : subasta.lider === j.id
                ? 'puja más alta'
                : j.dinero < minimo
                  ? 'sin dinero'
                  : 'no le llega';
          return (
            <TouchableOpacity
              key={j.id}
              disabled={!activo}
              onPress={() => pujar(j.id, importe)}
              style={[
                S.tarjeta,
                { marginBottom: 8, borderColor: activo ? color : C.borde },
                !activo && S.desactivado,
              ]}
            >
              <View style={[S.fila, { justifyContent: 'space-between' }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.texto, fontSize: 18, fontWeight: '700' }}>
                    {j.nombre}
                  </Text>
                  <View style={[S.fila, { marginTop: 6 }]}>
                    <Huecos
                      llenos={j.plantilla.length}
                      total={partida.config.huecos}
                      color={color}
                    />
                    <Text style={{ color: C.textoSuave, fontSize: 13 }}>
                      {activo ? `${j.dinero} € libres` : `${j.dinero} € · ${motivo}`}
                    </Text>
                  </View>
                </View>
                <Text style={{ color, fontSize: 22, fontWeight: '900' }}>
                  {activo ? `${importe} €` : '—'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={{ gap: 8, paddingTop: 8 }}>
        <TouchableOpacity
          style={[S.boton, !lider && S.desactivado]}
          disabled={!lider}
          onPress={adjudicar}
        >
          <Text style={S.botonTexto}>
            {lider ? `¡Adjudicado a ${lider.nombre}! (${subasta.pujaActual} €)` : 'Adjudicar'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={S.botonSec} onPress={descartar}>
          <Text style={S.botonSecTexto}>Nadie lo quiere · siguiente</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
