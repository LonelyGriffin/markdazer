import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet} from 'react-native';

export const CursorView = () => {
  const animation = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 100,
          duration: 100,
          delay: 400,
          useNativeDriver: false,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 100,
          delay: 300,
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, [animation]);

  const color = animation.interpolate({
    inputRange: [0, 100],
    outputRange: ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 1)'],
  });

  return (
    <Animated.Text style={{...style.cursor, color: color}}>│</Animated.Text>
  );
};

const style = StyleSheet.create({
  cursor: {
    letterSpacing: -10,
  },
});
