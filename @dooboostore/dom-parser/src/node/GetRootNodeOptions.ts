/**
 * Options for the getRootNode() method.
 * 
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/getRootNode)
 */
export interface GetRootNodeOptions {
    /**
     * A boolean value that indicates whether the shadow root, if any, should be returned.
     * If set to false (default), a shadow root node is not returned.
     * If set to true, a shadow root node is returned.
     */
    composed?: boolean;
}