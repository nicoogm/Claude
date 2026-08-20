import { useState } from 'react';
import { SafeAreaView, StatusBar, View } from 'react-native';
import Configuracion, { type Ajustes } from './src/pantallas/Configuracion.tsx';
import SeleccionTema from './src/pantallas/SeleccionTema.tsx';
import Subasta from './src/pantallas/Subasta.tsx';
import Resultados from './src/pantallas/Resultados.tsx';
import Votacion from './src/pantallas/Votacion.tsx';
import { usePartida } from './src/estado/partida.ts';
import type { Tema } from './src/motor/tipos.ts';
import { C } from './src/ui/tema.ts';

type Vista = 'config' | 'tema' | 'juego' | 'votacion';

export default function App() {
  const [vista, setVista] = useState<Vista>('config');
  const [ajustes, setAjustes] = useState<Ajustes | null>(null);
  const { partida, iniciar, salir } = usePartida();

  const empezar = (tema: Tema) => {
    if (!ajustes) return;
    iniciar(
      {
        temaId: tema.id,
        presupuesto: ajustes.presupuesto,
        huecos: ajustes.huecos,
        pujaMin: ajustes.pujaMin,
        incremento: ajustes.incremento,
        ordenAleatorio: ajustes.ordenAleatorio,
      },
      ajustes.nombres,
      tema.items,
    );
    setVista('juego');
  };

  const volverAlInicio = () => {
    salir();
    setVista('config');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.fondo }}>
      <StatusBar barStyle="light-content" backgroundColor={C.fondo} />
      <View style={{ flex: 1 }}>
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
            itemsNecesarios={ajustes.nombres.length * ajustes.huecos}
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
      </View>
    </SafeAreaView>
  );
}
