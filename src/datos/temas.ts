import type { Tema } from '../motor/tipos.ts';

const tema = (id: string, titulo: string, nombres: string[]): Tema => ({
  id,
  titulo,
  propio: false,
  items: nombres.map((nombre, i) => ({ id: `${id}-${i + 1}`, nombre })),
});

export const TEMAS: Tema[] = [
  tema('futbol', 'Leyendas del fútbol', [
    'Pelé', 'Maradona', 'Cruyff', 'Di Stéfano', 'Beckenbauer', 'Zidane',
    'Ronaldo Nazário', 'Messi', 'Cristiano Ronaldo', 'Ronaldinho', 'Iniesta',
    'Xavi', 'Buffon', 'Maldini', 'Roberto Carlos', 'Puyol', 'Casillas',
    'Raúl', 'Henry', 'Totti', 'Zlatan', 'Kaká', 'Modrić', 'Mbappé',
  ]),
  tema('ciudades', 'Ciudades del mundo', [
    'Tokio', 'Nueva York', 'París', 'Roma', 'Barcelona', 'Londres',
    'Estambul', 'Río de Janeiro', 'Ciudad del Cabo', 'Sídney', 'Kioto',
    'Marrakech', 'Lisboa', 'Praga', 'Buenos Aires', 'Bangkok', 'Seúl',
    'Ámsterdam', 'San Francisco', 'El Cairo', 'Venecia', 'Singapur',
  ]),
  tema('paises', 'Países para vivir', [
    'España', 'Italia', 'Japón', 'Portugal', 'Noruega', 'Suiza', 'Canadá',
    'Australia', 'Nueva Zelanda', 'México', 'Argentina', 'Brasil', 'Grecia',
    'Tailandia', 'Corea del Sur', 'Países Bajos', 'Islandia', 'Costa Rica',
    'Marruecos', 'Estados Unidos', 'Irlanda', 'Croacia',
  ]),
  tema('planes', 'Planes de fin de semana', [
    'Escapada a la playa', 'Cena de amigos', 'Maratón de series',
    'Concierto', 'Ruta de senderismo', 'Festival de música', 'Partido en vivo',
    'Spa y desconexión', 'Escape room', 'Mercadillo', 'Barbacoa',
    'Noche de bar', 'Museo', 'Karaoke', 'Roadtrip', 'Acampada',
    'Cine en casa', 'Brunch', 'Videojuegos', 'Piscina',
  ]),
  tema('comida', 'Comida favorita', [
    'Pizza', 'Sushi', 'Paella', 'Hamburguesa', 'Tacos', 'Ramen', 'Jamón',
    'Tortilla de patatas', 'Croquetas', 'Pasta carbonara', 'Pollo asado',
    'Bocadillo de calamares', 'Cocido', 'Curry', 'Kebab', 'Empanada',
    'Churros', 'Cheesecake', 'Helado', 'Ensaladilla rusa',
  ]),
  tema('peliculas', 'Películas imprescindibles', [
    'El Padrino', 'Pulp Fiction', 'Origen', 'Interstellar', 'Matrix',
    'El Señor de los Anillos', 'Cadena perpetua', 'Parásitos', 'Gladiator',
    'Regreso al futuro', 'Titanic', 'Forrest Gump', 'El club de la lucha',
    'Los Otros', 'Rec', 'Tiburón', 'Alien', 'Toy Story', 'Coco', 'Whiplash',
  ]),
  tema('series', 'Series para maratón', [
    'Breaking Bad', 'Los Soprano', 'The Wire', 'Juego de Tronos', 'Friends',
    'The Office', 'Chernobyl', 'Dark', 'Better Call Saul', 'Peaky Blinders',
    'Stranger Things', 'La casa de papel', 'Succession', 'True Detective',
    'Fargo', 'Black Mirror', 'Los Simpson', 'Narcos', 'Sherlock', 'Lost',
  ]),
  tema('musica', 'Artistas musicales', [
    'The Beatles', 'Queen', 'Michael Jackson', 'Pink Floyd', 'Nirvana',
    'Bob Marley', 'Beyoncé', 'Rosalía', 'Bad Bunny', 'Daft Punk', 'Adele',
    'Kendrick Lamar', 'Extremoduro', 'Estopa', 'AC/DC', 'Metallica',
    'Radiohead', 'Amy Winehouse', 'Coldplay', 'Rihanna',
  ]),
  tema('superpoderes', 'Superpoderes', [
    'Volar', 'Invisibilidad', 'Teletransporte', 'Leer la mente',
    'Parar el tiempo', 'Viajar en el tiempo', 'Superfuerza', 'Inmortalidad',
    'Curación instantánea', 'Respirar bajo el agua', 'Hablar todos los idiomas',
    'Controlar el clima', 'Duplicarte', 'No necesitar dormir', 'Suerte infinita',
    'Cambiar de forma', 'Telequinesis', 'Ver el futuro',
  ]),
  tema('videojuegos', 'Videojuegos legendarios', [
    'Tetris', 'Super Mario Bros', 'The Legend of Zelda', 'Minecraft',
    'GTA V', 'Half-Life 2', 'Dark Souls', 'The Last of Us', 'Elden Ring',
    'Red Dead Redemption 2', 'Fortnite', 'Counter-Strike', 'FIFA',
    'Pokémon Rojo', 'Portal', 'Doom', 'Age of Empires II', 'Among Us',
  ]),
];

export const temaPorId = (id: string): Tema | undefined =>
  TEMAS.find((t) => t.id === id);
