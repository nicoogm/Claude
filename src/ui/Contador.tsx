import { Text, View } from 'react-native';
import { C, F, S } from './tema.ts';
import { Pulsable } from './componentes.tsx';

/** Fila de ajuste numérico con − y +, usada en configuración y ajustes. */
export default function Contador({
  etiqueta, ayuda, valor, min, max, onChange,
}: {
  etiqueta: string;
  ayuda?: string;
  valor: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const paso = (d: number) => () => onChange(Math.min(max, Math.max(min, valor + d)));
  const Redondo = ({ signo, onPress, off }: { signo: string; onPress: () => void; off: boolean }) => (
    <Pulsable onPress={onPress} disabled={off}>
      <View
        style={[
          {
            width: 40, height: 40, borderRadius: 20, alignItems: 'center',
            justifyContent: 'center', backgroundColor: C.superficieAlta,
            borderWidth: 1, borderColor: C.linea,
          },
          off && S.desactivado,
        ]}
      >
        <Text style={{ fontFamily: F.extra, fontSize: 19, color: C.texto }}>{signo}</Text>
      </View>
    </Pulsable>
  );

  return (
    <View style={[S.fila, { justifyContent: 'space-between', paddingVertical: 8 }]}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={{ fontFamily: F.texto, fontSize: 15, color: C.texto }}>{etiqueta}</Text>
        {ayuda && (
          <Text style={{ fontFamily: F.texto, fontSize: 12, color: C.textoDebil, marginTop: 2 }}>
            {ayuda}
          </Text>
        )}
      </View>
      <View style={[S.fila, { gap: 12 }]}>
        <Redondo signo="−" onPress={paso(-1)} off={valor <= min} />
        <Text style={[S.cifra, { fontSize: 19, minWidth: 34, textAlign: 'center' }]}>{valor}</Text>
        <Redondo signo="+" onPress={paso(1)} off={valor >= max} />
      </View>
    </View>
  );
}
