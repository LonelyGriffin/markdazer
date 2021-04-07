import { AstNodeType } from "./type";
import { AstContainer } from "./container";

export class AstLine extends AstContainer {
  protected _type = AstNodeType.Line;
}
