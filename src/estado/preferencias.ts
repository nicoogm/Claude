import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Ajustes } from '../pantallas/Configuracion.tsx';

const CLAVE = 'draft:ultimos-ajustes';

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
