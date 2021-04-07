import React from 'react';
import {Text, View} from 'react-native';
import {useSubscription} from '../../../common/subscribeAble';
import {AstLine} from '../model/ast/line';
import {ASTContainerView} from './container';

type Props = {node: AstLine};

export const ASTLineView = ({node}: Props) => {
  useSubscription(node);

  return (
    <View>
      <Text>
        <ASTContainerView node={node} />
      </Text>
    </View>
  );
};
