import { create } from 'zustand';
import {
  adjudicar,
  crearPartida,
  descartar,
  pasar,
  pujar,
} from '../motor/motor.ts';
import type { Config, Item, Partida } from '../motor/tipos.ts';
import { borrarPartida, guardarPartida } from './preferencias.ts';

type Estado = {
  partida: Partida | null;
  /** Pila de estados anteriores: el motor es puro, así que deshacer es un pop. */
  pasado: Partida[];
  iniciar: (config: Config, nombres: string[], items: Item[]) => void;
  /** Retoma una partida guardada en el móvil. */
  retomar: (p: Partida) => void;
  pujar: (jugadorId: string, importe: number) => void;
  pasar: (jugadorId: string) => void;
  adjudicar: () => void;
  descartar: () => void;
  deshacer: () => void;
  puedeDeshacer: () => boolean;
  salir: () => void;
};

export const usePartida = create<Estado>((set, get) => {
  /** Aplica una transición del motor guardando el estado previo para deshacer. */
  const aplicar = (fn: (p: Partida) => Partida) => {
    const { partida, pasado } = get();
    if (!partida) return;
    const siguiente = fn(partida);
    set({ partida: siguiente, pasado: [...pasado, partida] });
    guardarPartida(siguiente);
  };

  return {
    partida: null,
    pasado: [],
    iniciar: (config, nombres, items) => {
      const nueva = crearPartida(config, nombres, items);
      set({ partida: nueva, pasado: [] });
      guardarPartida(nueva);
    },
    retomar: (p) => set({ partida: p, pasado: [] }),
    pujar: (jugadorId, importe) => aplicar((p) => pujar(p, jugadorId, importe)),
    pasar: (jugadorId) => aplicar((p) => pasar(p, jugadorId)),
    adjudicar: () => aplicar(adjudicar),
    descartar: () => aplicar(descartar),
    deshacer: () => {
      const { pasado } = get();
      const anterior = pasado.at(-1);
      if (!anterior) return;
      set({ partida: anterior, pasado: pasado.slice(0, -1) });
      guardarPartida(anterior);
    },
    puedeDeshacer: () => get().pasado.length > 0,
    salir: () => {
      borrarPartida();
      set({ partida: null, pasado: [] });
    },
  };
});
