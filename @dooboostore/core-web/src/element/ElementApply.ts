import {isDefined, ValidUtils} from "@dooboostore/core";

type HtmlTextEaTarget = { nodeType: 'comment', type: 'html' | 'text', start: Comment, end: Comment, script: string, variables: string[] };
type TargetType = 'html' | 'text' | 'attribute' | 'event';
type AttributeEaTargetType = { type: 'attribute' | 'property' | 'event', script: string | null, name: string, variables: string[] };
type AttributeEaTarget = { nodeType: 'element', node: Element, types: AttributeEaTargetType[] };

type EaTarget = HtmlTextEaTarget | AttributeEaTarget;

export class ElementApply {
  private id: string;
  private el: Element;
  private window: WindowProxy & typeof globalThis;
  private document: Document;
  private variableWrap: { start: string; end: string };

  constructor(el: Element, config?: { id?: string, variableWrap?: { start: string, end: string } }) {
    this.el = el;
    this.window = this.el.ownerDocument.defaultView;
    this.document = this.el.ownerDocument;
    this.id = config?.id ?? el.id;
    this.variableWrap = config?.variableWrap ?? {start: '@', end: '@'};
  }

  stripWrap(script?: string | null): string {
    const start = this.variableWrap.start;
    const end = this.variableWrap.end;
    if (script) {
      // or  /@([^@]+?)@/g
      return script.replace(/@(.+?)@/g, (_, v) => v)
    } else {
      return '';
    }

  }

  findVariables(script?: string | null): string[] {
    script = script ?? '';
    const start = this.variableWrap.start;
    const end = this.variableWrap.end;
    const variables: string[] = [];
    const regex = new RegExp(`${start}(\.+?)${end}`, 'g');
    let match;
    while ((match = regex.exec(script)) !== null) {
      variables.push(match[1]);
    }
    return variables;
  }


  getTarget(node: Node, id: string): EaTarget | undefined {
    if (
      node.nodeType === this.window.Node.COMMENT_NODE ||
      (node as Comment).data?.trim()?.startsWith(`ea:${this.id}:start:html`) ||
      (node as Comment).data?.trim()?.startsWith(`ea:${this.id}:start:text`)
    ) {
      const fullStr = (node as Comment).data?.trim();
      let [prefix, ...rest] = fullStr?.split(' ') ?? [];
      prefix = prefix.trim();
      const script = rest.join(' ');
      const [eaPrefix, eaId, startEnd, type] = prefix?.split(':') ?? [];

      const endPrefix = `${eaPrefix}:${eaId}:end:${type}`;
      let next = node.nextSibling;
      while (next) {
        if (next.nodeType === Node.COMMENT_NODE && (next as Comment).data?.trim()?.startsWith(endPrefix)) {
          return {nodeType: 'comment', type: type as 'html' | 'text', start: node as Comment, end: next as Comment, script: script ?? '', variables: this.findVariables(script)};
        }
        next = next.nextSibling;
      }


    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const aa = (node as Element).getAttributeNames().filter(name => {
        return name.startsWith(`ea:${id}:attribute:`) || name.startsWith(`ea:${id}:event:`) || name.startsWith(`ea:${id}:property:`);
      });
      const element = node as Element;
      const types = aa.map(attrName => {
        const [eaPrefix, eaId, type, name] = attrName?.split(':') ?? [];
        if (eaPrefix === 'ea' && eaId === id && (type === 'attribute' || type === 'event' || type === 'property') && name) {
          const script = element.getAttribute(attrName);
          const a: AttributeEaTargetType = {
            type,
            name,
            script: script,
            variables: this.findVariables(script)
          }
          return a;
        }
      }).filter(ValidUtils.isDefined);


      if (types?.length > 0) {
        const a: AttributeEaTarget = {
          nodeType: 'element',
          node: element,
          types
        }
        return a;
      }
    }
  }


  findAllTarget(): (EaTarget)[] {
    const targetRoots: Node[] = [this.el];
    if (this.el.shadowRoot) {
      targetRoots.push(this.el.shadowRoot);
    }
    const targets: EaTarget[] = [];
    targetRoots.forEach(el => {
      const walker = this.document.createTreeWalker(el, this.window.NodeFilter.SHOW_ELEMENT | this.window.NodeFilter.SHOW_COMMENT, {
        acceptNode: (node) => {
          const target = this.getTarget(node, this.id);
          if (target) {
            targets.push(target);
            return this.window.NodeFilter.FILTER_ACCEPT;
          } else {
            return this.window.NodeFilter.FILTER_SKIP;
          }
        }
      });
      // 한바꾸 돌려준다 그래야지 진행되니깐 walker
      while (walker.nextNode()) {
      }
    })
    return targets;
  }


  replaceChildren(target: HtmlTextEaTarget, data: string) {
    let next = target.start.nextSibling;
    while (next && next !== target.end) {
      next.remove();
      next = target.start.nextSibling;
    }
    if (target.type === 'html') {
      const t = this.document.createElement('template');
      t.innerHTML = data;
      const content = t.content;
      target.start.parentNode?.insertBefore(content, target.end);
    } else if (target.type === 'text') {
      const content = this.document.createTextNode(data);
      target.start.parentNode?.insertBefore(content, target.end);
    }
  }


