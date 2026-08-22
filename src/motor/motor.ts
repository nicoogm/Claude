import type {
  Config,
  Evento,
  Item,
  Jugador,
  Partida,
} from './tipos';

/** Baraja una copia del array. `rng` inyectable para poder testear. */
export function barajar<T>(xs: T[], rng: () => number = Math.random): T[] {
  const copia = [...xs];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/**
 * Saca al azar `cantidad` ítems de la lista del tema. Cada partida juega solo
 * con una parte de la lista, así que dos partidas del mismo tema no se repiten.
 */
export function sortearItems(
  items: Item[],
  cantidad: number,
  rng: () => number = Math.random,
): Item[] {
  return barajar(items, rng).slice(0, Math.min(cantidad, items.length));
}

export function crearPartida(
  config: Config,
  nombres: string[],
  items: Item[],
  rng: () => number = Math.random,
): Partida {
  const jugadores: Jugador[] = nombres.map((nombre, i) => ({
    id: `j${i + 1}`,
    nombre,
    dinero: config.presupuesto,
    plantilla: [],
  }));
  return siguienteItem({
    config,
    jugadores,
    mazo: config.ordenAleatorio ? barajar(items, rng) : [...items],
    descartados: [],
    subasta: null,
    turnoInicial: 0,
    fase: 'subasta',
    historial: [],
  });
}

export const huecosLibres = (j: Jugador, config: Config): number =>
  config.huecos - j.plantilla.length;

export const jugador = (p: Partida, id: string): Jugador => {
  const j = p.jugadores.find((x) => x.id === id);
  if (!j) throw new Error(`Jugador desconocido: ${id}`);
  return j;
};

/** Importe mínimo con el que se puede entrar o subir en la subasta actual. */
export function pujaMinimaActual(p: Partida): number {
  if (!p.subasta) return p.config.pujaMin;
  return p.subasta.lider === null
    ? p.config.pujaMin
    : p.subasta.pujaActual + p.config.incremento;
}

/** Orden de turno del lote actual, empezando por quien lo abre. */
export function ordenDeTurno(p: Partida, inicial: number): Jugador[] {
  const n = p.jugadores.length;
  return Array.from({ length: n }, (_, k) => p.jugadores[(inicial + k) % n]);
}

/** Puede seguir en el lote quien tiene hueco libre y dinero para subir. */
const puedeSeguir = (p: Partida, j: Jugador, minimo: number): boolean =>
  huecosLibres(j, p.config) > 0 && j.dinero >= minimo;

/** Solo puja quien tiene el turno. */
export function puedePujar(p: Partida, jugadorId: string): boolean {
  return (
    p.fase === 'subasta' &&
    p.subasta !== null &&
    p.subasta.turno === jugadorId &&
    jugador(p, jugadorId).dinero >= pujaMinimaActual(p)
  );
}

export function pujar(p: Partida, jugadorId: string, importe: number): Partida {
  if (!p.subasta) throw new Error('No hay subasta abierta');
  if (p.subasta.turno !== jugadorId) {
    throw new Error(`No es el turno de ${jugadorId}`);
  }
  const minimo = pujaMinimaActual(p);
  if (importe < minimo) throw new Error(`La puja mínima es ${minimo}`);
  if (importe > jugador(p, jugadorId).dinero) {
    throw new Error('Puja superior al dinero disponible');
  }
  return pasarElTurno({
    ...p,
    subasta: { ...p.subasta, pujaActual: importe, lider: jugadorId },
    historial: [
      ...p.historial,
      { tipo: 'puja', jugadorId, itemId: p.subasta.item.id, importe },
    ],
  });
}

/** El jugador se planta: deja de pujar por este lote (no por la partida). */
export function pasar(p: Partida, jugadorId: string): Partida {
  if (!p.subasta) throw new Error('No hay subasta abierta');
  if (p.subasta.turno !== jugadorId) {
    throw new Error(`No es el turno de ${jugadorId}`);
  }
  return pasarElTurno({
    ...p,
    subasta: {
      ...p.subasta,
      activos: p.subasta.activos.filter((id) => id !== jugadorId),
    },
    historial: [
      ...p.historial,
      { tipo: 'plante', jugadorId, itemId: p.subasta.item.id },
    ],
  });
}

/**
 * Da el turno al siguiente que pueda decidir algo. Si ya no queda nadie que
 * pueda superar al líder, el lote se adjudica; si nadie ha pujado, se descarta.
 */
function pasarElTurno(p: Partida): Partida {
  const s = p.subasta!;
  const minimo = pujaMinimaActual(p);
  const orden = ordenDeTurno(p, s.inicial);

  // Quien no llegue al mínimo queda fuera del lote sin tener que plantarse.
  const enPie = orden.filter(
    (j) => s.activos.includes(j.id) && puedeSeguir(p, j, minimo),
  );
  const rivales = enPie.filter((j) => j.id !== s.lider);

  if (s.lider !== null && rivales.length === 0) return adjudicar(p);
  if (s.lider === null && enPie.length === 0) return descartar(p);
  /*
   * Si nadie ha pujado y solo queda uno por decidir, el lote es suyo por la
   * mínima: no hay a quién pasárselo. Así todo lote acaba adjudicado y el
   * sorteo puede tener exactamente tantos lotes como huecos hay en la mesa.
   */
  if (s.lider === null && enPie.length === 1) {
    return adjudicar(
      { ...p, subasta: { ...s, pujaActual: p.config.pujaMin, lider: enPie[0].id } },
      true,
    );
  }

  // El siguiente en el orden circular a partir de quien acaba de decidir.
  const candidatos = s.lider === null ? enPie : rivales;
  const desde = orden.findIndex((j) => j.id === s.turno);
  const siguiente =
    candidatos.find((j) => orden.indexOf(j) > desde) ?? candidatos[0];

  return {
    ...p,
    subasta: { ...s, activos: enPie.map((j) => j.id), turno: siguiente.id },
  };
}

/**
 * Cierra el lote: se lo lleva el líder. `forzado` marca el caso en que era el
 * único que podía quedárselo y por tanto no ha habido puja de verdad.
 */
export function adjudicar(p: Partida, forzado = false): Partida {
  if (!p.subasta) throw new Error('No hay subasta abierta');
  const { item, pujaActual, lider } = p.subasta;
  if (lider === null) return descartar(p);

  const evento: Evento = forzado
    ? { tipo: 'forzada', jugadorId: lider, itemId: item.id, precio: pujaActual }
    : { tipo: 'adjudicacion', jugadorId: lider, itemId: item.id, precio: pujaActual };
  const jugadores = p.jugadores.map((j) =>
    j.id === lider
      ? {
          ...j,
          dinero: j.dinero - pujaActual,
          plantilla: [
            ...j.plantilla,
            { item, precio: pujaActual, modo: forzado ? ('forzado' as const) : ('puja' as const) },
          ],
        }
      : j,
  );
  return siguienteItem({
    ...p,
    jugadores,
    subasta: null,
    historial: [...p.historial, evento],
  });
}

/** Nadie quiso el lote: va al montón de sobrantes. */
export function descartar(p: Partida): Partida {
  if (!p.subasta) throw new Error('No hay subasta abierta');
  const { item } = p.subasta;
  return siguienteItem({
    ...p,
    descartados: [...p.descartados, item],
    subasta: null,
    historial: [...p.historial, { tipo: 'descarte', itemId: item.id }],
  });
}

const plantillasCompletas = (p: Partida): boolean =>
  p.jugadores.every((j) => huecosLibres(j, p.config) === 0);

/** ¿Queda alguien capaz de pujar por el siguiente lote? */
const quedanPujadores = (p: Partida): boolean =>
  p.jugadores.some((j) => puedeSeguir(p, j, p.config.pujaMin));

/**
 * Abre el siguiente lote, rotando quién arranca la puja. La partida se cierra
 * —aplicando el auto-relleno— cuando todas las plantillas están llenas, cuando
 * se agota la lista o cuando ya nadie tiene dinero para seguir pujando.
 */
function siguienteItem(p: Partida): Partida {
  if (plantillasCompletas(p) || p.mazo.length === 0 || !quedanPujadores(p)) {
    return aplicarAutoRelleno({ ...p, subasta: null, fase: 'resultados' });
  }
  const [item, ...resto] = p.mazo;
  const inicial = p.turnoInicial % p.jugadores.length;
  const orden = ordenDeTurno(p, inicial);
  const enPie = orden.filter((j) => puedeSeguir(p, j, p.config.pujaMin));

  const conLote: Partida = {
    ...p,
    mazo: resto,
    turnoInicial: (inicial + 1) % p.jugadores.length,
    subasta: {
      item,
      pujaActual: 0,
      lider: null,
      activos: enPie.map((j) => j.id),
      turno: enPie[0]?.id ?? orden[0].id,
      inicial,
    },
  };
  // Si nadie puede abrir este lote, se descarta y se pasa al siguiente.
  if (enPie.length === 0) return descartar(conLote);

  /*
   * Si solo queda uno con huecos y dinero, no hay contra quién pujar ni nada
   * que decidir: el lote es suyo por la puja mínima, sin opción a plantarse.
   * Cuando se le acaben las cabras, `quedanPujadores` se vuelve falso y el
   * resto de lotes le caen ya gratis por el auto-relleno.
   */
  if (enPie.length === 1) {
    return adjudicar(
      {
        ...conLote,
        subasta: { ...conLote.subasta!, pujaActual: p.config.pujaMin, lider: enPie[0].id },
      },
      true,
    );
  }

  return conLote;
}

/**
 * Regla acordada: cuando la partida se cierra con huecos vacíos, estos se
 * rellenan gratis con los ítems que vienen a continuación —primero los que no
 * llegaron a subastarse, en su orden, y después los descartados— repartidos
 * por rondas entre los jugadores incompletos, en orden de jugador.
 */
export function aplicarAutoRelleno(p: Partida): Partida {
  const bombo = [...p.mazo, ...p.descartados];
  if (bombo.length === 0) return p;

  const jugadores = p.jugadores.map((j) => ({ ...j, plantilla: [...j.plantilla] }));
  const historial = [...p.historial];
  let repartido = 0;

  while (repartido < bombo.length) {
    const incompletos = jugadores.filter((j) => huecosLibres(j, p.config) > 0);
    if (incompletos.length === 0) break;
    for (const j of incompletos) {
      if (repartido >= bombo.length) break;
      const item = bombo[repartido++];
      j.plantilla.push({ item, precio: 0, modo: 'relleno' });
      historial.push({ tipo: 'autoRelleno', jugadorId: j.id, itemId: item.id });
    }
  }

  return {
    ...p,
    jugadores,
    mazo: [],
    descartados: bombo.slice(repartido),
    historial,
  };
}
