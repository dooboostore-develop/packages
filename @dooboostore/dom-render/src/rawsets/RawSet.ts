import { RandomUtils } from '@dooboostore/core/random/RandomUtils';
import { StringUtils } from '@dooboostore/core/string/StringUtils';
import { EventManager, NormalAttrDataType } from '../events/EventManager';
import type { DomRenderConfig } from '../configs/DomRenderConfig';
import { Range } from '../iterators/Range';
import { ElementUtils } from '@dooboostore/core-web/element/ElementUtils';
import { ComponentSet } from '../components/ComponentSet';
import { DrPre } from '../operators/DrPre';
import { Dr } from '../operators/Dr';
import { DrIf } from '../operators/DrIf';
import { ExecuteState, OperatorExecuter } from '../operators/OperatorExecuter';
import { DrThis } from '../operators/DrThis';
import { DrForm } from '../operators/DrForm';
import { DrInnerText } from '../operators/DrInnerText';
import { DrInnerHTML } from '../operators/DrInnerHTML';
import { DrFor } from '../operators/DrFor';
import { DrForOf } from '../operators/DrForOf';
import { DrAppender } from '../operators/DrAppender';
import { DrRepeat } from '../operators/DrRepeat';
import { DrTargetElement } from '../operators/DrTargetElement';
import { DrTargetAttr } from '../operators/DrTargetAttr';
import { DrStripElement } from '../operators/DrStripElement';
import { TargetElement } from '../configs/TargetElement';
import { TargetAttr } from '../configs/TargetAttr';
import { DestroyOptionType } from './DestroyOptionType';
import { Attrs } from './Attrs';
import { AttrInitCallBack } from './AttrInitCallBack';
import { ElementInitCallBack } from './ElementInitCallBack';
import { RawSetType } from './RawSetType';
import { Render } from './Render';
import { DrThisProperty } from '../operators/DrThisProperty';
import { RawSetOperatorType } from './RawSetOperatorType';
import { CssParser, CssRule, isStyleRule, isAtRule } from '@dooboostore/core/parser/css/CssParser';
import { isOnCreateRenderData, OnCreateRenderDataParams } from '../lifecycle/OnCreateRenderData';
import { isOnCreateRender } from '../lifecycle/OnCreateRender';
import { isOnChangeAttrRender } from '../lifecycle/OnChangeAttrRender';
import { isOnInitRender } from '../lifecycle/OnInitRender';
import { isOnCreatedThisChild } from '../lifecycle/OnCreatedThisChild';
import { isOnDestroyRender, OnDestroyRenderParams } from '../lifecycle/OnDestroyRender';
import { DrTargetElementIsElement } from '../operators/DrTargetElementIsElement';
import { ObjectUtils } from '@dooboostore/core/object/ObjectUtils';
import { NodeUtils } from '@dooboostore/core-web/node/NodeUtils';
import { ConvertUtils } from '@dooboostore/core/convert/ConvertUtils';

export type RenderResult = { raws: RawSet[]; executedOperators: OperatorExecuter[] };

export class RawSet {
  public static readonly DR_NAME = 'dr';
  public static readonly DR_IF_NAME = 'dr-if';
  public static readonly DR_FOR_NAME = 'dr-for';
  public static readonly DR_FOR_OF_NAME = 'dr-for-of';
  public static readonly DR_THIS_PROPERTY_NAME = 'dr-this-property';
  public static readonly DR_REPEAT_NAME = 'dr-repeat';
  public static readonly DR_THIS_NAME = 'dr-this';
  public static readonly DR_FORM_NAME = 'dr-form';
  public static readonly DR_PRE_NAME = 'dr-pre';
  public static readonly DR_APPENDER_NAME = 'dr-appender';
  public static readonly DR_INNERHTML_NAME = 'dr-inner-html';
  public static readonly DR_INNERTEXT_NAME = 'dr-inner-text';
  public static readonly DR_DETECT_NAME = 'dr-detect';
  public static readonly DR_STRIP_NAME = 'dr-strip';
  public static readonly DR_REPLACE_TARGET_ELEMENT_IS_NAME = 'dr-replace-target-element-is';

  // elementName
  public static readonly DR_TARGET_ELEMENT_ELEMENTNAME = 'dr-target-element';
  // 감지처리되는 옵션
  public static readonly DR_DETECT_IF_OPTIONNAME = 'dr-detect-option-if';
  public static readonly DR_DETECT_FILTER_OPTIONNAME = 'dr-detect-option-filter';
  public static readonly DR_DETECT_ATTR_OPTIONNAME = 'dr-detect-option-attr';

  /**
   * @deprecated
   */
  public static readonly DR_THIS_OPTIONNAME = 'dr-option-this';
  public static readonly DR_ATTR_OPTIONNAME = 'dr-option-attr';
  public static readonly DR_IF_OPTIONNAME = 'dr-option-if';
  public static readonly DR_IT_OPTIONNAME = 'dr-option-it';
  public static readonly DR_VAR_OPTIONNAME = 'dr-option-var';
  public static readonly DR_AFTER_OPTIONNAME = 'dr-option-after';
  public static readonly DR_NEXT_OPTIONNAME = 'dr-option-next';
  public static readonly DR_BEFORE_OPTIONNAME = 'dr-option-before';
  public static readonly DR_COMPLETE_OPTIONNAME = 'dr-option-complete';
  public static readonly DR_STRIP_OPTIONNAME = 'dr-option-strip';
  public static readonly DR_DESTROY_OPTIONNAME = 'dr-option-destroy';

  public static readonly DR_THIS_NAME_OPTIONNAME = 'dr-option-this-name';

  public static readonly DR_VARIABLE_NAME_OPTIONNAME = 'dr-option-variable-name';
  public static readonly DR_ITEM_VARIABLE_NAME_OPTIONNAME = 'dr-option-item-variable-name';
  public static readonly DR_ITEM_INDEX_VARIABLE_NAME_OPTIONNAME = 'dr-option-item-index-variable-name';
  public static readonly DR_INNER_HTML_NAME_OPTIONNAME = 'dr-option-inner-html-name';
  public static readonly DR_INNER_TEXT_NAME_OPTIONNAME = 'dr-option-inner-text-name';
  public static readonly DR_INNER_HTML_ESCAPED_NAME_OPTIONNAME = 'dr-option-inner-html-escaped-name';

  public static readonly DR_KEY_OPTIONNAME = 'dr-option-key';
  public static readonly DR_HAS_KEYS_OPTIONNAME = 'dr-option-has-keys';

  public static readonly DR_ON_CREATE_ARGUMENTS_OPTIONNAME = 'dr-on-create:arguments';
  public static readonly DR_ON_CREATED_CALLBACK_OPTIONNAME = 'dr-on-create:callback';
  /**  우선 쓰는곳이 없어서 deprecated를 걸어놨음
  @deprecated
  */
  public static readonly DR_ON_INIT_ARGUMENTS_OPTIONNAME = 'dr-on-init:arguments';
  public static readonly DR_ON_CONSTRUCTOR_ARGUMENTS_OPTIONNAME = 'dr-on-constructor:arguments';


  public static readonly drAttrsOriginName: Attrs = {
    dr: RawSet.DR_NAME,
    drIf: RawSet.DR_IF_NAME,
    drFor: RawSet.DR_FOR_NAME,
    drForOf: RawSet.DR_FOR_OF_NAME,
    drThisProperty: RawSet.DR_THIS_PROPERTY_NAME,
    drAppender: RawSet.DR_APPENDER_NAME,
    drRepeat: RawSet.DR_REPEAT_NAME,
    drThis: RawSet.DR_THIS_NAME,
    drForm: RawSet.DR_FORM_NAME,
    drPre: RawSet.DR_PRE_NAME,
    drInnerHTML: RawSet.DR_INNERHTML_NAME,
    drInnerText: RawSet.DR_INNERTEXT_NAME,
    drItOption: RawSet.DR_IT_OPTIONNAME,
    drVarOption: RawSet.DR_VAR_OPTIONNAME,
    drAfterOption: RawSet.DR_AFTER_OPTIONNAME,
    drNextOption: RawSet.DR_NEXT_OPTIONNAME,
    drBeforeOption: RawSet.DR_BEFORE_OPTIONNAME,
    drCompleteOption: RawSet.DR_COMPLETE_OPTIONNAME,
    drStripElement: RawSet.DR_STRIP_NAME,
    drReplaceTargetElementIs: RawSet.DR_REPLACE_TARGET_ELEMENT_IS_NAME,
    drStripOption: RawSet.DR_STRIP_OPTIONNAME,
    drIfOption: RawSet.DR_IF_OPTIONNAME,
    drDetectIfOption: RawSet.DR_DETECT_IF_OPTIONNAME,
    drDestroyOption: RawSet.DR_DESTROY_OPTIONNAME,
    drHasKeysOption: RawSet.DR_HAS_KEYS_OPTIONNAME,
    drKeyOption: RawSet.DR_KEY_OPTIONNAME
  };

  public static readonly DR_TAGS = [];

  // public static readonly DR_REPLACE_ACTION_ATTRIBUTES = [
  //   RawSet.DR_REPLACE_TARGET_ELEMENT_IS_NAME
  // ]

  public static readonly DR_ELEMENTS = [
    RawSet.DR_TARGET_ELEMENT_ELEMENTNAME
  ];

  public static readonly DR_ATTRIBUTES = [
    RawSet.DR_NAME,
    RawSet.DR_APPENDER_NAME,
    RawSet.DR_IF_NAME,
    RawSet.DR_FOR_OF_NAME,
    RawSet.DR_THIS_PROPERTY_NAME,
    RawSet.DR_FOR_NAME,
    RawSet.DR_THIS_NAME,
    RawSet.DR_FORM_NAME,
    RawSet.DR_PRE_NAME,
    RawSet.DR_INNERHTML_NAME,
    RawSet.DR_INNERTEXT_NAME,
    RawSet.DR_REPEAT_NAME,
    RawSet.DR_DETECT_NAME,
    RawSet.DR_STRIP_NAME
  ] as const;

  constructor(
    public uuid: string,
    public type: RawSetType,
    public point: {
      start: Comment | Text | HTMLMetaElement;
      node: Node;
      end: Comment | Text | HTMLMetaElement;
      innerHTML?: string;
      // thisVariableName?: string | null,
      parent?: Node | null;
      parentRawSet?: RawSet;
      childrenRawSets?: RawSet[];
    },
    public dataSet: {
      config: DomRenderConfig;
      fragment: DocumentFragment;
      render?: Render;
    },
    public detect?: { action: Function }
  ) {
    // point.start.rawSet = this;
    // console.log('rawset constructor->', (this.point.node as Element).getAttributeNames());
  }

  get isConnected() {
    // console.log('isConnect???', this, this.point.start.isConnected, this.point.end.isConnected);
    return (
      this.point && this.point.start && this.point.end && this.point.start.isConnected && this.point.end.isConnected
    );
  }

