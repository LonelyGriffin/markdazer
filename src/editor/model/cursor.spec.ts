import {SoftwareKeyboardServiceMock} from '../../../nativeModules/SoftwareKeyboardService';
import {AstDocument, AstText} from './ast';
import {AstLine} from './ast/line';
import {Cursor} from './cursor';

describe('cursor', () => {
  describe('.setToDocumentEnd()', () => {
    test('should create Line with empty text when document is empty', () => {
      const doc = new AstDocument();
      const softwareKeyboardService = new SoftwareKeyboardServiceMock();
      const cur = new Cursor(doc, softwareKeyboardService);

      cur.setToDocumentEnd();

      const expected = new AstDocument({
        children: [
          new AstLine({
            children: [new AstText({text: '', cursorPosition: 0})],
          }),
        ],
      });

      expect(doc.toSnapshot()).toEqual(expected.toSnapshot());
      expect(cur.pointed).toBeTruthy();
    });
    test('should set position to last text node', () => {
      const pointedText = new AstText({text: 'text 1', cursorPosition: 2});
      const expectedPointed = new AstText({text: 'text 2'});

      const doc = new AstDocument({
        children: [
          new AstLine({
            children: [pointedText],
          }),
          new AstLine({
            children: [expectedPointed],
          }),
        ],
      });
      const softwareKeyboardService = new SoftwareKeyboardServiceMock();
      const cursor = new Cursor(doc, softwareKeyboardService);
      cursor.pointed = pointedText;

      cursor.setToDocumentEnd();

      const expected = new AstDocument({
        children: [
          new AstLine({
            children: [new AstText({text: 'text 1'})],
          }),
          new AstLine({
            children: [new AstText({text: 'text 2', cursorPosition: 6})],
          }),
        ],
      });

      expect(doc.toSnapshot()).toEqual(expected.toSnapshot());
      expect(cursor.pointed).toEqual(expectedPointed);
    });
  });
  describe('.requestRemovePointedNode()', () => {
    test('Nothing when there is not pointed node', () => {
      const doc = new AstDocument({
        children: [
          new AstLine({
            children: [new AstText({text: 'text'})],
          }),
        ],
      });
      const softwareKeyboardService = new SoftwareKeyboardServiceMock();
      const cursor = new Cursor(doc, softwareKeyboardService);

      cursor.requestRemovePointedNode();

      const expected = new AstDocument({
        children: [
          new AstLine({
            children: [new AstText({text: 'text'})],
          }),
        ],
      });

      expect(doc.toSnapshot()).toEqual(expected.toSnapshot());
      expect(cursor.pointed).toEqual(undefined);
    });
    test('Nothing when is last remaining text node', () => {
      const pointedText = new AstText({text: 'text', cursorPosition: 2});
      const doc = new AstDocument({
        children: [
          new AstLine({
            children: [pointedText],
          }),
        ],
      });
      const softwareKeyboardService = new SoftwareKeyboardServiceMock();
      const cursor = new Cursor(doc, softwareKeyboardService);
      cursor.pointed = pointedText;

      cursor.requestRemovePointedNode();

      const expected = new AstDocument({
        children: [
          new AstLine({
            children: [new AstText({text: 'text', cursorPosition: 2})],
          }),
        ],
      });

      expect(doc.toSnapshot()).toEqual(expected.toSnapshot());
      expect(cursor.pointed).toEqual(pointedText);
    });
    test('Should remove pointed', () => {
      const pointedText = new AstText({text: '', cursorPosition: 0});
      const expectedPointed = new AstText({text: 'text 1'});
      const doc = new AstDocument({
        children: [
          new AstLine({
            children: [expectedPointed, pointedText],
          }),
        ],
      });
      const softwareKeyboardService = new SoftwareKeyboardServiceMock();
      const cursor = new Cursor(doc, softwareKeyboardService);
      cursor.pointed = pointedText;

      cursor.requestRemovePointedNode();

      const expected = new AstDocument({
        children: [
          new AstLine({
            children: [new AstText({text: 'text 1', cursorPosition: 6})],
          }),
        ],
      });

      expect(doc.toSnapshot()).toEqual(expected.toSnapshot());
      expect(cursor.pointed).toEqual(expectedPointed);
    });
    test('Should remove pointed line if it is empty', () => {
      const pointedText = new AstText({text: '', cursorPosition: 0});
      const doc = new AstDocument({
        children: [
          new AstLine({
            children: [new AstText({text: 'text 1'})],
          }),
          new AstLine({
            children: [pointedText],
          }),
        ],
      });
      const softwareKeyboardService = new SoftwareKeyboardServiceMock();
      const cursor = new Cursor(doc, softwareKeyboardService);
      cursor.pointed = pointedText;
      debugger;
      cursor.requestRemovePointedNode();

      const expected = new AstDocument({
        children: [
          new AstLine({
            children: [
              new AstText({
                text: 'text 1',
                cursorPosition: 6,
              }),
            ],
          }),
        ],
      });

      expect(doc.toSnapshot()).toEqual(expected.toSnapshot());
    });
    test('Should concat with previous line if pointed position is begin', () => {
      const pointedText = new AstText({
        text: 'pointed text',
        cursorPosition: 0,
      });
      const expectedPointed = pointedText;
      const doc = new AstDocument({
        children: [
          new AstLine({
            children: [new AstText({text: 'text of first paragraph'})],
          }),
          new AstLine({
            children: [
              pointedText,
              new AstText({text: 'text of second paragraph'}),
            ],
          }),
        ],
      });
      const softwareKeyboardService = new SoftwareKeyboardServiceMock();
      const cursor = new Cursor(doc, softwareKeyboardService);
      cursor.pointed = pointedText;

      cursor.requestRemovePointedNode();

      const expected = new AstDocument({
        children: [
          new AstLine({
            children: [
              new AstText({
                text: 'text of first paragraph',
              }),
              new AstText({text: 'pointed text', cursorPosition: 0}),
              new AstText({
                text: 'text of second paragraph',
              }),
            ],
          }),
        ],
      });

      expect(doc.toSnapshot()).toEqual(expected.toSnapshot());
      expect(cursor.pointed).toEqual(expectedPointed);
    });
  });
  describe('.requestChangeText()', () => {
    test('Simple text change', () => {
      const pointedText = new AstText({
        text: 'initial text',
        cursorPosition: 6,
      });
      const doc = new AstDocument({
        children: [new AstLine({children: [pointedText]})],
      });
      const expected = new AstDocument({
        children: [
          new AstLine({
            children: [new AstText({text: 'expected text', cursorPosition: 6})],
          }),
        ],
      });
      const softwareKeyboardService = new SoftwareKeyboardServiceMock();
      const cursor = new Cursor(doc, softwareKeyboardService);
      cursor.pointed = pointedText;

      cursor.requestChangeText('expected text');

      expect(doc.toSnapshot()).toEqual(expected.toSnapshot());
    });
    test('New line of text end', () => {
      const pointedText = new AstText({
        text: 'initial text',
        cursorPosition: 12,
      });
      const doc = new AstDocument({
        children: [new AstLine({children: [pointedText]})],
      });
      const expected = new AstDocument({
        children: [
          new AstLine({
            children: [new AstText({text: 'expected text'})],
          }),
          new AstLine({
            children: [new AstText({text: '', cursorPosition: 0})],
          }),
        ],
      });
      const softwareKeyboardService = new SoftwareKeyboardServiceMock();
      const cursor = new Cursor(doc, softwareKeyboardService);
      cursor.pointed = pointedText;

      cursor.requestChangeText('expected text\n');

      expect(doc.toSnapshot()).toEqual(expected.toSnapshot());
    });
    test('New line of text middle', () => {
      const pointedText = new AstText({
        text: 'initial text',
        cursorPosition: 8,
      });
      const doc = new AstDocument({
        children: [new AstLine({children: [pointedText]})],
      });
      const expected = new AstDocument({
        children: [
          new AstLine({
            children: [new AstText({text: 'expected '})],
          }),
          new AstLine({
            children: [new AstText({text: 'text', cursorPosition: 0})],
          }),
        ],
      });
      const softwareKeyboardService = new SoftwareKeyboardServiceMock();
      const cursor = new Cursor(doc, softwareKeyboardService);
      cursor.pointed = pointedText;

      cursor.requestChangeText('expected \ntext');

      expect(doc.toSnapshot()).toEqual(expected.toSnapshot());
    });
    test('New line of text begin', () => {
      const pointedText = new AstText({
        text: 'initial text',
        cursorPosition: 0,
      });
      const doc = new AstDocument({
        children: [new AstLine({children: [pointedText]})],
      });
      const expected = new AstDocument({
        children: [
          new AstLine({
            children: [new AstText({text: ''})],
          }),
          new AstLine({
            children: [new AstText({text: 'expected text', cursorPosition: 0})],
          }),
        ],
      });
      const softwareKeyboardService = new SoftwareKeyboardServiceMock();
      const cursor = new Cursor(doc, softwareKeyboardService);
      cursor.pointed = pointedText;

      cursor.requestChangeText('\nexpected text');

      expect(doc.toSnapshot()).toEqual(expected.toSnapshot());
    });
  });
  describe('Complex cases', () => {});
});
