/**
 * SSR용 최소 FormData 구현 (dom-parser 전용).
 * - new FormData(formElement): form 하위 input/select/textarea/button 수집
 *   (disabled 제외, checkbox/radio는 checked만, nameless 제외)
 * - entries()/get()/has()/append() 지원 — Sim*Form.formData() 용도
 * - 브라우저 네이티브와 동일 API가 아님. SSR 폴백 전용.
 */
export class FormDataBase {
  private readonly fields: [string, string][] = [];

  constructor(form?: any) {
    if (!form) return;
    let controls: any[] = [];
    try {
      const list = form.querySelectorAll
        ? form.querySelectorAll('input,select,textarea,button')
        : [];
      controls = Array.isArray(list) ? list : Array.from(list ?? []);
    } catch {
      return;
    }
    for (const el of controls) {
      try {
        const name = el?.name ?? el?.getAttribute?.('name');
        if (!name || el?.disabled) continue;
        const tag = String(el?.tagName ?? '').toLowerCase();
        const type = String(el?.type ?? 'text').toLowerCase();
        if ((type === 'checkbox' || type === 'radio') && !el.checked) continue;
        if ((type === 'submit' || type === 'button' || type === 'reset') && tag === 'button' && !el.value) continue;
        const value = el?.value;
        if (value == null) continue;
        this.fields.push([String(name), String(value)]);
      } catch {
        // 개별 컨트롤 오류 무시
      }
    }
  }

  append(name: string, value: string): void {
    this.fields.push([String(name), String(value)]);
  }

  get(name: string): string | null {
    const f = this.fields.find(([k]) => k === name);
    return f ? f[1] : null;
  }

  has(name: string): boolean {
    return this.fields.some(([k]) => k === name);
  }

  *entries(): IterableIterator<[string, string]> {
    for (const f of this.fields) yield f;
  }

  *[Symbol.iterator](): IterableIterator<[string, string]> {
    yield* this.entries();
  }
}
