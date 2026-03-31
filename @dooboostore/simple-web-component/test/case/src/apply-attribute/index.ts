import swcRegister, { 
  elementDefine, 
  onConnectedInnerHtml, 
  addEventListener, 
  setAttribute, 
  updateAttribute, 
  removeAttribute,
  applyAttribute,
  applyAttributeHost,
  setAttributeHost
} from '@dooboostore/simple-web-component';

swcRegister(window);

@elementDefine('apply-attribute-test', { window })
class ApplyAttributeTest extends HTMLElement {
    // 1. Universal applyAttribute
    @applyAttribute('.target', 'update')
    onUniversalAttr(val: string) {
        return { 'data-universal': val , good: new Date().toISOString()};
    }

    // 2. Convenience Shorthands
    @setAttribute('.target', 'data-info')
    onSetAttr(val: any) {
        return val;
    }

    sw = true;
    @updateAttribute('.target')
    onUpdateAttr(status: string) {
        this.sw = !this.sw;
        return {
            'data-status': status,
            'aria-label': (el: HTMLElement) => `Target with status ${status}`,
            'title': status === 'active' ? 'Active Target' : null,
            'sw': this.sw ? 'enabled' : null
        };

    }

    @removeAttribute('.target')
    onRemoveAttr(props: string[]) {
        return props;
    }

    // 3. Host Decorators
    @setAttributeHost('data-host-info')
    onSetHostAttr(val: string) { return val; }

    @applyAttributeHost('update')
    onApplyHostAttr() {
        return { 'role': 'application', 'aria-hidden': 'false' };
    }

    @addEventListener('button', 'click', {delegate: true})
    onClick(e: Event) {
        const id = (e.target as HTMLElement).id;
        if (id === 'btn-universal') this.onUniversalAttr('SWC-POWER');
        if (id === 'btn-set') this.onSetAttr('Hello SWC');
        if (id === 'btn-update') this.onUpdateAttr('active');
        if (id === 'btn-remove') this.onRemoveAttr(['data-info', 'data-status', 'data-universal']);
        if (id === 'btn-host') {
            this.onSetHostAttr('host-meta');
            this.onApplyHostAttr();
        }
    }

    @onConnectedInnerHtml({useShadow: true})
    render() {
        return `
            <style>
                .target { padding: 20px; border: 1px solid #ccc; margin: 10px 0; transition: 0.3s; }
                .target[data-status="active"] { border-color: green; background: #e8f5e9; }
                .target[data-universal] { border-style: dashed; border-width: 3px; }
            </style>
            <div>
                <h3>@applyAttribute (setAttribute, updateAttribute, removeAttribute) Test</h3>
                <div class="target">Target Element (Check attributes in devtools)</div>
                <hr>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button id="btn-universal">applyAttribute (Universal Update)</button>
                    <button id="btn-set">setAttribute data-info</button>
                    <button id="btn-update">updateAttribute (Status: active)</button>
                    <button id="btn-remove">removeAttribute all</button>
                    <button id="btn-host">Host Attribute Test</button>
                </div>
            </div>
        `;
    }
}
