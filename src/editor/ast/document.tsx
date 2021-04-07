import React, { createContext, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { useSubscription } from "../../../common/subscribeAble";
import { AstDocument } from "../model/ast";
import { ASTContainerView } from "./container";

export const AstDocumentViewWidthContext = createContext(0);

type Props = { node: AstDocument };

export const ASTDocumentView = ({ node }: Props) => {
  useSubscription(node);
  const ref = useRef<View>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    ref.current.measure((x, y, width) => {
      setWidth(width);
    });
  });

  return (
    <AstDocumentViewWidthContext.Provider value={width}>
      <View
        style={{ width: "100%", flex: 1, backgroundColor: "white" }}
        ref={ref}
      >
        <ASTContainerView node={node} />
      </View>
    </AstDocumentViewWidthContext.Provider>
  );
};
