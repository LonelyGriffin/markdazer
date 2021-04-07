import { AstBaseNode } from "./base";
import { AstNodeType } from "./type";

export class AstText extends AstBaseNode {
  protected _type = AstNodeType.Text;
  text: string;
  cursorPosition?: number;

  constructor(snapshot: { text?: string; cursorPosition?: number } = {}) {
    super();
    this.text = snapshot.text || "";
    this.cursorPosition = snapshot.cursorPosition;
  }

  toSnapshot() {
    return {
      ...super.toSnapshot(),
      text: this.text,
      cursorPosition: this.cursorPosition,
    };
  }
}
