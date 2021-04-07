import { AstContainer } from "./container";
import { AstDocument } from "./document";
import { AstText } from "./text";

describe("ast", () => {
  describe("AstContainer", () => {
    describe(".insertBefore()", () => {
      test("Target node is first", () => {
        const targetNode = new AstText({ text: "target" });
        const container = new AstContainer({ children: [targetNode] });
        const doc = new AstDocument({ children: [container] });
        const expected = new AstDocument({
          children: [
            new AstContainer({
              children: [
                new AstText({ text: "text 1" }),
                new AstText({ text: "text 2" }),
                new AstText({ text: "target" }),
              ],
            }),
          ],
        });
        container.insertBefore(
          targetNode,
          new AstText({ text: "text 1" }),
          new AstText({ text: "text 2" })
        );

        expect(doc.toSnapshot()).toEqual(expected.toSnapshot());
      });
      test("Target node is middle and insert one node", () => {
        const targetNode = new AstText({ text: "target" });
        const container = new AstContainer({
          children: [
            new AstText({ text: "left" }),
            targetNode,
            new AstText({ text: "right" }),
          ],
        });
        const doc = new AstDocument({ children: [container] });
        const expected = new AstDocument({
          children: [
            new AstContainer({
              children: [
                new AstText({ text: "left" }),
                new AstText({ text: "node" }),
                new AstText({ text: "target" }),
                new AstText({ text: "right" }),
              ],
            }),
          ],
        });
      });
      test("Target node has not in container", () => {
        const container = new AstContainer({
          children: [
            new AstText({ text: "left" }),
            new AstText({ text: "target" }),
            new AstText({ text: "right" }),
          ],
        });
        const doc = new AstDocument({ children: [container] });
        const expected = new AstDocument({
          children: [
            new AstContainer({
              children: [
                new AstText({ text: "left" }),
                new AstText({ text: "target" }),
                new AstText({ text: "right" }),
              ],
            }),
          ],
        });

        container.insertBefore(
          new AstText({ text: "other" }),
          new AstText({ text: "node" })
        );

        expect(doc.toSnapshot()).toEqual(expected.toSnapshot());
      });
    });
    describe(".remove()", () => {
      test("Remove from middle", () => {
        const toRemove = new AstText({ text: "toRemove" });
        const container = new AstContainer({
          children: [
            new AstText({ text: "prev" }),
            toRemove,
            new AstText({ text: "next" }),
          ],
        });
        const doc = new AstDocument({ children: [container] });

        const expected = new AstDocument({
          children: [
            new AstContainer({
              children: [
                new AstText({ text: "prev" }),
                new AstText({ text: "next" }),
              ],
            }),
          ],
        });
        container.remove(toRemove);

        expect(doc.toSnapshot()).toEqual(expected.toSnapshot());
      });
      test("Remove head", () => {
        const toRemove = new AstText({ text: "toRemove" });
        const container = new AstContainer({
          children: [toRemove, new AstText({ text: "prev" })],
        });
        const doc = new AstDocument({ children: [container] });

        const expected = new AstDocument({
          children: [
            new AstContainer({
              children: [new AstText({ text: "prev" })],
            }),
          ],
        });
        container.remove(toRemove);

        expect(doc.toSnapshot()).toEqual(expected.toSnapshot());
      });
      test("Remove tail", () => {
        const toRemove = new AstText({ text: "toRemove" });
        const container = new AstContainer({
          children: [new AstText({ text: "prev" }), toRemove],
        });
        const doc = new AstDocument({ children: [container] });

        const expected = new AstDocument({
          children: [
            new AstContainer({
              children: [new AstText({ text: "prev" })],
            }),
          ],
        });
        container.remove(toRemove);

        expect(doc.toSnapshot()).toEqual(expected.toSnapshot());
      });
      test("Remove single", () => {
        const toRemove = new AstText({ text: "toRemove" });
        const container = new AstContainer({
          children: [toRemove],
        });
        const doc = new AstDocument({ children: [container] });

        const expected = new AstDocument({
          children: [
            new AstContainer({
              children: [],
            }),
          ],
        });
        container.remove(toRemove);

        expect(doc.toSnapshot()).toEqual(expected.toSnapshot());
      });
    });
  });
});
