export type Item = { id: string; nombre: string };

export type Tema = {
  id: string;
  titulo: string;
  items: Item[];
  propio: boolean;
};

/**
 * Cómo ha llegado un ítem a la plantilla:
 * - `puja`: se lo llevó pujando contra alguien.
 * - `forzado`: era el único que podía llevárselo, así que lo paga al mínimo.
 * - `relleno`: la partida acabó y se le asignó gratis para completar huecos.
 */
export type ModoAdquisicion = 'puja' | 'forzado' | 'relleno';

export type Adquisicion = { item: Item; precio: number; modo: ModoAdquisicion };

export type Jugador = {
  id: string;
  nombre: string;
  dinero: number;
  plantilla: Adquisicion[];
};

export type Config = {
  temaId: string;
  /** Divisa con la que se juega (cabras, gambas…). */
  monedaId: string;
  presupuesto: number;
  huecos: number;
  pujaMin: number;
  incremento: number;
  ordenAleatorio: boolean;
};

export type Subasta = {
  item: Item;
  pujaActual: number;
  lider: string | null;
  /** Quiénes siguen vivos en este lote: aún no se han plantado. */
  activos: string[];
  /** A quién le toca decidir ahora mismo. */
  turno: string;
  /** Jugador que abrió el lote; rota en cada uno. */
  inicial: number;
};

export type Fase = 'subasta' | 'resultados';

export type Evento =
  | { tipo: 'puja'; jugadorId: string; itemId: string; importe: number }
  | { tipo: 'adjudicacion'; jugadorId: string; itemId: string; precio: number }
  | { tipo: 'plante'; jugadorId: string; itemId: string }
  | { tipo: 'forzada'; jugadorId: string; itemId: string; precio: number }
  | { tipo: 'descarte'; itemId: string }
  | { tipo: 'autoRelleno'; jugadorId: string; itemId: string };

export type Partida = {
  config: Config;
  jugadores: Jugador[];
  /** Ítems pendientes de subastar, en el orden en que van a salir. */
  mazo: Item[];
  /** Ítems que nadie quiso; vuelven al bombo en el auto-relleno final. */
  descartados: Item[];
  subasta: Subasta | null;
  /** Índice del jugador que abre el siguiente lote. */
  turnoInicial: number;
  fase: Fase;
  historial: Evento[];
};
