import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DomParser } from '@dooboostore/dom-parser';

console.log('🚀 Input sanitization + constraint validation Tests Starting...');

// Ground truth: Chromium (measured matrices) — happy-dom#2598 classes.
describe('input value sanitization (matches Chromium)', () => {
    const doc = () => new DomParser('<html><body></body></html>').document as any;
    const mk = (attrs: Record<string, string>) => {
        const el = doc().createElement('input');
        for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
        return el;
    };

    test('defaults and strict numeric parsing', () => {
        assert.equal(mk({ type: 'range' }).value, '50', 'range default');
        assert.equal(mk({ type: 'color' }).value, '#000000', 'color default');
        assert.equal(mk({ type: 'number', value: 'abc' }).value, '', 'number garbage');
        assert.equal(mk({ type: 'number', value: '12:30' }).value, '', 'number with colon');
        assert.equal(mk({ type: 'number', value: ' 12 ' }).value, '', 'number with spaces');
        assert.equal(mk({ type: 'number', value: '12' }).value, '12');
        assert.equal(mk({ type: 'number', value: '-1.5e3' }).value, '-1.5e3');
    });

    test('date/time validation', () => {
        assert.equal(mk({ type: 'date', value: '2026-13-45' }).value, '', 'bad date');
        assert.equal(mk({ type: 'date', value: '2026-02-30' }).value, '', 'Feb 30 invalid');
        assert.equal(mk({ type: 'date', value: '2026-02-28' }).value, '2026-02-28');
        assert.equal(mk({ type: 'time', value: '25:00' }).value, '', 'bad time');
        assert.equal(mk({ type: 'time', value: '23:59' }).value, '23:59');
        assert.equal(mk({ type: 'time', value: '23:59:59' }).value, '23:59:59');
    });

    test('email strips whitespace; color accepts named colors; range clamps', () => {
        assert.equal(mk({ type: 'email', value: ' a@b.c ' }).value, 'a@b.c');
        assert.equal(mk({ type: 'color', value: 'red' }).value, '#ff0000');
        assert.equal(mk({ type: 'color', value: 'notacolor' }).value, '#000000');
        assert.equal(mk({ type: 'range', value: '999' }).value, '100');
        assert.equal(mk({ type: 'range', value: '-5' }).value, '0');
    });

    test('valueAsNumber', () => {
        assert.equal(mk({ type: 'number', value: '12' }).valueAsNumber, 12);
        assert.ok(Number.isNaN(mk({ type: 'number', value: 'abc' }).valueAsNumber));
        assert.ok(Number.isNaN(mk({ type: 'text', value: '12' }).valueAsNumber));
    });
});

describe('constraint validation (matches Chromium)', () => {
    const page = (html: string) => new DomParser(`<html><body>${html}</body></html>`).document as any;
    const probe = (html: string) => {
        const d = page(html);
        const el = d.querySelector('input,button');
        return [el.willValidate, el.validity.valueMissing, el.checkValidity()];
    };

    test('barred controls and valueMissing', () => {
        assert.deepEqual(probe('<input required>'), [true, true, false], 'plain required');
        assert.deepEqual(probe('<input required disabled>'), [false, false, true], 'disabled barred');
        assert.deepEqual(probe('<input required readonly>'), [false, false, true], 'readonly barred');
        assert.deepEqual(probe('<input type="hidden" required>'), [false, false, true], 'hidden barred');
        assert.deepEqual(probe('<button type="button" required>'), [false, false, true], 'button type=button');
        assert.deepEqual(probe('<button type="submit">'), [true, false, true], 'button type=submit');
        assert.deepEqual(probe('<fieldset disabled><input required></fieldset>'), [false, false, true], 'fieldset-disabled barred (valueMissing false)');
        // Chromium quirk: datalist descendant keeps valueMissing true while willValidate is false.
        assert.deepEqual(probe('<datalist><input required></datalist>'), [false, true, true], 'datalist quirk');
    });

    test('invalid pattern is ignored, not thrown', () => {
        const d = page('<input pattern="(abc" required value="x">');
        const el = d.querySelector('input');
        assert.equal(el.validity.patternMismatch, false);
        assert.equal(el.checkValidity(), true);
    });

    test('valid pattern produces patternMismatch and blocks validity', () => {
        const d = page('<input pattern="[0-9]+" value="abc">');
        const el = d.querySelector('input');
        assert.equal(el.validity.patternMismatch, true);
        assert.equal(el.checkValidity(), false);
    });
});
