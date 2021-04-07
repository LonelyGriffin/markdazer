import React from "react";
import { useSubscription } from "../../../common/subscribeAble";
import { AstContainer, AstDocument, AstText } from "../model/ast";
import { AstLine } from "../model/ast/line";
import { ASTDocumentView } from "./document";
import { ASTLineView } from "./line";
import { ASTTextView } from "./text";

type Props = { node: AstContainer };

export const ASTContainerView = ({ node }: Props) => {
  useSubscription(node);
  return (
    <>
      {node.children.map((child) => {
        if (child instanceof AstText) {
          return <ASTTextView node={child} key={child.id} />;
        }

        if (child instanceof AstLine) {
          return <ASTLineView node={child} key={child.id} />;
        }

        if (child instanceof AstDocument) {
          return <ASTDocumentView node={child} key={child.id} />;
        }

        if (child instanceof AstContainer) {
          return <ASTContainerView node={child} key={child.id} />;
        }

        return null;
      })}
    </>
  );
};
