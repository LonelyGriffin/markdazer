import { AstNodeType } from "./type";
import { AstContainer } from "./container";

export class AstDocument extends AstContainer {
  protected _type = AstNodeType.Document;
}
