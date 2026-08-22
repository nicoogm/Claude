# Draft Subastas — Especificación funcional v1

App móvil para el reto viral del draft por subasta. Un solo móvil hace de
"mesa": una persona lo lleva, va sacando los ítems y registra las pujas que
el resto canta en voz alta.

## 1. Decisiones cerradas

| Tema | Decisión |
|---|---|
| Modo de juego | Un único móvil como consola de subasta. Sin backend, sin cuentas, sin internet. |
| Ritmo de la puja | Por turnos: le toca a uno, sube o se planta, y pasa al siguiente. Quien abre rota en cada lote. |
| Divisa | De broma y elegible: cabras 🐐, gambas 🦐, plátanos 🍌 o patos 🦆. |
| Falta de dinero | Auto-relleno: cuando ya nadie puede pujar, los huecos vacíos se completan con los siguientes ítems de la lista, por orden. |
| Temas | 10 listas precargadas de ~100 ítems + editor para crear listas propias. De cada lista se sortean los ítems de la partida. |
| Ganador | No automático. Se muestran las plantillas y el grupo vota dentro de la app, con segunda vuelta si hay empate. |

## 2. Parámetros configurables

- Número de jugadores (2-10) y sus nombres.
- Divisa (cabras por defecto) y presupuesto por jugador (por defecto 20).
- Salen a subasta exactamente `jugadores × huecos` lotes, sorteados al azar de
  la lista del tema. Como todo lote acaba adjudicado, no hay nada que sobre y
  no es un ajuste que haya que tocar.
- Número de huecos por jugador (por defecto 3).
- Tema / lista de ítems.
- Ítems que salen a subasta: de la lista del tema (80-115 nombres cada una) se
  sortean solo los de esta partida, así que dos partidas del mismo tema no se
  parecen. Por defecto 18, con un mínimo de jugadores × huecos.
- Puja mínima inicial (por defecto 1) e incremento mínimo (por defecto 1).

## 3. Flujo de la partida

```
CONFIG → ELEGIR TEMA → [ SUBASTA_ÍTEM → ADJUDICACIÓN ]×N → AUTO-RELLENO → RESULTADOS → VOTACIÓN
```

**Subasta de un lote, por turnos**
1. La app muestra el lote y, arriba del todo, de quién es el turno.
2. Ese jugador elige: **subir** (cualquier importe desde la puja mínima, que es
   la actual más el incremento) o **plantarse**, que le deja fuera de ese lote
   —no de la partida.
3. El turno pasa al siguiente que siga vivo en el lote, saltándose al líder:
   nadie se puja a sí mismo.
4. Cuando todos los rivales se han plantado, el lote se adjudica al líder.
5. Si todos se plantan sin pujar, el lote cae en el último que quedaba por
   decidir, por la puja mínima: no hay a quién pasárselo.
6. **El jugador que abre la puja rota en cada lote**, y siempre se abre desde la
   puja mínima.
7. **Si solo queda uno que pueda pujar** —porque el resto tiene la plantilla
   llena o se ha quedado sin dinero— el lote es suyo por la puja mínima, de
   forma automática: no hay contra quién pujar ni opción a plantarse. Cuando a
   él también se le acabe el dinero, el resto de huecos se completa con el
   auto-relleno.
8. Corrección de errores: botón de deshacer la última acción.

## 4. Reglas del motor

**Elegibilidad para pujar.** Un jugador puede pujar un ítem si:
- tiene al menos un hueco libre, **y**
- su dinero restante ≥ puja actual + incremento mínimo.

Si deja de cumplirlo, su botón se desactiva solo.

**Auto-relleno (regla acordada).** Cuando a un jugador ya no le queda dinero
para pujar y aún tiene huecos vacíos, esos huecos se rellenan
automáticamente con los ítems que van quedando, en orden, sin coste.

La partida **se corta en cuanto ya nadie puede pujar** (nadie con huecos
libres conserva dinero para la puja mínima) y los huecos vacíos se rellenan
con los ítems que venían a continuación, en su orden, repartidos por rondas
entre los jugadores incompletos. No se recorre el resto de la lista.

**Fin de partida.** Termina cuando todos los jugadores tienen los huecos
llenos, cuando ya nadie puede pujar o cuando se agota la lista de ítems. En
los dos últimos casos se aplica el auto-relleno.

**Justicia del turno.** Nadie tiene turno fijo de puja: es subasta abierta a
viva voz. El único orden que importa es el de los ítems.

## 5. Modelo de datos

```ts
type Tema     = { id: string; titulo: string; items: Item[]; propio: boolean }
type Item     = { id: string; nombre: string }
type Jugador  = { id: string; nombre: string; dinero: number; plantilla: Item[] }
type Subasta  = { item: Item; pujaActual: number; lider: string | null;
                  activos: string[]; turno: string; inicial: number }
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
6. **Votación** — cada jugador vota la mejor plantilla, **la suya incluida**;
   se muestra el recuento y, si hay empate, se juega una segunda vuelta solo
   entre las empatadas.

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
