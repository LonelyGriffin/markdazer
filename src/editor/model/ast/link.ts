import { AstBaseNode } from "./base";
import { AstNodeType } from "./type";

export class AstLink extends AstBaseNode {
  protected _type = AstNodeType.Link;
  link: string;
  text: string;

  constructor(snapshot: { link?: string; text?: string } = {}) {
    super();
    this.link = snapshot.link || "";
    this.text = snapshot.text || "link";
  }

  toSnapshot() {
    return {
      ...super.toSnapshot(),
      link: this.link,
      text: this.text,
    };
  }
}
