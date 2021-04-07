import { AstBaseNode } from "./base";
import { AstNodeType, AstNode } from "./type";
import { AstToRightWalker } from "./walkers";

export class AstContainer extends AstBaseNode {
  protected _type = AstNodeType.Container;
  private _head?: AstNode;
  private _tail?: AstNode;

  get head() {
    return this._head;
  }
  get tail() {
    return this._tail;
  }

  get deepTail(): AstNode | undefined {
    if (!this._tail) {
      return undefined;
    }

    if (this._tail instanceof AstContainer) {
      return this._tail.deepTail;
    }

    return this._tail;
  }

  get iterator() {
    return new AstToRightWalker(this._head);
  }

  get children() {
    return Array.from(this.iterator);
  }

  constructor(snapshot: { children?: AstNode[] } = {}) {
    super();
    const children = snapshot.children || [];

    if (children.length > 0) {
      this.push(...children);
    }
  }

  toSnapshot(): Record<string, any> {
    return {
      ...super.toSnapshot(),
      children: this.children.map((node) => node.toSnapshot()),
    };
  }

  has(node: AstNode) {
    if (!this._head) {
      return false;
    }

    const nodes = new AstToRightWalker(this._head);

    for (let current of nodes) {
      if (current === node) {
        return true;
      }
    }
  }

  push(...nodes: AstNode[]) {
    for (let node of nodes) {
      node.parent = this;

      if (this._tail && this._head) {
        node.left = this._tail;
        this._tail.right = node;
        this._tail = node;
      } else if (!this._tail && this._head) {
        this._tail = node;
        this._head.right = node;
        node.left = this._head;
      } else if (!this._head) {
        this._head = node;
        this._tail = node;
      }
    }
  }

  insertBefore(targetNode: AstNode, ...nodes: AstNode[]) {
    if (!this.has(targetNode)) {
      return;
    }
    for (let node of nodes) {
      node.parent = this;
    }
    for (let i = 1; i < nodes.length; i++) {
      nodes[i - 1].right = nodes[i];
      nodes[i].left = nodes[i - 1];
    }

    const { left } = targetNode;
    targetNode.left = nodes[nodes.length - 1];
    nodes[nodes.length - 1].right = targetNode;
    nodes[0].left = left;

    if (left) {
      left.right = nodes[0];
    }

    if (this._head === targetNode) {
      this._head = nodes[0];
    }
  }

  insertAfter(targetNode: AstNode, ...nodes: AstNode[]) {
    if (!this.has(targetNode)) {
      return;
    }
    for (let node of nodes) {
      node.parent = this;
    }
    for (let i = 1; i < nodes.length; i++) {
      nodes[i - 1].right = nodes[i];
      nodes[i].left = nodes[i - 1];
    }

    const { right } = targetNode;
    targetNode.right = nodes[0];
    nodes[0].left = targetNode;
    nodes[nodes.length - 1].right = right;

    if (right) {
      right.left = nodes[nodes.length - 1];
    }

    if (this._tail === targetNode) {
      this._tail = nodes[nodes.length - 1];
    }
  }

  remove(node: AstNode) {
    if (!this.has(node)) {
      return;
    }

    node.parent = undefined;

    const { left, right } = node;

    if (left) {
      node.left = undefined;
      left.right = right;
    }

    if (right) {
      node.right = undefined;
      right.left = left;
    }

    if (left === this._head && !right) {
      this._tail = this._head;
    } else if (right === this._tail && !left) {
      this._head = this._tail;
    } else if (!left && !right) {
      this._head = this._tail = undefined;
    } else if (node === this._head) {
      this._head = right;
    } else if (node === this._tail) {
      this._tail = left;
    }
  }
}
