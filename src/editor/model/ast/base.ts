import shortid from "shortid";
import { SubscribeAble } from "../../../../common/subscribeAble";
import { AstContainer } from "./container";
import { AstNodeType, AstNode } from "./type";

export class AstBaseNode extends SubscribeAble {
  readonly id: string;
  protected _type = AstNodeType.Base;

  get type() {
    return this._type;
  }

  parent?: AstContainer;
  left?: AstNode;
  right?: AstNode;

  constructor() {
    super();
    this.id = shortid();
  }

  toSnapshot(): Record<string, any> {
    return {
      type: this._type,
    };
  }
}
