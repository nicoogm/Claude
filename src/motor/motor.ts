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
  const mazo = config.ordenAleatorio ? barajar(items, rng) : [...items];
  const partida: Partida = {
    config,
    jugadores,
    mazo,
    descartados: [],
    subasta: null,
    fase: 'subasta',
    historial: [],
  };
  return siguienteItem(partida);
}

export const huecosLibres = (j: Jugador, config: Config): number =>
  config.huecos - j.plantilla.length;

export const jugador = (p: Partida, id: string): Jugador => {
  const j = p.jugadores.find((x) => x.id === id);
  if (!j) throw new Error(`Jugador desconocido: ${id}`);
  return j;
};

/** Importe mínimo con el que se puede entrar en la subasta actual. */
export function pujaMinimaActual(p: Partida): number {
  if (!p.subasta) return p.config.pujaMin;
  return p.subasta.lider === null
    ? p.config.pujaMin
    : p.subasta.pujaActual + p.config.incremento;
}

/**
 * Un jugador puede pujar si le queda algún hueco, no es ya el líder de la
 * subasta y le llega el dinero para la puja mínima actual.
 */
export function puedePujar(p: Partida, jugadorId: string): boolean {
  if (p.fase !== 'subasta' || !p.subasta) return false;
  const j = jugador(p, jugadorId);
  if (huecosLibres(j, p.config) <= 0) return false;
  if (p.subasta.lider === jugadorId) return false;
  return j.dinero >= pujaMinimaActual(p);
}

export function pujar(p: Partida, jugadorId: string, importe: number): Partida {
  if (!p.subasta) throw new Error('No hay subasta abierta');
  if (!puedePujar(p, jugadorId)) {
    throw new Error(`${jugadorId} no puede pujar ahora`);
  }
  const minimo = pujaMinimaActual(p);
  if (importe < minimo) {
    throw new Error(`La puja mínima es ${minimo} €`);
  }
  if (importe > jugador(p, jugadorId).dinero) {
    throw new Error('Puja superior al dinero disponible');
  }
  return {
    ...p,
    subasta: { ...p.subasta, pujaActual: importe, lider: jugadorId },
    historial: [
      ...p.historial,
      { tipo: 'puja', jugadorId, itemId: p.subasta.item.id, importe },
    ],
  };
}

/** Cierra el ítem actual: se lo lleva el líder, o se descarta si no hubo pujas. */
export function adjudicar(p: Partida): Partida {
  if (!p.subasta) throw new Error('No hay subasta abierta');
  const { item, pujaActual, lider } = p.subasta;
  if (lider === null) return descartar(p);

  const evento: Evento = {
    tipo: 'adjudicacion',
    jugadorId: lider,
    itemId: item.id,
    precio: pujaActual,
  };
  const jugadores = p.jugadores.map((j) =>
    j.id === lider
      ? {
          ...j,
          dinero: j.dinero - pujaActual,
          plantilla: [...j.plantilla, { item, precio: pujaActual, auto: false }],
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

/** Nadie puja por el ítem: va al montón de sobrantes. */
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

/** ¿Queda alguien capaz de pujar por el siguiente ítem? */
const quedanPujadores = (p: Partida): boolean =>
  p.jugadores.some(
    (j) => huecosLibres(j, p.config) > 0 && j.dinero >= p.config.pujaMin,
  );

/**
 * Saca el siguiente ítem a subasta. La partida se cierra —aplicando el
 * auto-relleno— cuando todas las plantillas están llenas, cuando se agota la
 * lista o cuando ya nadie tiene dinero para seguir pujando.
 */
function siguienteItem(p: Partida): Partida {
  if (plantillasCompletas(p) || p.mazo.length === 0 || !quedanPujadores(p)) {
    return aplicarAutoRelleno({ ...p, subasta: null, fase: 'resultados' });
  }
  const [item, ...resto] = p.mazo;
  return {
    ...p,
    mazo: resto,
    subasta: { item, pujaActual: 0, lider: null },
  };
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
      j.plantilla.push({ item, precio: 0, auto: true });
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
