import React, {createContext, useContext, useEffect, useState} from 'react';
import {
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import SoftwareKeyboardService from '../../nativeModules/SoftwareKeyboardService';
import {ASTContainerView} from './ast/container';
import {ASTDocumentView} from './ast/document';
import {AstBaseNode, AstContainer, AstDocument} from './model/ast';
import {Cursor, CursorContext} from './model/cursor';
import {
  GlyphWidthResolverContext,
  GlyphWidthResolver,
  GlyphWidthRenderer,
} from './model/glyphWidthResolver';

const ast = new AstDocument();
const cursor = new Cursor(ast, new SoftwareKeyboardService());
const resolver = new GlyphWidthResolver();

export default function Editor() {
  const handleTouchOnEmptySpace = () => {
    cursor.setToDocumentEnd();
  };

  return (
    <CursorContext.Provider value={cursor}>
      <GlyphWidthResolverContext.Provider value={resolver}>
        <GlyphWidthRenderer />
        <TouchableWithoutFeedback onPress={handleTouchOnEmptySpace}>
          <View style={styles.container}>
            <ASTDocumentView node={ast} />
          </View>
        </TouchableWithoutFeedback>
      </GlyphWidthResolverContext.Provider>
    </CursorContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flex: 1,
    width: '100%',
    backgroundColor: 'red',
  },
});
