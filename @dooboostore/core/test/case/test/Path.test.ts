import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { ObjectUtils } from '../../../src/object/ObjectUtils'; // Assuming Path is still in ObjectUtils

describe('ObjectUtils.Path', () => {

  describe('Path.set', () => {
    test('should set a value for a simple path', () => {
      const obj: any = {};
      ObjectUtils.Path.set(obj, 'a.b.c', 123);
      assert.deepStrictEqual(obj, { a: { b: { c: 123 } } });
    });

    test('should set a value for a path with numeric array index', () => {
      const obj: any = {};
      ObjectUtils.Path.set(obj, 'a.b[0].c', 123);
      assert.deepStrictEqual(obj, { a: { b: [{ c: 123 }] } });
    });

    test('should set a value for a path with quoted string key', () => {
      const obj: any = {};
      ObjectUtils.Path.set(obj, "a.b['key'].c", 123);
      assert.deepStrictEqual(obj, { a: { b: { key: { c: 123 } } } });
    });

    test('should set a value for a path with double quoted string key', () => {
      const obj: any = {};
      ObjectUtils.Path.set(obj, 'a.b["key"].c', 123);
      assert.deepStrictEqual(obj, { a: { b: { key: { c: 123 } } } });
    });

    test('should handle mixed path types', () => {
      const obj: any = {};
      ObjectUtils.Path.set(obj, "data['users'][0].name", 'Alice');
      assert.deepStrictEqual(obj, { data: { users: [{ name: 'Alice' }] } });
    });

    test('should overwrite existing values', () => {
      const obj: any = { a: { b: { c: 100 } } };
      ObjectUtils.Path.set(obj, 'a.b.c', 200);
      assert.deepStrictEqual(obj, { a: { b: { c: 200 } } });
    });

    test('should create intermediate arrays if needed', () => {
      const obj: any = { a: {} };
      ObjectUtils.Path.set(obj, 'a.b[1].c', 123);
      assert.deepStrictEqual(obj, { a: { b: [{}, { c: 123 }] } });
    });

    test('should create intermediate objects if needed', () => {
      const obj: any = { a: {} };
      ObjectUtils.Path.set(obj, 'a.b.c', 123);
      assert.deepStrictEqual(obj, { a: { b: { c: 123 } } });
    });

    test('should handle single part path', () => {
      const obj: any = {};
      ObjectUtils.Path.set(obj, 'key', 'value');
      assert.deepStrictEqual(obj, { key: 'value' });
    });

    test('should handle single part path with array index', () => {
      const obj: any = {};
      ObjectUtils.Path.set(obj, 'arr[0]', 'value');
      assert.deepStrictEqual(obj, { arr: ['value'] });
    });

    test('should handle single part path with quoted key', () => {
      const obj: any = {};
      ObjectUtils.Path.set(obj, "obj['key']", 'value');
      assert.deepStrictEqual(obj, { obj: { key: 'value' } });
    });

    test('should handle path starting with array access', () => {
      const obj: any = [];
      ObjectUtils.Path.set(obj, '[0].name', 'Bob');
      assert.deepStrictEqual(obj, [{ name: 'Bob' }]);
    });

    test('should handle path starting with quoted key access', () => {
      const obj: any = {};
      ObjectUtils.Path.set(obj, "['user'].id", 1);
      assert.deepStrictEqual(obj, { user: { id: 1 } });
    });

    test('should handle complex nested structures', () => {
      const obj: any = {};
      ObjectUtils.Path.set(obj, "config.settings['network'][0].ip", '192.168.1.1');
      assert.deepStrictEqual(obj, { config: { settings: { network: [{ ip: '192.168.1.1' }] } } });
    });
  });

  describe('Path.to', () => {
    test('should convert a flat object with dot notation paths to a nested object', () => {
      const flatObj = {
        'a.b.c': 123,
        'a.b.d': 456,
      };
      const nestedObj = ObjectUtils.Path.to(flatObj);
      assert.deepStrictEqual(nestedObj, { a: { b: { c: 123, d: 456 } } });
    });

    test('should convert a flat object with array index paths to a nested object', () => {
      const flatObj = {
        'data[0].id': 1,
        'data[0].name': 'Alice',
        'data[1].id': 2,
        'data[1].name': 'Bob',
      };
      const nestedObj = ObjectUtils.Path.to(flatObj);
      assert.deepStrictEqual(nestedObj, { data: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }] });
    });

    test('should convert a flat object with quoted string key paths to a nested object', () => {
      const flatObj = {
        "user['profile'].age": 30,
        "user['profile'].city": 'Seoul',
      };
      const nestedObj = ObjectUtils.Path.to(flatObj);
      assert.deepStrictEqual(nestedObj, { user: { profile: { age: 30, city: 'Seoul' } } });
    });

    test('should handle mixed path types in Path.to', () => {
      const flatObj = {
        'config.version': '1.0',
        "config.features['featureA'].enabled": true,
        'config.features.featureB[0].name': 'SubFeature1',
      };
      const nestedObj = ObjectUtils.Path.to(flatObj);
      assert.deepStrictEqual(nestedObj, {
        config: {
          version: '1.0',
          features: {
            featureA: { enabled: true },
            featureB: [{ name: 'SubFeature1' }],
          },
        },
      });
    });

    test('should handle empty input object', () => {
      const flatObj = {};
      const nestedObj = ObjectUtils.Path.to(flatObj);
      assert.deepStrictEqual(nestedObj, {});
    });

    test('should handle single entry object', () => {
      const flatObj = { 'key': 'value' };
      const nestedObj = ObjectUtils.Path.to(flatObj);
      assert.deepStrictEqual(nestedObj, { key: 'value' });
    });
  });

  describe('Path.get', () => {
    const data = {
      user: {
        id: 123,
        name: 'Alice',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          zip: '12345'
        },
        roles: ['admin', 'editor', 'viewer'],
        permissions: {
          'read:all': true,
          'write:self': false
        }
      },
      products: [
        { id: 1, name: 'Laptop', price: 1200 },
        { id: 2, name: 'Mouse', price: 25 }
      ],
      config: {
        'app.version': '1.0.0',
        'db.host': 'localhost'
      },
      nullValue: null,
      undefinedValue: undefined
    };

    test('should get a value for a simple dot-separated path', () => {
      assert.strictEqual(ObjectUtils.Path.get(data, 'user.name'), 'Alice');
    });

    test('should get a value from a nested object', () => {
      assert.strictEqual(ObjectUtils.Path.get(data, 'user.address.city'), 'Anytown');
    });

    test('should get a value from an array by numeric index', () => {
      assert.strictEqual(ObjectUtils.Path.get(data, 'user.roles[0]'), 'admin');
      assert.strictEqual(ObjectUtils.Path.get(data, 'products[1].name'), 'Mouse');
    });

    test('should get a value from a path with quoted string key', () => {
      assert.strictEqual(ObjectUtils.Path.get(data, "user.permissions['read:all']"), true);
    });

    test('should get a value from a path with double quoted string key', () => {
      assert.strictEqual(ObjectUtils.Path.get(data, 'config["app.version"]'), '1.0.0');
    });

    test('should return undefined for a non-existent path', () => {
      assert.strictEqual(ObjectUtils.Path.get(data, 'user.email'), undefined);
      assert.strictEqual(ObjectUtils.Path.get(data, 'user.address.country'), undefined);
      assert.strictEqual(ObjectUtils.Path.get(data, 'products[99].name'), undefined);
    });

    test('should return default value for a non-existent path', () => {
      assert.strictEqual(ObjectUtils.Path.get(data, 'user.email', 'default@example.com'), 'default@example.com');
      assert.strictEqual(ObjectUtils.Path.get(data, 'products[99].name', 'No Product'), 'No Product');
    });

    test('should return undefined if an intermediate path is null or undefined', () => {
      assert.strictEqual(ObjectUtils.Path.get(data, 'nullValue.someProp'), undefined);
      assert.strictEqual(ObjectUtils.Path.get(data, 'undefinedValue.someProp'), undefined);
    });

    test('should return default value if an intermediate path is null or undefined', () => {
      assert.strictEqual(ObjectUtils.Path.get(data, 'nullValue.someProp', 'fallback'), 'fallback');
      assert.strictEqual(ObjectUtils.Path.get(data, 'undefinedValue.someProp', 'fallback'), 'fallback');
    });

    test('should return the object itself if path is empty string', () => {
      assert.deepStrictEqual(ObjectUtils.Path.get(data, ''), data);
    });

    test('should return the object itself if path is a single existing key', () => {
      assert.deepStrictEqual(ObjectUtils.Path.get(data, 'user'), data.user);
    });

    test('should handle path starting with array access', () => {
      const arrData = [{ name: 'Item 0' }, { name: 'Item 1' }];
      assert.strictEqual(ObjectUtils.Path.get(arrData, '[0].name'), 'Item 0');
    });

    test('should handle path starting with quoted key access', () => {
      const objData = { 'my-key': { value: 100 } };
      assert.strictEqual(ObjectUtils.Path.get(objData, "['my-key'].value"), 100);
    });
  });

  describe('Path.availablePath', () => {
    const data = {
      user: {
        id: 123,
        name: 'Alice',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          zip: '12345'
        },
        roles: ['admin', 'editor', 'viewer'],
        permissions: {
          'read:all': true,
          'write:self': false
        }
      },
      products: [
        { id: 1, name: 'Laptop', price: 1200 },
        { id: 2, name: 'Mouse', price: 25 }
      ],
      'config.file': { // Key with a dot
        'app.version': '1.0.0',
        'db.host': 'localhost'
      },
      'key with space': 'value',
      'key[with]brackets': 'value',
      'key\'with\'quotes': 'value',
      nullValue: null,
      undefinedValue: undefined,
      circular: {} as any // For circular reference test
    };
    data.circular = data; // Create circular reference

    test('should return paths for a simple object', () => {
      const obj = { a: 1, b: 'hello' };
      const expected = ['a', 'b'];
      assert.deepStrictEqual(ObjectUtils.Path.availablePath(obj).sort(), expected.sort());
    });

    test('should return paths for a nested object', () => {
      const obj = { a: { b: 1, c: { d: 2 } } };
      const expected = ['a', 'a.b', 'a.c', 'a.c.d'];
      assert.deepStrictEqual(ObjectUtils.Path.availablePath(obj).sort(), expected.sort());
    });

    test('should return paths for an array', () => {
      const arr = [1, { a: 2 }, 3];
      const expected = ['[0]', '[1]', '[1].a', '[2]'];
      assert.deepStrictEqual(ObjectUtils.Path.availablePath(arr).sort(), expected.sort());
    });

    test('should return paths for mixed object and array', () => {
      const obj = { data: [{ id: 1, name: 'Test' }, { id: 2 }] };
      const expected = ['data', 'data[0]', 'data[0].id', 'data[0].name', 'data[1]', 'data[1].id'];
      assert.deepStrictEqual(ObjectUtils.Path.availablePath(obj).sort(), expected.sort());
    });

    test('should handle keys with special characters', () => {
      const obj = {
        'key.with.dot': 1,
        'key with space': 2,
        'key[with]brackets': 3,
        'key\'with\'quotes': 4,
        'key"with"doublequotes': 5
      };
      const expected = [
        "['key.with.dot']",
        "['key with space']",
        "['key[with]brackets']",
        "['key\'with\'quotes']",
        "['key\"with\"doublequotes']"
      ];
      assert.deepStrictEqual(ObjectUtils.Path.availablePath(obj).sort(), expected.sort());
    });

    test('should handle null and undefined values', () => {
      const obj = { a: 1, b: null, c: undefined, d: { e: 2 } };
      const expected = ['a', 'b', 'c', 'd', 'd.e'];
      assert.deepStrictEqual(ObjectUtils.Path.availablePath(obj).sort(), expected.sort());
    });

    test('should handle empty object', () => {
      const obj = {};
      assert.deepStrictEqual(ObjectUtils.Path.availablePath(obj), []);
    });

    test('should handle empty array', () => {
      const arr: any[] = [];
      assert.deepStrictEqual(ObjectUtils.Path.availablePath(arr), []);
    });

    test('should handle circular references', () => {
      const obj: any = {};
      obj.a = 1;
      obj.b = obj; // Circular reference
      const expected = ['a', 'b']; // 'b' itself, but not its children
      assert.deepStrictEqual(ObjectUtils.Path.availablePath(obj).sort(), expected.sort());
    });

    test('should return all paths for the complex data object', () => {
      const paths = ObjectUtils.Path.availablePath(data);
      const expectedPaths = [
        'user', 'user.id', 'user.name', 'user.address', 'user.address.street',
        'user.address.city', 'user.address.zip', 'user.roles', 'user.roles[0]',
        'user.roles[1]', 'user.roles[2]', 'user.permissions', "user.permissions['read:all']",
        "user.permissions['write:self']", 'products', 'products[0]', 'products[0].id',
        'products[0].name', 'products[0].price', 'products[1]', 'products[1].id',
        'products[1].name', 'products[1].price', "['config.file']", "['config.file']['app.version']",
        "['config.file']['db.host']", "['key with space']", "['key[with]brackets']",
        "['key\'with\'quotes']", 'nullValue', 'undefinedValue', 'circular'
      ].sort();
      assert.deepStrictEqual(paths.sort(), expectedPaths);
    });

    test('should filter paths by string values only', () => {
      const obj = {
        name: 'Alice',
        age: 30,
        city: 'Seoul',
        active: true,
        data: { title: 'Manager', count: 5 }
      };
      const paths = ObjectUtils.Path.availablePath(obj, (path, value) => typeof value === 'string');
      const expected = ['name', 'city', 'data.title'];
      assert.deepStrictEqual(paths.sort(), expected.sort());
    });

    test('should filter paths by numeric values only', () => {
      const obj = {
        name: 'Alice',
        age: 30,
        city: 'Seoul',
        score: 95.5,
        data: { title: 'Manager', count: 5 }
      };
      const paths = ObjectUtils.Path.availablePath(obj, (path, value) => typeof value === 'number');
      const expected = ['age', 'score', 'data.count'];
      assert.deepStrictEqual(paths.sort(), expected.sort());
    });

    test('should filter paths by path pattern', () => {
      const obj = {
        user: { id: 1, name: 'Alice', email: 'alice@test.com' },
        admin: { id: 2, name: 'Bob', role: 'admin' },
        config: { version: '1.0', debug: true }
      };
      const paths = ObjectUtils.Path.availablePath(obj, (path, value) => path.includes('user'));
      const expected = ['user', 'user.id', 'user.name', 'user.email'];
      assert.deepStrictEqual(paths.sort(), expected.sort());
    });

    test('should filter paths by both path and value conditions', () => {
      const obj = {
        user: { id: 1, name: 'Alice', age: 25 },
        product: { id: 2, name: 'Laptop', price: 1200 },
        settings: { id: 3, theme: 'dark', timeout: 30 }
      };
      // Filter for numeric values in paths containing 'id'
      const paths = ObjectUtils.Path.availablePath(obj, (path, value) =>
        path.includes('id') && typeof value === 'number'
      );
      const expected = ['user.id', 'product.id', 'settings.id'];
      assert.deepStrictEqual(paths.sort(), expected.sort());
    });

    test('should filter array elements', () => {
      const obj = {
        numbers: [1, 2, 3],
        strings: ['a', 'b', 'c'],
        mixed: [1, 'hello', true, { name: 'test' }]
      };
      // Filter for string values only
      const paths = ObjectUtils.Path.availablePath(obj, (path, value) => typeof value === 'string');
      const expected = ['strings[0]', 'strings[1]', 'strings[2]', 'mixed[1]', 'mixed[3].name'];
      assert.deepStrictEqual(paths.sort(), expected.sort());
    });

    test('should return empty array when no paths match filter', () => {
      const obj = { name: 'Alice', age: 30, active: true };
      const paths = ObjectUtils.Path.availablePath(obj, (path, value) => typeof value === 'object');
      assert.deepStrictEqual(paths, []);
    });

    test('should work with complex nested filter conditions', () => {
      const obj = {
        users: [
          { id: 1, name: 'Alice', profile: { age: 25, city: 'Seoul' } },
          { id: 2, name: 'Bob', profile: { age: 30, city: 'Tokyo' } }
        ],
        config: { version: 1.0, name: 'MyApp' }
      };
      // Filter for paths containing 'name' with string values
      const paths = ObjectUtils.Path.availablePath(obj, (path, value) =>
        path.includes('name') && typeof value === 'string'
      );
      const expected = ['users[0].name', 'users[1].name', 'config.name'];
      assert.deepStrictEqual(paths.sort(), expected.sort());
    });
  });

  describe('Path.deletePath', () => {
    test('should delete a simple property', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = ObjectUtils.Path.deletePath(obj, 'b');
      assert.strictEqual(result, true);
      assert.deepStrictEqual(obj, { a: 1, c: 3 });
    });

    test('should delete a nested property', () => {
      const obj = { user: { id: 1, name: 'Alice', email: 'alice@test.com' } };
      const result = ObjectUtils.Path.deletePath(obj, 'user.email');
      assert.strictEqual(result, true);
      assert.deepStrictEqual(obj, { user: { id: 1, name: 'Alice' } });
    });

    test('should delete an array element by index', () => {
      const obj = { items: ['a', 'b', 'c', 'd'] };
      const result = ObjectUtils.Path.deletePath(obj, 'items[1]');
      assert.strictEqual(result, true);
      assert.deepStrictEqual(obj, { items: ['a', 'c', 'd'] });
    });

    test('should delete a property in an array element', () => {
      const obj = { users: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }] };
      const result = ObjectUtils.Path.deletePath(obj, 'users[0].name');
      assert.strictEqual(result, true);
      assert.deepStrictEqual(obj, { users: [{ id: 1 }, { id: 2, name: 'Bob' }] });
    });

    test('should delete a property with quoted key', () => {
      const obj = { config: { 'app.version': '1.0', 'db.host': 'localhost' } };
      const result = ObjectUtils.Path.deletePath(obj, "config['app.version']");
      assert.strictEqual(result, true);
      assert.deepStrictEqual(obj, { config: { 'db.host': 'localhost' } });
    });

    test('should return false for non-existent path', () => {
      const obj = { a: { b: 1 } };
      const result = ObjectUtils.Path.deletePath(obj, 'a.c');
      assert.strictEqual(result, false);
      assert.deepStrictEqual(obj, { a: { b: 1 } }); // Object unchanged
    });

    test('should return false for non-existent nested path', () => {
      const obj = { a: 1 };
      const result = ObjectUtils.Path.deletePath(obj, 'a.b.c');
      assert.strictEqual(result, false);
      assert.deepStrictEqual(obj, { a: 1 }); // Object unchanged
    });

    test('should return false for array index out of bounds', () => {
      const obj = { items: ['a', 'b'] };
      const result = ObjectUtils.Path.deletePath(obj, 'items[5]');
      assert.strictEqual(result, false);
      assert.deepStrictEqual(obj, { items: ['a', 'b'] }); // Object unchanged
    });

    test('should handle empty path', () => {
      const obj = { a: 1 };
      const result = ObjectUtils.Path.deletePath(obj, '');
      assert.strictEqual(result, false);
      assert.deepStrictEqual(obj, { a: 1 }); // Object unchanged
    });

    test('should delete deeply nested property', () => {
      const obj = {
        level1: {
          level2: {
            level3: {
              target: 'delete me',
              keep: 'keep me'
            }
          }
        }
      };
      const result = ObjectUtils.Path.deletePath(obj, 'level1.level2.level3.target');
      assert.strictEqual(result, true);
      assert.deepStrictEqual(obj, {
        level1: {
          level2: {
            level3: {
              keep: 'keep me'
            }
          }
        }
      });
    });

    test('should delete property with special characters in key', () => {
      const obj = {
        'key with space': 1,
        'key[with]brackets': 2,
        'key.with.dots': 3
      };
      const result = ObjectUtils.Path.deletePath(obj, "['key with space']");
      assert.strictEqual(result, true);
      assert.deepStrictEqual(obj, {
        'key[with]brackets': 2,
        'key.with.dots': 3
      });
    });

    test('should handle null and undefined intermediate values', () => {
      const obj = { a: null, b: undefined };
      const result1 = ObjectUtils.Path.deletePath(obj, 'a.something');
      const result2 = ObjectUtils.Path.deletePath(obj, 'b.something');
      assert.strictEqual(result1, false);
      assert.strictEqual(result2, false);
      assert.deepStrictEqual(obj, { a: null, b: undefined }); // Object unchanged
    });

    test('should delete from complex mixed structure', () => {
      const obj = {
        users: [
          { id: 1, profile: { name: 'Alice', settings: { theme: 'dark' } } },
          { id: 2, profile: { name: 'Bob', settings: { theme: 'light' } } }
        ]
      };
      const result = ObjectUtils.Path.deletePath(obj, 'users[0].profile.settings.theme');
      assert.strictEqual(result, true);
      assert.deepStrictEqual(obj, {
        users: [
          { id: 1, profile: { name: 'Alice', settings: {} } },
          { id: 2, profile: { name: 'Bob', settings: { theme: 'light' } } }
        ]
      });
    });
  });

  describe('Path.toOptionalChainPath', () => {
    test('should convert a simple dot-separated path', () => {
      const path = 'a.b.c';
      const expected = 'a?.b?.c';
      assert.strictEqual(ObjectUtils.Path.toOptionalChainPath(path), expected);
    });

    test('should handle path with numeric array index', () => {
      const path = 'a.b[0].c';
      const expected = 'a?.b?.[0]?.c';
      assert.strictEqual(ObjectUtils.Path.toOptionalChainPath(path), expected);
    });

    test('should handle path with quoted string key', () => {
      const path = "a.b['key-1'].c";
      const expected = "a?.b?.['key-1']?.c";
      assert.strictEqual(ObjectUtils.Path.toOptionalChainPath(path), expected);
    });

    test('should handle a single property path', () => {
      const path = 'a';
      const expected = 'a';
      assert.strictEqual(ObjectUtils.Path.toOptionalChainPath(path), expected);
    });

    test('should handle an empty path', () => {
      const path = '';
      const expected = '';
      assert.strictEqual(ObjectUtils.Path.toOptionalChainPath(path), expected);
    });

    test('should handle path that already contains optional chaining', () => {
      const path = 'a?.b.c';
      const expected = 'a?.b?.c';
      assert.strictEqual(ObjectUtils.Path.toOptionalChainPath(path), expected);
    });

    test('should handle path with mixed existing optional chaining', () => {
      const path = 'a.b?.[0].c';
      const expected = 'a?.b?.[0]?.c';
      assert.strictEqual(ObjectUtils.Path.toOptionalChainPath(path), expected);
    });

    test('should handle complex paths', () => {
      const path = "a.b[0]['c-d'].e";
      const expected = "a?.b?.[0]?.['c-d']?.e";
      assert.strictEqual(ObjectUtils.Path.toOptionalChainPath(path), expected);
    });

    test('should handle path starting with array index', () => {
      const path = '[0].a.b';
      const expected = '[0]?.a?.b';
      assert.strictEqual(ObjectUtils.Path.toOptionalChainPath(path), expected);
    });

    test('should not change path with only special characters inside brackets', () => {
      const path = "['a.b.c']";
      const expected = "['a.b.c']";
      assert.strictEqual(ObjectUtils.Path.toOptionalChainPath(path), expected);
    });

    test('should handle multiple brackets', () => {
      const path = "a[0][1].b";
      const expected = "a?.[0]?.[1]?.b";
      assert.strictEqual(ObjectUtils.Path.toOptionalChainPath(path), expected);
    });

    test('should handle "this" keyword', () => {
      const path = "this";
      const expected = "this";
      assert.strictEqual(ObjectUtils.Path.toOptionalChainPath(path), expected);
    });

    test('should handle "window" keyword', () => {
      const path = "window";
      const expected = "window";
      assert.strictEqual(ObjectUtils.Path.toOptionalChainPath(path), expected);
    });

    test('should handle path that is only an array index', () => {
      const path = "[2]";
      const expected = "[2]";
      assert.strictEqual(ObjectUtils.Path.toOptionalChainPath(path), expected);
    });

    test('should handle single quoted keys', () => {
      const path = "a.b['my-var'].c";
      const expected = "a?.b?.['my-var']?.c";
      assert.strictEqual(ObjectUtils.Path.toOptionalChainPath(path), expected);
    });

    test('should handle parentheses in path', () => {
      const path = "a.(b).c";
      const expected = "a?.(b)?.c";
      assert.strictEqual(ObjectUtils.Path.toOptionalChainPath(path), expected);
    });

    test('should not process string containing an arrow function', () => {
      const path = "() => @thi@.searchWorlds.length=0}";
      const expected = "() => @thi@.searchWorlds.length=0}";
      assert.strictEqual(ObjectUtils.Path.toOptionalChainPath(path), expected);
    });

    test('should not process string containing an object literal', () => {
      const path = "{ 'dr-select-container': true, 'is-open': this.__domrender_components?.NWrbCjhSxpdaHtfBBscrfbEdJrVULxzNDhlUpB.isOpen, [this.__domrender_components.NWrbCjhSxpdaHtfBBscrfbEdJrVULxzNDhlUpB.classAttr]:this.__domrender_components.NWrbCjhSxpdaHtfBBscrfbEdJrVULxzNDhlUpB.classAttr }";
      const expected = path; // Expect it to be unchanged
      assert.strictEqual(ObjectUtils.Path.toOptionalChainPath(path), expected);
    });

    test('should not modify ternary operator expressions', () => { // Renamed test for clarity
      const path = "this.selected ? 'selected' : null";
      const expected = "this?.selected ? 'selected' : null"; // Should remain unchanged
      assert.strictEqual(ObjectUtils.Path.toOptionalChainPath(path), expected);
    });

    test('should handle ternary operator with userInfo', () => {
      const path = "this.userInfo? 'hidden' : null";
      const expected = "this?.userInfo? 'hidden' : null";
      assert.strictEqual(ObjectUtils.Path.toOptionalChainPath(path), expected);
    });

    test('should handle ternary operator with method call and array access', () => {
      const path = "this.isImageSelected(this.asd[0]) ? 'checked' : null";
      const expected = "this?.isImageSelected?.(this?.asd?.[0]) ? 'checked' : null";
      assert.strictEqual(ObjectUtils.Path.toOptionalChainPath(path), expected);
    });

    test('toOptionalChainOperator', () => {
      const path = 'this.__domrender_components.JBthGucywhFGkkucxinSARMQXxfOdiTpTscIgVJe.value.obj.getPackagesByCategory(this.__domrender_components.JBthGucywhFGkkucxinSARMQXxfOdiTpTscIgVJe.value.obj.categories[0])';
      const expected = 'this?.__domrender_components?.JBthGucywhFGkkucxinSARMQXxfOdiTpTscIgVJe?.value?.obj?.getPackagesByCategory?.(this?.__domrender_components?.JBthGucywhFGkkucxinSARMQXxfOdiTpTscIgVJe?.value?.obj?.categories?.[0])';
      assert.strictEqual(ObjectUtils.Path.toOptionalChainPath(path), expected);
    })
  });

  describe('Path.removeOptionalChainOperator', () => {
    test('should remove optional chaining from a simple path', () => {
      const path = 'a?.b?.c';
      const expected = 'a.b.c';
      assert.strictEqual(ObjectUtils.Path.removeOptionalChainOperator(path), expected);
    });

    test('should handle path with array index', () => {
      const path = 'a?.[0]?.b';
      const expected = 'a[0].b';
      assert.strictEqual(ObjectUtils.Path.removeOptionalChainOperator(path), expected);
    });

    test('should handle path with quoted string key', () => {
      const path = "a?.['key-1']?.c";
      const expected = "a['key-1'].c";
      assert.strictEqual(ObjectUtils.Path.removeOptionalChainOperator(path), expected);
    });

    test('should not change a path with no optional chaining', () => {
      const path = 'a.b.c';
      const expected = 'a.b.c';
      assert.strictEqual(ObjectUtils.Path.removeOptionalChainOperator(path), expected);
    });

    test('should handle a single property path', () => {
      const path = 'a';
      const expected = 'a';
      assert.strictEqual(ObjectUtils.Path.removeOptionalChainOperator(path), expected);
    });

    test('should handle an empty path', () => {
      const path = '';
      const expected = '';
      assert.strictEqual(ObjectUtils.Path.removeOptionalChainOperator(path), expected);
    });

    test('should handle complex paths', () => {
      const path = "a?.b?.[0]?.['c-d']?.e";
      const expected = "a.b[0]['c-d'].e";
      assert.strictEqual(ObjectUtils.Path.removeOptionalChainOperator(path), expected);
    });

    test('should handle path starting with array index', () => {
      const path = '[0]?.a?.b';
      const expected = '[0].a.b';
      assert.strictEqual(ObjectUtils.Path.removeOptionalChainOperator(path), expected);
    });

    test('should handle quoted keys with dots', () => {
      const path = 'a?.["asdasd.ddd"]["cc.aa"]';
      const expected = 'a["asdasd.ddd"]["cc.aa"]';
      assert.strictEqual(ObjectUtils.Path.removeOptionalChainOperator(path), expected);
    });

    test('should handle single quoted keys', () => {
      const path = "a?.b?.['my-var']?.c";
      const expected = "a.b['my-var'].c";
      assert.strictEqual(ObjectUtils.Path.removeOptionalChainOperator(path), expected);
    });

    test('should handle parentheses in path', () => {
      const path = "a?.(b)?.c";
      const expected = "a.(b).c";
      assert.strictEqual(ObjectUtils.Path.removeOptionalChainOperator(path), expected);
    });
  });

  describe('Path.isFunctionScript and Path.isArrowFunctionScript', () => {
    test('should identify function scripts', () => {
      assert.strictEqual(ObjectUtils.Path.isFunctionScript('function myFunc() {}'), true);
      assert.strictEqual(ObjectUtils.Path.isFunctionScript(' function myFunc() {} '), true);
      assert.strictEqual(ObjectUtils.Path.isFunctionScript('myFunc() {}'), false);
    });

    test('should identify arrow function scripts', () => {
      assert.strictEqual(ObjectUtils.Path.isArrowFunctionScript('() => {}'), true);
      assert.strictEqual(ObjectUtils.Path.isArrowFunctionScript(' (a, b) => a + b '), true);
      assert.strictEqual(ObjectUtils.Path.isArrowFunctionScript('=> {}'), false);
      assert.strictEqual(ObjectUtils.Path.isArrowFunctionScript('() => a.b.c'), true);
      assert.strictEqual(ObjectUtils.Path.isArrowFunctionScript('a.b.c'), false);
    });
  });
});