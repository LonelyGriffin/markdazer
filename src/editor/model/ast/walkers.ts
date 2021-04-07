import { AstContainer } from "./container";
import { AstNode } from "./type";

type NodePredicate = (node: AstNode) => boolean;

export abstract class AstWalker
  implements Iterable<AstNode>, Iterator<AstNode, undefined> {
  private startNode?: AstNode;
  protected result: IteratorResult<AstNode, undefined> = {
    value: undefined,
    done: true,
  };

  constructor(startNode?: AstNode) {
    this.startNode = startNode;
    this.reset();
  }

  private reset() {
    if (this.startNode) {
      this.result = {
        value: this.startNode,
        done: false,
      };
    } else {
      this.result = {
        value: undefined,
        done: true,
      };
    }
  }

  [Symbol.iterator](): Iterator<AstNode, undefined> {
    this.reset();
    return this;
  }

  next(): IteratorResult<AstNode, undefined> {
    const currentResult = this.result;

    const nextNode = currentResult.value
      ? this.nextNodeFor(currentResult.value)
      : undefined;

    this.result = {
      value: nextNode,
      done: !Boolean(nextNode),
    } as IteratorResult<AstNode, undefined>;

    return currentResult;
  }

  abstract nextNodeFor(node: AstNode): AstNode | undefined;

  find<T>(is: NodePredicate): T | undefined {
    for (let node of this) {
      if (is(node)) {
        return (node as any) as T;
      }
    }

    return undefined;
  }

  findSecond<T>(is: NodePredicate): T | undefined {
    let firstPassed = false;
    for (let node of this) {
      if (is(node)) {
        if (firstPassed) {
          return (node as any) as T;
        } else {
          firstPassed = true;
        }
      }
    }

    return undefined;
  }

  findBefore(is: NodePredicate, isBefore: NodePredicate) {
    for (let node of this) {
      if (isBefore(node)) {
        return undefined;
      }
      if (is(node)) {
        return node;
      }
    }

    return undefined;
  }
}

export class AstToRightWalker extends AstWalker {
  nextNodeFor(node: AstNode) {
    return node.right;
  }
}

export class AstToLeftWalker extends AstWalker {
  nextNodeFor(node: AstNode) {
    return node.left;
  }
}

export class AstToBeginWalker extends AstWalker {
  nextNodeFor(node: AstNode): AstNode | undefined {
    const { left, parent } = node;

    if (!left) {
      if (parent) {
        return this.nextNodeFor(parent);
      }

      return undefined;
    }

    if (left instanceof AstContainer) {
      return left.deepTail || left;
    }

    return node.left;
  }
}
