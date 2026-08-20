export type Item = { id: string; nombre: string };

export type Tema = {
  id: string;
  titulo: string;
  items: Item[];
  propio: boolean;
};

/** Un ítem ya en la plantilla de un jugador. `auto` = llegó por auto-relleno. */
export type Adquisicion = { item: Item; precio: number; auto: boolean };

export type Jugador = {
  id: string;
  nombre: string;
  dinero: number;
  plantilla: Adquisicion[];
};

export type Config = {
  temaId: string;
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
};

export type Fase = 'subasta' | 'resultados';

export type Evento =
  | { tipo: 'puja'; jugadorId: string; itemId: string; importe: number }
  | { tipo: 'adjudicacion'; jugadorId: string; itemId: string; precio: number }
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
  fase: Fase;
  historial: Evento[];
};
