// 타입 전용 검사 (실행 안 함, test:types 가 tsc 로 확인).
// 규칙: 인자가 없으면 괄호도 없다 — bare(@x) 는 되고, 빈 괄호 @x() 는 타입 에러.
import * as d from '../../src/decorators/index.ts';

export class BareMethods extends HTMLElement {
  @d.eventAnimationcancel m_eventAnimationcancel() {}
  @d.eventAnimationend m_eventAnimationend() {}
  @d.eventAnimationiteration m_eventAnimationiteration() {}
  @d.eventAnimationstart m_eventAnimationstart() {}
  @d.eventBlur m_eventBlur() {}
  @d.eventChange m_eventChange() {}
  @d.eventClick m_eventClick() {}
  @d.eventContextmenu m_eventContextmenu() {}
  @d.eventCopy m_eventCopy() {}
  @d.eventCut m_eventCut() {}
  @d.eventDblclick m_eventDblclick() {}
  @d.eventDrag m_eventDrag() {}
  @d.eventDragend m_eventDragend() {}
  @d.eventDragenter m_eventDragenter() {}
  @d.eventDragleave m_eventDragleave() {}
  @d.eventDragover m_eventDragover() {}
  @d.eventDragstart m_eventDragstart() {}
  @d.eventDrop m_eventDrop() {}
  @d.eventError m_eventError() {}
  @d.eventFocus m_eventFocus() {}
  @d.eventFocusin m_eventFocusin() {}
  @d.eventFocusout m_eventFocusout() {}
  @d.eventInput m_eventInput() {}
  @d.eventInvalid m_eventInvalid() {}
  @d.eventKeydown m_eventKeydown() {}
  @d.eventKeypress m_eventKeypress() {}
  @d.eventKeyup m_eventKeyup() {}
  @d.eventLoad m_eventLoad() {}
  @d.eventMousedown m_eventMousedown() {}
  @d.eventMouseenter m_eventMouseenter() {}
  @d.eventMouseleave m_eventMouseleave() {}
  @d.eventMousemove m_eventMousemove() {}
  @d.eventMouseout m_eventMouseout() {}
  @d.eventMouseover m_eventMouseover() {}
  @d.eventMouseup m_eventMouseup() {}
  @d.eventPaste m_eventPaste() {}
  @d.eventPointercancel m_eventPointercancel() {}
  @d.eventPointerdown m_eventPointerdown() {}
  @d.eventPointerenter m_eventPointerenter() {}
  @d.eventPointerleave m_eventPointerleave() {}
  @d.eventPointermove m_eventPointermove() {}
  @d.eventPointerout m_eventPointerout() {}
  @d.eventPointerover m_eventPointerover() {}
  @d.eventPointerup m_eventPointerup() {}
  @d.eventReset m_eventReset() {}
  @d.eventResize m_eventResize() {}
  @d.eventScroll m_eventScroll() {}
  @d.eventSelect m_eventSelect() {}
  @d.eventSubmit m_eventSubmit() {}
  @d.eventToggle m_eventToggle() {}
  @d.eventTouchcancel m_eventTouchcancel() {}
  @d.eventTouchend m_eventTouchend() {}
  @d.eventTouchmove m_eventTouchmove() {}
  @d.eventTouchstart m_eventTouchstart() {}
  @d.eventTransitioncancel m_eventTransitioncancel() {}
  @d.eventTransitionend m_eventTransitionend() {}
  @d.eventTransitionrun m_eventTransitionrun() {}
  @d.eventTransitionstart m_eventTransitionstart() {}
  @d.eventWheel m_eventWheel() {}
  @d.applyAppHost m_applyAppHost() {}
  @d.attrAppHost m_attrAppHost() {}
  @d.changedAttribute m_changedAttribute() {}
  @d.changedRoute m_changedRoute() {}
  @d.clearChildrenLight m_clearChildrenLight() {}
  @d.clearChildrenNode m_clearChildrenNode() {}
  @d.clearNode m_clearNode() {}
  @d.removeNode m_removeNode() {}
  @d.clsAppHost m_clsAppHost() {}
  @d.eventAnimationcancelAppHost m_eventAnimationcancelAppHost() {}
  @d.eventAnimationcancelDocument m_eventAnimationcancelDocument() {}
  @d.eventAnimationcancelWindow m_eventAnimationcancelWindow() {}
  @d.eventAnimationendAppHost m_eventAnimationendAppHost() {}
  @d.eventAnimationendDocument m_eventAnimationendDocument() {}
  @d.eventAnimationendWindow m_eventAnimationendWindow() {}
  @d.eventAnimationiterationAppHost m_eventAnimationiterationAppHost() {}
  @d.eventAnimationiterationDocument m_eventAnimationiterationDocument() {}
  @d.eventAnimationiterationWindow m_eventAnimationiterationWindow() {}
  @d.eventAnimationstartAppHost m_eventAnimationstartAppHost() {}
  @d.eventAnimationstartDocument m_eventAnimationstartDocument() {}
  @d.eventAnimationstartWindow m_eventAnimationstartWindow() {}
  @d.eventBlurAppHost m_eventBlurAppHost() {}
  @d.eventBlurDocument m_eventBlurDocument() {}
  @d.eventBlurWindow m_eventBlurWindow() {}
  @d.eventChangeAppHost m_eventChangeAppHost() {}
  @d.eventChangeDocument m_eventChangeDocument() {}
  @d.eventChangeWindow m_eventChangeWindow() {}
  @d.eventClickAppHost m_eventClickAppHost() {}
  @d.eventClickDocument m_eventClickDocument() {}
  @d.eventClickWindow m_eventClickWindow() {}
  @d.eventContextmenuAppHost m_eventContextmenuAppHost() {}
  @d.eventContextmenuDocument m_eventContextmenuDocument() {}
  @d.eventContextmenuWindow m_eventContextmenuWindow() {}
  @d.eventCopyAppHost m_eventCopyAppHost() {}
  @d.eventCopyDocument m_eventCopyDocument() {}
  @d.eventCopyWindow m_eventCopyWindow() {}
  @d.eventCutAppHost m_eventCutAppHost() {}
  @d.eventCutDocument m_eventCutDocument() {}
  @d.eventCutWindow m_eventCutWindow() {}
  @d.eventDblclickAppHost m_eventDblclickAppHost() {}
  @d.eventDblclickDocument m_eventDblclickDocument() {}
  @d.eventDblclickWindow m_eventDblclickWindow() {}
  @d.eventDragAppHost m_eventDragAppHost() {}
  @d.eventDragDocument m_eventDragDocument() {}
  @d.eventDragendAppHost m_eventDragendAppHost() {}
  @d.eventDragendDocument m_eventDragendDocument() {}
  @d.eventDragendWindow m_eventDragendWindow() {}
  @d.eventDragenterAppHost m_eventDragenterAppHost() {}
  @d.eventDragenterDocument m_eventDragenterDocument() {}
  @d.eventDragenterWindow m_eventDragenterWindow() {}
  @d.eventDragleaveAppHost m_eventDragleaveAppHost() {}
  @d.eventDragleaveDocument m_eventDragleaveDocument() {}
  @d.eventDragleaveWindow m_eventDragleaveWindow() {}
  @d.eventDragoverAppHost m_eventDragoverAppHost() {}
  @d.eventDragoverDocument m_eventDragoverDocument() {}
  @d.eventDragoverWindow m_eventDragoverWindow() {}
  @d.eventDragstartAppHost m_eventDragstartAppHost() {}
  @d.eventDragstartDocument m_eventDragstartDocument() {}
  @d.eventDragstartWindow m_eventDragstartWindow() {}
  @d.eventDragWindow m_eventDragWindow() {}
  @d.eventDropAppHost m_eventDropAppHost() {}
  @d.eventDropDocument m_eventDropDocument() {}
  @d.eventDropWindow m_eventDropWindow() {}
  @d.eventErrorAppHost m_eventErrorAppHost() {}
  @d.eventErrorDocument m_eventErrorDocument() {}
  @d.eventErrorWindow m_eventErrorWindow() {}
  @d.eventFocusAppHost m_eventFocusAppHost() {}
  @d.eventFocusDocument m_eventFocusDocument() {}
  @d.eventFocusinAppHost m_eventFocusinAppHost() {}
  @d.eventFocusinDocument m_eventFocusinDocument() {}
  @d.eventFocusinWindow m_eventFocusinWindow() {}
  @d.eventFocusoutAppHost m_eventFocusoutAppHost() {}
  @d.eventFocusoutDocument m_eventFocusoutDocument() {}
  @d.eventFocusoutWindow m_eventFocusoutWindow() {}
  @d.eventFocusWindow m_eventFocusWindow() {}
  @d.eventInputAppHost m_eventInputAppHost() {}
  @d.eventInputDocument m_eventInputDocument() {}
  @d.eventInputWindow m_eventInputWindow() {}
  @d.eventInvalidAppHost m_eventInvalidAppHost() {}
  @d.eventInvalidDocument m_eventInvalidDocument() {}
  @d.eventInvalidWindow m_eventInvalidWindow() {}
  @d.eventKeydownAppHost m_eventKeydownAppHost() {}
  @d.eventKeydownDocument m_eventKeydownDocument() {}
  @d.eventKeydownWindow m_eventKeydownWindow() {}
  @d.eventKeypressAppHost m_eventKeypressAppHost() {}
  @d.eventKeypressDocument m_eventKeypressDocument() {}
  @d.eventKeypressWindow m_eventKeypressWindow() {}
  @d.eventKeyupAppHost m_eventKeyupAppHost() {}
  @d.eventKeyupDocument m_eventKeyupDocument() {}
  @d.eventKeyupWindow m_eventKeyupWindow() {}
  @d.eventLoadAppHost m_eventLoadAppHost() {}
  @d.eventLoadDocument m_eventLoadDocument() {}
  @d.eventLoadWindow m_eventLoadWindow() {}
  @d.eventMousedownAppHost m_eventMousedownAppHost() {}
  @d.eventMousedownDocument m_eventMousedownDocument() {}
  @d.eventMousedownWindow m_eventMousedownWindow() {}
  @d.eventMouseenterAppHost m_eventMouseenterAppHost() {}
  @d.eventMouseenterDocument m_eventMouseenterDocument() {}
  @d.eventMouseenterWindow m_eventMouseenterWindow() {}
  @d.eventMouseleaveAppHost m_eventMouseleaveAppHost() {}
  @d.eventMouseleaveDocument m_eventMouseleaveDocument() {}
  @d.eventMouseleaveWindow m_eventMouseleaveWindow() {}
  @d.eventMousemoveAppHost m_eventMousemoveAppHost() {}
  @d.eventMousemoveDocument m_eventMousemoveDocument() {}
  @d.eventMousemoveWindow m_eventMousemoveWindow() {}
  @d.eventMouseoutAppHost m_eventMouseoutAppHost() {}
  @d.eventMouseoutDocument m_eventMouseoutDocument() {}
  @d.eventMouseoutWindow m_eventMouseoutWindow() {}
  @d.eventMouseoverAppHost m_eventMouseoverAppHost() {}
  @d.eventMouseoverDocument m_eventMouseoverDocument() {}
  @d.eventMouseoverWindow m_eventMouseoverWindow() {}
  @d.eventMouseupAppHost m_eventMouseupAppHost() {}
  @d.eventMouseupDocument m_eventMouseupDocument() {}
  @d.eventMouseupWindow m_eventMouseupWindow() {}
  @d.eventPasteAppHost m_eventPasteAppHost() {}
  @d.eventPasteDocument m_eventPasteDocument() {}
  @d.eventPasteWindow m_eventPasteWindow() {}
  @d.eventPointercancelAppHost m_eventPointercancelAppHost() {}
  @d.eventPointercancelDocument m_eventPointercancelDocument() {}
  @d.eventPointercancelWindow m_eventPointercancelWindow() {}
  @d.eventPointerdownAppHost m_eventPointerdownAppHost() {}
  @d.eventPointerdownDocument m_eventPointerdownDocument() {}
  @d.eventPointerdownWindow m_eventPointerdownWindow() {}
  @d.eventPointerenterAppHost m_eventPointerenterAppHost() {}
  @d.eventPointerenterDocument m_eventPointerenterDocument() {}
  @d.eventPointerenterWindow m_eventPointerenterWindow() {}
  @d.eventPointerleaveAppHost m_eventPointerleaveAppHost() {}
  @d.eventPointerleaveDocument m_eventPointerleaveDocument() {}
  @d.eventPointerleaveWindow m_eventPointerleaveWindow() {}
  @d.eventPointermoveAppHost m_eventPointermoveAppHost() {}
  @d.eventPointermoveDocument m_eventPointermoveDocument() {}
  @d.eventPointermoveWindow m_eventPointermoveWindow() {}
  @d.eventPointeroutAppHost m_eventPointeroutAppHost() {}
  @d.eventPointeroutDocument m_eventPointeroutDocument() {}
  @d.eventPointeroutWindow m_eventPointeroutWindow() {}
  @d.eventPointeroverAppHost m_eventPointeroverAppHost() {}
  @d.eventPointeroverDocument m_eventPointeroverDocument() {}
  @d.eventPointeroverWindow m_eventPointeroverWindow() {}
  @d.eventPointerupAppHost m_eventPointerupAppHost() {}
  @d.eventPointerupDocument m_eventPointerupDocument() {}
  @d.eventPointerupWindow m_eventPointerupWindow() {}
  @d.eventResetAppHost m_eventResetAppHost() {}
  @d.eventResetDocument m_eventResetDocument() {}
  @d.eventResetWindow m_eventResetWindow() {}
  @d.eventResizeAppHost m_eventResizeAppHost() {}
  @d.eventResizeDocument m_eventResizeDocument() {}
  @d.eventResizeWindow m_eventResizeWindow() {}
  @d.eventScrollAppHost m_eventScrollAppHost() {}
  @d.eventScrollDocument m_eventScrollDocument() {}
  @d.eventScrollWindow m_eventScrollWindow() {}
  @d.eventSelectAppHost m_eventSelectAppHost() {}
  @d.eventSelectDocument m_eventSelectDocument() {}
  @d.eventSelectWindow m_eventSelectWindow() {}
  @d.eventSubmitAppHost m_eventSubmitAppHost() {}
  @d.eventSubmitDocument m_eventSubmitDocument() {}
  @d.eventSubmitWindow m_eventSubmitWindow() {}
  @d.eventToggleAppHost m_eventToggleAppHost() {}
  @d.eventToggleDocument m_eventToggleDocument() {}
  @d.eventToggleWindow m_eventToggleWindow() {}
  @d.eventTouchcancelAppHost m_eventTouchcancelAppHost() {}
  @d.eventTouchcancelDocument m_eventTouchcancelDocument() {}
  @d.eventTouchcancelWindow m_eventTouchcancelWindow() {}
  @d.eventTouchendAppHost m_eventTouchendAppHost() {}
  @d.eventTouchendDocument m_eventTouchendDocument() {}
  @d.eventTouchendWindow m_eventTouchendWindow() {}
  @d.eventTouchmoveAppHost m_eventTouchmoveAppHost() {}
  @d.eventTouchmoveDocument m_eventTouchmoveDocument() {}
  @d.eventTouchmoveWindow m_eventTouchmoveWindow() {}
  @d.eventTouchstartAppHost m_eventTouchstartAppHost() {}
  @d.eventTouchstartDocument m_eventTouchstartDocument() {}
  @d.eventTouchstartWindow m_eventTouchstartWindow() {}
  @d.eventTransitioncancelAppHost m_eventTransitioncancelAppHost() {}
  @d.eventTransitioncancelDocument m_eventTransitioncancelDocument() {}
  @d.eventTransitioncancelWindow m_eventTransitioncancelWindow() {}
  @d.eventTransitionendAppHost m_eventTransitionendAppHost() {}
  @d.eventTransitionendDocument m_eventTransitionendDocument() {}
  @d.eventTransitionendWindow m_eventTransitionendWindow() {}
  @d.eventTransitionrunAppHost m_eventTransitionrunAppHost() {}
  @d.eventTransitionrunDocument m_eventTransitionrunDocument() {}
  @d.eventTransitionrunWindow m_eventTransitionrunWindow() {}
  @d.eventTransitionstartAppHost m_eventTransitionstartAppHost() {}
  @d.eventTransitionstartDocument m_eventTransitionstartDocument() {}
  @d.eventTransitionstartWindow m_eventTransitionstartWindow() {}
  @d.eventWheelAppHost m_eventWheelAppHost() {}
  @d.eventWheelDocument m_eventWheelDocument() {}
  @d.eventWheelWindow m_eventWheelWindow() {}
  @d.innerHtml m_innerHtml() {}
  @d.innerHtmlLight m_innerHtmlLight() {}
  @d.innerHtmlShadow m_innerHtmlShadow() {}
  @d.innerText m_innerText() {}
  @d.innerTextLight m_innerTextLight() {}
  @d.innerTextShadow m_innerTextShadow() {}
  @d.insertAfterBegin m_insertAfterBegin() {}
  @d.insertAfterBeginLight m_insertAfterBeginLight() {}
  @d.insertBeforeEnd m_insertBeforeEnd() {}
  @d.insertBeforeEndLight m_insertBeforeEndLight() {}
  @d.insertBeforeEndShadow m_insertBeforeEndShadow() {}
  @d.intersectionObserver m_intersectionObserver() {}
  @d.intersectionObserverAll m_intersectionObserverAll() {}
  @d.intersectionObserverDelegate m_intersectionObserverDelegate() {}
  @d.intersectionObserverDelegateAll m_intersectionObserverDelegateAll() {}
  @d.intersectionObserverDelegateLight m_intersectionObserverDelegateLight() {}
  @d.intersectionObserverDelegateShadow m_intersectionObserverDelegateShadow() {}
  @d.intersectionObserverLight m_intersectionObserverLight() {}
  @d.intersectionObserverShadow m_intersectionObserverShadow() {}
  @d.mutationObserver m_mutationObserver() {}
  @d.mutationObserverAll m_mutationObserverAll() {}
  @d.mutationObserverDelegate m_mutationObserverDelegate() {}
  @d.mutationObserverDelegateAll m_mutationObserverDelegateAll() {}
  @d.mutationObserverDelegateLight m_mutationObserverDelegateLight() {}
  @d.mutationObserverDelegateShadow m_mutationObserverDelegateShadow() {}
  @d.mutationObserverLight m_mutationObserverLight() {}
  @d.mutationObserverShadow m_mutationObserverShadow() {}
  @d.onAdopted m_onAdopted() {}
  @d.onAdoptedAfter m_onAdoptedAfter() {}
  @d.onAdoptedBefore m_onAdoptedBefore() {}
  @d.onConnectedCompleted m_onConnectedCompleted() {}
  @d.onConnectedSwcApp m_onConnectedSwcApp() {}
  @d.onDisconnected m_onDisconnected() {}
  @d.onDisconnectedAfter m_onDisconnectedAfter() {}
  @d.onDisconnectedBefore m_onDisconnectedBefore() {}
  @d.onInitialize m_onInitialize() {}
  @d.propAppHost m_propAppHost() {}
  @d.propDocument m_propDocument() {}
  @d.propWindow m_propWindow() {}
  @d.publishMessage m_publishMessage() {}
  @d.publishSwcAppMessage m_publishSwcAppMessage() {}
  @d.replaceChildrenLight m_replaceChildrenLight() {}
  @d.requestAnimationFrame m_requestAnimationFrame() {}
  @d.resizeObserver m_resizeObserver() {}
  @d.resizeObserverAll m_resizeObserverAll() {}
  @d.resizeObserverDelegate m_resizeObserverDelegate() {}
  @d.resizeObserverDelegateAll m_resizeObserverDelegateAll() {}
  @d.resizeObserverDelegateLight m_resizeObserverDelegateLight() {}
  @d.resizeObserverDelegateShadow m_resizeObserverDelegateShadow() {}
  @d.resizeObserverLight m_resizeObserverLight() {}
  @d.resizeObserverShadow m_resizeObserverShadow() {}
  @d.styleAppHost m_styleAppHost() {}
  @d.subscribeSwcAppRouteChange m_subscribeSwcAppRouteChange() {}
  @d.swcAppRoute m_swcAppRoute() {}
  @d.swcAppRouteGo m_swcAppRouteGo() {}
  @d.swcAppRoutePush m_swcAppRoutePush() {}
  @d.swcAppRoutePushAddSearchParam m_swcAppRoutePushAddSearchParam() {}
  @d.swcAppRoutePushDeleteHashSearchParam m_swcAppRoutePushDeleteHashSearchParam() {}
  @d.swcAppRoutePushDeleteSearchParam m_swcAppRoutePushDeleteSearchParam() {}
  @d.swcAppRoutePushUpsertSearchParam m_swcAppRoutePushUpsertSearchParam() {}
  @d.swcAppRouteReplace m_swcAppRouteReplace() {}
  @d.swcAppRouteReplaceAddSearchParam m_swcAppRouteReplaceAddSearchParam() {}
  @d.swcAppRouteReplaceDeleteHashSearchParam m_swcAppRouteReplaceDeleteHashSearchParam() {}
  @d.swcAppRouteReplaceDeleteSearchParam m_swcAppRouteReplaceDeleteSearchParam() {}
  @d.swcAppRouteReplaceUpsertSearchParam m_swcAppRouteReplaceUpsertSearchParam() {}
}

