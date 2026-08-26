import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Ajustes } from '../pantallas/Configuracion.tsx';
import type { Partida } from '../motor/tipos.ts';

const CLAVE = 'draft:ultimos-ajustes';
const CLAVE_PARTIDA = 'draft:partida-en-curso';

/**
 * Guarda la última configuración usada para no tener que reescribir los
 * nombres en cada partida. Si el almacenamiento falla (modo privado, permisos)
 * el juego sigue funcionando: solo se pierde la comodidad.
 */
export async function guardarAjustes(a: Ajustes): Promise<void> {
  try {
    await AsyncStorage.setItem(CLAVE, JSON.stringify(a));
  } catch {
    // Sin persistencia no pasa nada grave; no merece molestar al jugador.
  }
}

export async function leerAjustes(): Promise<Partial<Ajustes> | null> {
  try {
    const guardado = await AsyncStorage.getItem(CLAVE);
    if (!guardado) return null;
    const datos = JSON.parse(guardado) as Partial<Ajustes>;
    // Lo guardado puede venir de una versión anterior: solo se acepta lo válido.
    return {
      ...datos,
      nombres: Array.isArray(datos.nombres)
        ? datos.nombres.filter((n): n is string => typeof n === 'string').slice(0, 10)
        : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * La partida en curso se guarda tras cada acción para que cerrar la app, que
 * el móvil la mate en segundo plano o una recarga no se lleven por delante
 * media hora de subasta.
 */
export async function guardarPartida(p: Partida): Promise<void> {
  try {
    await AsyncStorage.setItem(CLAVE_PARTIDA, JSON.stringify(p));
  } catch {
    // Si no se puede guardar, la partida sigue viva en memoria.
  }
}

export async function leerPartida(): Promise<Partida | null> {
  try {
    const guardado = await AsyncStorage.getItem(CLAVE_PARTIDA);
    if (!guardado) return null;
    const p = JSON.parse(guardado) as Partida;
    // Comprobación mínima: lo guardado puede ser de una versión anterior.
    const valida =
      Array.isArray(p?.jugadores) &&
      p.jugadores.length > 0 &&
      Array.isArray(p?.mazo) &&
      typeof p?.config?.huecos === 'number' &&
      (p.fase === 'subasta' || p.fase === 'resultados');
    return valida ? p : null;
  } catch {
    return null;
  }
}

export async function borrarPartida(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CLAVE_PARTIDA);
  } catch {
    // Nada que hacer: como mucho quedará una partida vieja que no se ofrece.
  }
}
