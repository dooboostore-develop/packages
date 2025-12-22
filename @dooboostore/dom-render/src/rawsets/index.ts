export * from './AttrInitCallBack';
export * from './Attrs';
export * from './CreatorMetaData';
export * from './DestroyOptionType';
export * from './ElementInitCallBack';
export * from './RawSet';
export * from './RawSetOperatorType';
export * from './RawSetType';
export * from './Render';


export const enum DomRenderComponentMetaKey {
  DOMRENDER_COMPONENTS_KEY = '__domrender_components'
}

export const enum DomRenderProxyMetaKey {
  onBeforeReturnGet = 'onBeforeReturnGet',
  onBeforeReturnSet = 'onBeforeReturnSet',
  __render = '__render',
  _rawSets = '_rawSets',
  _targets = '_targets',
  _domRender_proxy = '_domRender_proxy',
  _DomRender_isProxy = '_DomRender_isProxy',
  _DomRender_isFinal = '_DomRender_isFinal',
  _DomRender_ref = '_DomRender_ref',
  _domRender_ref = '_domRender_ref',
  _DomRender_origin = '_DomRender_origin',
  _domRender_origin = '_domRender_origin',
  _DomRender_config = '_DomRender_config',
  _domRender_config = '_domRender_config',
  _DomRender_proxy = '_DomRender_proxy',
}