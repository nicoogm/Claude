import { useState } from 'react';
import { ActivityIndicator, SafeAreaView, StatusBar, View } from 'react-native';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import {
  Manrope_500Medium,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import Configuracion, { type Ajustes } from './src/pantallas/Configuracion.tsx';
import SeleccionTema from './src/pantallas/SeleccionTema.tsx';
import Subasta from './src/pantallas/Subasta.tsx';
import Resultados from './src/pantallas/Resultados.tsx';
import Votacion from './src/pantallas/Votacion.tsx';
import { usePartida } from './src/estado/partida.ts';
import { sortearItems } from './src/motor/motor.ts';
import type { Tema } from './src/motor/tipos.ts';
import { C } from './src/ui/tema.ts';
import { Aparecer } from './src/ui/componentes.tsx';

type Vista = 'config' | 'tema' | 'juego' | 'votacion';

export default function App() {
  const [vista, setVista] = useState<Vista>('config');
  const [ajustes, setAjustes] = useState<Ajustes | null>(null);
  const { partida, iniciar, salir } = usePartida();

  const [fuentesListas] = useFonts({
    BebasNeue_400Regular,
    Manrope_500Medium,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  const empezar = (tema: Tema) => {
    if (!ajustes) return;
    iniciar(
      {
        temaId: tema.id,
        presupuesto: ajustes.presupuesto,
        huecos: ajustes.huecos,
        pujaMin: ajustes.pujaMin,
        incremento: ajustes.incremento,
        ordenAleatorio: true,
      },
      ajustes.nombres,
      // Cada partida juega con un puñado de lotes sacados al azar del tema.
      sortearItems(tema.items, ajustes.itemsEnJuego),
    );
    setVista('juego');
  };

  const volverAlInicio = () => {
    salir();
    setVista('config');
  };

  if (!fuentesListas) {
    return (
      <View style={{ flex: 1, backgroundColor: C.fondo, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={C.laton} />
      </View>
    );
  }

  // Una key por vista para que cada pantalla se monte de nuevo y entre animada.
  const clave =
    vista === 'juego' && partida ? `juego-${partida.fase}` : vista;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.fondo }}>
      <StatusBar barStyle="light-content" backgroundColor={C.fondo} />
      <Aparecer key={clave} desplazamiento={10} style={{ flex: 1 }}>
        {vista === 'config' && (
          <Configuracion
            onContinuar={(a) => {
              setAjustes(a);
              setVista('tema');
            }}
          />
        )}

        {vista === 'tema' && ajustes && (
          <SeleccionTema
            itemsNecesarios={ajustes.itemsEnJuego}
            onElegir={empezar}
            onVolver={() => setVista('config')}
          />
        )}

        {vista === 'juego' && partida && partida.fase === 'subasta' && (
          <Subasta partida={partida} />
        )}

        {vista === 'juego' && partida && partida.fase === 'resultados' && (
          <Resultados
            partida={partida}
            onVotar={() => setVista('votacion')}
            onSalir={volverAlInicio}
          />
        )}

        {vista === 'votacion' && partida && (
          <Votacion partida={partida} onSalir={volverAlInicio} />
        )}
      </Aparecer>
    </SafeAreaView>
  );
}
