import swcRegister, { 
  elementDefine, 
  onConnectedInnerHtml, 
  addEventListener, 
  setStyle, 
  updateStyle, 
  updateStyleHost,
  applyStyle,
  applyStyleHost
} from '@dooboostore/simple-web-component';

swcRegister(window);

@elementDefine('apply-style-test', { window })
class ApplyStyleTest extends HTMLElement {
    // 1. Universal applyStyle
    @applyStyle('.target', 'set')
    onUniversalStyle(color: string) {
        return `color: white; background: ${color}; padding: 15px; border-radius: 8px;`;
    }

    // 2. Convenience Shorthands
    @setStyle('.target')
    onSetStyle(color: string) {
        return `color: ${color}; border: 2px solid ${color}; padding: 10px;`;
    }

    @updateStyle('.box')
    onUpdateStyle(size: number) {
        return {
            'width': `${size}px`,
            'height': `${size}px`,
            'background-color': (el: HTMLElement) => size > 100 ? 'red' : 'green'
        };
    }

    // 3. Host Decorators
    @updateStyleHost()
    onUpdateHost(opacity: number) {
        return {
            'opacity': opacity,
            'display': 'block',
            'border': '1px solid black'
        };
    }

    @applyStyleHost('update')
    onApplyHostStyle() {
        return { 'box-shadow': '0 0 20px rgba(0,0,0,0.3)' };
    }

    @addEventListener('button', 'click', {delegate: true})
    onClick(e: Event) {
        const id = (e.target as HTMLElement).id;
        if (id === 'btn-universal') this.onUniversalStyle('purple');
        if (id === 'btn-set-red') this.onSetStyle('red');
        if (id === 'btn-grow') this.onUpdateStyle(150);
        if (id === 'btn-shrink') this.onUpdateStyle(50);
        if (id === 'btn-host') {
            this.onUpdateHost(0.5);
            this.onApplyHostStyle();
        }
    }

    @onConnectedInnerHtml({useShadow: true})
    render() {
        return `
            <style>
                .target { margin: 15px 0; transition: 0.3s; }
                .box { transition: all 0.3s; display: flex; align-items: center; justify-content: center; color: white; margin: 15px 0; background: grey; }
            </style>
            <div>
                <h3>@applyStyle / @updateStyle / @setStyle Test</h3>
                <div class="target">Target Element for Styles</div>
                <div class="box" style="width: 100px; height: 100px;">BOX</div>
                <hr>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button id="btn-universal">applyStyle (Universal Set Purple)</button>
                    <button id="btn-set-red">setStyle Red</button>
                    <button id="btn-grow">Grow (150px)</button>
                    <button id="btn-shrink">Shrink (50px)</button>
                    <button id="btn-host">Host Style Test</button>
                </div>
            </div>
        `;
    }
}