  apply(config?: {
    targetVariableName?: string,
    exclude?: {
      html?: boolean,
      text?: boolean,
      attribute?: boolean,
      event?: boolean,
      property?: boolean,
    },
    target?: 'noInitialized', context?: { [key: string]: any }, bind?: any,
  }) {
    const element = this.el;
    const id = this.id;

    const targets = this.findAllTarget();


    for (let it of targets) {
      const firstNode = (it.nodeType === 'comment' ? it.start : it.node) as Node & { __ea_initialized?: boolean };
      if (config?.target === 'noInitialized' && firstNode.__ea_initialized) {
        continue;
      } else if (!firstNode.__ea_initialized) {
        firstNode.__ea_initialized = true;
      }
      const variables = new Set<string>();
      if (it.nodeType === 'comment') {
        it.variables.forEach(v => variables.add(v));
      } else {
        it.types.forEach(type => {
          type.variables.forEach(v => variables.add(v));
        })
      }


      const context = new Proxy(config?.context ?? {}, {
        get(target, key) {
          // @ts-ignore
          const value = target[key]
          return typeof value === 'function'
            ? value.bind(config?.bind ?? target)
            : value
        }
      })

      if (!config?.targetVariableName || (config?.targetVariableName && variables.has(config?.targetVariableName))) {
        if (it.nodeType === 'comment') {
          const data: Function = (new Function('ctx', `
                  with(ctx) {
                    return function(){
                      return (${this.stripWrap(it.script)});
                    }
                  }
              `)(context)).bind(it.start);
          // const data = new Function('ctx', `with(ctx) { return (${this.stripWrap(it.script)}) }`)(context);
          if (config?.exclude?.html && it.type === 'html') continue;
          if (config?.exclude?.text && it.type === 'text') continue;
          this.replaceChildren(it, data());

        } else if (it.nodeType === 'element') {
          for (const tit of it.types) {
            if (!config?.targetVariableName || (config?.targetVariableName && tit.variables.find(v => v === config?.targetVariableName))) {
              const data: Function = (new Function('ctx', `
                  with(ctx) {
                    return function(event){
                      return (${this.stripWrap(tit.script)});
                    }
                  }
              `)(context)).bind(it.node);

              // if (typeof data === 'function') {
              //   data = data.bind(it.node);
              // }

              console.log('------------------->',it, tit)
              if (tit.type === 'attribute' && !config?.exclude?.attribute) {
                it.node.setAttribute(tit.name, data());
              } else if (tit.type === 'property' && !config?.exclude?.property) {
                it.node[tit.name] = data();
              } else if (tit.type === 'event' && !config?.exclude?.event) {
                if (it.node[`__ea_event_${tit.name}-callback`]) {
                  it.node.removeEventListener(tit.name, it.node[`__ea_event_${tit.name}-callback`]);
                }
                if (data) {

                  it.node[`__ea_event_${tit.name}-callback`] = data;
                  it.node.addEventListener(tit.name, data as any);
                }
              }
            }
          }

        }
      }
    }
  }

  removeAllEventListener() {
    const m = this.findAllTarget().filter(it => it.nodeType === 'element').flatMap(it => it.types.map(sit => ({...sit, node: it.node})).filter(it => it.type === 'event'));
    m.forEach(tit => {
      if (tit.node[`__ea_event_${tit.name}-callback`]) {
        tit.node.removeEventListener(tit.name, tit.node[`__ea_event_${tit.name}-callback`]);
      }
    })
  }

  static htmlDataSet(id: string, script: string) {
    return {start: `ea:${id}:start:html ${script} `, end: `ea:${id}:end:html `}
  }

  static html(id: string, script: string) {
    const s = ElementApply.htmlDataSet(id, script);
    return `<!--${s.start}--><!--${s.end}-->`
  }

  static textDataSet(id: string, script: string) {
    return {start: `ea:${id}:start:text ${script} `, end: `ea:${id}:end:text `}
  }

  static text(id: string, script: string) {
    const s = ElementApply.textDataSet(id, script);
    return `<!--${s.start}--><!--${s.end}-->`
  }

  static attribute(id: string, name: string, script: string) {
    return `ea:${id}:attribute:${name}="${script}"`
  }

  static event(id: string, name: string, script: string) {
    return `ea:${id}:event:${name}="${script}"`
  }

  static property(id: string, name: string, script: string) {
    return `ea:${id}:property:${name}="${script}"`
  }

  static attributeName(id: string, name: string) {
    return `ea:${id}:attribute:${name}`
  }

  static eventName(id: string, name: string) {
    return `ea:${id}:event:${name}`
  }

  static propertyName(id: string, name: string) {
    return `ea:${id}:property:${name}`
  }


  /**
   <div>
   <!-- ea-dddd-start-html
   this.asd + this.zzz;
   ddddddddddddddddasdasd
   asdasdasd
   -->
   <!-- ea-dddd-end-html -->

   <div ea-dddd-attribute-value="ddddddddd @this@.zz+this.gg"   ea-dddd-event-click="wwww">
   asdasd
   </div>
   </div>
   */
}
