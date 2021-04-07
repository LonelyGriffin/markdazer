import { AstNodeType } from "./type";
import { AstContainer } from "./container";

export class AstHeader extends AstContainer {
  protected _type = AstNodeType.Header;
}