export class BareFields extends HTMLElement {
  @d.query a?: HTMLElement;
  @d.queryAll b?: HTMLElement[];
}

export const emptyParens = () => {
  // @ts-expect-error
  d.eventAnimationcancel();
  // @ts-expect-error
  d.eventAnimationend();
  // @ts-expect-error
  d.eventAnimationiteration();
  // @ts-expect-error
  d.eventAnimationstart();
  // @ts-expect-error
  d.eventBlur();
  // @ts-expect-error
  d.eventChange();
  // @ts-expect-error
  d.eventClick();
  // @ts-expect-error
  d.eventContextmenu();
  // @ts-expect-error
  d.eventCopy();
  // @ts-expect-error
  d.eventCut();
  // @ts-expect-error
  d.eventDblclick();
  // @ts-expect-error
  d.eventDrag();
  // @ts-expect-error
  d.eventDragend();
  // @ts-expect-error
  d.eventDragenter();
  // @ts-expect-error
  d.eventDragleave();
  // @ts-expect-error
  d.eventDragover();
  // @ts-expect-error
  d.eventDragstart();
  // @ts-expect-error
  d.eventDrop();
  // @ts-expect-error
  d.eventError();
  // @ts-expect-error
  d.eventFocus();
  // @ts-expect-error
  d.eventFocusin();
  // @ts-expect-error
  d.eventFocusout();
  // @ts-expect-error
  d.eventInput();
  // @ts-expect-error
  d.eventInvalid();
  // @ts-expect-error
  d.eventKeydown();
  // @ts-expect-error
  d.eventKeypress();
  // @ts-expect-error
  d.eventKeyup();
  // @ts-expect-error
  d.eventLoad();
  // @ts-expect-error
  d.eventMousedown();
  // @ts-expect-error
  d.eventMouseenter();
  // @ts-expect-error
  d.eventMouseleave();
  // @ts-expect-error
  d.eventMousemove();
  // @ts-expect-error
  d.eventMouseout();
  // @ts-expect-error
  d.eventMouseover();
  // @ts-expect-error
  d.eventMouseup();
  // @ts-expect-error
  d.eventPaste();
  // @ts-expect-error
  d.eventPointercancel();
  // @ts-expect-error
  d.eventPointerdown();
  // @ts-expect-error
  d.eventPointerenter();
  // @ts-expect-error
  d.eventPointerleave();
  // @ts-expect-error
  d.eventPointermove();
  // @ts-expect-error
  d.eventPointerout();
  // @ts-expect-error
  d.eventPointerover();
  // @ts-expect-error
  d.eventPointerup();
  // @ts-expect-error
  d.eventReset();
  // @ts-expect-error
  d.eventResize();
  // @ts-expect-error
  d.eventScroll();
  // @ts-expect-error
  d.eventSelect();
  // @ts-expect-error
  d.eventSubmit();
  // @ts-expect-error
  d.eventToggle();
  // @ts-expect-error
  d.eventTouchcancel();
  // @ts-expect-error
  d.eventTouchend();
  // @ts-expect-error
  d.eventTouchmove();
  // @ts-expect-error
  d.eventTouchstart();
  // @ts-expect-error
  d.eventTransitioncancel();
  // @ts-expect-error
  d.eventTransitionend();
  // @ts-expect-error
  d.eventTransitionrun();
  // @ts-expect-error
  d.eventTransitionstart();
  // @ts-expect-error
  d.eventWheel();
  // @ts-expect-error
  d.applyAppHost();
  // @ts-expect-error
  d.attrAppHost();
  // @ts-expect-error
  d.changedAttribute();
  // @ts-expect-error
  d.changedRoute();
  // @ts-expect-error
  d.clearChildrenLight();
  // @ts-expect-error
  d.clearChildrenNode();
  // @ts-expect-error
  d.clearNode();
  // @ts-expect-error
  d.removeNode();
  // @ts-expect-error
  d.clsAppHost();
  // @ts-expect-error
  d.eventAnimationcancelAppHost();
  // @ts-expect-error
  d.eventAnimationcancelDocument();
  // @ts-expect-error
  d.eventAnimationcancelWindow();
  // @ts-expect-error
  d.eventAnimationendAppHost();
  // @ts-expect-error
  d.eventAnimationendDocument();
  // @ts-expect-error
  d.eventAnimationendWindow();
  // @ts-expect-error
  d.eventAnimationiterationAppHost();
  // @ts-expect-error
  d.eventAnimationiterationDocument();
  // @ts-expect-error
  d.eventAnimationiterationWindow();
  // @ts-expect-error
  d.eventAnimationstartAppHost();
  // @ts-expect-error
  d.eventAnimationstartDocument();
  // @ts-expect-error
  d.eventAnimationstartWindow();
  // @ts-expect-error
  d.eventBlurAppHost();
  // @ts-expect-error
  d.eventBlurDocument();
  // @ts-expect-error
  d.eventBlurWindow();
  // @ts-expect-error
  d.eventChangeAppHost();
  // @ts-expect-error
  d.eventChangeDocument();
  // @ts-expect-error
  d.eventChangeWindow();
  // @ts-expect-error
  d.eventClickAppHost();
  // @ts-expect-error
  d.eventClickDocument();
  // @ts-expect-error
  d.eventClickWindow();
  // @ts-expect-error
  d.eventContextmenuAppHost();
  // @ts-expect-error
  d.eventContextmenuDocument();
  // @ts-expect-error
  d.eventContextmenuWindow();
  // @ts-expect-error
  d.eventCopyAppHost();
  // @ts-expect-error
  d.eventCopyDocument();
  // @ts-expect-error
  d.eventCopyWindow();
  // @ts-expect-error
  d.eventCutAppHost();
  // @ts-expect-error
  d.eventCutDocument();
  // @ts-expect-error
  d.eventCutWindow();
  // @ts-expect-error
  d.eventDblclickAppHost();
  // @ts-expect-error
  d.eventDblclickDocument();
  // @ts-expect-error
  d.eventDblclickWindow();
  // @ts-expect-error
  d.eventDragAppHost();
  // @ts-expect-error
  d.eventDragDocument();
  // @ts-expect-error
  d.eventDragendAppHost();
  // @ts-expect-error
  d.eventDragendDocument();
  // @ts-expect-error
  d.eventDragendWindow();
  // @ts-expect-error
  d.eventDragenterAppHost();
  // @ts-expect-error
  d.eventDragenterDocument();
  // @ts-expect-error
  d.eventDragenterWindow();
  // @ts-expect-error
  d.eventDragleaveAppHost();
  // @ts-expect-error
  d.eventDragleaveDocument();
  // @ts-expect-error
  d.eventDragleaveWindow();
  // @ts-expect-error
  d.eventDragoverAppHost();
  // @ts-expect-error
  d.eventDragoverDocument();
  // @ts-expect-error
  d.eventDragoverWindow();
  // @ts-expect-error
  d.eventDragstartAppHost();
  // @ts-expect-error
  d.eventDragstartDocument();
  // @ts-expect-error
  d.eventDragstartWindow();
  // @ts-expect-error
  d.eventDragWindow();
  // @ts-expect-error
  d.eventDropAppHost();
  // @ts-expect-error
  d.eventDropDocument();
  // @ts-expect-error
  d.eventDropWindow();
  // @ts-expect-error
  d.eventErrorAppHost();
  // @ts-expect-error
  d.eventErrorDocument();
  // @ts-expect-error
  d.eventErrorWindow();
  // @ts-expect-error
  d.eventFocusAppHost();
  // @ts-expect-error
  d.eventFocusDocument();
  // @ts-expect-error
  d.eventFocusinAppHost();
  // @ts-expect-error
  d.eventFocusinDocument();
  // @ts-expect-error
  d.eventFocusinWindow();
  // @ts-expect-error
  d.eventFocusoutAppHost();
  // @ts-expect-error
  d.eventFocusoutDocument();
  // @ts-expect-error
  d.eventFocusoutWindow();
  // @ts-expect-error
  d.eventFocusWindow();
  // @ts-expect-error
  d.eventInputAppHost();
  // @ts-expect-error
  d.eventInputDocument();
  // @ts-expect-error
  d.eventInputWindow();
  // @ts-expect-error
  d.eventInvalidAppHost();
  // @ts-expect-error
  d.eventInvalidDocument();
  // @ts-expect-error
  d.eventInvalidWindow();
  // @ts-expect-error
  d.eventKeydownAppHost();
  // @ts-expect-error
  d.eventKeydownDocument();
  // @ts-expect-error
  d.eventKeydownWindow();
  // @ts-expect-error
  d.eventKeypressAppHost();
  // @ts-expect-error
  d.eventKeypressDocument();
  // @ts-expect-error
  d.eventKeypressWindow();
  // @ts-expect-error
  d.eventKeyupAppHost();
  // @ts-expect-error
  d.eventKeyupDocument();
  // @ts-expect-error
  d.eventKeyupWindow();
  // @ts-expect-error
  d.eventLoadAppHost();
  // @ts-expect-error
  d.eventLoadDocument();
  // @ts-expect-error
  d.eventLoadWindow();
  // @ts-expect-error
  d.eventMousedownAppHost();
  // @ts-expect-error
  d.eventMousedownDocument();
  // @ts-expect-error
  d.eventMousedownWindow();
  // @ts-expect-error
  d.eventMouseenterAppHost();
  // @ts-expect-error
  d.eventMouseenterDocument();
  // @ts-expect-error
  d.eventMouseenterWindow();
  // @ts-expect-error
  d.eventMouseleaveAppHost();
  // @ts-expect-error
  d.eventMouseleaveDocument();
  // @ts-expect-error
  d.eventMouseleaveWindow();
  // @ts-expect-error
  d.eventMousemoveAppHost();
  // @ts-expect-error
  d.eventMousemoveDocument();
  // @ts-expect-error
  d.eventMousemoveWindow();
  // @ts-expect-error
  d.eventMouseoutAppHost();
  // @ts-expect-error
  d.eventMouseoutDocument();
  // @ts-expect-error
  d.eventMouseoutWindow();
  // @ts-expect-error
  d.eventMouseoverAppHost();
  // @ts-expect-error
  d.eventMouseoverDocument();
  // @ts-expect-error
  d.eventMouseoverWindow();
  // @ts-expect-error
  d.eventMouseupAppHost();
  // @ts-expect-error
  d.eventMouseupDocument();
  // @ts-expect-error
  d.eventMouseupWindow();
  // @ts-expect-error
  d.eventPasteAppHost();
  // @ts-expect-error
  d.eventPasteDocument();
  // @ts-expect-error
  d.eventPasteWindow();
  // @ts-expect-error
  d.eventPointercancelAppHost();
  // @ts-expect-error
  d.eventPointercancelDocument();
  // @ts-expect-error
  d.eventPointercancelWindow();
  // @ts-expect-error
  d.eventPointerdownAppHost();
  // @ts-expect-error
  d.eventPointerdownDocument();
  // @ts-expect-error
  d.eventPointerdownWindow();
  // @ts-expect-error
  d.eventPointerenterAppHost();
  // @ts-expect-error
  d.eventPointerenterDocument();
  // @ts-expect-error
  d.eventPointerenterWindow();
  // @ts-expect-error
  d.eventPointerleaveAppHost();
  // @ts-expect-error
  d.eventPointerleaveDocument();
  // @ts-expect-error
  d.eventPointerleaveWindow();
  // @ts-expect-error
  d.eventPointermoveAppHost();
  // @ts-expect-error
  d.eventPointermoveDocument();
  // @ts-expect-error
  d.eventPointermoveWindow();
  // @ts-expect-error
  d.eventPointeroutAppHost();
  // @ts-expect-error
  d.eventPointeroutDocument();
  // @ts-expect-error
  d.eventPointeroutWindow();
  // @ts-expect-error
  d.eventPointeroverAppHost();
  // @ts-expect-error
  d.eventPointeroverDocument();
  // @ts-expect-error
  d.eventPointeroverWindow();
  // @ts-expect-error
  d.eventPointerupAppHost();
  // @ts-expect-error
  d.eventPointerupDocument();
  // @ts-expect-error
  d.eventPointerupWindow();
  // @ts-expect-error
  d.eventResetAppHost();
  // @ts-expect-error
  d.eventResetDocument();
  // @ts-expect-error
  d.eventResetWindow();
  // @ts-expect-error
  d.eventResizeAppHost();
  // @ts-expect-error
  d.eventResizeDocument();
  // @ts-expect-error
  d.eventResizeWindow();
  // @ts-expect-error
  d.eventScrollAppHost();
  // @ts-expect-error
  d.eventScrollDocument();
  // @ts-expect-error
  d.eventScrollWindow();
  // @ts-expect-error
  d.eventSelectAppHost();
  // @ts-expect-error
  d.eventSelectDocument();
  // @ts-expect-error
  d.eventSelectWindow();
  // @ts-expect-error
  d.eventSubmitAppHost();
  // @ts-expect-error
  d.eventSubmitDocument();
  // @ts-expect-error
  d.eventSubmitWindow();
  // @ts-expect-error
  d.eventToggleAppHost();
  // @ts-expect-error
  d.eventToggleDocument();
  // @ts-expect-error
  d.eventToggleWindow();
  // @ts-expect-error
  d.eventTouchcancelAppHost();
  // @ts-expect-error
  d.eventTouchcancelDocument();
  // @ts-expect-error
  d.eventTouchcancelWindow();
  // @ts-expect-error
  d.eventTouchendAppHost();
  // @ts-expect-error
  d.eventTouchendDocument();
  // @ts-expect-error
  d.eventTouchendWindow();
  // @ts-expect-error
  d.eventTouchmoveAppHost();
  // @ts-expect-error
  d.eventTouchmoveDocument();
  // @ts-expect-error
  d.eventTouchmoveWindow();
  // @ts-expect-error
  d.eventTouchstartAppHost();
  // @ts-expect-error
  d.eventTouchstartDocument();
  // @ts-expect-error
  d.eventTouchstartWindow();
  // @ts-expect-error
  d.eventTransitioncancelAppHost();
  // @ts-expect-error
  d.eventTransitioncancelDocument();
  // @ts-expect-error
  d.eventTransitioncancelWindow();
  // @ts-expect-error
  d.eventTransitionendAppHost();
  // @ts-expect-error
  d.eventTransitionendDocument();
  // @ts-expect-error
  d.eventTransitionendWindow();
  // @ts-expect-error
  d.eventTransitionrunAppHost();
  // @ts-expect-error
  d.eventTransitionrunDocument();
  // @ts-expect-error
  d.eventTransitionrunWindow();
  // @ts-expect-error
  d.eventTransitionstartAppHost();
  // @ts-expect-error
  d.eventTransitionstartDocument();
  // @ts-expect-error
  d.eventTransitionstartWindow();
  // @ts-expect-error
  d.eventWheelAppHost();
  // @ts-expect-error
  d.eventWheelDocument();
  // @ts-expect-error
  d.eventWheelWindow();
  // @ts-expect-error
  d.innerHtml();
  // @ts-expect-error
  d.innerHtmlLight();
  // @ts-expect-error
  d.innerHtmlShadow();
  // @ts-expect-error
  d.innerText();
  // @ts-expect-error
  d.innerTextLight();
  // @ts-expect-error
  d.innerTextShadow();
  // @ts-expect-error
  d.insertAfterBegin();
  // @ts-expect-error
  d.insertAfterBeginLight();
  // @ts-expect-error
  d.insertBeforeEnd();
  // @ts-expect-error
  d.insertBeforeEndLight();
  // @ts-expect-error
  d.insertBeforeEndShadow();
  // @ts-expect-error
  d.intersectionObserver();
  // @ts-expect-error
  d.intersectionObserverAll();
  // @ts-expect-error
  d.intersectionObserverDelegate();
  // @ts-expect-error
  d.intersectionObserverDelegateAll();
  // @ts-expect-error
  d.intersectionObserverDelegateLight();
  // @ts-expect-error
  d.intersectionObserverDelegateShadow();
  // @ts-expect-error
  d.intersectionObserverLight();
  // @ts-expect-error
  d.intersectionObserverShadow();
  // @ts-expect-error
  d.mutationObserver();
  // @ts-expect-error
  d.mutationObserverAll();
  // @ts-expect-error
  d.mutationObserverDelegate();
  // @ts-expect-error
  d.mutationObserverDelegateAll();
  // @ts-expect-error
  d.mutationObserverDelegateLight();
  // @ts-expect-error
  d.mutationObserverDelegateShadow();
  // @ts-expect-error
  d.mutationObserverLight();
  // @ts-expect-error
  d.mutationObserverShadow();
  // @ts-expect-error
  d.onAdopted();
  // @ts-expect-error
  d.onAdoptedAfter();
  // @ts-expect-error
  d.onAdoptedBefore();
  // @ts-expect-error
  d.onConnectedCompleted();
  // @ts-expect-error
  d.onConnectedSwcApp();
  // @ts-expect-error
  d.onDisconnected();
  // @ts-expect-error
  d.onDisconnectedAfter();
  // @ts-expect-error
  d.onDisconnectedBefore();
  // @ts-expect-error
  d.onInitialize();
  // @ts-expect-error
  d.propAppHost();
  // @ts-expect-error
  d.propDocument();
  // @ts-expect-error
  d.propWindow();
  // @ts-expect-error
  d.publishMessage();
  // @ts-expect-error
  d.publishSwcAppMessage();
  // @ts-expect-error
  d.query();
  // @ts-expect-error
  d.queryAll();
  // @ts-expect-error
  d.replaceChildrenLight();
  // @ts-expect-error
  d.requestAnimationFrame();
  // @ts-expect-error
  d.resizeObserver();
  // @ts-expect-error
  d.resizeObserverAll();
  // @ts-expect-error
  d.resizeObserverDelegate();
  // @ts-expect-error
  d.resizeObserverDelegateAll();
  // @ts-expect-error
  d.resizeObserverDelegateLight();
  // @ts-expect-error
  d.resizeObserverDelegateShadow();
  // @ts-expect-error
  d.resizeObserverLight();
  // @ts-expect-error
  d.resizeObserverShadow();
  // @ts-expect-error
  d.styleAppHost();
  // @ts-expect-error
  d.subscribeSwcAppRouteChange();
  // @ts-expect-error
  d.swcAppRoute();
  // @ts-expect-error
  d.swcAppRouteGo();
  // @ts-expect-error
  d.swcAppRoutePush();
  // @ts-expect-error
  d.swcAppRoutePushAddSearchParam();
  // @ts-expect-error
  d.swcAppRoutePushDeleteHashSearchParam();
  // @ts-expect-error
  d.swcAppRoutePushDeleteSearchParam();
  // @ts-expect-error
  d.swcAppRoutePushUpsertSearchParam();
  // @ts-expect-error
  d.swcAppRouteReplace();
  // @ts-expect-error
  d.swcAppRouteReplaceAddSearchParam();
  // @ts-expect-error
  d.swcAppRouteReplaceDeleteHashSearchParam();
  // @ts-expect-error
  d.swcAppRouteReplaceDeleteSearchParam();
  // @ts-expect-error
  d.swcAppRouteReplaceUpsertSearchParam();
};
