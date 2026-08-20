export type Divisa = {
  id: string;
  singular: string;
  plural: string;
  emoji: string;
};

export const DIVISAS: Divisa[] = [
  { id: 'cabras', singular: 'cabra', plural: 'cabras', emoji: '🐐' },
  { id: 'gambas', singular: 'gamba', plural: 'gambas', emoji: '🦐' },
  { id: 'platanos', singular: 'plátano', plural: 'plátanos', emoji: '🍌' },
  { id: 'patos', singular: 'pato', plural: 'patos', emoji: '🦆' },
];

export const divisaPorId = (id: string): Divisa =>
  DIVISAS.find((d) => d.id === id) ?? DIVISAS[0];

/** Formato corto para la interfaz: «12 🐐». */
export const precio = (n: number, d: Divisa) => `${n} ${d.emoji}`;

/** Formato largo para textos: «1 cabra», «12 cabras». */
export const precioLargo = (n: number, d: Divisa) =>
  `${n} ${n === 1 ? d.singular : d.plural}`;
