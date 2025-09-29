export type Attr = { name: string; value: any };
export namespace NodeUtils {
  export enum FindNodesFilterResult {
    MATCH_AND_CONTINUE='MATCH_AND_CONTINUE', // Match the node, and continue to its children
    MATCH_AND_SKIP_CHILDREN='MATCH_AND_SKIP_CHILDREN', // Match the node, but do not traverse its children
    NO_MATCH_AND_CONTINUE='NO_MATCH_AND_CONTINUE', // Don't match the node, but continue to its children
    NO_MATCH_AND_SKIP_CHILDREN='NO_MATCH_AND_SKIP_CHILDREN' // Don't match the node, and also skip its children
  }
  // https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript
  export const removeAllChildNode = (node: Node) => {
    while (node?.firstChild) {
      node.firstChild.remove();
    }
  };

  export const appendChild = (parentNode: Node, childNode: Node) => {
    return parentNode.appendChild(childNode);
  };

  export const replaceNode = (targetNode: Node, newNode: Node) => {
    // console.log('repalceNode', targetNode, newNode, targetNode.parentNode)
    return targetNode.parentNode?.replaceChild(newNode, targetNode);
  };

  export const addNode = (targetNode: Node, newNode: Node) => {
    return targetNode.parentNode?.insertBefore(newNode, targetNode.nextSibling);
  };
  export const cloneNode = <N extends Node>(element: N, deep?: boolean) => {
    return element.cloneNode(deep ?? false) as N;
  };

  export const findNodes = (rootNode: Node, filter: (node: Node) => FindNodesFilterResult): Node[] => {
    const foundNodes: Node[] = [];

    function traverse(node: Node) {
      if (!node) {
        return;
      }

      node.childNodes.forEach(child => {
        const result = filter(child);

        if (
          result === FindNodesFilterResult.MATCH_AND_CONTINUE ||
          result === FindNodesFilterResult.MATCH_AND_SKIP_CHILDREN
        ) {
          foundNodes.push(child);
        }

        if (
          result === FindNodesFilterResult.MATCH_AND_CONTINUE ||
          result === FindNodesFilterResult.NO_MATCH_AND_CONTINUE
        ) {
          traverse(child);
        }
      });
    }

    traverse(rootNode);
    return foundNodes;
  };
}
