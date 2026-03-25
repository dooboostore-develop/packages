import { elementDefine, innerHtml, changedAttribute, setAttribute, addEventListener, query, HostSet } from '@dooboostore/simple-web-component';

@elementDefine({ name: 'load-test-container' })
class LoadTestContainer extends HTMLElement {
  parentCount = 0;

  @query('#parent-display')
  displayEl?: HTMLElement;

  @changedAttribute('parent-count')
  onParentCountChange(newVal: any) {
    this.parentCount = Number(newVal);
    if (this.displayEl) this.displayEl.textContent = String(this.parentCount);
  }

  @setAttribute('parent-count')
  incParent() {
    return this.parentCount + 1;
  }

  @innerHtml({ useShadow: true })
  render() {
    return `
            <div style="border: 3px double #1a73e8; padding: 20px; border-radius: 10px; background: #e8f0fe;">
                <h2>Parent Container</h2>
                <p>Parent Counter: <strong id="parent-display">${this.parentCount}</strong></p>
                <div id="item-slot-container" style="margin-top: 10px; padding: 10px; border: 1px solid #aaa; background: white; min-height: 100px;">
                    <slot></slot>
                </div>
            </div>
        `;
  }
}

@elementDefine({ name: 'load-test-item' })
class LoadTestItem extends HTMLElement {
  count = 0;
  titleStr = '';

  @query('.count-val')
  countValEl?: HTMLElement;

  @query('.title-val')
  titleValEl?: HTMLElement;

  @changedAttribute('count')
  onCountChange(newVal: any) {
    this.count = Number(newVal);
    if (this.countValEl) this.countValEl.textContent = String(this.count);
  }

  @changedAttribute('title')
  onTitleChange(newVal: any) {
    this.titleStr = newVal || '';
    if (this.titleValEl) this.titleValEl.textContent = this.titleStr;
  }

  @setAttribute('count')
  updateCount(val: number) {
    return val;
  }

  @addEventListener('.inc-own-btn', 'click')
  handleInc() {
    this.updateCount(this.count + 1);
  }

  @addEventListener('.inc-parent-from-child-btn', 'click')
  handleIncParent(event: Event, { $appHost }: HostSet) {
    if ($appHost && typeof ($appHost as any).incParent === 'function') {
      ($appHost as any).incParent();
    } else {
      // Fallback if no appHost found (static tests, etc.)
      const parent = document.getElementById('main-container') as any;
      if (parent && typeof parent.incParent === 'function') parent.incParent();
    }
  }

  @innerHtml({ useShadow: true })
  render() {
    return `
            <div style="padding: 10px; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 15px;">
                <span class="title-val" style="font-weight: bold; min-width: 120px;">${this.titleStr}</span>
                <span style="color: #555;">Own: <span class="count-val">${this.count}</span></span>
                <button class="inc-own-btn">Inc Own</button>
                <button class="inc-parent-from-child-btn" style="font-size: 0.8em;">Inc Parent (via ID)</button>
            </div>
        `;
  }
}

// --- Benchmark Logic ---
const resultDisplay = document.getElementById('result')!;

function measurePerformance(count: number) {
  const mainContainer = document.getElementById('main-container');
  if (!mainContainer) return;

  resultDisplay.textContent = `Adding ${count} rows...`;

  setTimeout(() => {
    const start = performance.now();
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const el = document.createElement('load-test-item');
      el.setAttribute('title', `Item #${i + 1}`);
      el.setAttribute('count', '0');
      fragment.appendChild(el);
    }
    mainContainer.appendChild(fragment);
    const end = performance.now();
    resultDisplay.textContent = `Time to append ${count} rows: ${(end - start).toFixed(2)} ms`;
  }, 10);
}

document.getElementById('add-1-btn')?.addEventListener('click', () => measurePerformance(1));
document.getElementById('add-100-btn')?.addEventListener('click', () => measurePerformance(100));
document.getElementById('add-1000-btn')?.addEventListener('click', () => measurePerformance(1000));

document.getElementById('inc-parent-btn')?.addEventListener('click', () => {
  const mainContainer = document.getElementById('main-container') as any;
  if (mainContainer) mainContainer.incParent();
});

document.getElementById('clear-btn')?.addEventListener('click', () => {
  const mainContainer = document.getElementById('main-container');
  if (!mainContainer) return;
  mainContainer.innerHTML = '';
  resultDisplay.textContent = 'Cleared all items.';
});
