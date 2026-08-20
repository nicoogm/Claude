# Draft Subastas

App móvil para el reto viral del draft por subasta. Un solo móvil hace de mesa:
una persona lo lleva, va sacando los ítems del tema elegido y registra las
pujas que el resto canta en voz alta. Cada jugador tiene un presupuesto y unos
huecos que rellenar.

Las reglas completas están en [`ESPECIFICACION.md`](ESPECIFICACION.md).

## Probarlo en el móvil

```bash
npm install
npm start          # escanea el QR con la app Expo Go
```

## Comandos

| Comando | Qué hace |
|---|---|
| `npm start` | Arranca Expo y muestra el QR |
| `npm test` | Tests del motor de juego |
| `npm run typecheck` | Comprobación de tipos |

## Estructura

```
App.tsx              navegación entre pantallas
src/motor/           reglas del juego (funciones puras, sin UI) + tests
src/estado/          store de la partida, con deshacer
src/datos/temas.ts   temas precargados
src/pantallas/       configuración, tema, subasta, resultados, votación
src/ui/tema.ts       colores y estilos comunes
```

El motor no depende de React: se puede testear entero desde Node y sería lo
único a reutilizar si algún día se hace una versión multijugador online.
