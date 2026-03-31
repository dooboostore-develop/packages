import swcRegister, { 
  elementDefine, 
  onConnectedInnerHtml, 
  addEventListener, 
  setClass, 
  updateClass, 
  toggleClass, 
  setClassHost,
  updateClassHost,
  applyClass,
  applyClassHost
} from '@dooboostore/simple-web-component';

swcRegister(window);

@elementDefine('apply-class-test', { window })
class ApplyClassTest extends HTMLElement {
    // 1. Universal applyClass (Using separate target)
    @applyClass('#universal-target', 'update')
    onUniversalClass(isActive: boolean) {
        return { 'universal-active': isActive };
    }

    // 2. setClass (Replace Strategy - This is DESTRUCTIVE!)
    @setClass('#set-target')
    onSetClass(name: string) {
        return name;
    }

    // 3. updateClass (Merge Strategy - SAFE for multiple decorators)
    @updateClass('.item')
    onUpdateClass(id: string) {
        return {
            'active': (el: HTMLElement) => el.id === id,
            'highlight': (el: HTMLElement) => el.id === 'item1'
        }
    }

    // 4. toggleClass
    @toggleClass('#toggle-target')
    onToggleClass(name: string) {
        return name;
    }

    // 5. Host Decorators (Comparing Set vs Update)
    @setClassHost()
    onSetHostClass(name: string) {
        return name;
    }

    @updateClassHost()
    onUpdateHostClass(isActive: boolean) {
        return { 'host-merged': isActive };
    }

    private sw = true;

    @addEventListener('button', 'click', {delegate: true})
    async onClick(e: Event) {
        const id = (e.target as HTMLElement).id;
        if (id === 'btn-universal') await this.onUniversalClass(this.sw);
        if (id === 'btn-set') await this.onSetClass('new-exclusive-class');
        if (id === 'btn-update1') await this.onUpdateClass('item1');
        if (id === 'btn-update2') await this.onUpdateClass('item2');
        if (id === 'btn-toggle') await this.onToggleClass('toggled-state');
        
        // Host Test
        if (id === 'btn-host-set') await this.onSetHostClass('host-exclusive');
        if (id === 'btn-host-update') await this.onUpdateHostClass(this.sw);
        
        this.sw = !this.sw;
    }

    @onConnectedInnerHtml({useShadow: true})
    render() {
        return `
            <style>
                :host { display: block; padding: 20px; border: 1px solid #ccc; transition: 0.3s; }
                :host(.host-exclusive) { border: 5px solid red; }
                :host(.host-merged) { background: #E8F5E9; }

                .active { color: #FF385C; font-weight: 850; }
                .highlight { background: #FFF9C4; }
                .new-exclusive-class { background: #000; color: #fff; padding: 10px; border-radius: 8px; }
                .universal-active { outline: 3px solid #4CAF50; }
                .toggled-state { opacity: 0.5; transform: scale(0.95); }
                
                .test-section { margin-bottom: 24px; padding: 15px; border: 1px solid #eee; border-radius: 8px; }
                .target-box { padding: 15px; margin: 10px 0; border: 1px dashed #999; background: #fafafa; min-height: 40px; transition: 0.2s; }
                .item { padding: 8px; margin: 4px; border: 1px solid #ddd; border-radius: 4px; display: inline-block; }
                
                h2 { margin-top: 0; color: #333; }
                h4 { margin: 0 0 10px 0; color: #666; font-size: 14px; }
                .warning { color: #d32f2f; font-size: 12px; font-weight: bold; }
                .info { color: #1976d2; font-size: 12px; }
            </style>
            <div>
                <h2>Apply Class Strategies Test</h2>
                
                <div class="test-section">
                    <h4>1. setClass <span class="warning">(Replace Strategy - Overwrites EVERYTHING)</span></h4>
                    <div id="set-target" class="target-box original-class">I have 'original-class'</div>
                    <button id="btn-set">Run setClass</button>
                    <p class="info">* Notice 'original-class' and dashed border disappear.</p>
                </div>

                <div class="test-section">
                    <h4>2. updateClass <span class="info">(Merge Strategy - Safe for multiple decorators)</span></h4>
                    <div id="item1" class="item">Item 1</div>
                    <div id="item2" class="item">Item 2</div>
                    <div style="margin-top: 10px;">
                        <button id="btn-update1">Activate Item 1</button>
                        <button id="btn-update2">Activate Item 2</button>
                    </div>
                </div>

                <div class="test-section">
                    <h4>3. toggleClass / applyClass</h4>
                    <div id="universal-target" class="target-box">Universal Target</div>
                    <div id="toggle-target" class="target-box">Toggle Target</div>
                    <button id="btn-universal">Toggle Universal</button>
                    <button id="btn-toggle">Toggle Class</button>
                </div>

                <div class="test-section">
                    <h4>4. Host Decorators Comparison</h4>
                    <div style="display: flex; gap: 8px;">
                        <button id="btn-host-set">setClassHost (Exclusive)</button>
                        <button id="btn-host-update">updateClassHost (Merge)</button>
                    </div>
                </div>
            </div>
        `;
    }
}
