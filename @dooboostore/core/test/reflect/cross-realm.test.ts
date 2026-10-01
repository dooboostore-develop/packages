import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert';
import vm from 'node:vm';
import { ReflectUtils } from '../../src/reflect/ReflectUtils.ts';

// 회귀: 다른 realm(iframe window 등)의 클래스를 상속하면 그 realm 의 Object 로 끝나 findMetadata/findAllMetadata 가 무한 루프였다
test('findMetadata / findAllMetadata stop on classes from another realm', () => {
  const ForeignBase = vm.runInNewContext('(class ForeignBase {})');
  class Child extends ForeignBase {}
  const KEY = Symbol('k');
  Reflect.defineMetadata(KEY, 'child', Child);
  assert.deepStrictEqual(ReflectUtils.findAllMetadata(KEY, Child), ['child']);
  assert.strictEqual(ReflectUtils.findMetadata(KEY, Child), 'child');
  assert.strictEqual(ReflectUtils.findMetadata(Symbol('none'), new Child()), undefined);
});
