export type Attr = { name: string, value: any }
export namespace NodeUtils {
  // https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript
  export const removeAllChildNode = (node: Node) => {
    while (node?.firstChild) {
      node.firstChild.remove();
    }
  }

  export const appendChild = (parentNode: Node, childNode: Node) => {
    return parentNode.appendChild(childNode)
  }

  export const replaceNode = (targetNode: Node, newNode: Node) => {
    // console.log('repalceNode', targetNode, newNode, targetNode.parentNode)
    return targetNode.parentNode?.replaceChild(newNode, targetNode);
  }


  export const addNode = (targetNode: Node, newNode: Node) => {
    return targetNode.parentNode?.insertBefore(newNode, targetNode.nextSibling);
  }
  export const cloneNode = <N extends Node>(element: N, deep?: boolean) => {
    return element.cloneNode(deep ?? false) as N;
  }

}
