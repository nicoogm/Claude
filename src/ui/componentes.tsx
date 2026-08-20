import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { C, F, S, sombra } from './tema.ts';

/** Entrada de un bloque: sube y aparece. `retraso` permite escalonar listas. */
export function Aparecer({
  children,
  retraso = 0,
  desplazamiento = 14,
  style,
}: {
  children: ReactNode;
  retraso?: number;
  desplazamiento?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: 380,
      delay: retraso,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [v, retraso]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: v,
          transform: [
            { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [desplazamiento, 0] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/** Superficie pulsable que se hunde ligeramente al tocarla. */
export function Pulsable({
  children,
  onPress,
  disabled,
  style,
  escala = 0.97,
}: {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  escala?: number;
}) {
  const v = useRef(new Animated.Value(1)).current;
  const animar = (hacia: number) =>
    Animated.spring(v, {
      toValue: hacia,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => animar(escala)}
      onPressOut={() => animar(1)}
    >
      <Animated.View style={[style, { transform: [{ scale: v }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

export function Boton({
  texto,
  onPress,
  disabled,
  variante = 'principal',
}: {
  texto: string;
  onPress: () => void;
  disabled?: boolean;
  variante?: 'principal' | 'secundario' | 'fantasma';
}) {
  // Un principal apagado se pinta como secundario: el latón sucio se ve mal.
  const efectiva = disabled && variante === 'principal' ? 'secundario' : variante;
  const estilos = {
    principal: {
      fondo: C.laton,
      borde: C.laton,
      color: C.tinta,
      elevar: true,
    },
    secundario: {
      fondo: C.superficieAlta,
      borde: C.linea,
      color: C.texto,
      elevar: false,
    },
    fantasma: {
      fondo: 'transparent',
      borde: C.lineaSuave,
      color: C.textoSuave,
      elevar: false,
    },
  }[efectiva];

  return (
    <Pulsable onPress={onPress} disabled={disabled} escala={0.98}>
      <View
        style={[
          {
            backgroundColor: estilos.fondo,
            borderColor: estilos.borde,
            borderWidth: 1,
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: 'center',
          },
          estilos.elevar && !disabled ? sombra(0.8) : null,
          disabled && S.desactivado,
        ]}
      >
        <Text
          style={{
            fontFamily: F.extra,
            fontSize: 15,
            letterSpacing: 0.3,
            color: estilos.color,
          }}
        >
          {texto}
        </Text>
      </View>
    </Pulsable>
  );
}

/**
 * Número que rueda hasta su nuevo valor en lugar de saltar de golpe. Se pinta
 * desde el estado porque `setNativeProps` no existe en la versión web.
 */
export function Cifra({
  valor,
  sufijo = '',
  style,
}: {
  valor: number;
  sufijo?: string;
  style?: StyleProp<TextStyle>;
}) {
  const v = useRef(new Animated.Value(valor)).current;
  const [mostrado, setMostrado] = useState(valor);

  useEffect(() => {
    // Solo repinta cuando cambia el entero, no en cada fotograma.
    const id = v.addListener(({ value }) => {
      setMostrado((previo) => {
        const redondeado = Math.round(value);
        return redondeado === previo ? previo : redondeado;
      });
    });
    Animated.timing(v, {
      toValue: valor,
      duration: 380,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => v.removeListener(id);
  }, [valor, v]);

  return <Text style={style}>{`${mostrado}${sufijo}`}</Text>;
}

/** Barra de avance de la partida. */
export function Progreso({ hechos, total }: { hechos: number; total: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: total > 0 ? hechos / total : 0,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [hechos, total, v]);

  return (
    <View
      style={{
        height: 3,
        borderRadius: 2,
        backgroundColor: C.lineaSuave,
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={{
          height: 3,
          backgroundColor: C.laton,
          width: v.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
        }}
      />
    </View>
  );
}
