import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { ObjectPathParser, Token, TokenType } from '../../../src/parser/path/ObjectPathParser';

describe('ObjectPathParser', () => {

  describe('Tree-based API', () => {
    test('should create parser instance and get root', () => {
      const parser = new ObjectPathParser('this.object.good');
      const root = parser.getRoot();
      assert.ok(root);
      assert.strictEqual(root.type, TokenType.ROOT);
    });

    test('should parse simple path into tree', () => {
      const parser = new ObjectPathParser('a.b.c');
      const root = parser.getRoot();
      assert.ok(root.hasChildren());
      // Should have one MemberExpression child
      const memberExpr = root.children[0];
      assert.strictEqual(memberExpr.type, TokenType.MEMBER_EXPRESSION);
    });

    test('should parse path with brackets into tree', () => {
      const parser = new ObjectPathParser('a[0].b');
      const root = parser.getRoot();
      const memberExpr = root.children[0];
      assert.strictEqual(memberExpr.type, TokenType.MEMBER_EXPRESSION);
      // Should have bracket access in children
      const hasBracket = memberExpr.children.some(c => c.type === TokenType.BRACKET_ACCESS);
      assert.ok(hasBracket);
    });

    test('should parse function calls into tree', () => {
      const parser = new ObjectPathParser('a.func()');
      const root = parser.getRoot();
      const memberExpr = root.children[0];
      const hasFunc = memberExpr.children.some(c => c.type === TokenType.FUNCTION_CALL);
      assert.ok(hasFunc);
    });

    test('should parse string literals', () => {
      const parser = new ObjectPathParser("a['key']");
      const root = parser.getRoot();
      const memberExpr = root.children[0];
      const bracket = memberExpr.children.find(c => c.type === TokenType.BRACKET_ACCESS);
      assert.ok(bracket);
      // Bracket should have string child
      const hasString = bracket!.children.some(c => c.type === TokenType.STRING);
      assert.ok(hasString);
    });

    test('should identify keywords', () => {
      const parser = new ObjectPathParser('this.value');
      const root = parser.getRoot();
      const memberExpr = root.children[0];
      const identifier = memberExpr.children[0];
      assert.strictEqual(identifier.type, TokenType.IDENTIFIER);
      assert.ok(identifier.isKeyword());
    });

    test('should walk tree', () => {
      const parser = new ObjectPathParser('a.b.c');
      const root = parser.getRoot();
      const types: TokenType[] = [];
      root.walk((token) => types.push(token.type));
      assert.ok(types.includes(TokenType.ROOT));
      assert.ok(types.includes(TokenType.MEMBER_EXPRESSION));
      assert.ok(types.includes(TokenType.IDENTIFIER));
    });

    test('should find tokens in tree', () => {
      const parser = new ObjectPathParser('a.b.c');
      const root = parser.getRoot();
      const identifier = root.find(t => t.type === TokenType.IDENTIFIER && t.value === 'b');
      assert.ok(identifier);
      assert.strictEqual(identifier!.value, 'b');
    });

    test('should findAll tokens in tree', () => {
      const parser = new ObjectPathParser('a.b.c');
      const root = parser.getRoot();
      const identifiers = root.findAll(t => t.type === TokenType.IDENTIFIER);
      assert.ok(identifiers.length >= 3);
    });
  });


  describe('toOptionalChainPath (instance method)', () => {
    test('should convert a simple dot-separated path', () => {
      const parser = new ObjectPathParser('a.b.c');
      assert.strictEqual(parser.toOptionalChainPath(), 'a?.b?.c');
    });

    test('should handle path with numeric array index', () => {
      const parser = new ObjectPathParser('a.b[0].c');
      assert.strictEqual(parser.toOptionalChainPath(), 'a?.b?.[0]?.c');
    });

    test('should handle path with quoted string key', () => {
      const parser = new ObjectPathParser("a.b['key-1'].c");
      assert.strictEqual(parser.toOptionalChainPath(), "a?.b?.['key-1']?.c");
    });

    test('should handle a single property path', () => {
      const parser = new ObjectPathParser('a');
      assert.strictEqual(parser.toOptionalChainPath(), 'a');
    });

    test('should handle an empty path', () => {
      const parser = new ObjectPathParser('');
      assert.strictEqual(parser.toOptionalChainPath(), '');
    });

    test('should handle path that already contains optional chaining', () => {
      const parser = new ObjectPathParser('a?.b.c');
      assert.strictEqual(parser.toOptionalChainPath(), 'a?.b?.c');
    });

    test('should handle path with mixed existing optional chaining', () => {
      const parser = new ObjectPathParser('a.b?.[0].c');
      assert.strictEqual(parser.toOptionalChainPath(), 'a?.b?.[0]?.c');
    });

    test('should handle complex paths', () => {
      const parser = new ObjectPathParser("a.b[0]['c-d'].e");
      assert.strictEqual(parser.toOptionalChainPath(), "a?.b?.[0]?.['c-d']?.e");
    });

    test('should not change path with only special characters inside brackets', () => {
      const parser = new ObjectPathParser("['a.b.c']");
      assert.strictEqual(parser.toOptionalChainPath(), "['a.b.c']");
    });

    test('should handle multiple brackets', () => {
      const parser = new ObjectPathParser("a[0][1].b");
      assert.strictEqual(parser.toOptionalChainPath(), "a?.[0]?.[1]?.b");
    });

    test('should handle "this" keyword', () => {
      const parser = new ObjectPathParser("this");
      assert.strictEqual(parser.toOptionalChainPath(), "this");
    });

    test('should handle "window" keyword', () => {
      const parser = new ObjectPathParser("window");
      assert.strictEqual(parser.toOptionalChainPath(), "window");
    });

    test('should handle path that is only an array index', () => {
      const parser = new ObjectPathParser("[2]");
      assert.strictEqual(parser.toOptionalChainPath(), "[2]");
    });

    test('should handle single quoted keys', () => {
      const parser = new ObjectPathParser("a.b['my-var'].c");
      assert.strictEqual(parser.toOptionalChainPath(), "a?.b?.['my-var']?.c");
    });

    test('should not process string containing an arrow function', () => {
      const parser = new ObjectPathParser("() => @thi@.searchWorlds.length=0}");
      assert.strictEqual(parser.toOptionalChainPath(), "() => @thi@.searchWorlds.length=0}");
    });

    test('should not process string containing an object literal', () => {
      const path = "{ 'dr-select-container': true }";
      const parser = new ObjectPathParser(path);
      assert.strictEqual(parser.toOptionalChainPath(), path);
    });

    test('should not modify ternary operator expressions', () => {
      const parser = new ObjectPathParser("this.selected ? 'selected' : null");
      assert.strictEqual(parser.toOptionalChainPath(), "this?.selected ? 'selected' : null");
    });

    test('should handle ternary operator with method call and array access', () => {
      const parser = new ObjectPathParser("this.isImageSelected(this.asd[0]) ? 'checked' : null");
      assert.strictEqual(parser.toOptionalChainPath(), "this?.isImageSelected?.(this?.asd?.[0]) ? 'checked' : null");
    });

    test('toOptionalChainOperator', () => {
      const parser = new ObjectPathParser('this.__domrender_components.JBthGucywhFGkkucxinSARMQXxfOdiTpTscIgVJe.value.obj.getPackagesByCategory(this.__domrender_components.JBthGucywhFGkkucxinSARMQXxfOdiTpTscIgVJe.value.obj.categories[0])');
      assert.strictEqual(parser.toOptionalChainPath(), 'this?.__domrender_components?.JBthGucywhFGkkucxinSARMQXxfOdiTpTscIgVJe?.value?.obj?.getPackagesByCategory?.(this?.__domrender_components?.JBthGucywhFGkkucxinSARMQXxfOdiTpTscIgVJe?.value?.obj?.categories?.[0])');
    });

    test('should handle ternary operator with property access', () => {
      const parser = new ObjectPathParser("this.currentImageType === 'background' ? this.selectedBackgroundImages : this.selectedObjectImages");
      assert.strictEqual(parser.toOptionalChainPath(), "this?.currentImageType === 'background' ? this?.selectedBackgroundImages : this?.selectedObjectImages");
    });

    test('should handle URL concatenation with property access', () => {
      const parser = new ObjectPathParser("'https://map.naver.com/p/smart-around/place/' + this.market.uuid");
      assert.strictEqual(parser.toOptionalChainPath(), "'https://map.naver.com/p/smart-around/place/' + this?.market?.uuid");
    });

    test('should handle URL concatenation with double quotes', () => {
      const parser = new ObjectPathParser('"https://map.naver.com/p/smart-around/place/" + this.market.uuid');
      assert.strictEqual(parser.toOptionalChainPath(), '"https://map.naver.com/p/smart-around/place/" + this?.market?.uuid');
    });
  });

  describe('removeOptionalChainOperator (instance method)', () => {
    test('should remove optional chaining from a simple path', () => {
      const parser = new ObjectPathParser('a?.b?.c');
      assert.strictEqual(parser.removeOptionalChainOperator(), 'a.b.c');
    });

    test('should handle path with array index', () => {
      const parser = new ObjectPathParser('a?.[0]?.b');
      assert.strictEqual(parser.removeOptionalChainOperator(), 'a[0].b');
    });

    test('should handle path with quoted string key', () => {
      const parser = new ObjectPathParser("a?.['key-1']?.c");
      assert.strictEqual(parser.removeOptionalChainOperator(), "a['key-1'].c");
    });

    test('should not change a path with no optional chaining', () => {
      const parser = new ObjectPathParser('a.b.c');
      assert.strictEqual(parser.removeOptionalChainOperator(), 'a.b.c');
    });

    test('should handle a single property path', () => {
      const parser = new ObjectPathParser('a');
      assert.strictEqual(parser.removeOptionalChainOperator(), 'a');
    });

    test('should handle an empty path', () => {
      const parser = new ObjectPathParser('');
      assert.strictEqual(parser.removeOptionalChainOperator(), '');
    });

    test('should handle complex paths', () => {
      const parser = new ObjectPathParser("a?.b?.[0]?.['c-d']?.e");
      assert.strictEqual(parser.removeOptionalChainOperator(), "a.b[0]['c-d'].e");
    });

    test('should handle path starting with array index', () => {
      const parser = new ObjectPathParser('[0]?.a?.b');
      assert.strictEqual(parser.removeOptionalChainOperator(), '[0].a.b');
    });

    test('should handle quoted keys with dots', () => {
      const parser = new ObjectPathParser('a?.["asdasd.ddd"]["cc.aa"]');
      assert.strictEqual(parser.removeOptionalChainOperator(), 'a["asdasd.ddd"]["cc.aa"]');
    });

    test('should handle single quoted keys', () => {
      const parser = new ObjectPathParser("a?.b?.['my-var']?.c");
      assert.strictEqual(parser.removeOptionalChainOperator(), "a.b['my-var'].c");
    });

    test('should handle parentheses in path', () => {
      const parser = new ObjectPathParser("a?.(b)?.c");
      assert.strictEqual(parser.removeOptionalChainOperator(), "a.(b).c");
    });
  });

  describe('Helper methods', () => {
    test('isFunctionScript should identify function scripts', () => {
      const parser1 = new ObjectPathParser('function myFunc() {}');
      const parser2 = new ObjectPathParser(' function myFunc() {} ');
      const parser3 = new ObjectPathParser('myFunc() {}');
      assert.strictEqual(parser1.isFunctionScript(), true);
      assert.strictEqual(parser2.isFunctionScript(), true);
      assert.strictEqual(parser3.isFunctionScript(), false);
    });

    test('isArrowFunctionScript should identify arrow function scripts', () => {
      const parser1 = new ObjectPathParser('() => {}');
      const parser2 = new ObjectPathParser(' (a, b) => a + b ');
      const parser3 = new ObjectPathParser('=> {}');
      const parser4 = new ObjectPathParser('() => a.b.c');
      const parser5 = new ObjectPathParser('a.b.c');
      assert.strictEqual(parser1.isArrowFunctionScript(), true);
      assert.strictEqual(parser2.isArrowFunctionScript(), true);
      assert.strictEqual(parser3.isArrowFunctionScript(), false);
      assert.strictEqual(parser4.isArrowFunctionScript(), true);
      assert.strictEqual(parser5.isArrowFunctionScript(), false);
    });

    test('isObjectLiteralInput should identify object literals', () => {
      const parser1 = new ObjectPathParser('{ a: 1 }');
      const parser2 = new ObjectPathParser('a.b.c');
      assert.strictEqual(parser1.isObjectLiteralInput(), true);
      assert.strictEqual(parser2.isObjectLiteralInput(), false);
    });
  });


  describe('Static methods (backward compatibility)', () => {
    test('static isFunctionScript', () => {
      assert.strictEqual(ObjectPathParser.isFunctionScript('function myFunc() {}'), true);
      assert.strictEqual(ObjectPathParser.isFunctionScript('myFunc() {}'), false);
    });

    test('static isArrowFunctionScript', () => {
      assert.strictEqual(ObjectPathParser.isArrowFunctionScript('() => {}'), true);
      assert.strictEqual(ObjectPathParser.isArrowFunctionScript('a.b.c'), false);
    });

    test('static isObjectLiteral', () => {
      assert.strictEqual(ObjectPathParser.isObjectLiteral('{ a: 1 }'), true);
      assert.strictEqual(ObjectPathParser.isObjectLiteral('a.b.c'), false);
    });

    test('static parse factory method', () => {
      const parser = ObjectPathParser.parse('a.b.c');
      assert.ok(parser instanceof ObjectPathParser);
      assert.strictEqual(parser.toOptionalChainPath(), 'a?.b?.c');
    });
  });

  describe('Token class methods', () => {
    test('Token type checks', () => {
      const token = new Token(TokenType.IDENTIFIER, 'test', 0, 4);
      assert.strictEqual(token.isIdentifier(), true);
      assert.strictEqual(token.isString(), false);
      assert.strictEqual(token.isNumber(), false);
    });

    test('Token keyword check', () => {
      const thisToken = new Token(TokenType.IDENTIFIER, 'this', 0, 4);
      const normalToken = new Token(TokenType.IDENTIFIER, 'foo', 0, 3);
      assert.strictEqual(thisToken.isKeyword(), true);
      assert.strictEqual(normalToken.isKeyword(), false);
    });

    test('Token operator checks', () => {
      const orToken = new Token(TokenType.OPERATOR, '||', 0, 2);
      const nullishToken = new Token(TokenType.OPERATOR, '??', 0, 2);
      const eqToken = new Token(TokenType.OPERATOR, '===', 0, 3);
      const plusToken = new Token(TokenType.OPERATOR, '+', 0, 1);
      
      assert.strictEqual(orToken.isLogicalOperator(), true);
      assert.strictEqual(nullishToken.isNullishOperator(), true);
      assert.strictEqual(eqToken.isComparisonOperator(), true);
      assert.strictEqual(plusToken.isArithmeticOperator(), true);
    });

    test('Token tree methods', () => {
      const parent = new Token(TokenType.MEMBER_EXPRESSION, 'a.b', 0, 3);
      const child1 = new Token(TokenType.IDENTIFIER, 'a', 0, 1);
      const child2 = new Token(TokenType.PROPERTY_ACCESS, 'b', 2, 3);
      
      parent.addChild(child1);
      parent.addChild(child2);
      
      assert.strictEqual(parent.hasChildren(), true);
      assert.strictEqual(parent.getChildren().length, 2);
      assert.strictEqual(child1.getParent(), parent);
    });
  });
});