  // 중요
  getUsingTriggerVariables(config?: DomRenderConfig): Set<string> {
    const usingTriggerVariables = new Set<string>();
    // console.log('------data', this.dataSet)
    this.dataSet.fragment.childNodes.forEach((cNode, key) => {
      // console.log('-----aaaa-data', cNode, key)
      let script = '';
      if (cNode.nodeType === Node.TEXT_NODE) {
        script = `\`${(cNode as Text).textContent ?? ''}\``;
        const expressionGroups = RawSet.expressionGroups(script);
        // console.log('???????', script, expressionGroups)
        if (expressionGroups[0].length > 1) {
          script = expressionGroups[0][1] as string;
        }
        // console.log('--', expressionGroups, script)
      } else if (cNode.nodeType === Node.ELEMENT_NODE) {
        const element = cNode as Element;
        const targetAttrNames = (config?.targetAttrs?.map(it => it.name) ?? []).concat(
          RawSet.DR_ATTRIBUTES,
          RawSet.DR_DETECT_FILTER_OPTIONNAME,
          RawSet.DR_DETECT_IF_OPTIONNAME,
          RawSet.DR_DETECT_ATTR_OPTIONNAME
        ); // .concat(EventManager.normalAttrMapAttrName);
        const targetScripts = targetAttrNames
          .map(it => element.getAttribute(it))
          .filter(it => it)
          .map(it => `(${it})`);
        const targetAttrMap = element.getAttribute(EventManager.normalAttrMapAttrName);
        // console.log('targetAttrMap-->', targetAttrMap)
        if (targetAttrMap) {
          new Map<string, NormalAttrDataType>(JSON.parse(targetAttrMap)).forEach((v, k) => {
            const variablePaths = v.variablePaths;
            // let targetScript = v.originalAttrValue;
            // variablePaths.forEach(it => {
            //   let r = ObjectUtils.Path.toOptionalChainPath(it.inner);
            //   targetScript = targetScript.replaceAll(it.origin,`\${${r}}`);
            // })
            // targetScripts.push(`(${targetScript})`);
            // 변수 체크만 하는거니깐 이렇게
            variablePaths.forEach(it => targetScripts.push(`(${it.inner})`));
            // console.log('targetScripts', targetScripts);
          });
        }
        // console.log('targetScriptstargetScripts', targetScripts)
        script = targetScripts.join(';');
        // script = targetScripts.map(it=>`try{${it}}catch(e){}`).join(';');

        // attribute쪽 체크하는거 추가
        // console.log('----!!!!!-->', targetAttrNames)
        // const otherAttrs = element.getAttributeNames()
        //     .filter(it => !targetAttrNames.includes(it.toLowerCase()) && RawSet.isExporesion(element.getAttribute(it)))
        //     .map(it => {
        //         return `\`${element.getAttribute(it) ?? ''}\``;
        //     }).join(';');
        // script += ';' + otherAttrs
      }
      if (script) {
        // console.log('------1-',script)
        script = script.replace(/#[^#]*#/g, '({})');
        // console.log('------2-',script)
        // script = script.replace('}$','}');
        // script = script.replace('@this@','this');
        // console.log('----------->', script)

        // TODO: 훔.. 꼭필요한가..?  트리거될때 스크립트변수 까지 감지해야될까?
        EventManager.VARNAMES.forEach(it => {
          // script = script.replace(RegExp(it.replace('$', '\\$'), 'g'), `this?.___${it}`);
          // script = script.replace(RegExp(it.replace('$', '\\$'), 'g'), `this.___${it}`);
          script = script.replace(RegExp(it.replace('$', '\\$'), 'g'), `this.___${it}`);
          // console.log('scripts-->', script)
        });
        // console.log('--------1--', script);
        // script = script.replaceAll('#{','${').replaceAll('}#', '}')
        // console.log('--------2--', script);
        // TODO: 훔.. 꼭필요한가..?  트리거될때 스크립트변수 까지 감지해야될까?
        Array.from(ObjectUtils.Path.detectPathFromScript(script, { excludeThis: true }))
          .filter(it => !it.startsWith(`___${EventManager.SCRIPTS_VARNAME}`))
          .forEach(it => usingTriggerVariables.add(it));
      }
    });
    // console.log('usingTriggerVariable----------->', usingTriggerVariables)
    return usingTriggerVariables;
  }

  // 중요 render 처리 부분
  // public async render(obj: any, config: DomRenderConfig): Promise<RawSet[]> {
  // }
  public async render(obj: any, config: DomRenderConfig): Promise<RenderResult> {
    // console.log('render!!!!!!!!!!!!!!')
    // const t0 = performance.now();
    // console.group('RawSet render', this);
    const genNode = config.window.document.importNode(this.dataSet.fragment, true);
    const raws: RawSet[] = [];
    const onAttrInitCallBacks: AttrInitCallBack[] = [];
    const onElementInitCallBacks: ElementInitCallBack[] = [];
    const onThisComponentSetCallBacks: ComponentSet[] = [];
    const drAttrs: Attrs[] = [];
    // console.log('rawSet render!!', obj, config, this, Array.from(genNode.childNodes.values()));
    const executedOperators: OperatorExecuter[] = [];
    for (const cNode of Array.from(genNode.childNodes.values())) {
      // console.log('cNodecNodecNode', cNode);
      let attribute = {};
      if (cNode.nodeType === Node.ELEMENT_NODE) {
        attribute = ElementUtils.getAttributeToObject(cNode as Element);
      }

      const __render = Object.freeze({
        rawSet: this,
        scripts: EventManager.setBindProperty(config?.scripts, obj),
        router: config?.router,
        range: Range.range,
        element: cNode,
        attribute: attribute,
        rootObject: obj,
        scriptUtils: ObjectUtils.Script,
        nearThis: this.findNearThis(obj),
        parentThis: this.findParentThis(obj),
        bindScript: ` /** render **/
                    const ${EventManager.SCRIPTS_VARNAME} = this.__render.scripts;
                    const ${EventManager.RAWSET_VARNAME} = this.__render.rawSet;
                    const ${EventManager.ELEMENT_VARNAME} = this.__render.element;
                    const ${EventManager.ATTRIBUTE_VARNAME} = this.__render.attribute;
                    const ${EventManager.RANGE_VARNAME} = this.__render.range;
                    const ${EventManager.ROUTER_VARNAME} = this.__render.router;
                    const ${EventManager.NEAR_THIS_VARNAME} = this.__render.nearThis;
                    const ${EventManager.PARENT_THIS_VARNAME} = this.__render.parentThis;
                    const ${EventManager.SCRIPT_UTILS_VARNAME} = this.__render.scriptUtils;
                    const ${EventManager.ROOT_OBJECT_VARNAME} = this.__render.rootObject;
            `
      }) as unknown as Render;

      // const normalAttribute = attribute[EventManager.normalAttrMapAttrName];
      // if (normalAttribute) {
      //   new Map<string, string>(JSON.parse(normalAttribute)).forEach((v, k) => {
      //     const cval = ScriptUtils.evalReturn({ bodyScript: __render.bindScript, returnScript: v }, Object.assign(obj, { __render: __render }));
      //     console.log('-----------',v,k, cval);
      //     attribute[v] = cval;
      //   });
      // }

      const fag = config.window.document.createDocumentFragment();
      if (cNode.nodeType === Node.TEXT_NODE && cNode.textContent) {
        // console.log('text-->', this, obj, config, cNode.textContent);
        // console.log('text-->', Array.from(this.fragment.childNodes))
        const textContent = cNode.textContent;
        const runText = RawSet.expressionGroups(textContent)[0][1];
        // console.log('--->', RawSet.exporesionGrouops(textContent), textContent,runText, runText[0][1])
        let newNode: Node;
        if (textContent?.startsWith('#')) {
          const r = ObjectUtils.Script.evaluateReturn({bodyScript: __render.bindScript, returnScript: runText}, Object.assign(obj, { __render })
          );
          const template = config.window.document.createElement('template') as HTMLTemplateElement;
          template.innerHTML = r;
          newNode = template.content;
        } else {
          const r = ObjectUtils.Script.evaluateReturn({bodyScript:__render.bindScript , returnScript:runText},Object.assign(obj, { __render }));
          newNode = config.window.document.createTextNode(r);
        }
        cNode.parentNode?.replaceChild(newNode, cNode);
        // console.log('-------', this.point.start.parentNode.nodeName)
        // 중요 style value change 됐을때 다시 처리해야되기떄문에: 마지막에 completed 없는 attr 가지고 판단 하니깐
        if (this.type === RawSetType.STYLE_TEXT && this.point.parent) {
          (this.point.parent as Element).removeAttribute('completed');
        }
      } else if (cNode.nodeType === Node.ELEMENT_NODE) {
        const element = cNode as Element;
        // console.log('target-->', element)
        const drAttr: Attrs = {
          dr: this.getAttributeAndDelete(element, RawSet.DR_NAME),
          drIf: this.getAttributeAndDelete(element, RawSet.DR_IF_NAME),
          drFor: this.getAttributeAndDelete(element, RawSet.DR_FOR_NAME),
          drForOf: this.getAttributeAndDelete(element, RawSet.DR_FOR_OF_NAME),
          drThisProperty: this.getAttributeAndDelete(element, RawSet.DR_THIS_PROPERTY_NAME),
          drAppender: this.getAttributeAndDelete(element, RawSet.DR_APPENDER_NAME),
          drRepeat: this.getAttributeAndDelete(element, RawSet.DR_REPEAT_NAME),
          drThis: this.getAttributeAndDelete(element, RawSet.DR_THIS_NAME),
          drForm: this.getAttributeAndDelete(element, RawSet.DR_FORM_NAME),
          drPre: this.getAttributeAndDelete(element, RawSet.DR_PRE_NAME),
          drInnerHTML: this.getAttributeAndDelete(element, RawSet.DR_INNERHTML_NAME),
          drInnerText: this.getAttributeAndDelete(element, RawSet.DR_INNERTEXT_NAME),
          drStripElement: this.getAttributeAndDelete(element, RawSet.DR_STRIP_NAME),
          drReplaceTargetElementIs: this.getAttributeAndDelete(element, RawSet.DR_REPLACE_TARGET_ELEMENT_IS_NAME),
          drItOption: this.getAttributeAndDelete(element, RawSet.DR_IT_OPTIONNAME),
          drIfOption: this.getAttributeAndDelete(element, RawSet.DR_IF_OPTIONNAME),
          drVarOption: this.getAttributeAndDelete(element, RawSet.DR_VAR_OPTIONNAME),
          drNextOption: this.getAttributeAndDelete(element, RawSet.DR_NEXT_OPTIONNAME),
          drAfterOption: this.getAttributeAndDelete(element, RawSet.DR_AFTER_OPTIONNAME),
          drBeforeOption: this.getAttributeAndDelete(element, RawSet.DR_BEFORE_OPTIONNAME),
          drCompleteOption: this.getAttributeAndDelete(element, RawSet.DR_COMPLETE_OPTIONNAME),
          drStripOption: this.getAttributeAndDelete(element, RawSet.DR_STRIP_OPTIONNAME),
          drDestroyOption: this.getAttributeAndDelete(element, RawSet.DR_DESTROY_OPTIONNAME),
          drKeyOption: this.getAttributeAndDelete(element, RawSet.DR_KEY_OPTIONNAME),
          drDetectIfOption: this.getAttribute(element, RawSet.DR_DETECT_IF_OPTIONNAME),
          drHasKeysOption: this.getAttribute(element, RawSet.DR_HAS_KEYS_OPTIONNAME)
        };
        drAttrs.push(drAttr);
        // 아래 순서 중요
        const operators = [
          new DrPre( this, __render, { raws, fag }, { element, attrName: RawSet.DR_PRE_NAME, attr: drAttr.drPre, attrs: drAttr }, { config, obj, operatorAround: config.operatorAround?.drPre }, { onAttrInitCallBacks, onElementInitCallBacks, onThisComponentSetCallBacks } ),
          new Dr( this, __render, { raws, fag }, { element, attrName: RawSet.DR_NAME, attr: drAttr.dr, attrs: drAttr }, { config, obj, operatorAround: config.operatorAround?.dr }, { onAttrInitCallBacks, onElementInitCallBacks, onThisComponentSetCallBacks } ),
          // new Dr(this, __render, {raws, fag}, {element, attrName: EventManager.onRenderedInitAttrName, attr: drAttr.dr, attrs: drAttr}, {config, obj, operatorAround: config.operatorAround?.dr}, {onAttrInitCallBacks, onElementInitCallBacks, onThisComponentSetCallBacks}),
          new DrIf( this, __render, { raws, fag }, { element, attrName: RawSet.DR_IF_NAME, attr: drAttr.drIf, attrs: drAttr }, { config, obj, operatorAround: config.operatorAround?.drIf }, { onAttrInitCallBacks, onElementInitCallBacks, onThisComponentSetCallBacks } ),
          new DrStripElement( this, __render, { raws, fag }, { element, attrName: RawSet.DR_STRIP_NAME, attr: drAttr.drStripElement, attrs: drAttr }, { config, obj, operatorAround: config.operatorAround?.drThis }, { onAttrInitCallBacks, onElementInitCallBacks, onThisComponentSetCallBacks } ),
          new DrThis( this, __render, { raws, fag }, { element, attrName: RawSet.DR_THIS_NAME, attr: drAttr.drThis, attrs: drAttr }, { config, obj, operatorAround: config.operatorAround?.drThis }, { onAttrInitCallBacks, onElementInitCallBacks, onThisComponentSetCallBacks } ),
          new DrForm( this, __render, { raws, fag }, { element, attrName: RawSet.DR_FOR_NAME, attr: drAttr.drForm, attrs: drAttr }, { config, obj, operatorAround: config.operatorAround?.drForm }, { onAttrInitCallBacks, onElementInitCallBacks, onThisComponentSetCallBacks } ),
          new DrInnerText( this, __render, { raws, fag }, { element, attrName: RawSet.DR_INNERTEXT_NAME, attr: drAttr.drInnerText, attrs: drAttr }, { config, obj, operatorAround: config.operatorAround?.drInnerText }, { onAttrInitCallBacks, onElementInitCallBacks, onThisComponentSetCallBacks } ),
          new DrInnerHTML( this, __render, { raws, fag }, { element, attrName: RawSet.DR_INNERHTML_NAME, attr: drAttr.drInnerHTML, attrs: drAttr }, { config, obj, operatorAround: config.operatorAround?.drInnerHTML }, { onAttrInitCallBacks, onElementInitCallBacks, onThisComponentSetCallBacks } ),
          new DrFor( this, __render, { raws, fag }, { element, attrName: RawSet.DR_FOR_NAME, attr: drAttr.drFor, attrs: drAttr }, { config, obj, operatorAround: config.operatorAround?.drFor }, { onAttrInitCallBacks, onElementInitCallBacks, onThisComponentSetCallBacks } ),
          new DrForOf( this, __render, { raws, fag }, { element, attrName: RawSet.DR_FOR_OF_NAME, attr: drAttr.drForOf, attrs: drAttr }, { config, obj, operatorAround: config.operatorAround?.drForOf }, { onAttrInitCallBacks, onElementInitCallBacks, onThisComponentSetCallBacks } ),
          new DrThisProperty( this, __render, { raws, fag }, { element, attrName: RawSet.DR_THIS_PROPERTY_NAME, attr: drAttr.drThisProperty, attrs: drAttr }, { config, obj, operatorAround: config.operatorAround?.drThisProperty }, { onAttrInitCallBacks, onElementInitCallBacks, onThisComponentSetCallBacks } ),
          new DrAppender( this, __render, { raws, fag }, { element, attrName: RawSet.DR_APPENDER_NAME, attr: drAttr.drAppender, attrs: drAttr }, { config, obj, operatorAround: config.operatorAround?.drAppender }, { onAttrInitCallBacks, onElementInitCallBacks, onThisComponentSetCallBacks } ),
          new DrRepeat( this, __render, { raws, fag }, { element, attrName: RawSet.DR_REPEAT_NAME, attr: drAttr.drRepeat, attrs: drAttr }, { config, obj, operatorAround: config.operatorAround?.drRepeat }, { onAttrInitCallBacks, onElementInitCallBacks, onThisComponentSetCallBacks } ),
          new DrTargetElementIsElement( this, __render, { raws, fag }, { element, attrName: RawSet.DR_REPLACE_TARGET_ELEMENT_IS_NAME, attr: drAttr.drReplaceTargetElementIs, attrs: drAttr }, { config, obj }, { onAttrInitCallBacks, onElementInitCallBacks, onThisComponentSetCallBacks } ),
          new DrTargetElement( this, __render, { raws, fag }, { element, attrs: drAttr }, { config, obj }, { onAttrInitCallBacks, onElementInitCallBacks, onThisComponentSetCallBacks } ),
          new DrTargetAttr( this, __render, { raws, fag }, { element, attrs: drAttr }, { config, obj }, { onAttrInitCallBacks, onElementInitCallBacks, onThisComponentSetCallBacks } )
        ];

        for (const operator of operators) {
          const state = await operator.start();
          if (state === ExecuteState.EXECUTE) {
            executedOperators.push(operator);
            break;
          } else if (state === ExecuteState.STOP) {
            return { raws, executedOperators };
          }
        }
      }
    }

    this.point.childrenRawSets = raws;
    raws.forEach(it => {
      it.point.parentRawSet = this;
    });


    // console.log('pppppppppppppp', this);

    // replaceBody와 applyEvent 순서를 바꿨다 20250511
    const childrenNodes = Array.from(genNode.childNodes);
    // console.log(`RawSet aa took ${performance.now() - t0} milliseconds.`, childrenNodes);
    this.applyEvent(obj, genNode, config);
    // console.log(`RawSet xxxxxxxxxx took ${performance.now() - t0} milliseconds.`);
    this.replaceBody(genNode); // 중요 여기서 마지막에 연션된 값을 그려준다.
    // console.log('rawSEt!!!!!!!', obj, this.near)
    // console.log('rawSEt!!!!!!!', obj, this.findNearThis(obj),childrenNodes,config)
    // console.log('rawSEt!!!!!!!', obj, drAttrs)
    this.onRenderedEvent(obj, childrenNodes, config);
    drAttrs.forEach(it => {
      if (it.drCompleteOption) {
        // genNode.childNodes
        const render = Object.freeze({
          rawSet: this,
          fag: genNode,
          scripts: EventManager.setBindProperty(config?.scripts, obj)
        } as Render);
        ObjectUtils.Script.evaluate(
          `
                const ${EventManager.FAG_VARNAME} = this.__render.fag;
                const ${EventManager.SCRIPTS_VARNAME} = this.__render.scripts;
                const ${EventManager.RAWSET_VARNAME} = this.__render.rawSet;
                ${it.drCompleteOption}`,
          Object.assign(obj, { __render: render })
        );
      }
    });

    // 중요 style isolation 나중에 :scope로 대체 가능할듯.
    // 2023.9.4일 없앰  style 처음들어올때 처리하는걸로 바꿈
    // RawSet.generateStyleSheetsLocal(config);
    for (const it of onThisComponentSetCallBacks) {
      if (isOnInitRender(it.obj)) {
        await it.obj?.onInitRender?.({}, this);
      }
    }
    for (const it of onElementInitCallBacks) {
      if (isOnInitRender(this.dataSet.render?.currentThis)) {
        // TODO: 나중에 파라미터 들어가야될듯. 지금은 리팩토링하느라 빠짐
        // console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', it, this.dataSet);
        // dr-on-init:arguments

        // if (isOnInitRender()) {
        //   it.targetElement.__render.component.onInitRender?.(...param);
        // }
        // if (it.targetElement?.__render?.element && it.targetElement?.__render?.component) {
        //   const oninit = it.targetElement.__render.element.getAttribute(RawSet.DR_ON_INIT_ARGUMENTS_OPTIONNAME); // dr-on-component-init
        //   let param = [];
        //   if (oninit) {
        //     const script = `${it.targetElement.__render.renderScript} return ${oninit} `;
        //     param = ScriptUtils.eval(script, Object.assign(obj, {
        //       __render: it.targetElement.__render
        //     }));
        //     if (!Array.isArray(param)) {
        //       param = [param];
        //     }
        //   }
        //
        //   if (isOnInitRender(it.targetElement.__render.component)) {
        //     it.targetElement.__render.component.onInitRender?.(...param);
        //   }
        // }
        await this.dataSet.render.currentThis.onInitRender({}, this);
      }

      config?.onElementInit?.(it.name, obj, this, it.targetElement);
    }

    // TODO: 이부분도 위에 targetElement 처럼 해야될까?
    for (const it of onAttrInitCallBacks) {
      config?.onAttrInit?.(it.attrName, it.attrValue, obj, this);
    }

    // component destroy
    if (obj.__domrender_components) {
      Object.entries(obj.__domrender_components).forEach(([key, value]) => {
        const rawSet = (value as any).__rawSet as RawSet;
        const drAttrs: Attrs | undefined = rawSet?.dataSet.render?.attribute;
        if (rawSet && !rawSet.isConnected) {
          const destroyOptions = drAttrs?.drDestroyOption?.split(',') ?? [];
          RawSet.destroy(obj.__domrender_components[key], { rawSet: rawSet }, config, destroyOptions);
          delete obj.__domrender_components[key];
        }
      });
    }
    // console.log('-------raws',raws)
    // console.log(`RawSet render took ${performance.now() - t0} milliseconds.`);
    // console.groupEnd();
    return { raws: raws, executedOperators: executedOperators };
  }

  // 중요 스타일 적용 부분
  private static generateRuleSelector(start: string, end: string, sit: string) {
    const selectorText = `:is(${start} ~ *:not(${start} ~ ${end} ~ *))`;
    if (sit.startsWith('## ')) {
      return sit.replace(/^## /, '');
    } else if (sit.startsWith('.')) {
      return `${selectorText}${sit}, ${selectorText} ${sit}`;
    } else if (sit.includes('::')) {
      const reg = sit.match(/(.*)::(.*)$/);
      const first = reg?.[1];
      const extracted = reg?.[2];
      const divText = `${start} ~ ${first}:not(${start} ~ ${end} ~ *)`;
      return `${selectorText} ${first}, ${divText}::${extracted}`;
    } else {
      const divText = `${start} ~ ${sit}:not(${start} ~ ${end} ~ *)`;
      return `${selectorText} ${sit}, ${divText}`;
    }
  }

  public static generateStyleTransform(styleBody: string | string[], componentKey: string, styleTagWrap = true) {
    // console.log('style!!!!!!!!!!!!!!!!1', styleBody, componentKey, styleTagWrap);
    if (Array.isArray(styleBody)) {
      styleBody = styleBody.join('\n');
    }
    styleBody = styleBody.replaceAll('#uuid#', componentKey);
    const start = `#${componentKey}-start`;
    const end = `#${componentKey}-end`;
    // 이거뭐하는지 까먹었네 뭐였지??..
    // 동적으로 처리하는것같은데.. css 에서는 동적으로 처리하는걸 지향 해야될것같은데 이기능 deprecated 할지 고민중
    // const before = StringUtils.regexExecArrayReplace(styleBody, /(\$\{.*?\}\$)/g, (data) => {
    //   // console.log('동적?', `var(--domrender-${data[0]})`)
    //   return `var(--domrender-${data[0]})`;
    // });
    // const before = styleBody;
    // console.log('before@@@@@@@@@@@', before)
    const cssParser = new CssParser(styleBody);

    const processRule = (rule: CssRule) => {
      if (isStyleRule(rule)) {
        const isRoot = rule.selector.includes(':root');
        if (!isRoot) {
          // Handle comma-separated selectors
          const selectors = rule.selector.split(',').map(s => s.trim());
          const transformedSelectors = selectors.map(selector => this.generateRuleSelector(start, end, selector));
          rule.selector = transformedSelectors.join(', ');
        }
      } else if (isAtRule(rule)) {
        if (rule.name === 'media') {
          const hasRoot = rule.children.some(
            childRule => isStyleRule(childRule) && childRule.selector.includes(':root')
          );
          if (!hasRoot) {
            rule.children.forEach(childRule => {
              if (isStyleRule(childRule)) {
                const selectors = childRule.selector.split(',').map(s => s.trim());
                const transformedSelectors = selectors.map(selector => this.generateRuleSelector(start, end, selector));
                childRule.selector = transformedSelectors.join(', ');
              }
            });
          }
        }
      }
    };

    cssParser.rules.forEach(processRule);

    let after = cssParser.stringify();
    // let after = StringUtils.regexExecArrayReplace(stringify as string, /(var\(--domrender-(\$\{.*?\}\$)?\))/g, (data) => {
    //   return data[2];
    // });
    // console.log('after@@@@@@@@@@@', after)

    // 여기서 선언 selector 자체에도 처리가능하도록 한다 20250518
    after = after.replaceAll('/*$', '${');
    after = after.replaceAll('$*/', '}$');

    if (styleTagWrap) {
      styleBody = `<style id='${componentKey}-style' domstyle>${after}</style>`;
    }

    // console.log('style!!!!!!!!!!!!!!2', styleBody);
    return styleBody;
  }

  public applyEvent(obj: any, fragment = this.dataSet.fragment, config?: DomRenderConfig) {
    // const t0 = performance.now();
    this.dataSet.config.eventManager.applyEvent(
      obj,
      this.dataSet.config.eventManager.findAttrElements(fragment, config),
      config
    );
    // console.log(`RawSet applyEvent took ${performance.now() - t0} milliseconds.`);
  }

  public onRenderedEvent(obj: any, nodes: Node[], config?: DomRenderConfig) {
    this.dataSet.config.eventManager.onRenderedEvent(obj, nodes, config);
  }

  public getAttribute(element: Element, attr: string) {
    const data = element.getAttribute(attr);
    return data;
  }

  public getAttributeAndDelete(element: Element, attr: string) {
    const data = element.getAttribute(attr);
    // if (data)
    //  element.setAttribute(`origin-${attr}`, data);

    element.removeAttribute(attr);
    return data;
  }

  public getDrAppendAttributeAndDelete(element: Element, obj: any) {
    let data = element.getAttribute(RawSet.DR_APPENDER_NAME);
    // if (data && !/\[[0-9]+\]/g.test(data)) {
    if (data && !/\[.+\]/g.test(data)) {
      const currentIndex = ObjectUtils.Script.evaluateReturn(
        `${ObjectUtils.Path.toOptionalChainPath(data)}?.length -1`,
        obj
      );
      // console.log('------?', currentIndex)
      // if (currentIndex === undefined || isNaN(currentIndex)) {
      //     return undefined;
      // }
      // const currentIndex = ScriptUtils.evalReturn(`${data}.length`, obj);
      data = `${data}[${currentIndex}]`;
      element.setAttribute(RawSet.DR_APPENDER_NAME, data);
      // element.setAttribute(RawSet.DR_IF_NAME, data);
      // element.setAttribute('dr-id', data);
      // console.log('-->', element)
    }

    // if (data && !/\.childs\[[0-9]+\]/g.test(data)) {
    //     const currentIndex = ScriptUtils.evalReturn(`${data}.currentIndex`, obj);
    //     data = `${data}.childs[${currentIndex}]`;
    //     element.setAttribute(RawSet.DR_APPENDER_NAME, data)
    // }
    element.removeAttribute(RawSet.DR_APPENDER_NAME);
    return data;
  }

  public replaceBody(genNode: Node) {
    this.childAllRemove();
    this.point.start.parentNode?.insertBefore(genNode, this.point.start.nextSibling); // 중요 start checkpoint 다음인 end checkpoint 앞에 넣는다. 즉 중간 껴넣기 (나중에 meta tag로 변경을 해도될듯하긴한데..)
  }

  // 중요 important
  public static checkPointCreates(element: Node, obj: any, config: DomRenderConfig): RawSet[] {
    // console.log('!@@@@@@@@@@@@@@@@', obj);
    // const NodeFilter = (config.window as any).NodeFilter;
    // const thisVariableName = (element as any).__domrender_this_variable_name;
    // let html = element instanceof DocumentFragment ? ElementUtils.toInnerHTML(element, {document: config.window.document}) : (element as HTMLElement).outerHTML;
    // console.log('==============html-->', element, html);
    const NodeFilter = (config.window as any).NodeFilter;
    const Node = (config.window as any).Node;
    const processedNodes = new Set<Node>();

    const findNodes = NodeUtils.findNodes(element, node => {
      // console.log('nodeType', node.nodeType, node, (node as any).tagName, (node as any).data);
      // for (const processedNode of processedNodes) {
      //   console.log('pre check!!', Array.from(processedNodes),processedNode !== node , processedNode.contains(node));
      //   // if(processedNode.contains(node)){
      //   console.log('---prechecker--html', (processedNode as HTMLElement).outerHTML,'------', (node as HTMLElement).outerHTML);
      //   // }
      //   if (processedNode !== node && processedNode.contains(node)) {
      //     console.log('acceptNodeReturn contain', NodeFilter.FILTER_REJECT);
      //     return NodeFilter.FILTER_REJECT;
      //   }
      // }

      if (node.nodeType === Node.TEXT_NODE) {
        // console.log('nodeText--->', node.textContent)
        // console.log('????????', node.parentElement, node.parentElement?.getAttribute('dr-pre'));
        // console.log('???????/',node.textContent, node.parentElement?.getAttribute('dr-pre'))
        // TODO: 나중에
        // const between = StringUtils.betweenRegexpStr('[$#]\\{', '\\}', StringUtils.deleteEnter((node as Text).data ?? ''))
        const between = RawSet.expressionGroups(StringUtils.deleteEnter((node as Text).data ?? ''));
        // console.log('bbbb', between)
        const r =
          between?.length > 0
            ? NodeUtils.FindNodesFilterResult.MATCH_AND_SKIP_CHILDREN
            : NodeUtils.FindNodesFilterResult.NO_MATCH_AND_SKIP_CHILDREN;
        // console.log('acceptNodeReturn node', r);
        return r;
        // return /\$\{.*?\}/g.test(StringUtils.deleteEnter((node as Text).data ?? '')) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        // return /[$#]\{.*?\}/g.test(StringUtils.deleteEnter((node as Text).data ?? '')) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        // if (typeof Window === 'undefined' && element.getAttribute('ttt') === 'visual') {
        //   return NodeFilter.FILTER_REJECT;
        // }
        // console.log('nodeHTML-->', element.outerHTML);
        if (element.hasAttribute(RawSet.DR_PRE_NAME)) {
          let r = NodeUtils.FindNodesFilterResult.NO_MATCH_AND_SKIP_CHILDREN;
          // console.log('acceptNodeReturn', r);
          return r;
        }
        if (element.hasAttribute(EventManager.attrAttrName)) {
        // console.log('elementAttrAttrName-->', element.outerHTML);
          const script = element.getAttribute(EventManager.attrAttrName) ?? '';
          // console.log('scriptscriptscriptscriptscriptscript,', script)
          // const keyValuePairs = Array.from(script.matchAll(/['"]?(\w+)['"]?:\s*([^,}]+)/g))
          const keyValuePairs = Array.from(script.matchAll(/['"]?([\w-_]+)['"]?:\s*([^,}]+)/g))
            .map(match => ({
            key: match[1],
            value: match[2]
          }));
          (keyValuePairs ?? []).forEach(it => {
            element.setAttribute(it.key, '${' + it.value + '}$');
          });
        }
        // element.setAttribute('dr-event-click', 'console.log(11)');
        const targetElementIs = element.getAttribute(RawSet.DR_REPLACE_TARGET_ELEMENT_IS_NAME);
        const targetElementNames = config.targetElements?.map(it => it.name.toLowerCase()) ?? [];
        targetElementNames.push(...RawSet.DR_ELEMENTS)
        const isElement =
          targetElementNames.includes(element.tagName.toLowerCase()) ||
          targetElementNames.includes(targetElementIs?.toLowerCase() as any);
        // if (isElement) {
        //   (element as HTMLElement).style.display = 'none';
        //   (element as HTMLElement).style.width = '100px';
        //   (element as HTMLElement).style.height = '100px';
        //   console.log((element as HTMLElement).outerHTML)
        // }
        // console.log('------targetElementIstargetElementIs>', targetElementNames, '---', isElement, targetElementIs);
        // const targetAttrNames = (config.targetAttrs?.map(it => it.name) ?? []).concat([...RawSet.DR_ATTRIBUTES,...EventManager.RAWSET_CHECK_ATTRIBUTE]);
        const targetAttrNames = (config.targetAttrs?.map(it => it.name) ?? []).concat([...RawSet.DR_ATTRIBUTES]);
        const normalAttrs = new Map<string, NormalAttrDataType>();
        const linkVariables = new Map<string, string>();
        const linkNames = EventManager.linkAttrs.map(it => it.name);
        const isAttr =
          element.getAttributeNames().filter(it=>!EventManager.noDetectAttr.includes(it)).filter(it => {
            const value = element.getAttribute(it)?.trim();

            // link일때
            if (value && linkNames.includes(it)) {
              linkVariables.set(it, value);
            } else if (value && RawSet.isExpression(value)) {
              // 표현식있을떄
              const variablePaths: { origin: string; inner: string }[] = RawSet.expressionGroups(value).map(it => ({
                origin: it[0].trim(),
                inner: it[1].trim()
              }));
              const isStringTemplate = variablePaths.length > 1 || (variablePaths[0] && variablePaths[0].origin !== value);
              // normal Attribute 초반에 셋팅해주기.
              // TODO: 이거 하긴했는데 사이드 이팩트?
              // let variablePath: string = RawSet.expressionGroups(value)[0][1];
              // const originVariable = variablePath;
              // variablePath = variablePath.replace(/#[^#]*#/g, '({})');
              // const optionalChainPath = ObjectUtils.Path.toOptionalChainPath(variablePath);
              // const cval = ObjectUtils.Script.evaluateReturn(optionalChainPath, Object.assign(obj));

              let targetScript = value;
              variablePaths.forEach(it => {
                let r = it.inner.replace(/#[^#]*#/g, '({})');
                r = ObjectUtils.Path.toOptionalChainPath(r);
                targetScript = targetScript.replaceAll(it.origin, `\${${r}}`);
              });
              const cval = ObjectUtils.Script.evaluateReturn('`' + targetScript + '`', Object.assign(obj));

              if (cval === null) {
                element.removeAttribute(it);
              } else {
                element.setAttribute(it, cval);
              }
              normalAttrs.set(it, { originalAttrValue: value, variablePaths: variablePaths, isStringTemplate });
              // normalAttrs.set(it, originVariable);
              // console.log('normalAttribute', it, variablePath);
            }
            // console.log(element.getAttribute(it), attrExpresion);
            const isTargetAttr = targetAttrNames.includes(it.toLowerCase());
            return isTargetAttr;
          }).length > 0;

          if (linkVariables.size) {
            element.setAttribute(
              EventManager.linkTargetMapAttrName,
              JSON.stringify(Array.from(linkVariables.entries()))
            );
          }
          // 기본 attribute를 처리하기위해
          if (normalAttrs.size) {
            element.setAttribute(EventManager.normalAttrMapAttrName, JSON.stringify(Array.from(normalAttrs.entries())));
          }
          // if (isElement)  {
          //   element.setAttribute('www', '@this@');
          // }
          const r = isAttr || isElement ? NodeUtils.FindNodesFilterResult.MATCH_AND_SKIP_CHILDREN : NodeUtils.FindNodesFilterResult.NO_MATCH_AND_CONTINUE;
          // console.log('acceptNodeReturn element', r);
          return r;
        }
        const r = NodeUtils.FindNodesFilterResult.NO_MATCH_AND_CONTINUE;
        // console.log('acceptNodeReturn  nothing', r);
        return r;
      }
    )

    const pars: RawSet[] = [];
    let currentNode: Node | null;
    const name = RandomUtils.uuid();
    // console.log('name==', name);
    // eslint-disable-next-line no-cond-assign
    // while ((currentNode = nodeIterator?.nextNode())) {
    // console.log('findNodes~~', findNodes);
    for (const currentNode of findNodes) {
      // 여기에서 부모인거 인지시켜준다  위쪽 에서 다시찾을떄 걸러진다.. JSDOM ..이놈이 즉각적인 처리를 못해줘서 수동 검증 로직 넣었다.
      processedNodes.add(currentNode);
      // console.log('currentNode!!!!', currentNode);
      if (currentNode.nodeType === Node.TEXT_NODE) {
        const text = (currentNode as Text).textContent ?? '';
        const template = config.window.document?.createElement('template');
        if (!template) break;
        // const a = StringUtils.regexExec(/\$\{.*?\}/g, text);
        // const a = StringUtils.regexExec(/[$#]\{.*?\}/g, text);
        // const a = StringUtils.betweenRegexpStr('[$#]\\{', '\\}', text); // <--TODO: 나중에..
        const groups = RawSet.expressionGroups(text);
        const map = groups.map(it => ({
          uuid: `${RandomUtils.alphabet(40)}_${obj?.constructor?.name}`,
          content: it[0],
          regexArr: it
        }));
        // console.log('create!!',map);
        let lasterIndex = 0;
        for (let i = 0; i < map.length; i++) {
          const it = map[i];
          // console.log('itttttttttttt', it);
          const regexArr = it.regexArr;
          // 중요: text경우 asdasd ${this.name}$ 이렇게 있다면 앞부분 asdasd <-- 이부분은 살려야되니깐 아래처럼 짜름
          const preparedText = regexArr.input.substring(lasterIndex, regexArr.index);
          // const preparedText = regexArr[1];
          // const start = config.window.document.createElement('meta');
          // start.setAttribute('id', `${it.uuid}-start`);
          // const end = config.window.document.createElement('meta');
          // end.setAttribute('id', `${it.uuid}-end`);
          let type: RawSetType;
          if (currentNode.parentNode && currentNode.parentNode.nodeName.toUpperCase() === 'STYLE') {
            type = RawSetType.STYLE_TEXT;
          } else {
            type = RawSetType.TEXT;
          }
          const node = config.window.document.createTextNode(preparedText);
          const startEndPoint = RawSet.createStartEndPoint({ id: it.uuid, type }, config);
          // layout setting
          // console.log('createTextNode', node);
          template.content.append(node); // expression 앞 부분 넣어줘야 앞부분 일반 text 안짤린다.
          template.content.append(startEndPoint.start); // add start checkpoint
          template.content.append(startEndPoint.end); // add end checkpoint

          // content 안쪽 RawSet render 할때 start 와 end 사이에 fragment 연산해서 들어간다.
          const fragment = config.window.document.createDocumentFragment();
          fragment.append(config.window.document.createTextNode(it.content));
          // (startEndPoint.start as any).khh = RandomUtils.decimal(0,10)
          pars.push(
            new RawSet(
              it.uuid,
              type,
              {
                start: startEndPoint.start,
                node: currentNode,
                end: startEndPoint.end,
                parent: currentNode.parentNode
                // thisVariableName: thisVariableName
              },
              { fragment: fragment, config: config }
            )
          );
          lasterIndex = regexArr.index + it.content.length;
        }
        template.content.append(config.window.document.createTextNode(text.substring(lasterIndex, text.length)));
        const p = currentNode?.parentNode;
        p?.replaceChild(template.content, currentNode); // <-- 여기서 text를 fragment로 replace했기때문에 추적 변경이 가능하다.
      } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
        // const uuid = `${RandomUtils.alphabet(40)}___${obj?.constructor?.name}`;
        const uuid = `${RandomUtils.alphabet(40)}`;
        const element = currentNode as Element;
        // console.log('create ElementTarget', uuid, element.outerHTML);
        const fragment = config.window.document.createDocumentFragment();
        const elementType: RawSetType = RawSetType.TARGET_ELEMENT;
        const startEndPoint = RawSet.createStartEndPoint({ node: element, id: uuid, type: elementType }, config);
        // 여기서 등록한 component 추가한다.
        const targetElementIs = element.getAttribute(RawSet.DR_REPLACE_TARGET_ELEMENT_IS_NAME);
        const targetElementNames = config.targetElements?.map(it => it.name.toLowerCase()) ?? [];
        targetElementNames.push(...RawSet.DR_ELEMENTS)
        const isElement =
          targetElementNames.includes(element.tagName.toLowerCase()) ||
          targetElementNames.includes(targetElementIs?.toLowerCase() as any);
        // if (isElement) {
        //   (element as HTMLElement).style.display = 'none'
        // }
        // const isElement = targetElementNames.includes(element.tagName.toLowerCase());
        const targetAttrNames = (config.targetAttrs?.map(it => it.name) ?? []).concat(RawSet.DR_ATTRIBUTES);
        const isAttr = element.getAttributeNames().filter(it => targetAttrNames.includes(it.toLowerCase())).length > 0;
        currentNode?.parentNode?.insertBefore(startEndPoint.start, currentNode);
        currentNode?.parentNode?.insertBefore(startEndPoint.end, currentNode.nextSibling);
        fragment.append(currentNode);
        // const tempDiv = document.createElement('div');
        // tempDiv.appendChild(fragment.cloneNode(true)); // fragment 복사본 추가
        // console.log('------',tempDiv.innerHTML);
        // console.log();
        const rawSet = new RawSet(
          uuid,
          isElement ? elementType : isAttr ? RawSetType.TARGET_ATTR : RawSetType.UNKOWN,
          {
            start: startEndPoint.start,
            node: currentNode,
            end: startEndPoint.end,
            parent: currentNode.parentNode
            // thisVariableName: thisVariableName
          },
          { config: config, fragment: fragment }
        );
        pars.push(rawSet);
      }
    }
    // config
    const util = ElementUtils;
    // console.log('parsparsparsparsparsparsparsparsparspars', pars, name);
    return pars;
    // const lastpars: RawSet[] = []
    //
    // pars.forEach(it => {
    //   // it.uuid
    //   const parents = pars.filter(it => it.dataSet.fragment.getElementById(it.uuid+'-start'))
    //
    //   console.log('vvvvvvvvv', parents);
    //   if (parents.length>0) {
    //     parents.forEach(sit => {
    //       sit.dataSet.fragment.getElementById(sit.uuid + '-start')?.replaceWith(it.dataSet.fragment);
    //       it.dataSet.fragment.getElementById(sit.uuid + '-end').remove();
    //       console.log('rrr');
    //       // ElementUtils.toInnerHTML(it.dataSet.fragment, {document: config.window.document});
    //       // ElementUtils.toInnerHTML(it.dataSet.fragment
    //     });
    //   } else {
    //     lastpars.push(it)
    //   }
    // })
    // console.log('zzzzzz', lastpars);
    // return lastpars;
  }

  public static createStartEndPoint(data: { node?: Node; id: string; type: RawSetType }, config: DomRenderConfig) {
    if (data.type === RawSetType.TARGET_ELEMENT && data.node) {
      const element = data.node as Element;
      const start: HTMLMetaElement = config.window.document.createElement('meta');
      const end: HTMLMetaElement = config.window.document.createElement('meta');
      start.setAttribute('id', `${data.id}-start`);
      start.setAttribute('dr-start-point', '');
      const keys = element.getAttribute(RawSet.DR_KEY_OPTIONNAME);
      const thisPropertyType = element.getAttribute(RawSet.DR_THIS_PROPERTY_NAME);
      if (thisPropertyType) {
        start.setAttribute('type', RawSetOperatorType.DR_THIS_PROPERTY);
      }
      if (keys) {
        element.removeAttribute(RawSet.DR_KEY_OPTIONNAME);
        start.setAttribute(RawSet.DR_KEY_OPTIONNAME, keys);
      }
      end.setAttribute('id', `${data.id}-end`);
      end.setAttribute('dr-end-point', '');
      return { start, end };
    } else if (data.type === RawSetType.STYLE_TEXT) {
      return {
        start: config.window.document.createTextNode(`/*start text ${data.id}*/`),
        end: config.window.document.createTextNode(`/*end text ${data.id}*/`)
      };
    } else {
      // text
      return {
        start: config.window.document.createComment(`start text ${data.id}`),
        end: config.window.document.createComment(`end text ${data.id}`)
      };
    }
  }

  public remove() {
    this.childAllRemove();
    this.point.end.remove();
    this.point.start.remove();
  }

  public childAllRemove() {
    let next = this.point.start.nextSibling;
    while (next) {
      if (next === this.point.end) {
        break;
      }
      next.remove();
      next = this.point.start.nextSibling;
    }
  }

  public childs(stopNext?: (node: Node) => boolean) {
    const childs: any[] = [];
    let next = this.point.start.nextSibling;
    while (next && next !== this.point.end) {
      if (stopNext?.(next)) {
        return;
      }
      childs.push(next);
      next = next.nextSibling;
    }
    return childs;
  }

  public getHasRawSet(key: string) {
    let rawSet: RawSet | undefined;
    this.childs(node => {
      const drKey = (node as Element).getAttribute?.(RawSet.DR_KEY_OPTIONNAME);
      if (drKey && drKey === key) {
        rawSet = (node as any).rawSet as RawSet;
        return true;
      }
      return false;
    });
    return rawSet;
  }

  public static drItOtherEncoding(element: Element | DocumentFragment, postFix?: string) {
    const random = RandomUtils.uuid() + postFix;
    const regex = /#it#/g;
    element
      .querySelectorAll(
        `[${RawSet.DR_IT_OPTIONNAME}], [${RawSet.DR_FOR_OF_NAME}], [${RawSet.DR_REPEAT_NAME}], [${RawSet.DR_APPENDER_NAME}]`
      )
      .forEach(it => {
        it.innerHTML = it.innerHTML.replace(regex, random);
      });
    return random;
  }

  public static drItOtherDecoding(element: Element | DocumentFragment, random: string) {
    element
      .querySelectorAll(
        `[${RawSet.DR_IT_OPTIONNAME}], [${RawSet.DR_FOR_OF_NAME}], [${RawSet.DR_REPEAT_NAME}], [${RawSet.DR_APPENDER_NAME}]`
      )
      .forEach(it => {
        it.innerHTML = it.innerHTML.replace(RegExp(random, 'g'), '#it#');
      });
  }

  public static drVarDecoding(
    element: Element,
    vars: { name: string; value: string; regex: RegExp; random: string }[]
  ) {
    element.querySelectorAll(`[${RawSet.DR_THIS_NAME}]`).forEach(it => {
      vars
        .filter(vit => vit.value && vit.name)
        .forEach(vit => {
          it.innerHTML = it.innerHTML.replace(RegExp(vit.random, 'g'), vit.value);
        });
    });
  }

  public static replaceInnerHTML(element: Element, config: { asIs: string | RegExp; toBe?: string }): string {
    const innerHTML = element.innerHTML;
    const tobe = (config.toBe = config.toBe ?? RandomUtils.uuid());
    if (config.asIs instanceof RegExp) {
      element.innerHTML = innerHTML.replace(config.asIs, config.toBe);
    } else {
      element.innerHTML = innerHTML.replaceAll(config.asIs, config.toBe);
    }
    return tobe;
  }

  public static drThisEncoding(element: Element, drThis: string, config: { asIs: RegExp; toBe?: string }): string {
    const thisRandom = (config.toBe = config?.toBe ?? RandomUtils.uuid());
    // console.log('rrrrrrrrrrrrr', thisRandom);
    // const thisRegex = /(?<!(dr-|\.))this(?=.?)/g;
    // const thisRegex = /[^(dr\-)]this(?=.?)/g;
    // const thisRegex = /[^(dr\-)]this\./g;
    // safari 때문에 전위 검색 regex가 안됨 아 짜증나서 이걸로함.
    // element.querySelectorAll(`[${RawSet.DR_PRE_NAME}]`).forEach(it => {
    //     let message = it.innerHTML;
    // })
    element.querySelectorAll(`[${RawSet.DR_PRE_NAME}]`).forEach(it => {
      it.innerHTML = it.innerHTML.replace(config.asIs, thisRandom);
    });
    element.querySelectorAll(`[${RawSet.DR_THIS_NAME}]`).forEach(it => {
      // console.log('rrrrrrrrand?', drThis,config);
      let message = it.innerHTML;
      // StringUtils.regexExec(/([^(dr\-)])?this(?=.?)/g, message).reverse().forEach(it => {
      StringUtils.regexExec(config.asIs, message)
        .reverse()
        .forEach(it => {
          message = message.substr(0, it.index) + message.substr(it.index).replace(it[0], `${it[1] ?? ''}${drThis}`);
        });
      it.innerHTML = message;
    });

    // console.log('changggg', element.innerHTML);
    let message = element.innerHTML;
    StringUtils.regexExec(config.asIs, message)
      .reverse()
      .forEach(it => {
        message = message.substr(0, it.index) + message.substr(it.index).replace(it[0], `${it[1] ?? ''}${drThis}`);
      });
    element.innerHTML = message;
    return thisRandom;
  }

  public static drThisBindEncoding(
    element: Element,
    variable: RegExp,
    config: { config: DomRenderConfig; otherReplaceVariablePath?: string }
  ) {
    element.querySelectorAll(`[${RawSet.DR_THIS_NAME}]`).forEach(eIt => {
      let message = eIt.innerHTML;
      // StringUtils.regexExec(/([^(dr\-)])?this(?=.?)/g, message).reverse().forEach(it => {
      StringUtils.regexExec(variable, message)
        .reverse()
        .forEach(it => {
          message =
            message.substr(0, it.index) +
            message.substr(it.index).replace(it[0], `${it[1] ?? ''}${eIt.getAttribute(RawSet.DR_THIS_NAME)}`);
        });
      eIt.innerHTML = message;
    });

    const targetElements = config.config.targetElements ?? [];
    const targetElementNames = targetElements
      .map(it => it.name.replaceAll('.', '\\.').replaceAll(':', '\\:'))
      .join(',');
    const thisRandom = RandomUtils.uuid();
    // console.log('thisRandom', thisRandom, variable);
    element.querySelectorAll(targetElementNames).forEach(it => {
      it.innerHTML = it.innerHTML.replace(variable, thisRandom);
    });

    element.querySelectorAll(`[${RawSet.DR_REPLACE_TARGET_ELEMENT_IS_NAME}]`).forEach(it => {
      it.innerHTML = it.innerHTML.replace(variable, thisRandom);
    });

    if (config.otherReplaceVariablePath) {
      let message = element.innerHTML;
      StringUtils.regexExec(variable, message)
        .reverse()
        .forEach(it => {
          message =
            message.substr(0, it.index) +
            message.substr(it.index).replace(it[0], `${it[1] ?? ''}${config.otherReplaceVariablePath}`);
        });
      element.innerHTML = message;
    }
    return thisRandom;
  }

  public static drThisBindDecoding(element: Element, config: { asIs: string; toBe: string; config: DomRenderConfig }) {
    const targetElements = config.config.targetElements ?? [];
    const targetElementNames = targetElements
      .map(it => it.name.replaceAll('.', '\\.').replaceAll(':', '\\:'))
      .join(',');
    element.querySelectorAll(targetElementNames).forEach(it => {
      it.innerHTML = it.innerHTML.replace(RegExp(config.asIs, 'g'), config.toBe);
    });
    element.querySelectorAll(`[${RawSet.DR_REPLACE_TARGET_ELEMENT_IS_NAME}]`).forEach(it => {
      it.innerHTML = it.innerHTML.replace(RegExp(config.asIs, 'g'), config.toBe);
    });
  }

  public static drThisDecoding(element: Element, config: { asIs: string; toBe: string }) {
    element.querySelectorAll(`[${RawSet.DR_PRE_NAME}]`).forEach(it => {
      it.innerHTML = it.innerHTML.replace(RegExp(config.asIs, 'g'), config.toBe);
    });
    element.querySelectorAll(`[${RawSet.DR_THIS_NAME}]`).forEach(it => {
      it.innerHTML = it.innerHTML.replace(RegExp(config.asIs, 'g'), config.toBe);
    });
  }

  public static drFormOtherMoveAttr(element: Element, as: string, to: string, config: DomRenderConfig) {
    element.querySelectorAll(`[${RawSet.DR_FORM_NAME}]`).forEach(subElement => {
      const nodeIterator = config.window.document?.createNodeIterator(subElement, NodeFilter.SHOW_ELEMENT, {
        acceptNode(node) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            return element.hasAttribute(as) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
          } else {
            return NodeFilter.FILTER_REJECT;
          }
        }
      });

      let node;
      // eslint-disable-next-line no-cond-assign
      while ((node = nodeIterator?.nextNode())) {
        const element = node as Element;
        element.setAttribute(to, element.getAttribute(as) ?? '');
        element.removeAttribute(as);
      }
    });
  }

  public static drVarEncoding(element: Element, drVarOption: string) {
    const vars = (drVarOption?.split(',') ?? []).map(it => {
      const s = it.trim().split('=');
      const name = s[0]?.trim();
      const value = s[1]?.trim();
      return {
        name,
        value,
        // regex: RegExp('(?<!(dr-|\\.))var\\.' + s[0] + '(?=.?)', 'g'),
        regex: RegExp('\\$var\\.' + name + '(?=.?)', 'g'),
        random: RandomUtils.uuid()
      };
    });
    // console.log('asd', element.innerHTML);
    // element.querySelectorAll(`[${RawSet.DR_THIS_NAME}]`).forEach(it => {
    element.querySelectorAll(`[${RawSet.DR_VAR_OPTIONNAME}]`).forEach(it => {
      vars
        .filter(vit => vit.value && vit.name)
        .forEach(vit => {
          it.innerHTML = it.innerHTML.replace(vit.regex, vit.random);
        });
    });
    vars
      .filter(vit => vit.value && vit.name)
      .forEach(vit => {
        element.innerHTML = element.innerHTML.replace(vit.regex, vit.value);
      });
    return vars;
  }

  public static async drThisCreate(
    rawSet: RawSet,
    element: Element,
    drThis: string,
    drVarOption: string,
    drStripOption: boolean | string | null,
    obj: any,
    config: DomRenderConfig,
    set?: ComponentSet
  ): Promise<DocumentFragment | undefined> {
    // console.log('ttttttttttttttttttttt',element.innerHTML, drThis, set, obj);
    const fag = config.window.document?.createDocumentFragment();
    if (!fag) {
      return;
    }
    const targetElement = element.cloneNode(true) as Element;
    let targetObj = obj;
    if (set) {
      targetObj = set.obj;
      set.setTemplateStyle(await RawSet.fetchTemplateStyle(set));
      const style = RawSet.generateStyleTransform(set.styles ?? [], rawSet.uuid, true);
      targetElement.innerHTML = style + (set.template ?? '');
    } else {
      targetObj = ObjectUtils.Script.evaluateReturn(ObjectUtils.Path.toOptionalChainPath(drThis), obj);
    }

    const componentKey = rawSet.uuid;
    const renderScript = ` /*drThisCreate*/
        // console.log('-----', this.__render);
        var ${EventManager.RENDER_VARNAME} = this.__render; 
        var ${EventManager.RAWSET_VARNAME} = this.__render.rawSet; 
        var ${EventManager.COMPONENT_VARNAME} = this.__render.component; 
        var ${EventManager.ELEMENT_VARNAME} = this.__render.element; 
        var ${EventManager.ROUTER_VARNAME} = this.__render.router; 
        var ${EventManager.INNER_HTML_VARNAME} = this.__render.innerHTML; 
        var ${EventManager.ATTRIBUTE_VARNAME} = this.__render.attribute; 
        var ${EventManager.PARENT_THIS_PATH_VARNAME} = this.__render.parentThisPath; 
        var ${EventManager.CURRENT_THIS_VARNAME} = this.__render.currentThis; 
        var ${EventManager.CURRENT_THIS_PATH_VARNAME} = this.__render.currentThisPath; 
        var ${EventManager.PARENT_THIS_VARNAME} = this.__render.parentThis; 
        var ${EventManager.NEAR_THIS_PATH_VARNAME} = this.__render.nearThisPath; 
        var ${EventManager.NEAR_THIS_VARNAME} = this.__render.nearThis; 
        var ${EventManager.CREATOR_META_DATA_VARNAME} = this.__render.creatorMetaData;
      `;

    const parentThisPath = rawSet.findParentThisPath();
    const parentThis = rawSet.findParentThis(obj);
    const nearThisPath = rawSet.findNearThisPath();
    const nearThis = rawSet.findNearThis(obj);
    // console.log('ttttttttttttttttt',parentThisPath, parentThis, nearThisPath, nearThis);
    // console.log('-element.innerHTMLelement.innerHTMLelement.innerHTML',element.innerHTML);
    let render = {
      renderScript: renderScript,
      element: element,
      getElement: () => config.window.document.querySelector(`[class*="${rawSet.uuid}"]`),
      innerHTML: element.innerHTML,
      // attribute: ObjectUtils.toDeleteKey(attribute, [...Object.values(RawSet.drAttrsOriginName), ...Object.values(EventManager.VARNAMES)]),
      rawSet: rawSet,
      router: config.router,
      componentKey: componentKey,
      currentThis: targetObj,
      currentThisPath: drThis,
      parentThisPath: parentThisPath,
      parentThis: parentThis,
      nearThisPath: nearThisPath,
      nearThis: nearThis,
      scripts: EventManager.setBindProperty(config.scripts ?? {}, obj)
    } as Render;
    // const attribute = DomUtils.getAttributeToObject(element);
    render.attribute = RawSet.getAttributeObject(element, { script: renderScript, obj: obj, renderData: render });
    render = Object.freeze(render);

    // dr-on-create data onCreateRender
    const onCreateDataScript = `return {rootParent: this, render: this.__render}`;
    const onCreateDataParam = ObjectUtils.Script.evaluate<OnCreateRenderDataParams>(
      onCreateDataScript,
      Object.assign(obj, { __render: render })
    );
    if (isOnCreateRenderData(targetObj)) {
      targetObj?.onCreateRenderData(onCreateDataParam as OnCreateRenderDataParams);
    }
    // 부모에게도 자식 this 생성된거 알려주는 callback
    if (onCreateDataParam?.render?.parentThis && isOnCreatedThisChild(onCreateDataParam?.render?.parentThis)) {
      onCreateDataParam.render.parentThis.onCreatedThisChild(targetObj, onCreateDataParam as OnCreateRenderDataParams);
    }

    // dr-on-create onCreateRender
    const onCreate = element.getAttribute(RawSet.DR_ON_CREATE_ARGUMENTS_OPTIONNAME);
    let createParam: any[] = [];
    if (onCreate) {
      createParam = ObjectUtils.Script.evaluateReturn<any[]>(
        { bodyScript: renderScript, returnScript: ObjectUtils.Path.toOptionalChainPath(onCreate) },
        obj
      );
      if (!Array.isArray(createParam)) {
        createParam = [createParam];
      }
    }

    if (isOnCreateRender(targetObj)) {
      targetObj.onCreateRender(...createParam);
    }

    // console.log('매번타나?');
    // 중요 dr-normal-attr-map
    // const normalAttrMap = element.getAttribute(EventManager.normalAttrMapAttrName);
    const targetAttrObject = RawSet.getAttributeObject(element, { script: renderScript, obj: obj, renderData: render });
    if (targetAttrObject) {
      rawSet.dataSet.render ??= {};
      rawSet.dataSet.render.attribute = targetAttrObject;
      Object.entries(targetAttrObject).forEach(([key, cval], index) => {
        // console.log('ooooooooooooooooo', key, cval);
        // const script = `${renderScript} return ${value} `;
        // const cval = ScriptUtils.eval(script, Object.assign(obj, { __render: render }));
        // // element.setAttribute(key, cval);
        if (isOnChangeAttrRender(targetObj)) {
          targetObj.onChangeAttrRender(key, cval, { rawSet: rawSet });
        }
      });
    }

    // dr-on-component-init
    // const oninit = element.getAttribute(`${EventManager.attrPrefix}on-component-init`); // dr-on-component-init
    const oninit = element.getAttribute(RawSet.DR_ON_CREATED_CALLBACK_OPTIONNAME); // dr-on-component-init
    // console.log('--------drThisCreate!!!', oninit)
    if (oninit) {
      const script = `${renderScript}  ${oninit} `;
      ObjectUtils.Script.evaluate(script, Object.assign(obj, { __render: render }));
    }

    targetElement.querySelectorAll(EventManager.attrNames.map(it => `[${it}]`).join(',')).forEach(it => {
      it.setAttribute(EventManager.ownerVariablePathAttrName, 'this');
    });

    // console.log('targetElement',targetElement);
    // attribute
    // const componentName = element.getAttribute(RawSet.DR_COMPONENT_NAME_OPTIONNAME) ?? 'component';
    // const componentNameReplaceKey = RandomUtils.uuid();
    // if (componentName) {
    //   RawSet.replaceInnerHTML(element, {asIs: `#${componentName}#`, toBe: 'this'})
    // }
    // const innerHTMLName = element.getAttribute(RawSet.DR_COMPONENT_INNER_HTML_NAME_OPTIONNAME) ?? 'innerHTML';
    // const innerHTMLNameReplaceKey = RandomUtils.uuid();
    // if (innerHTMLName) {
    //   RawSet.replaceInnerHTML(element, {asIs: `#${innerHTMLName}#`, toBe: innerHTMLNameReplaceKey})
    // }

    rawSet.point.innerHTML = element.innerHTML;
    const innerText = element.textContent?.trim() ?? '';
    const escapedInnerHTML = ConvertUtils.escapeHTML(element.innerHTML);
    // 이걸 왜 뺐었지... 다시넣었음  그런데 조금 로직이.. 검증이..
    const innerHTMLName = targetElement.getAttribute(RawSet.DR_INNER_HTML_NAME_OPTIONNAME) ?? 'innerHTML';
    const innerTEXTName = targetElement.getAttribute(RawSet.DR_INNER_TEXT_NAME_OPTIONNAME) ?? 'innerTEXT';
    const innerHTMLEscapedName = targetElement.getAttribute(RawSet.DR_INNER_HTML_ESCAPED_NAME_OPTIONNAME) ?? 'innerHTMLEscaped';
    const templateReplacements: StringUtils.SequentialReplacement[] = [];
    if (innerHTMLName) {
      templateReplacements.push({
        regex: new RegExp(`#${innerHTMLName}#`, 'g'),
        callback: () => element.innerHTML
      });
    }
    if (innerTEXTName) {
      templateReplacements.push({
        regex: new RegExp(`#${innerTEXTName}#`, 'g'),
        callback: () => innerText
      });
    }
    if (innerHTMLEscapedName) {
      templateReplacements.push({
        regex: new RegExp(`#${innerHTMLEscapedName}#`, 'g'),
        callback: () => escapedInnerHTML
      });
    }

    if (templateReplacements.length > 0) {
      targetElement.innerHTML = StringUtils.replaceSequentially(targetElement.innerHTML, templateReplacements);
    }

    // console.log('aa-asIs', targetElement.innerHTML);
    const optionThisName = targetElement.getAttribute(RawSet.DR_THIS_NAME_OPTIONNAME);
    // console.log('11111111111111', optionThisName)
    targetElement
      .getAttributeNames()
      .forEach(it => targetElement.setAttribute(it, targetElement.getAttribute(it)!.replace(/#this#/g, drThis)));
    const thisRandom = this.drThisEncoding(targetElement, drThis, { asIs: /@this@/g });
    // console.log('@@@@@@@@@@@@@0', thisRandom);
    // let thisNameRandom: string | undefined = undefined;
    if (optionThisName) {
      // console.log('-----0', element.innerHTML, '\n', targetElement.innerHTML)
      targetElement.innerHTML = targetElement.innerHTML.replaceAll(`@${optionThisName}@`, drThis);
      // console.log('-----1', element.innerHTML, '\n', targetElement.innerHTML)
      // thisNameRandom = this.drThisBindEncoding(targetElement, new RegExp(`@${optionThisName}@`, 'g'), {config: config, otherReplaceVariablePath: drThis});
    }
    const nearThisRandom = this.drThisBindEncoding(targetElement, /@nearThis@/g, {
      config: config,
      otherReplaceVariablePath: rawSet.findNearThisPath()
    });
    const parentThisRandom = this.drThisBindEncoding(targetElement, /@parentThis@/g, {
      config: config,
      otherReplaceVariablePath: rawSet.findParentThisPath()
    });
    // console.log('@@@@@@@@@@@@@1', targetElement.innerHTML, rawSet.findParentThisPath());
    // console.log('@@@@@@@@@@@@@-----------', rawSet.point?.parentRawSet?.point?.start, rawSet.point?.parentRawSet?.point?.start instanceof HTMLMetaElement);
    // if (rawSet.point?.parentRawSet?.point?.start instanceof HTMLMetaElement) {
    // console.log('@@@@@@@@@@@@@-----------', rawSet.point?.parentRawSet?.point?.start.getAttribute('this-path'));
    // }
    // console.log('@@@@@@@@@@@@@2', targetElement.innerHTML);
    // const nearThisRandom = this.drThisEncoding(targetElement, rawSet.findNearThisPath(), {asIs: /@nearThis@/g});
    // const parentThisRandom = this.drThisEncoding(targetElement, rawSet.findParentThisPath(), {asIs: /@parentThis@/g});
    // console.log('aa-toBe', targetElement.innerHTML);
    // console.log('------', rawSet.findNearThisPath());
    // console.log('------', rawSet.findParentThisPath());
    const vars = this.drVarEncoding(targetElement, drVarOption);
    this.drVarDecoding(targetElement, vars);
    this.drThisDecoding(targetElement, { asIs: thisRandom, toBe: '@this@' });
    // if (optionThisName && thisNameRandom)
    //   this.drThisBindDecoding(targetElement, {config: config, asIs: thisNameRandom, toBe: `@${optionThisName}@`});
    this.drThisBindDecoding(targetElement, { config: config, asIs: nearThisRandom, toBe: '@nearThis@' });
    this.drThisBindDecoding(targetElement, { config: config, asIs: parentThisRandom, toBe: '@parentThis@' });
    // if (componentName) {
    //   RawSet.replaceInnerHTML(element, {asIs: componentNameReplaceKey, toBe: `#${componentName}#`})
    // }
    // if (innerHTMLName) {
    //   RawSet.replaceInnerHTML(targetElement, {asIs: innerHTMLNameReplaceKey, toBe: `#${innerHTMLName}#`})
    // }
    // console.log('ddddddddddddd', targetElement.innerHTML);
    if (drStripOption && (drStripOption === true || drStripOption === 'true')) {
      // console.log('------childNodes', Array.from(n.childNodes))
      Array.from(targetElement.childNodes).forEach(it => fag.append(it));
    } else {
      targetElement.classList.add(`${rawSet.uuid}`);
      fag.append(targetElement);
    }
    // (fag as any).__domrender_this_variable_name = drThis;
    // console.log('set __domrender_this_variable_name', (fag as any).__domrender_this_variable_name)
    return fag;
  }

  private static async fetchTemplateStyle(set: { template?: string; styles?: string | string[] }) {
    // const id = RandomUtils.getRandomString(20);
    const stylePromises: Promise<string>[] = [];
    const templatePromise =
      set.template && set.template.startsWith('lazy://')
        ? (await fetch(set.template.substring(6))).text()
        : Promise.resolve(set.template);
    if (Array.isArray(set.styles)) {
      for (let i = 0; set.styles && i < (set.styles.length ?? 0); i++) {
        const it = set.styles[i];
        stylePromises.push(it.startsWith('lazy://') ? (await fetch(it.substring(6))).text() : Promise.resolve(it));
      }
    } else if (set.styles) {
      stylePromises.push(Promise.resolve(set.styles));
    }
    // const tempTemplate = config.window.document.createElement('template');
    // tempTemplate.innerHTML = await templatePromise;
    // const tempContainer = config.window.document.createElement('div');
    return {
      template: await templatePromise,
      styles: await Promise.all(stylePromises)
    };
  }

  public static createComponentTargetAttribute(
    name: string,
    getThisObj: (element: Element, attrValue: string, obj: any, rawSet: RawSet) => any,
    factory: (element: Element, attrValue: string, obj: any, rawSet: RawSet) => DocumentFragment
  ) {
    const targetAttribute: TargetAttr = {
      name,
      callBack(element: Element, attrValue: string, obj: any, rawSet: RawSet): DocumentFragment {
        const thisObj = getThisObj(element, attrValue, obj, rawSet);
        const data = factory(element, attrValue, obj, rawSet);
        // rawSet.point.thisVariableName = (data as any).__domrender_this_variable_name;
        if (thisObj) {
          // const i = thisObj.__domrender_component_new = (thisObj.__domrender_component_new ?? new Proxy({}, new DomRenderFinalProxy())) as CreatorMetaData;
          // i.thisVariableName = rawSet.point.thisVariableName;
          // i.rawSet = rawSet;
          // i.innerHTML = element.innerHTML;
          // i.rootCreator = new Proxy(obj, new DomRenderFinalProxy());
          // i.creator = new Proxy(rawSet.point.thisVariableName ? ScriptUtils.evalReturn(rawSet.point.thisVariableName, obj) : obj, new DomRenderFinalProxy());
        }
        return data;
      }
    };
    return targetAttribute;
  }

  public static createComponentTargetElement({
    name,
    objFactory,
    template = '',
    styles = [],
    noStrip
  }: {
    name: string;
    noStrip?: boolean;
    objFactory: (element: Element, obj: any, rawSet: RawSet, counstructorParam: any[]) => any;
    template?: string;
    styles?: string | string[];
  }): TargetElement {
    const targetElement: TargetElement = {
      name,
      styles,
      template,
      noStrip,
      async callBack(
        element: Element,
        obj: any,
        rawSet: RawSet,
        attrs: Attrs,
        config: DomRenderConfig
      ): Promise<DocumentFragment | undefined> {
        const templateStyle = await RawSet.fetchTemplateStyle({ template: this.template, styles: this.styles });
        this.template = templateStyle.template;
        this.styles = templateStyle.styles;
        obj.__domrender_components ??= {};
        const domrenderComponents = obj.__domrender_components;
        // debugger;
        const renderScript = ` /*createComponentTargetElement*/
            var ${EventManager.RAWSET_VARNAME} = this.__render.rawSet; 
            var ${EventManager.COMPONENT_VARNAME} = this.__render.component; 
            var ${EventManager.ELEMENT_VARNAME} = this.__render.element; 
            var ${EventManager.ROUTER_VARNAME} = this.__render.router; 
            var ${EventManager.INNER_HTML_VARNAME} = this.__render.innerHTML; 
            var ${EventManager.ATTRIBUTE_VARNAME} = this.__render.attribute; 
            var ${EventManager.PARENT_THIS_PATH_VARNAME} = this.__render.parentThisPath; 
            var ${EventManager.PARENT_THIS_VARNAME} = this.__render.parentThis; 
            var ${EventManager.NEAR_THIS_PATH_VARNAME} = this.__render.nearThisPath; 
            var ${EventManager.NEAR_THIS_VARNAME} = this.__render.nearThis; 
            var ${EventManager.CREATOR_META_DATA_VARNAME} = this.__render.creatorMetaData;
        `;
        const parentThisPath = rawSet.findParentThisPath();
        const parentThis = rawSet.findParentThis(obj);
        const nearThisPath = rawSet.findNearThisPath();
        const nearThis = rawSet.findNearThis(obj);
        let render = {
          renderScript,
          element: element,
          innerHTML: element.innerHTML,
          // attribute: attribute,
          getElement: () => config.window.document.querySelector(`[class*="${rawSet.uuid}"]`),
          rawSet: rawSet,
          router: config.router,
          componentKey: rawSet.uuid,
          nearThisPath: nearThisPath,
          nearThis: nearThis,
          parentThisPath: parentThisPath,
          parentThis: parentThis,
          scripts: EventManager.setBindProperty(config.scripts ?? {}, obj)
        } as Render;
        const constructor = element.getAttribute(RawSet.DR_ON_CONSTRUCTOR_ARGUMENTS_OPTIONNAME);
        let constructorParam = [];
        // script 부분은 처리되어 바인딩 시켜준다
        render.attribute = RawSet.getAttributeObject(element, { script: renderScript, obj: obj, renderData: render });
        render = Object.freeze(render);
        //
        // // dr-constructor
        if (constructor) {
          let param =
            ObjectUtils.Script.evaluateReturn(
              { bodyScript: renderScript, returnScript: ObjectUtils.Path.toOptionalChainPath(constructor) },
              Object.assign(obj, { __render: render })
            ) ?? [];
          if (!Array.isArray(param)) {
            param = [param];
          }
          constructorParam = param;
        }

        // // console.log('------22', attrs);
        const instance = (domrenderComponents[rawSet.uuid] = objFactory(element, obj, rawSet, constructorParam));
        render = {
          currentThis: instance,
          // creatorMetaData: i,
          ...render
        };
        rawSet.dataSet.render = render;
        // 추적 및 destroy 위해.
        instance.__rawSet = rawSet;

        let applayTemplate = element.innerHTML;
        let applayTemplateText = element.textContent?.trim() ?? '';
        let applayTemplateEscape =  ConvertUtils.escapeHTML(element.innerHTML);
        let innerHTMLThisRandom;
        const componentName = element.getAttribute(RawSet.DR_VARIABLE_NAME_OPTIONNAME) ?? 'component';
        const innerHTMLName = element.getAttribute(RawSet.DR_INNER_HTML_NAME_OPTIONNAME) ?? 'innerHTML';
        const innerTEXTName = element.getAttribute(RawSet.DR_INNER_TEXT_NAME_OPTIONNAME) ?? 'innerTEXT';
        const innerHTMLEscapedName = element.getAttribute(RawSet.DR_INNER_HTML_ESCAPED_NAME_OPTIONNAME) ?? 'innerHTMLEscaped';

        // if (element.getAttribute(RawSet.DR_COMPONENT_VARIABLE_NAME_OPTIONNAME)) {
        //   console.log('vvvvvvv', element.getAttribute(RawSet.DR_COMPONENT_VARIABLE_NAME_OPTIONNAME));
        // }
        if (applayTemplate) {
          // if (rawSet.point.thisVariableName) {
          // 넘어온 innerHTML에 this가 있으면 해당안되게 우선 치환.
          innerHTMLThisRandom = RandomUtils.uuid();
          applayTemplate = StringUtils.replaceSequentially(applayTemplate, [
            {
              regex: /this\./g,
              callback: () => innerHTMLThisRandom
            },
            {
              regex: new RegExp(`#${componentName}#`, 'g'),
              callback: () => nearThisPath
            }
          ]);
          // }
          // applayTemplate = applayTemplate.replace(RegExp(`#${componentName}#`, 'g'), 'this');
        }
        // applayTemplate = template.replace(RegExp(`#${innerHTMLName}#`, 'g'), applayTemplate);
        // RawSet.replaceInnerHTML(
        // applayTemplate = StringUtils.regexExecArrayReplace(this.template, RegExp(`#${innerHTMLName}#`, 'g'), applayTemplate)
        // applayTemplate = StringUtils.regexExecArrayReplace(this.template, [RegExp(`#${innerHTMLName}#`, 'g')], applayTemplate)
        applayTemplate = StringUtils.replaceSequentially((this.template ?? ''), [
          {
            regex: new RegExp(`#${innerHTMLName}#`, 'g'),
            callback: () => applayTemplate
          },
          {
            regex: new RegExp(`#${innerTEXTName}#`, 'g'),
            callback: () => applayTemplateText
          },
          {
            regex: new RegExp(`#${innerHTMLEscapedName}#`, 'g'),
            callback: () => applayTemplateEscape
          }
        ]);
        // dr-on-component-init
        // const oninit = element.getAttribute(`${EventManager.attrPrefix}on-component-init`); // dr-on-component-init
        // const oninit = element.getAttribute(RawSet.DR_ON_CREATED_CALLBACK_OPTIONNAME); // dr-on-component-init
        // if (oninit) {
        //   const script = `${renderScript}  ${oninit} `;
        //   ObjectUtils.Script.eval(script, Object.assign(obj, {
        //     __render: render
        //   }));
        // }

        const style = RawSet.generateStyleTransform(this.styles, rawSet.uuid, true);
        element.innerHTML = style + (applayTemplate ?? '');

        // 여기서 targetElement의 옷을 벗긴다.
        // console.log('---createComponentTargetElement', element);
        let data = await RawSet.drThisCreate(
          rawSet,
          element,
          `this.__domrender_components.${rawSet.uuid}`,
          '',
          !noStrip,
          obj,
          config
        );
        // const tempDiv = document.createElement("div");
        // tempDiv.appendChild(data.cloneNode(true)); // 원본 보존
        // console.log('-------------ddddddddddddd', element.innerHTML, tempDiv.innerHTML);
        // let data = await RawSet.drThisCreate(rawSet, element, `this.__domrender_components.${componentKey}`, '', false, obj, config);

        // 넘어온 innerHTML에 this가 있는걸 다시 복호화해서 제대로 작동하도록한다. 부모에서의 this면 부모껄로 작동되게
        // console.log('!!!!!@', (data && innerHTMLThisRandom) ,innerHTMLThisRandom);
        if (data && innerHTMLThisRandom) {
          const template = config.window.document.createElement('template') as HTMLTemplateElement;

          // console.log('------->', template.content);
          // 브라우저에서는 이게되는데 linkedom 에서는 안된다. 그래서 innerhtml로 처리함
          // template.content.append(data);
          // console.log('-------', template.innerHTML);
          // const d = config.window.document.createElement('div')
          // d.innerHTML='<a></a>'
          // console.log('-----XX', ElementUtils.toInnerHTML(data, {document: config.window.document}));
          // template.innerHTML = template.innerHTML.replace(RegExp(innerHTMLThisRandom, 'g'), 'this.');
            let s = ElementUtils.toInnerHTML(data, {document: config.window.document});
            template.innerHTML = s.replace(RegExp(innerHTMLThisRandom, 'g'), 'this.');;
          // console.log('ccc?', template.innerHTML);
          // template.innerHTML = '<div>zzzzzzz</div>'
          data = template.content;
        }
        // (data as any).render = render;
        return data;
      }
      // complete
    };
    return targetElement;
  }

  public static isExpression(data: string | null) {
    // const reg = /(?:[$#]\{(?:(([$#]\{)??[^$#]?[^{]*?)\}[$#]))/g;
    const reg = /[$#]\{([\s\S.]*?)\}[$#]/g;
    return reg.test(data ?? '');
  }

  public static expressionGroups(data: string | null) {
    // const reg = /(?:[$#]\{(?:(([$#]\{)??[^$#]*?)\}[$#]))/g;
    // const reg = /(?:[$#]\{(?:(([$#]\{)??[^$#]?[^{]*?)\}[$#]))/g;
    const reg = /[$#]\{([\s\S.]*?)\}[$#]/g;
    return StringUtils.regexExec(reg, data ?? '');
  }

  public static destroy(
    obj: any | undefined,
    parameter: OnDestroyRenderParams,
    config: DomRenderConfig,
    destroyOptions: (DestroyOptionType | string)[] = []
  ): void {
    // console.log('destroy destroydestroydestroydestroy', obj, parameter, config, destroyOptions);
    if (!destroyOptions.some(it => it === DestroyOptionType.NO_DESTROY)) {
      if (!destroyOptions.some(it => it === DestroyOptionType.NO_MESSENGER_DESTROY)) {
        if (config.messenger && obj) {
          config.messenger.deleteChannelFromObj(obj);
        }
      }
      // console.log('------------destroy', obj);
      if (isOnDestroyRender(obj)) {
        obj.onDestroyRender?.(parameter);
      }
    }
  }

  public findNearThis = (obj: any, rawSet: RawSet = this) => {
    const path = this.findNearThisPath(rawSet);
    if (path) {
      const optionalPath = ObjectUtils.Path.toOptionalChainPath(path);
      // console.log('ppppp-', path, optionalPath)
      return ObjectUtils.Script.evaluateReturn(optionalPath, obj);
    }
  };

  public findParentThis = (obj: any, rawSet: RawSet = this) => {
    const path = this.findParentThisPath(rawSet);
    if (path) {
      const optionalPath = ObjectUtils.Path.toOptionalChainPath(path);
      return ObjectUtils.Script.evaluateReturn(optionalPath, obj);
    }
  };

  public findNearThisPath = (rawSet: RawSet = this): string | undefined => {
    const paths = this.findThisPaths(rawSet);
    return paths[paths.length - 1];
  };

  public findParentThisPath = (rawSet: RawSet = this): string | undefined => {
    const paths = this.findThisPaths(rawSet);
    return paths[paths.length - 2];
  };

  public findThisPaths = (rawSet: RawSet = this): string[] => {
    const paths: string[] = [];
    const findPath = (rawSet: RawSet) => {
      if (rawSet && rawSet.point) {
        // jsDom에서 instranceof HTMLMetaElement가 안먹히는것같아? 간혈적으로?
        if (
          rawSet.point?.start &&
          'getAttribute' in rawSet.point.start &&
          rawSet.point.start.getAttribute('this-path')
        ) {
          paths.push(rawSet.point.start.getAttribute('this-path')!);
        }
        if (rawSet.point.parentRawSet) findPath(rawSet.point.parentRawSet);
      }
    };
    findPath(rawSet);
    paths.push('this');
    return paths.reverse();
  };

  public static getAttributeObject(element: Element, config: { script: string; obj: any; renderData?: any }) {
    if (!element) {
      return undefined;
    }
    const attribute = ElementUtils.getAttributeToObject(element);
    const normalAttribute = attribute[EventManager.normalAttrMapAttrName];
    if (normalAttribute) {
      new Map<string, NormalAttrDataType>(JSON.parse(normalAttribute)).forEach((v, k) => {
        const variablePaths = v.variablePaths;
        let targetScript = v.originalAttrValue.trim();

        //중요!! expression 하나만 존재 및 그외것들이 없을때  그자체가 값이다 그외 여러개 있으면 문자열 합치는걸로 간주한다.
          if (v.isStringTemplate) {
              variablePaths.forEach(it => {
                  let r = ObjectUtils.Path.toOptionalChainPath(it.inner);
                  targetScript = targetScript.replaceAll(it.origin, `\${${r}}`);
              });
          } else {
              let r = ObjectUtils.Path.toOptionalChainPath(variablePaths[0].inner);
              targetScript = targetScript.replaceAll(variablePaths[0].origin, r);
          }
        const cval = ObjectUtils.Script.evaluateReturn(
          { bodyScript: config.script, returnScript: v.isStringTemplate ? '`' + targetScript + '`' : targetScript },
          Object.assign(config.obj, config.renderData ? { __render: config.renderData } : undefined)
        );
        attribute[k] = cval;
      });
    }
      // console.log('attribute', attribute);
    return attribute;
  }
}
