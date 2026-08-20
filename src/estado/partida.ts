import { create } from 'zustand';
import {
  adjudicar,
  crearPartida,
  descartar,
  pujar,
} from '../motor/motor.ts';
import type { Config, Item, Partida } from '../motor/tipos.ts';

type Estado = {
  partida: Partida | null;
  /** Pila de estados anteriores: el motor es puro, así que deshacer es un pop. */
  pasado: Partida[];
  iniciar: (config: Config, nombres: string[], items: Item[]) => void;
  pujar: (jugadorId: string, importe: number) => void;
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
    set({ partida: fn(partida), pasado: [...pasado, partida] });
  };

  return {
    partida: null,
    pasado: [],
    iniciar: (config, nombres, items) =>
      set({ partida: crearPartida(config, nombres, items), pasado: [] }),
    pujar: (jugadorId, importe) => aplicar((p) => pujar(p, jugadorId, importe)),
    adjudicar: () => aplicar(adjudicar),
    descartar: () => aplicar(descartar),
    deshacer: () => {
      const { pasado } = get();
      const anterior = pasado.at(-1);
      if (!anterior) return;
      set({ partida: anterior, pasado: pasado.slice(0, -1) });
    },
    puedeDeshacer: () => get().pasado.length > 0,
    salir: () => set({ partida: null, pasado: [] }),
  };
});
