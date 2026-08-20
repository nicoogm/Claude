// Mete el bundle web exportado por Expo dentro de un único HTML autocontenido,
// que es lo que admite el visor de artefactos (sin peticiones a otros hosts).
//   npx expo export -p web --output-dir dist && node tools/empaquetar-web.mjs <salida.html>
//
// Con --completo envuelve el resultado en un documento HTML entero, que es lo
// que necesita cualquier sitio normal (GitHub Pages, abrirlo a mano, etc.);
// sin la opción sale el fragmento que espera el visor de artefactos.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { globSync } from 'node:fs';

/** Fuentes que la app carga de verdad; el resto de pesos no se piden nunca. */
const FUENTES = ['BebasNeue_400Regular', 'Manrope_500Medium', 'Manrope_700Bold', 'Manrope_800ExtraBold'];

/** Convierte la ruta de cada .ttf usado en un data: URI dentro del bundle. */
function incrustarFuentes(js) {
  const ttfs = globSync('dist/assets/**/*.ttf');
  let incrustadas = 0;
  for (const ruta of ttfs) {
    const nombre = ruta.split('/').pop().split('.')[0];
    if (!FUENTES.includes(nombre)) continue;
    const url = '/' + ruta.replace(/^dist\//, '');
    if (!js.includes(url)) throw new Error('No se encuentra en el bundle: ' + url);
    const datos = readFileSync(ruta).toString('base64');
    js = js.replaceAll(url, `data:font/ttf;base64,${datos}`);
    incrustadas++;
  }
  if (incrustadas !== FUENTES.length) {
    throw new Error(`Solo se incrustaron ${incrustadas} de ${FUENTES.length} fuentes`);
  }
  return js;
}

const dirJs = 'dist/_expo/static/js/web';
const bundle = readdirSync(dirJs).find((f) => f.endsWith('.js'));
if (!bundle) throw new Error('No hay bundle en ' + dirJs);

const js = incrustarFuentes(readFileSync(`${dirJs}/${bundle}`, 'utf8'))
  // Evita que un "</script>" dentro del código cierre la etiqueta antes de tiempo.
  .replaceAll('</script>', '<\\/script>');

const html = `<meta charset="utf-8" />
<title>Draft Subastas</title>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, shrink-to-fit=no" />
<style>
  /* La app es de tema oscuro por decisión propia: pintamos el fondo
     explícitamente para no heredar el del visor en ningún tema. */
  html, body {
    height: 100%;
    margin: 0;
    background: #0B1020;
    color: #F2F5FF;
    overflow: hidden;
    overscroll-behavior: none;
    -webkit-font-smoothing: antialiased;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  #root { display: flex; height: 100%; flex: 1; }
  /* Se juega a base de toques rápidos: sin destello azul al tocar. */
  #root * { -webkit-tap-highlight-color: transparent; }
  #cargando {
    position: fixed; inset: 0; display: flex; align-items: center;
    justify-content: center; font-size: 15px; color: #939CBB;
  }
</style>

<div id="root"></div>
<div id="cargando">Cargando la subasta…</div>
<script>${js}</script>
<script>
  // El bundle es síncrono y monta la app antes de llegar aquí, así que primero
  // se comprueba si #root ya tiene contenido y solo si no, se queda a la espera.
  (function () {
    var root = document.getElementById('root');
    var quitar = function () {
      var aviso = document.getElementById('cargando');
      if (aviso) aviso.remove();
    };
    if (root.childElementCount > 0) return quitar();
    var obs = new MutationObserver(function () {
      if (root.childElementCount > 0) { quitar(); obs.disconnect(); }
    });
    obs.observe(root, { childList: true });
    setTimeout(quitar, 8000); // red de seguridad: nunca dejar el aviso encallado
  })();
</script>
`;

const completo = process.argv.includes('--completo');
const salida = process.argv.find((x, i) => i > 1 && !x.startsWith('--')) ?? 'draft-subastas.html';

const documento = completo
  ? `<!doctype html>
<html lang="es">
<head>
${html.trimEnd()}
</body>
</html>
`.replace('<div id="root"></div>', '</head>\n<body>\n<div id="root"></div>')
  : html;

writeFileSync(salida, documento);
console.log(`${salida} · ${Math.round(documento.length / 1024)} KB${completo ? ' · documento completo' : ''}`);
