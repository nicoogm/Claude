import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import {
  adjudicar,
  crearPartida,
  descartar,
  huecosLibres,
  ordenDeTurno,
  pasar,
  puedePujar,
  pujar,
  pujaMinimaActual,
  sortearItems,
} from './motor.ts';
import type { Config, Item, Partida } from './tipos.ts';

const config: Config = {
  temaId: 'test',
  monedaId: 'cabras',
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
const turno = (p: Partida) => p.subasta?.turno;

/**
 * Atajo para los tests: los que van antes en el turno se plantan, `ganador`
 * abre con `precio` y el resto se planta hasta que el lote se cierra.
 */
const compra = (p: Partida, ganador: string, precio: number) => {
  const lote = p.subasta!.item.id;
  const mismoLote = (q: Partida) => q.subasta?.item.id === lote;
  let q = p;
  while (mismoLote(q) && q.subasta!.turno !== ganador) q = pasar(q, q.subasta!.turno);
  if (!mismoLote(q)) throw new Error(`El lote se cerró antes del turno de ${ganador}`);
  q = pujar(q, ganador, precio);
  while (mismoLote(q)) q = pasar(q, q.subasta!.turno);
  return q;
};

describe('arranque de partida', () => {
  it('reparte presupuesto y abre el primer lote', () => {
    const p = nueva();
    assert.equal(p.fase, 'subasta');
    assert.equal(p.subasta?.item.id, 'i1');
    assert.deepEqual(p.jugadores.map((x) => x.dinero), [20, 20, 20]);
  });

  it('empieza pujando el primer jugador', () => {
    assert.equal(turno(nueva()), 'j1');
  });
});

describe('turnos y rotación', () => {
  it('el turno avanza al siguiente tras pujar', () => {
    const p = pujar(nueva(), 'j1', 1);
    assert.equal(turno(p), 'j2');
  });

  it('el turno avanza al siguiente tras plantarse', () => {
    const p = pasar(nueva(), 'j1');
    assert.equal(turno(p), 'j2');
  });

  it('da la vuelta al orden circularmente', () => {
    let p = nueva();
    p = pujar(p, 'j1', 1);
    p = pujar(p, 'j2', 2);
    p = pujar(p, 'j3', 3);
    assert.equal(turno(p), 'j1'); // vuelve al primero, que puede resubir
  });

  it('quien abre el lote rota en cada uno', () => {
    let p = nueva();
    assert.equal(p.subasta?.inicial, 0);
    p = compra(p, 'j1', 1);
    assert.equal(p.subasta?.inicial, 1);
    assert.equal(turno(p), 'j2');
    p = compra(p, 'j2', 1);
    assert.equal(turno(p), 'j3');
    p = compra(p, 'j3', 1);
    assert.equal(turno(p), 'j1'); // vuelta completa
  });

  it('ordenDeTurno rota la mesa sin perder a nadie', () => {
    const p = nueva();
    assert.deepEqual(ordenDeTurno(p, 1).map((x) => x.id), ['j2', 'j3', 'j1']);
  });

  it('solo puede pujar quien tiene el turno', () => {
    const p = nueva();
    assert.equal(puedePujar(p, 'j1'), true);
    assert.equal(puedePujar(p, 'j2'), false);
    assert.throws(() => pujar(p, 'j2', 5), /No es el turno/);
    assert.throws(() => pasar(p, 'j3'), /No es el turno/);
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

  it('rechaza pujar más de lo que se tiene', () => {
    assert.throws(() => pujar(nueva(), 'j1', 21), /dinero disponible/);
  });

  it('descuenta el dinero al adjudicar', () => {
    const p = compra(nueva(), 'j1', 7);
    assert.equal(j(p, 'j1').dinero, 13);
    assert.equal(j(p, 'j1').plantilla[0].precio, 7);
  });
});

describe('cierre del lote', () => {
  it('se adjudica solo cuando todos los rivales se plantan', () => {
    let p = nueva();
    p = pujar(p, 'j1', 4);
    p = pasar(p, 'j2');
    assert.equal(p.subasta?.item.id, 'i1'); // sigue vivo: falta j3
    p = pasar(p, 'j3');
    assert.equal(j(p, 'j1').plantilla.length, 1);
    assert.equal(p.subasta?.item.id, 'i2'); // lote nuevo
  });

  it('el líder no vuelve a tener el turno mientras nadie le supere', () => {
    let p = nueva();
    p = pujar(p, 'j1', 2);
    p = pasar(p, 'j2');
    assert.equal(turno(p), 'j3'); // no vuelve a j1
  });

  it('se descarta si todos se plantan sin pujar', () => {
    let p = nueva();
    p = pasar(p, 'j1');
    p = pasar(p, 'j2');
    p = pasar(p, 'j3');
    assert.deepEqual(p.descartados.map((i) => i.id), ['i1']);
    assert.equal(p.subasta?.item.id, 'i2');
  });

  it('deja fuera del lote a quien no llega al mínimo', () => {
    let p = nueva(12, { presupuesto: 5 });
    p = pujar(p, 'j1', 5);   // Ana lo apuesta todo: el mínimo pasa a 6
    // Nadie puede superarla, así que el lote se cierra sin más turnos.
    assert.equal(j(p, 'j1').plantilla.length, 1);
    assert.equal(j(p, 'j1').dinero, 0);
    assert.equal(p.subasta?.item.id, 'i2');
  });

  it('quien tiene la plantilla llena no entra en los lotes siguientes', () => {
    let p = nueva();
    p = compra(p, 'j1', 1);
    p = compra(p, 'j1', 1);
    p = compra(p, 'j1', 1);
    assert.equal(huecosLibres(j(p, 'j1'), p.config), 0);
    assert.ok(!p.subasta?.activos.includes('j1'));
    assert.notEqual(turno(p), 'j1');
  });
});

describe('fin de partida y auto-relleno', () => {
  it('termina cuando todas las plantillas están llenas', () => {
    let p = nueva(9);
    // Ana y Bea llenan las suyas pujando; a Caj le caen las tres restantes.
    for (const id of ['j1', 'j1', 'j1', 'j2', 'j2', 'j2']) p = compra(p, id, 1);
    assert.equal(p.fase, 'resultados');
    assert.ok(p.jugadores.every((x) => x.plantilla.length === 3));
    assert.deepEqual(
      j(p, 'j3').plantilla.map((a) => a.modo),
      ['forzado', 'forzado', 'forzado'],
    );
  });

  it('corta y reparte en cuanto ya nadie puede pujar', () => {
    let p = nueva(12, { presupuesto: 5 });
    p = compra(p, 'j1', 5);
    p = compra(p, 'j2', 5);
    // Caj se queda sola: los lotes le caen al mínimo hasta gastar sus 5 cabras.
    assert.equal(p.fase, 'resultados');
    assert.equal(j(p, 'j3').plantilla.length, 3);
    assert.deepEqual(j(p, 'j3').plantilla.map((a) => a.precio), [1, 1, 1]);
    assert.equal(j(p, 'j3').dinero, 2);
    // Ana y Bea, sin cabras, completan sus huecos con el auto-relleno.
    assert.ok(j(p, 'j1').plantilla.slice(1).every((a) => a.modo === 'relleno'));
    assert.ok(p.jugadores.every((x) => x.plantilla.length === 3));
  });

  it('reparte los sobrantes al agotarse la lista', () => {
    let p = nueva(5);
    p = compra(p, 'j1', 1);
    p = compra(p, 'j1', 1);
    p = compra(p, 'j1', 1);
    assert.equal(p.fase, 'subasta');
    p = descartar(p);
    p = descartar(p);
    assert.equal(p.fase, 'resultados');
    assert.deepEqual(j(p, 'j2').plantilla.map((a) => a.item.id), ['i4']);
    assert.deepEqual(j(p, 'j3').plantilla.map((a) => a.item.id), ['i5']);
    assert.equal(j(p, 'j2').plantilla[0].modo, 'relleno');
    assert.equal(j(p, 'j2').plantilla[0].precio, 0);
  });

  it('no deja a nadie con más ítems que huecos', () => {
    let q = nueva(40);
    while (q.fase === 'subasta') q = adjudicar(q); // nadie puja nunca
    assert.ok(q.jugadores.every((x) => x.plantilla.length === 3));
    assert.equal(q.descartados.length, 40 - 9);
  });
});

describe('sorteo de ítems', () => {
  it('saca la cantidad pedida sin repetir', () => {
    const sorteados = sortearItems(items(100), 18);
    assert.equal(sorteados.length, 18);
    assert.equal(new Set(sorteados.map((i) => i.id)).size, 18);
  });

  it('no pide más de lo que hay en la lista', () => {
    assert.equal(sortearItems(items(5), 20).length, 5);
  });

  it('dos sorteos del mismo tema no dan la misma lista', () => {
    const lista = items(100);
    const a = sortearItems(lista, 18).map((i) => i.id).join();
    const b = sortearItems(lista, 18).map((i) => i.id).join();
    assert.notEqual(a, b);
  });

  it('todos los ítems de la lista pueden salir', () => {
    const lista = items(30);
    const vistos = new Set<string>();
    for (let i = 0; i < 200; i++) {
      for (const it of sortearItems(lista, 9)) vistos.add(it.id);
    }
    assert.equal(vistos.size, 30);
  });
});

describe('quien no llega al importe queda fuera', () => {
  // Presupuesto ajustado para que j1 se quede corto a mitad de lote.
  const corta = () => crearPartida({ ...config, presupuesto: 6 }, ['Ana', 'Bea', 'Caj'], items(12));

  it('sale de los activos en cuanto la puja le supera', () => {
    let p = corta();
    p = compra(p, 'j1', 5);           // a Ana le queda 1
    assert.equal(j(p, 'j1').dinero, 1);
    p = pujar(p, 'j2', 1);            // abre Bea; el mínimo pasa a 2
    assert.ok(!p.subasta!.activos.includes('j1'), 'Ana debería estar fuera del lote');
    assert.equal(puedePujar(p, 'j1'), false);
  });

  it('nunca le vuelve a tocar el turno en ese lote', () => {
    let p = corta();
    p = compra(p, 'j1', 5);
    p = pujar(p, 'j2', 1);
    const turnos: string[] = [];
    while (p.subasta && p.subasta.item.id === 'i2') {
      turnos.push(p.subasta.turno);
      p = pasar(p, p.subasta.turno);
    }
    assert.ok(!turnos.includes('j1'), `Ana no debía tener turno, y los hubo: ${turnos}`);
  });

  it('tampoco puede abrir un lote si no llega a la puja mínima', () => {
    let p = crearPartida({ ...config, presupuesto: 6, pujaMin: 2 }, ['Ana', 'Bea', 'Caj'], items(12));
    p = compra(p, 'j1', 5);           // a Ana le queda 1, y abrir cuesta 2
    assert.ok(!p.subasta!.activos.includes('j1'));
    assert.notEqual(p.subasta!.turno, 'j1');
  });

  it('sigue jugando los lotes que sí puede pagar', () => {
    let p = corta();
    p = compra(p, 'j1', 5);
    // Lote nuevo: con 1 cabra Ana puede abrir, porque la mínima es 1.
    p = compra(p, 'j2', 1);
    assert.ok(p.subasta!.activos.includes('j1'));
  });
});

describe('cuando solo queda uno que pueda pujar', () => {
  it('el lote es suyo por la puja mínima, sin opción a plantarse', () => {
    let p = nueva(12);
    // Ana y Bea llenan sus tres huecos; Caj se queda sola con huecos libres.
    for (const id of ['j1', 'j1', 'j1', 'j2', 'j2', 'j2']) p = compra(p, id, 1);
    const caj = j(p, 'j3');
    assert.equal(caj.plantilla.length, 3);
    assert.ok(caj.plantilla.every((a) => a.modo === 'forzado'));
    assert.ok(caj.plantilla.every((a) => a.precio === p.config.pujaMin));
  });

  it('respeta la puja mínima configurada, no siempre 1', () => {
    let p = nueva(12, { pujaMin: 3 });
    for (const id of ['j1', 'j1', 'j1', 'j2', 'j2', 'j2']) p = compra(p, id, 3);
    assert.deepEqual(j(p, 'j3').plantilla.map((a) => a.precio), [3, 3, 3]);
  });

  it('en cuanto se queda sin cabras, los siguientes le caen gratis', () => {
    let p = nueva(12, { presupuesto: 4 });
    p = compra(p, 'j3', 4);                       // Caj se funde todo en un lote
    for (const id of ['j1', 'j1', 'j1']) p = compra(p, id, 1);
    // Bea se queda sola y se lleva los suyos forzados al mínimo.
    assert.ok(j(p, 'j2').plantilla.every((a) => a.modo === 'forzado'));
    // Caj, con huecos pero sin cabras, los completa por auto-relleno.
    assert.equal(j(p, 'j3').dinero, 0);
    assert.deepEqual(j(p, 'j3').plantilla.map((a) => a.modo), ['puja', 'relleno', 'relleno']);
    assert.equal(p.fase, 'resultados');
  });

  it('nunca se le ofrece plantarse: no hay subasta abierta para él', () => {
    let p = nueva(12);
    for (const id of ['j1', 'j1', 'j1', 'j2', 'j2', 'j2']) p = compra(p, id, 1);
    // La partida ya ha terminado: no queda ningún turno que ofrecerle.
    assert.equal(p.subasta, null);
    assert.equal(p.fase, 'resultados');
  });
});
