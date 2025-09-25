export const DomRenderNoProxyKey = 'DomRender:NoProxy'
export const DomRenderNoProxy = (target: any, propertyKey?: string | symbol) => {
    // 클래스 데코레이터로 사용된 경우
    if (propertyKey === undefined) {
      // target은 클래스 생성자
      Reflect.defineMetadata(DomRenderNoProxyKey, true, target);
      return;
    }

    // 프로퍼티 데코레이터로 사용된 경우
    // target은 프로토타입, propertyKey는 프로퍼티 이름
    Reflect.defineMetadata(DomRenderNoProxyKey, true, target, propertyKey);
};

export const getDomRenderNoProxy = (target: any, propertyKey?: string | symbol) => {
  // if (ValidUtils.isNotNullUndefined(target)) {
    // 클래스 데코레이터
    if (propertyKey === undefined) {
      return Reflect.getMetadata(DomRenderNoProxyKey, target);
    }
    // 프로퍼티 데코레이터
    return Reflect.getMetadata(DomRenderNoProxyKey, target, propertyKey);
  // } else {
  //   return undefined;
  // }
}

export const isDomRenderNoProxy = (target: any, propertyKey?: string | symbol) => {
  return getDomRenderNoProxy(target, propertyKey) === true;
}