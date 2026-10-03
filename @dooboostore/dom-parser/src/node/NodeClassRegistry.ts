// 서로를 참조하는 노드 클래스들(NodeBase ↔ TextBase 등)을 순환 import 없이 쓰기 위한 등록부.
// 이 파일은 아무것도 import 하지 않는다. 각 클래스 모듈이 정의 직후 자기를 등록하고, 쓰는 쪽은 실행 시점에 꺼낸다.
// (예전엔 함수 안에서 require 했는데, ESM(Vite·tsx·Node ESM)에는 require 가 없어 터졌다)
export const NodeClassRegistry = {} as {
  TextBase: any;
  Comment: any;
  DocumentFragmentBase: any;
  NodeIterator: any;
  TreeWalker: any;
  ElementBase: any;
};
