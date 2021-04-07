import {createContext} from 'react';
import {StyleSheet} from 'react-native';
import {
  ISoftwareKeyboardService,
  SoftwareKeyboardServiceMock,
} from '../../../nativeModules/SoftwareKeyboardService';
import {AstContainer, AstDocument, AstText, AstToBeginWalker} from './ast';
import {AstLine} from './ast/line';

export class Cursor {
  private softwareKeyboardService: ISoftwareKeyboardService;
  pointed?: AstText;
  ast: AstDocument;
  constructor(
    ast: AstDocument,
    softwareKeyboardService: ISoftwareKeyboardService,
  ) {
    this.ast = ast;
    this.softwareKeyboardService = softwareKeyboardService;
    this.softwareKeyboardService.subscribe((event) => {
      console.log('event: ', event);
      if (event.type === 'changed' && this.pointed) {
        this.pointed.text = event.text;
        this.pointed.cursorPosition = event.cursor;
        this.pointed.commit();
      }
    });
  }

  setToDocumentEnd = () => {
    console.log('setToDocumentEnd');
    const endAstTextNode = new AstToBeginWalker(
      this.ast.deepTail,
    ).find<AstText>((node) => node instanceof AstText);

    if (!endAstTextNode) {
      const paragraph = new AstLine();
      const text = new AstText();
      text.cursorPosition = 0;

      paragraph.push(text);
      this.ast.push(paragraph);

      this.pointed = text;
      this.ast.commit();
      this.softwareKeyboardService.dispatch({type: 'open'});
      return;
    }

    if (this.pointed) {
      this.pointed.cursorPosition = undefined;
      this.softwareKeyboardService.dispatch({type: 'open'});
      this.pointed.commit();
    }

    this.pointed = endAstTextNode;
    this.pointed.cursorPosition = this.pointed.text.length;
    this.softwareKeyboardService.dispatch({type: 'open'});
    this.pointed.commit();
  };

  requestChangeText(text: string) {
    if (!this.pointed) {
      return;
    }

    const splitted = text.split('\n');

    if (splitted.length === 1) {
      this.pointed.text = text;
      this.pointed.commit();
      return;
    }

    const pointedLine = this.pointed.parent;

    if (
      pointedLine instanceof AstLine &&
      pointedLine.parent instanceof AstContainer
    ) {
      const linesContainer = pointedLine.parent;
      const newText = new AstText({
        text: splitted[1],
        cursorPosition: 0,
      });
      const newLine = new AstLine({children: [newText]});

      linesContainer.insertAfter(pointedLine, newLine);

      this.pointed.cursorPosition = undefined;
      this.pointed.text = splitted[0];
      this.pointed.commit();
      linesContainer.commit();
      this.pointed = newText;
    }
  }

  requestChangePointed(pointed: AstText, position: number) {
    console.log('requestChangePointed', position);
    const prevPointed = this.pointed;
    this.pointed = pointed;
    this.pointed.cursorPosition = position;

    if (prevPointed && prevPointed !== pointed) {
      prevPointed.cursorPosition = undefined;
      prevPointed.commit();
    }
    console.log('commit', this.pointed.id, this.pointed.cursorPosition);
    this.pointed!.commit();

    this.softwareKeyboardService.dispatch({
      type: 'change',
      text: this.pointed.text,
      cursor: this.pointed.cursorPosition,
    });
  }

  requestChangePointerPosition(position: number) {
    console.log('requestChangePointerPosition', position);
    if (!this.pointed) {
      return;
    }

    this.pointed.cursorPosition = position;
    this.pointed.commit();
  }

  requestRemovePointedNode() {
    if (!this.pointed || !this.pointed.parent) {
      return;
    }

    const left = this.pointed.left;
    const parent = this.pointed.parent;

    if (left instanceof AstText) {
      parent.remove(this.pointed);
      this.pointed = left;
      this.pointed.cursorPosition = this.pointed.text.length;
      this.pointed.commit();
      parent.commit();
      this.softwareKeyboardService.dispatch({
        type: 'change',
        text: this.pointed.text,
        cursor: this.pointed.cursorPosition,
      });
    }

    if (
      !left &&
      parent instanceof AstLine &&
      parent.left instanceof AstLine &&
      parent.parent instanceof AstContainer
    ) {
      const leftLine = parent.left;
      const linesContainer = parent.parent;

      leftLine.push(...parent.children);
      linesContainer.remove(parent);

      if (this.pointed.text === '' && leftLine.tail instanceof AstText) {
        leftLine.remove(this.pointed);
        this.pointed = leftLine.tail;
        this.pointed.cursorPosition = this.pointed.text.length;
      }
      linesContainer.commit();
      leftLine.commit();
      this.pointed.commit();
      this.softwareKeyboardService.dispatch({
        type: 'change',
        text: this.pointed.text,
        cursor: this.pointed.cursorPosition || 0,
      });
    }
  }
}

export const CursorContext = createContext(
  new Cursor(new AstDocument(), new SoftwareKeyboardServiceMock()),
);
