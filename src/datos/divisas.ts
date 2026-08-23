export type Divisa = {
  id: string;
  singular: string;
  plural: string;
  emoji: string;
  /** Para que los textos concuerden: «las cabras gastadas», «los patos gastados». */
  femenino: boolean;
};

export const DIVISAS: Divisa[] = [
  { id: 'cabras', singular: 'cabra', plural: 'cabras', emoji: '🐐', femenino: true },
  { id: 'gambas', singular: 'gamba', plural: 'gambas', emoji: '🦐', femenino: true },
  { id: 'platanos', singular: 'plátano', plural: 'plátanos', emoji: '🍌', femenino: false },
  { id: 'patos', singular: 'pato', plural: 'patos', emoji: '🦆', femenino: false },
];

export const divisaPorId = (id: string): Divisa =>
  DIVISAS.find((d) => d.id === id) ?? DIVISAS[0];

/** Formato corto para la interfaz: «12 🐐». */
export const precio = (n: number, d: Divisa) => `${n} ${d.emoji}`;

/** Formato largo para textos: «1 cabra», «12 cabras». */
export const precioLargo = (n: number, d: Divisa) =>
  `${n} ${n === 1 ? d.singular : d.plural}`;

/** «las cabras» / «los patos». */
export const articulo = (d: Divisa) => (d.femenino ? 'las' : 'los');

/** «gastadas» / «gastados», concordando con la divisa. */
export const gastadas = (d: Divisa) => (d.femenino ? 'gastadas' : 'gastados');
