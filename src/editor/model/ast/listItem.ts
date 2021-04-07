import { AstNodeType } from "./type";
import { AstBaseNode } from "./base";

export class AstListItem extends AstBaseNode {
  protected _type = AstNodeType.ListItem;
}
