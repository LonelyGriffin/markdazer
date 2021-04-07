import { AstNodeType } from "./type";
import { AstContainer } from "./container";

export class AstTable extends AstContainer {
  protected _type = AstNodeType.Table;
}
