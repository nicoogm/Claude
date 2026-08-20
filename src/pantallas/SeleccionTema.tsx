import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { TEMAS } from '../datos/temas.ts';
import type { Tema } from '../motor/tipos.ts';
import { C, S } from '../ui/tema.ts';

export default function SeleccionTema({
  itemsNecesarios,
  onElegir,
  onVolver,
}: {
  itemsNecesarios: number;
  onElegir: (t: Tema) => void;
  onVolver: () => void;
}) {
  return (
    <ScrollView style={S.pantalla} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={S.titulo}>¿De qué va el draft?</Text>
      <Text style={S.subtitulo}>
        Necesitáis al menos {itemsNecesarios} ítems para llenar todas las plantillas.
      </Text>

      {TEMAS.map((t) => {
        const suficiente = t.items.length >= itemsNecesarios;
        return (
          <TouchableOpacity
            key={t.id}
            disabled={!suficiente}
            onPress={() => onElegir(t)}
            style={[S.tarjeta, !suficiente && S.desactivado]}
          >
            <Text style={{ color: C.texto, fontSize: 18, fontWeight: '700' }}>
              {t.titulo}
            </Text>
            <Text style={{ color: C.textoSuave, marginTop: 4 }}>
              {t.items.length} ítems · {t.items.slice(0, 3).map((i) => i.nombre).join(', ')}…
            </Text>
            {!suficiente && (
              <Text style={{ color: C.aviso, marginTop: 6, fontSize: 13 }}>
                Lista demasiado corta para esta configuración
              </Text>
            )}
          </TouchableOpacity>
        );
      })}

      <View style={{ height: 8 }} />
      <TouchableOpacity style={S.botonSec} onPress={onVolver}>
        <Text style={S.botonSecTexto}>← Volver</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
