import { AstNodeType } from "./type";
import { AstContainer } from "./container";
import { AstBaseNode } from "./base";

export class AstTableCell extends AstBaseNode {
  protected _type = AstNodeType.TableCell;
}
