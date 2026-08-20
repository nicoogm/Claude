# Draft Subastas — Especificación funcional v1

App móvil para el reto viral del draft por subasta. Un solo móvil hace de
"mesa": una persona lo lleva, va sacando los ítems y registra las pujas que
el resto canta en voz alta.

## 1. Decisiones cerradas

| Tema | Decisión |
|---|---|
| Modo de juego | Un único móvil como consola de subasta. Sin backend, sin cuentas, sin internet. |
| Rol del portador | Es el "subastador": lee el ítem en voz alta y registra pujas. Puede jugar o no (configurable). |
| Falta de dinero | Auto-relleno: quien no pueda seguir pujando recibe automáticamente ítems para completar sus huecos. |
| Temas | 8-10 listas precargadas + editor para crear listas propias, guardadas en el móvil. |
| Ganador | No automático. Se muestran las plantillas y el grupo vota dentro de la app. |

## 2. Parámetros configurables

- Número de jugadores (2-10) y sus nombres.
- Presupuesto por jugador (por defecto 20 €).
- Número de huecos por jugador (por defecto 3).
- Tema / lista de ítems.
- Puja mínima inicial (por defecto 1 €) e incremento mínimo (por defecto 1 €).
- Orden de aparición de los ítems: aleatorio o el orden de la lista.

## 3. Flujo de la partida

```
CONFIG → ELEGIR TEMA → [ SUBASTA_ÍTEM → ADJUDICACIÓN ]×N → AUTO-RELLENO → RESULTADOS → VOTACIÓN
```

**Subasta de un ítem**
1. La app muestra el ítem a pantalla completa (el portador lo lee en alto).
2. La gente puja de viva voz; el portador toca el nombre del jugador y su
   importe. La puja actual y el líder quedan siempre visibles.
3. "Adjudicar" cierra el ítem: se descuenta el dinero al líder y el ítem entra
   en su plantilla.
4. Si nadie puja, el ítem se descarta y pasa al siguiente.
5. Corrección de errores: botón de deshacer la última acción (imprescindible,
   se registran pujas a mano y a toda velocidad).

## 4. Reglas del motor

**Elegibilidad para pujar.** Un jugador puede pujar un ítem si:
- tiene al menos un hueco libre, **y**
- su dinero restante ≥ puja actual + incremento mínimo.

Si deja de cumplirlo, su botón se desactiva solo.

**Auto-relleno (regla acordada).** Cuando a un jugador ya no le queda dinero
para pujar y aún tiene huecos vacíos, esos huecos se rellenan
automáticamente con los ítems que van quedando, en orden, sin coste.

Se aplica al **final de la partida** (decisión tomada): la subasta sigue su
curso normal hasta agotar la lista, y solo entonces los huecos vacíos se
rellenan, en orden, con los ítems sobrantes (los que quedaron sin subastar y
los que nadie quiso). El reparto es por rondas entre los jugadores
incompletos, siguiendo el orden de jugador.

**Fin de partida.** Termina cuando todos los jugadores tienen los huecos
llenos, o cuando se agota la lista de ítems (y entonces se aplica A).

**Justicia del turno.** Nadie tiene turno fijo de puja: es subasta abierta a
viva voz. El único orden que importa es el de los ítems.

## 5. Modelo de datos

```ts
type Tema     = { id: string; titulo: string; items: Item[]; propio: boolean }
type Item     = { id: string; nombre: string }
type Jugador  = { id: string; nombre: string; dinero: number; plantilla: Item[] }
type Subasta  = { item: Item; pujaActual: number; lider: string | null }
type Config   = { presupuesto: number; huecos: number; pujaMin: number;
                  incremento: number; ordenAleatorio: boolean; temaId: string }
type Partida  = { config: Config; jugadores: Jugador[]; mazo: Item[];
                  subasta: Subasta | null; historial: Evento[] }
```

El `historial` de eventos es lo que hace posible el deshacer y el resumen final.

## 6. Pantallas

1. **Inicio** — nueva partida / mis listas.
2. **Configuración** — jugadores, dinero, huecos, opciones.
3. **Selección de tema** — precargados y propios.
4. **Subasta** — ítem grande, puja actual + líder, fila de jugadores con dinero
   y huecos, botones de puja rápida (+1 / +2 / +5), adjudicar, deshacer.
5. **Resultados** — plantillas lado a lado con lo gastado en cada ítem.
6. **Votación** — cada jugador vota la mejor plantilla ajena; se muestra el
   recuento.

## 7. Stack y plan de trabajo

- **React Native + Expo + TypeScript.** Se prueba en el móvil con un QR, sin
  Mac ni publicación en tiendas.
- **Zustand** para el estado, **AsyncStorage** para listas propias e historial.
- Motor de juego como módulo puro (funciones sin UI) para poder testearlo.

Fases:
1. Esqueleto Expo + navegación entre pantallas.
2. Motor de juego puro + tests de las reglas (elegibilidad, auto-relleno, fin).
3. Pantalla de subasta conectada al motor.
4. Temas precargados + editor de listas propias.
5. Resultados y votación.
6. Pulido: animaciones, sonido de martillo, compartir resultado como imagen.

## 8. Fuera del alcance de la v1

Multijugador online, cuentas de usuario, puntuación automática por valor de
ítem, sincronización entre dispositivos, monetización.
