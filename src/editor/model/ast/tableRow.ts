import { AstNodeType } from "./type";
import { AstContainer } from "./container";

export class AstTableRow extends AstContainer {
  protected _type = AstNodeType.TableRow;
}
