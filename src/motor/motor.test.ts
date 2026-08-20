import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import {
  adjudicar,
  crearPartida,
  descartar,
  huecosLibres,
  puedePujar,
  pujar,
  pujaMinimaActual,
} from './motor.ts';
import type { Config, Item, Partida } from './tipos.ts';

const config: Config = {
  temaId: 'test',
  presupuesto: 20,
  huecos: 3,
  pujaMin: 1,
  incremento: 1,
  ordenAleatorio: false,
};

const items = (n: number): Item[] =>
  Array.from({ length: n }, (_, i) => ({ id: `i${i + 1}`, nombre: `Item ${i + 1}` }));

const nueva = (n = 12, cfg: Partial<Config> = {}) =>
  crearPartida({ ...config, ...cfg }, ['Ana', 'Bea', 'Caj'], items(n));

const j = (p: Partida, id: string) => p.jugadores.find((x) => x.id === id)!;

/** Adjudica el ítem actual a `jugadorId` por `precio`. */
const compra = (p: Partida, jugadorId: string, precio: number) =>
  adjudicar(pujar(p, jugadorId, precio));

describe('arranque de partida', () => {
  it('reparte presupuesto y saca el primer ítem', () => {
    const p = nueva();
    assert.equal(p.fase, 'subasta');
    assert.equal(p.subasta?.item.id, 'i1');
    assert.deepEqual(p.jugadores.map((x) => x.dinero), [20, 20, 20]);
  });

  it('respeta el orden de la lista cuando no es aleatorio', () => {
    const p = adjudicar(pujar(nueva(), 'j1', 1));
    assert.equal(p.subasta?.item.id, 'i2');
  });
});

describe('reglas de puja', () => {
  it('la primera puja es la mínima y luego sube por incremento', () => {
    let p = nueva();
    assert.equal(pujaMinimaActual(p), 1);
    p = pujar(p, 'j1', 3);
    assert.equal(pujaMinimaActual(p), 4);
  });

  it('rechaza pujas por debajo del mínimo', () => {
    const p = pujar(nueva(), 'j1', 5);
    assert.throws(() => pujar(p, 'j2', 5), /mínima es 6/);
  });

  it('rechaza pujar más dinero del que se tiene', () => {
    assert.throws(() => pujar(nueva(), 'j1', 21), /dinero disponible/);
  });

  it('el líder no puede pujarse a sí mismo por encima', () => {
    const p = pujar(nueva(), 'j1', 2);
    assert.equal(puedePujar(p, 'j1'), false);
    assert.equal(puedePujar(p, 'j2'), true);
  });

  it('descuenta el dinero al adjudicar', () => {
    const p = compra(nueva(), 'j1', 7);
    assert.equal(j(p, 'j1').dinero, 13);
    assert.equal(j(p, 'j1').plantilla[0].precio, 7);
  });
});

describe('elegibilidad', () => {
  it('deja fuera a quien ya tiene los huecos llenos', () => {
    let p = nueva();
    p = compra(p, 'j1', 1);
    p = compra(p, 'j1', 1);
    p = compra(p, 'j1', 1);
    assert.equal(huecosLibres(j(p, 'j1'), p.config), 0);
    assert.equal(puedePujar(p, 'j1'), false);
  });

  it('deja fuera a quien no llega a la puja mínima actual', () => {
    let p = nueva();
    p = compra(p, 'j1', 19); // le queda 1 €
    assert.equal(puedePujar(p, 'j1'), true); // aún puede entrar por 1 €
    p = pujar(p, 'j2', 2);
    assert.equal(puedePujar(p, 'j1'), false);
  });
});

describe('descartes', () => {
  it('adjudicar sin pujas descarta el ítem', () => {
    const p = adjudicar(nueva());
    assert.deepEqual(p.descartados.map((i) => i.id), ['i1']);
    assert.equal(p.subasta?.item.id, 'i2');
    assert.equal(p.historial.at(-1)?.tipo, 'descarte');
  });
});

describe('fin de partida y auto-relleno (opción A)', () => {
  it('termina cuando todas las plantillas están llenas', () => {
    let p = nueva(9);
    for (const id of ['j1', 'j1', 'j1', 'j2', 'j2', 'j2', 'j3', 'j3', 'j3']) {
      p = compra(p, id, 1);
    }
    assert.equal(p.fase, 'resultados');
    assert.equal(p.subasta, null);
    assert.ok(p.jugadores.every((x) => x.plantilla.length === 3));
  });

  it('la subasta sigue viva hasta el final aunque alguien se arruine', () => {
    let p = nueva();
    p = compra(p, 'j1', 20); // j1 se queda a 0 con 2 huecos libres
    assert.equal(p.fase, 'subasta');
    assert.equal(puedePujar(p, 'j1'), false);
    assert.equal(j(p, 'j1').plantilla.length, 1);
  });

  it('reparte los sobrantes al agotarse la lista', () => {
    // 5 ítems: j1 compra los 3 primeros y nadie quiere los 2 últimos.
    let p = nueva(5);
    p = compra(p, 'j1', 1);
    p = compra(p, 'j1', 1);
    p = compra(p, 'j1', 1);
    assert.equal(p.fase, 'subasta'); // la lista aún no se ha agotado
    p = descartar(p);
    p = descartar(p);
    assert.equal(p.fase, 'resultados');
    assert.deepEqual(j(p, 'j2').plantilla.map((a) => a.item.id), ['i4']);
    assert.deepEqual(j(p, 'j3').plantilla.map((a) => a.item.id), ['i5']);
    assert.ok(j(p, 'j2').plantilla[0].auto);
    assert.equal(j(p, 'j2').plantilla[0].precio, 0);
  });

  it('los descartados vuelven al bombo del auto-relleno', () => {
    let p = nueva(4);
    p = descartar(p);            // i1 al montón
    p = compra(p, 'j1', 1);      // i2
    p = compra(p, 'j2', 1);      // i3
    p = compra(p, 'j3', 1);      // i4 -> se acaba la lista
    assert.equal(p.fase, 'resultados');
    // Solo queda i1 y va al primer jugador incompleto.
    assert.deepEqual(j(p, 'j1').plantilla.map((a) => a.item.id), ['i2', 'i1']);
    assert.equal(p.descartados.length, 0);
  });

  it('reparte por rondas entre los incompletos', () => {
    let p = nueva(7);
    p = compra(p, 'j1', 1); // i1
    p = compra(p, 'j1', 1); // i2
    p = compra(p, 'j1', 1); // i3 -> j1 lleno
    // Nadie quiere i4..i7: los 4 sobrantes se reparten entre j2 y j3.
    while (p.fase === 'subasta') p = descartar(p);
    assert.deepEqual(j(p, 'j2').plantilla.map((a) => a.item.id), ['i4', 'i6']);
    assert.deepEqual(j(p, 'j3').plantilla.map((a) => a.item.id), ['i5', 'i7']);
  });

  it('no deja a nadie con más ítems que huecos', () => {
    const p = nueva(40);
    let q = p;
    while (q.fase === 'subasta') q = adjudicar(q); // nadie puja nunca
    assert.ok(q.jugadores.every((x) => x.plantilla.length === 3));
    assert.equal(q.descartados.length, 40 - 9);
  });
});
