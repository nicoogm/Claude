import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StatusBar, View } from 'react-native';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import {
  Manrope_500Medium,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import Menu from './src/pantallas/Menu.tsx';
import Configuracion, {
  AJUSTES_INICIALES,
  type Ajustes,
} from './src/pantallas/Configuracion.tsx';
import AjustesPantalla from './src/pantallas/Ajustes.tsx';
import Reglas from './src/pantallas/Reglas.tsx';
import SeleccionTema from './src/pantallas/SeleccionTema.tsx';
import Subasta from './src/pantallas/Subasta.tsx';
import Resultados from './src/pantallas/Resultados.tsx';
import Votacion from './src/pantallas/Votacion.tsx';
import { usePartida } from './src/estado/partida.ts';
import {
  borrarPartida,
  guardarAjustes,
  leerAjustes,
  leerPartida,
} from './src/estado/preferencias.ts';
import { sortearItems } from './src/motor/motor.ts';
import type { Partida, Tema } from './src/motor/tipos.ts';
import { C } from './src/ui/tema.ts';
import { Aparecer } from './src/ui/componentes.tsx';

type Vista = 'menu' | 'config' | 'ajustes' | 'reglas' | 'tema' | 'juego' | 'veredicto';

export default function App() {
  const [vista, setVista] = useState<Vista>('menu');
  const [ajustes, setAjustes] = useState<Ajustes>(AJUSTES_INICIALES);
  // Desde dónde se abrió Ajustes, para devolver al jugador a su sitio.
  const [vueltaDeAjustes, setVueltaDeAjustes] = useState<Vista>('menu');
  const { partida, iniciar, retomar, salir } = usePartida();
  // Partida guardada de una sesión anterior, aún sin retomar.
  const [guardada, setGuardada] = useState<Partida | null>(null);

  const [fuentesListas] = useFonts({
    BebasNeue_400Regular,
    Manrope_500Medium,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  // La última mesa y sus reglas se recuperan al abrir la app.
  useEffect(() => {
    let vivo = true;
    leerAjustes().then((guardado) => {
      if (vivo && guardado) setAjustes((prev) => ({ ...prev, ...guardado }));
    });
    leerPartida().then((p) => {
      if (vivo) setGuardada(p);
    });
    return () => {
      vivo = false;
    };
  }, []);

  /** Todo cambio de ajustes se guarda: no hay botón de "aplicar". */
  const cambiarAjustes = (a: Ajustes) => {
    setAjustes(a);
    guardarAjustes(a);
  };

  const empezar = (tema: Tema) => {
    iniciar(
      {
        temaId: tema.id,
        monedaId: ajustes.monedaId,
        presupuesto: ajustes.presupuesto,
        huecos: ajustes.huecos,
        // Un lote siempre se abre por una cabra; no es configurable.
        pujaMin: 1,
        incremento: ajustes.incremento,
        ordenAleatorio: true,
      },
      ajustes.nombres,
      // Un lote por hueco de la mesa, sacados al azar de la lista del tema.
      sortearItems(tema.items, ajustes.nombres.length * ajustes.huecos),
    );
    setVista('juego');
  };

  const volverAlMenu = () => {
    salir();
    setGuardada(null);
    setVista('menu');
  };

  /** Retoma la partida guardada justo donde se quedó. */
  const continuar = () => {
    if (!guardada) return;
    retomar(guardada);
    setGuardada(null);
    setVista('juego');
  };

  /** Texto de la tarjeta de continuar: por dónde iba la partida. */
  const resumenGuardada = (() => {
    if (!guardada) return null;
    const nombres = guardada.jugadores.map((j) => j.nombre).join(', ');
    if (guardada.fase === 'resultados') return `${nombres} · pendiente el veredicto`;
    const total = guardada.config.huecos * guardada.jugadores.length;
    const hechos = guardada.jugadores.reduce((s, j) => s + j.plantilla.length, 0);
    return `${nombres} · lote ${Math.min(hechos + 1, total)} de ${total}`;
  })();

  const abrirAjustes = (desde: Vista) => {
    setVueltaDeAjustes(desde);
    setVista('ajustes');
  };

  if (!fuentesListas) {
    return (
      <View style={{ flex: 1, backgroundColor: C.fondo, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={C.laton} />
      </View>
    );
  }

  // Una key por vista para que cada pantalla se monte de nuevo y entre animada.
  const clave = vista === 'juego' && partida ? `juego-${partida.fase}` : vista;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.fondo }}>
      <StatusBar barStyle="light-content" backgroundColor={C.fondo} />
      <Aparecer key={clave} desplazamiento={10} style={{ flex: 1 }}>
        {vista === 'menu' && (
          <Menu
            continuar={resumenGuardada}
            onIr={(clave) => {
              if (clave === 'continuar') continuar();
              if (clave === 'jugar') {
                // Empezar de cero descarta la guardada: solo cabe una partida.
                borrarPartida();
                setGuardada(null);
                setVista('config');
              }
              if (clave === 'reglas') setVista('reglas');
              if (clave === 'ajustes') abrirAjustes('menu');
            }}
          />
        )}

        {vista === 'reglas' && (
          <Reglas monedaId={ajustes.monedaId} onVolver={() => setVista('menu')} />
        )}

        {vista === 'ajustes' && (
          <AjustesPantalla
            ajustes={ajustes}
            onCambiar={cambiarAjustes}
            onVolver={() => setVista(vueltaDeAjustes)}
          />
        )}

        {vista === 'config' && (
          <Configuracion
            ajustes={ajustes}
            onCambiar={cambiarAjustes}
            onContinuar={(a) => {
              cambiarAjustes(a);
              setVista('tema');
            }}
            onAjustes={() => abrirAjustes('config')}
            onVolver={() => setVista('menu')}
          />
        )}

        {vista === 'tema' && (
          <SeleccionTema
            itemsNecesarios={ajustes.nombres.length * ajustes.huecos}
            onElegir={empezar}
            onVolver={() => setVista('config')}
          />
        )}

        {vista === 'juego' && partida && partida.fase === 'subasta' && (
          <Subasta partida={partida} onSalir={volverAlMenu} />
        )}

        {vista === 'juego' && partida && partida.fase === 'resultados' && (
          <Resultados
            partida={partida}
            onVotar={() => setVista('veredicto')}
            onSalir={volverAlMenu}
          />
        )}

        {vista === 'veredicto' && partida && (
          <Votacion
            partida={partida}
            onVolver={() => setVista('juego')}
            onSalir={volverAlMenu}
          />
        )}
      </Aparecer>
    </SafeAreaView>
  );
}
