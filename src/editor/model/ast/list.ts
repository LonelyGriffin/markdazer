import { AstNodeType } from "./type";
import { AstContainer } from "./container";

export class AstList extends AstContainer {
  protected _type = AstNodeType.List;
}
