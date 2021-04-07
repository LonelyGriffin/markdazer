import React, {useCallback, useContext, useEffect, useRef} from 'react';
import {
  Animated,
  GestureResponderEvent,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
} from 'react-native';
import {useSubscription} from '../../../common/subscribeAble';
import {AstText} from '../model/ast';
import {CursorContext} from '../model/cursor';
import {GlyphWidthResolverContext} from '../model/glyphWidthResolver';
import {CursorView} from './cursor';
import {AstDocumentViewWidthContext} from './document';

type Props = {node: AstText};

const lineHeight = 30;

export const ASTTextView = ({node}: Props) => {
  useSubscription(node);

  const glyphResolver = useContext(GlyphWidthResolverContext);
  const {text, cursorPosition} = node;
  const documentWidth = useContext(AstDocumentViewWidthContext);
  const cur = useContext(CursorContext);

  console.log('render', text, cursorPosition, node.id, node.cursorPosition);
  const changeCursorPosition = (
    locationX: number,
    locationY: number,
    text: string,
    documentWidth: number,
  ) => {
    if (text === '') {
      cur.requestChangePointed(node, 0);
      return;
    }
    let index = 0;
    let curX = 0;
    let curY = lineHeight;
    for (index; index < text.length; index++) {
      if (curX >= documentWidth) {
        curX = 0;
        curY += lineHeight;
      }
      const glyphWidth =
        glyphResolver.widthMap['test_style'] &&
        glyphResolver.widthMap['test_style'][text[index]]
          ? glyphResolver.widthMap['test_style'][text[index]]
          : 0;
      curX += glyphWidth;
      if (curX >= locationX && curY >= locationY) {
        const relX = locationX - curX + glyphWidth;
        if (relX < glyphWidth / 2) {
          cur.requestChangePointed(node, index);
        } else {
          cur.requestChangePointed(node, index + 1);
        }
        return;
      }
    }
  };

  const textRef = useRef<Text>(null);

  const handleTap = useCallback(
    (e: GestureResponderEvent) => {
      e.stopPropagation();
      if (!textRef.current) {
        return;
      }
      const {locationX, locationY} = e.nativeEvent;
      changeCursorPosition(locationX, locationY, text, documentWidth);
    },
    [text, documentWidth],
  );

  useEffect(() => {
    for (let glyph of text) {
      glyphResolver.requestGlyphWidth('test_style', glyph);
    }
  }, [text]);

  if (cursorPosition !== undefined) {
    const before = text.substring(0, cursorPosition);
    const after = text.substring(cursorPosition!, text.length);

    return (
      <TouchableWithoutFeedback onPress={handleTap}>
        <Text ref={textRef} style={style.text}>
          <Text>{before}</Text>
          <CursorView key={'cursor'} />
          <Text>{after}</Text>
        </Text>
      </TouchableWithoutFeedback>
    );
  } else {
    return (
      <TouchableWithoutFeedback onPress={handleTap}>
        <Text ref={textRef} style={style.text}>
          <Text>{text}</Text>
        </Text>
      </TouchableWithoutFeedback>
    );
  }
};

const style = StyleSheet.create({
  text: {
    lineHeight,
  },
});
