import React, {
  createContext,
  createRef,
  useContext,
  useEffect,
  useRef,
} from 'react';
import {View, Text} from 'react-native';
import {SubscribeAble, useSubscription} from '../../../common/subscribeAble';

type GlyphStyle = string;
type Glyph = string;
type GlyphMap<T> = Record<GlyphStyle, Record<Glyph, T>>;

export class GlyphWidthResolver extends SubscribeAble {
  nextToResolve?: [GlyphStyle, Glyph];
  widthMap: GlyphMap<number> = {};

  private requestMap: GlyphMap<boolean> = {};

  requestGlyphWidth = (style: GlyphStyle, glyph: Glyph) => {
    if (
      (this.widthMap[style] && this.widthMap[style][glyph]) ||
      (this.requestMap[style] && this.requestMap[style][glyph])
    ) {
      return;
    }

    if (!this.requestMap[style]) {
      this.requestMap[style] = {};
    }

    this.requestMap[style][glyph] = true;

    this.next();
  };

  resolve = (style: GlyphStyle, glyph: Glyph, width: number) => {
    if (!this.widthMap[style]) {
      this.widthMap[style] = {};
    }
    this.widthMap[style][glyph] = width;
    delete this.requestMap[style][glyph];

    if (Object.keys(this.requestMap).length === 0) {
      delete this.requestMap[style];
    }

    this.nextToResolve = undefined;
    this.next();
  };

  private next() {
    if (this.nextToResolve) {
      return;
    }

    const style = Object.keys(this.requestMap)[0];

    if (!style) {
      return;
    }

    const glyph = Object.keys(this.requestMap[style])[0];

    if (!glyph) {
      return;
    }

    this.nextToResolve = [style, glyph];

    this.commit();
  }
}

export const GlyphWidthResolverContext = createContext(
  new GlyphWidthResolver(),
);

export const GlyphWidthRenderer = () => {
  const textRef = useRef<Text>(null);
  const resolver = useContext(GlyphWidthResolverContext);
  const {nextToResolve, resolve} = resolver;

  useSubscription(resolver);
  useEffect(() => {
    const text = textRef.current;
    if (nextToResolve && text) {
      text.measure((x, y, width) => {
        setTimeout(() => {
          resolve(nextToResolve[0], nextToResolve[1], width);
        }, 24);
      });
    }
  });

  return (
    <View>
      <Text ref={textRef}>{nextToResolve ? nextToResolve[1] : ''}</Text>
    </View>
  );
};
