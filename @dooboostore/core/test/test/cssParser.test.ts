import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { CssParser, StyleRule, AtRule, isStyleRule, isAtRule, CssRule, CssContentItem } from '@dooboostore/core/parser/css/CssParser';

describe('CSSParser', () => {

    describe('Basic Parsing', () => {
        test('should parse a simple style rule', () => {
            const parser = new CssParser('body { color: red; font-size: 16px; }');
            assert.strictEqual(parser.rules.length, 1);

            const rule = parser.rules[0];
            assert(rule instanceof StyleRule, 'Rule should be an instance of StyleRule');
            assert.strictEqual(rule.selector, 'body');
            assert.deepStrictEqual(rule.declarations, { color: 'red', 'font-size': '16px' });
            assert.strictEqual(rule.children.length, 0);
        });

        test('should parse multiple style rules', () => {
            const parser = new CssParser(`
                h1 { color: blue; }
                p { margin: 10px; }
                .container { display: flex; }
            `);
            assert.strictEqual(parser.rules.length, 3);

            assert.strictEqual((parser.rules[0] as StyleRule).selector, 'h1');
            assert.strictEqual((parser.rules[1] as StyleRule).selector, 'p');
            assert.strictEqual((parser.rules[2] as StyleRule).selector, '.container');
        });

        test('should parse at-rules', () => {
            const parser = new CssParser('@import "styles.css";');
            assert.strictEqual(parser.rules.length, 1);

            const rule = parser.rules[0];
            assert(rule instanceof AtRule, 'Rule should be an instance of AtRule');
            assert.strictEqual(rule.name, 'import');
            assert.strictEqual(rule.condition, '"styles.css"');
        });

        test('should parse media queries with nested rules', () => {
            const parser = new CssParser(`
                @media (max-width: 768px) {
                    body { font-size: 14px; }
                    .container { padding: 5px; }
                }
            `);
            assert.strictEqual(parser.rules.length, 1);

            const mediaRule = parser.rules[0];
            assert(mediaRule instanceof AtRule);
            assert.strictEqual(mediaRule.name, 'media');
            assert.strictEqual(mediaRule.condition, '(max-width: 768px)');
            assert.strictEqual(mediaRule.children.length, 2);

            const bodyRule = mediaRule.children[0];
            assert(bodyRule instanceof StyleRule);
            assert.strictEqual(bodyRule.selector, 'body');
        });

        test('should parse nested CSS rules', () => {
            const parser = new CssParser(`
                .parent {
                    color: black;
                    .child {
                        color: red;
                        font-size: 12px;
                    }
                }
            `);
            assert.strictEqual(parser.rules.length, 1);

            const parentRule = parser.rules[0];
            assert(parentRule instanceof StyleRule);
            assert.strictEqual(parentRule.selector, '.parent');
            assert.strictEqual(parentRule.children.length, 1);

            const childRule = parentRule.children[0];
            assert(childRule instanceof StyleRule);
            assert.strictEqual(childRule.selector, '.child');
            assert.deepStrictEqual(childRule.declarations, { color: 'red', 'font-size': '12px' });
        });
    });

    describe('Stringify Functionality', () => {
        test('should stringify simple style rules correctly', () => {
            const parser = new CssParser('body { color: red; margin: 0; }');
            const output = parser.stringify();

            const expected = 'body {\n  color: red;\n  margin: 0;\n}';
            assert.strictEqual(output, expected);
        });

        test('should stringify nested rules correctly', () => {
            const parser = new CssParser(`
                .container {
                    display: flex;
                    .item {
                        flex: 1;
                    }
                }
            `);
            const output = parser.stringify();

            assert(output.includes('.container {'));
            assert(output.includes('display: flex;'));
            assert(output.includes('.item {'));
            assert(output.includes('flex: 1;'));
        });

        test('should stringify at-rules correctly', () => {
            const parser = new CssParser('@media (min-width: 768px) { body { font-size: 18px; } }');
            const output = parser.stringify();

            assert(output.includes('@media (min-width: 768px) {'));
            assert(output.includes('body {'));
            assert(output.includes('font-size: 18px;'));
        });

        test('should handle camelCase to kebab-case conversion', () => {
            const content: CssContentItem[] = [
                { type: 'declaration', property: 'fontSize', value: '16px' },
                { type: 'declaration', property: 'backgroundColor', value: 'blue' }
            ];
            const rule = new StyleRule('div', content);
            const output = rule.stringify();

            assert(output.includes('font-size: 16px;'));
            assert(output.includes('background-color: blue;'));
        });
    });

    describe('Parser Manipulation Methods', () => {
        let parser: CssParser;

        test('setup initial parser', () => {
            parser = new CssParser(`
                .first { color: red; }
                .second { color: blue; }
            `);
            assert.strictEqual(parser.rules.length, 2);
        });

        test('append should add rules to the end', () => {
            parser.append('.third { color: green; }');
            assert.strictEqual(parser.rules.length, 3);
            assert.strictEqual(parser.rules[2].selector, '.third');
        });

        test('prepend should add rules to the beginning', () => {
            parser.prepend('.zero { color: black; }');
            assert.strictEqual(parser.rules.length, 4);
            assert.strictEqual(parser.rules[0].selector, '.zero');
        });

        test('insertAt should insert at specific index', () => {
            parser.insertAt(2, '.middle { color: yellow; }');
            assert.strictEqual(parser.rules.length, 5);
            assert.strictEqual(parser.rules[2].selector, '.middle');
        });

        test('insertBefore should insert before target rule', () => {
            const target = parser.rules[1];
            parser.insertBefore(target, '.before-first { color: purple; }');
            assert.strictEqual(parser.rules.length, 6);
            assert.strictEqual(parser.rules[1].selector, '.before-first');
        });

        test('insertAfter should insert after target rule', () => {
            const target = parser.rules[2];
            parser.insertAfter(target, '.after-first { color: orange; }');
            assert.strictEqual(parser.rules.length, 7);
            assert.strictEqual(parser.rules[3].selector, '.after-first');
        });

        test('remove should remove target rule', () => {
            const target = parser.rules[0];
            parser.remove(target);
            assert.strictEqual(parser.rules.length, 6);
            assert.notStrictEqual(parser.rules[0].selector, '.zero');
        });

        test('replace should replace target rule', () => {
            const target = parser.rules[0];
            parser.replace(target, '.replacement { color: pink; }');
            assert.strictEqual(parser.rules.length, 6);
            assert.strictEqual(parser.rules[0].selector, '.replacement');
        });
    });

    describe('Node Manipulation Methods', () => {
        test('should manipulate children of style rules', () => {
            const parentRule = new StyleRule('.parent', [
                { type: 'declaration', property: 'display', value: 'block' }
            ]);

            // Test append
            parentRule.append('.child1 { color: red; }');
            assert.strictEqual(parentRule.children.length, 1);
            assert.strictEqual((parentRule.children[0] as StyleRule).selector, '.child1');

            // Test prepend
            parentRule.prepend('.child0 { color: blue; }');
            assert.strictEqual(parentRule.children.length, 2);
            assert.strictEqual((parentRule.children[0] as StyleRule).selector, '.child0');

            // Test insertAt
            parentRule.insertAt(1, '.child-middle { color: green; }');
            assert.strictEqual(parentRule.children.length, 3);
            assert.strictEqual((parentRule.children[1] as StyleRule).selector, '.child-middle');
        });

        test('should manipulate children of at-rules', () => {
            const mediaRule = new AtRule('media', '(max-width: 768px)', []);

            mediaRule.append('body { font-size: 14px; }');
            mediaRule.append('.container { padding: 10px; }');

            assert.strictEqual(mediaRule.children.length, 2);
            assert.strictEqual((mediaRule.children[0] as StyleRule).selector, 'body');
            assert.strictEqual((mediaRule.children[1] as StyleRule).selector, '.container');
        });

        test('should handle insertBefore and insertAfter on children', () => {
            const parentRule = new StyleRule('.parent', []);
            parentRule.append('.first { color: red; }');
            parentRule.append('.second { color: blue; }');

            const firstChild = parentRule.children[0];
            const secondChild = parentRule.children[1];

            // Insert before first
            parentRule.insertBefore(firstChild, '.before-first { color: yellow; }');
            assert.strictEqual(parentRule.children.length, 3);
            assert.strictEqual((parentRule.children[0] as StyleRule).selector, '.before-first');

            // Insert after second (now at index 2)
            parentRule.insertAfter(parentRule.children[2], '.after-second { color: green; }');
            assert.strictEqual(parentRule.children.length, 4);
            assert.strictEqual((parentRule.children[3] as StyleRule).selector, '.after-second');
        });

        test('should handle replace and remove on children', () => {
            const parentRule = new StyleRule('.parent', []);
            parentRule.append('.first { color: red; }');
            parentRule.append('.second { color: blue; }');
            parentRule.append('.third { color: green; }');

            const secondChild = parentRule.children[1];

            // Replace second child
            parentRule.replace(secondChild, '.new-second { color: purple; }');
            assert.strictEqual(parentRule.children.length, 3);
            assert.strictEqual((parentRule.children[1] as StyleRule).selector, '.new-second');

            // Remove first child
            const firstChild = parentRule.children[0];
            parentRule.remove(firstChild);
            assert.strictEqual(parentRule.children.length, 2);
            assert.strictEqual((parentRule.children[0] as StyleRule).selector, '.new-second');
        });
    });

    describe('Type Guards', () => {
        test('isStyleRule should correctly identify style rules', () => {
            const styleRule = new StyleRule('div', [
                { type: 'declaration', property: 'color', value: 'red' }
            ]);
            const atRule = new AtRule('media', '(max-width: 768px)', []);

            assert(isStyleRule(styleRule));
            assert(!isStyleRule(atRule));
        });

        test('isAtRule should correctly identify at-rules', () => {
            const styleRule = new StyleRule('div', [
                { type: 'declaration', property: 'color', value: 'red' }
            ]);
            const atRule = new AtRule('media', '(max-width: 768px)', []);

            assert(isAtRule(atRule));
            assert(!isAtRule(styleRule));
        });
    });



    describe('Edge Cases', () => {
        test('should handle empty CSS', () => {
            const parser = new CssParser('');
            assert.strictEqual(parser.rules.length, 0);
        });

        test('should handle CSS with comments', () => {
            const parser = new CssParser(`
                /* This is a comment */
                body { color: red; }
                /* Another comment */
                .container { display: flex; }
            `);
            assert.strictEqual(parser.rules.length, 2);
            assert.strictEqual((parser.rules[0] as StyleRule).selector, 'body');
            assert.strictEqual((parser.rules[1] as StyleRule).selector, '.container');
        });

        test('should handle malformed CSS gracefully', () => {
            const parser = new CssParser('body { color: red; } .incomplete {');
            // Should parse what it can
            assert.strictEqual(parser.rules.length, 1);
            assert.strictEqual((parser.rules[0] as StyleRule).selector, 'body');
        });

        test('should handle CSS with colons in values', () => {
            const parser = new CssParser('div { background: url("http://example.com/image.jpg"); }');
            assert.strictEqual(parser.rules.length, 1);
            assert.strictEqual(parser.rules[0].declarations.background, 'url("http://example.com/image.jpg")');
        });

        test('should handle empty rules', () => {
            const parser = new CssParser('.empty {}');
            assert.strictEqual(parser.rules.length, 1);
            assert.strictEqual((parser.rules[0] as StyleRule).selector, '.empty');
            assert.deepStrictEqual(parser.rules[0].declarations, {});
        });
    });

    describe('Comment Handling', () => {
        test('should parse and preserve comments at top level', () => {
            const parser = new CssParser(`
                /* Header comment */
                body { color: red; }
                /* Middle comment */
                .container { display: flex; }
                /* Footer comment */
            `);
            
            // Check that we have comments in content
            const hasComments = parser.content.some(item => item.type === 'comment');
            assert(hasComments, 'Should have comments in content');
            
            // Check specific comment content
            const comments = parser.content.filter(item => item.type === 'comment');
            assert.strictEqual(comments.length, 3);
            assert.strictEqual(comments[0].text, 'Header comment');
            assert.strictEqual(comments[1].text, 'Middle comment');
            assert.strictEqual(comments[2].text, 'Footer comment');
        });

        test('should parse comments within style rules', () => {
            const parser = new CssParser(`
                .container {
                    /* This is a comment inside a rule */
                    color: red;
                    /* Another comment */
                    font-size: 16px;
                }
            `);
            
            const rule = parser.rules[0] as StyleRule;
            const comments = rule.content.filter(item => item.type === 'comment');
            assert.strictEqual(comments.length, 2);
            assert.strictEqual(comments[0].text, 'This is a comment inside a rule');
            assert.strictEqual(comments[1].text, 'Another comment');
        });

        test('should parse comments within at-rules', () => {
            const parser = new CssParser(`
                @media (max-width: 768px) {
                    /* Mobile styles comment */
                    body { font-size: 14px; }
                    /* Another mobile comment */
                }
            `);
            
            const mediaRule = parser.rules[0] as AtRule;
            const comments = mediaRule.content.filter(item => item.type === 'comment');
            assert.strictEqual(comments.length, 2);
            assert.strictEqual(comments[0].text, 'Mobile styles comment');
            assert.strictEqual(comments[1].text, 'Another mobile comment');
        });

        test('should stringify comments correctly', () => {
            const parser = new CssParser(`
                /* Top level comment */
                body {
                    /* Inside rule comment */
                    color: red;
                }
            `);
            
            const output = parser.stringify();
            assert(output.includes('/* Top level comment */'));
            assert(output.includes('/* Inside rule comment */'));
        });

        test('should handle mixed content with comments, declarations, and rules', () => {
            const parser = new CssParser(`
                /* Global comment */
                color: blue;
                /* Before rule comment */
                .container {
                    /* Inside container */
                    display: flex;
                    /* Another inside comment */
                    padding: 10px;
                }
                /* After rule comment */
                background: white;
            `);
            
            // Check content order and types
            const contentTypes = parser.content.map(item => item.type);
            assert.deepStrictEqual(contentTypes, [
                'comment',      // Global comment
                'declaration',  // color: blue
                'comment',      // Before rule comment
                'rule',         // .container rule
                'comment',      // After rule comment
                'declaration'   // background: white
            ]);
            
            const output = parser.stringify();
            assert(output.includes('/* Global comment */'));
            assert(output.includes('color: blue;'));
            assert(output.includes('/* Before rule comment */'));
            assert(output.includes('.container {'));
            assert(output.includes('/* After rule comment */'));
            assert(output.includes('background: white;'));
        });

        test('should handle comments with special characters', () => {
            const parser = new CssParser(`
                /* Comment with special chars: @#$%^&*()_+-={}[]|\\:";'<>?,./ */
                body { color: red; }
            `);
            
            const comments = parser.content.filter(item => item.type === 'comment');
            assert.strictEqual(comments.length, 1);
            assert.strictEqual(comments[0].text, 'Comment with special chars: @#$%^&*()_+-={}[]|\\:";\'<>?,./');
        });

        test('should handle multiline comments', () => {
            const parser = new CssParser(`
                /*
                 * This is a multiline comment
                 * with multiple lines
                 * and proper formatting
                 */
                body { color: red; }
            `);
            
            const comments = parser.content.filter(item => item.type === 'comment');
            assert.strictEqual(comments.length, 1);
            assert(comments[0].text.includes('This is a multiline comment'));
            assert(comments[0].text.includes('with multiple lines'));
        });

        test('should handle unclosed comments gracefully', () => {
            const parser = new CssParser(`
                /* This comment is not closed
                body { color: red; }
            `);
            
            // Should still parse what it can - unclosed comment consumes everything
            const comments = parser.content.filter(item => item.type === 'comment');
            // When comment is not closed, it consumes the rest of the content
            assert(comments.length >= 0, 'Should handle unclosed comments without crashing');
            
            // The parser should not crash and should handle the malformed CSS gracefully
            const output = parser.stringify();
            assert(typeof output === 'string', 'Should produce valid string output');
        });
    });

    describe('Rule Modification', () => {
        test('should modify selector and stringify correctly', () => {
            const parser = new CssParser(`
                .original { color: red; font-size: 16px; }
                #container { display: flex; padding: 20px; }
            `);

            // Get the first rule and modify its selector
            const firstRule = parser.rules[0] as StyleRule;
            assert.strictEqual(firstRule.selector, '.original');
            
            firstRule.selector = '.modified';
            
            // Stringify and check if the selector was changed
            const output = parser.stringify();
            assert(output.includes('.modified {'), 'Should contain the modified selector');
            assert(!output.includes('.original {'), 'Should not contain the original selector');
            assert(output.includes('color: red;'), 'Should preserve the declarations');
            assert(output.includes('font-size: 16px;'), 'Should preserve all declarations');
        });

        test('should modify multiple selectors and maintain order', () => {
            const parser = new CssParser(`
                .first { color: red; }
                .second { color: blue; }
                .third { color: green; }
            `);

            // Modify all selectors
            (parser.rules[0] as StyleRule).selector = '.uno';
            (parser.rules[1] as StyleRule).selector = '.dos';
            (parser.rules[2] as StyleRule).selector = '.tres';

            const output = parser.stringify();
            
            // Check that all selectors were changed and order is maintained
            const unoIndex = output.indexOf('.uno {');
            const dosIndex = output.indexOf('.dos {');
            const tresIndex = output.indexOf('.tres {');

            assert(unoIndex !== -1, 'Should contain .uno selector');
            assert(dosIndex !== -1, 'Should contain .dos selector');
            assert(tresIndex !== -1, 'Should contain .tres selector');
            
            assert(unoIndex < dosIndex, '.uno should come before .dos');
            assert(dosIndex < tresIndex, '.dos should come before .tres');
        });

        test('should modify nested rule selectors', () => {
            const parser = new CssParser(`
                .parent {
                    color: black;
                    .child {
                        color: red;
                        .grandchild {
                            color: blue;
                        }
                    }
                }
            `);

            const parentRule = parser.rules[0] as StyleRule;
            const childRule = parentRule.children[0] as StyleRule;
            const grandchildRule = childRule.children[0] as StyleRule;

            // Modify all nested selectors
            parentRule.selector = '.new-parent';
            childRule.selector = '.new-child';
            grandchildRule.selector = '.new-grandchild';

            const output = parser.stringify();
            
            assert(output.includes('.new-parent {'), 'Should contain modified parent selector');
            assert(output.includes('.new-child {'), 'Should contain modified child selector');
            assert(output.includes('.new-grandchild {'), 'Should contain modified grandchild selector');
            
            assert(!output.includes('.parent {'), 'Should not contain original parent selector');
            assert(!output.includes('.child {'), 'Should not contain original child selector');
            assert(!output.includes('.grandchild {'), 'Should not contain original grandchild selector');
        });

        test('should modify at-rule conditions', () => {
            const parser = new CssParser(`
                @media (max-width: 768px) {
                    body { font-size: 14px; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `);

            const mediaRule = parser.rules[0] as AtRule;
            const keyframesRule = parser.rules[1] as AtRule;

            // Modify at-rule conditions
            mediaRule.condition = '(max-width: 1024px)';
            keyframesRule.condition = 'slideIn';

            const output = parser.stringify();
            
            assert(output.includes('@media (max-width: 1024px) {'), 'Should contain modified media condition');
            assert(output.includes('@keyframes slideIn {'), 'Should contain modified keyframes name');
            
            assert(!output.includes('(max-width: 768px)'), 'Should not contain original media condition');
            assert(!output.includes('fadeIn'), 'Should not contain original keyframes name');
        });

        test('should modify selectors with comments preserved', () => {
            const parser = new CssParser(`
                /* Original selector comment */
                .original {
                    /* Inside comment */
                    color: red;
                }
            `);

            const rule = parser.rules[0] as StyleRule;
            rule.selector = '.modified';

            const output = parser.stringify();
            
            assert(output.includes('.modified {'), 'Should contain modified selector');
            assert(output.includes('/* Original selector comment */'), 'Should preserve top-level comment');
            assert(output.includes('/* Inside comment */'), 'Should preserve inside comment');
            assert(!output.includes('.original {'), 'Should not contain original selector');
        });

        test('should handle complex selector modifications', () => {
            const parser = new CssParser(`
                div.container > .item:hover {
                    background-color: #f0f0f0;
                    transition: all 0.3s ease;
                }
            `);

            const rule = parser.rules[0] as StyleRule;
            const originalSelector = rule.selector;
            
            // Modify to a completely different complex selector
            rule.selector = 'nav ul li a.active::before';

            const output = parser.stringify();
            
            assert(output.includes('nav ul li a.active::before {'), 'Should contain new complex selector');
            assert(!output.includes(originalSelector), 'Should not contain original selector');
            assert(output.includes('background-color: #f0f0f0;'), 'Should preserve declarations');
            assert(output.includes('transition: all 0.3s ease;'), 'Should preserve all declarations');
        });

        test('should modify selectors and maintain manipulation methods', () => {
            const parser = new CssParser(`
                .first { color: red; }
                .second { color: blue; }
            `);

            // Modify selectors
            (parser.rules[0] as StyleRule).selector = '.modified-first';
            (parser.rules[1] as StyleRule).selector = '.modified-second';

            // Add a new rule
            parser.append('.third { color: green; }');

            // Modify the newly added rule's selector
            (parser.rules[2] as StyleRule).selector = '.modified-third';

            const output = parser.stringify();
            
            assert(output.includes('.modified-first {'), 'Should contain first modified selector');
            assert(output.includes('.modified-second {'), 'Should contain second modified selector');
            assert(output.includes('.modified-third {'), 'Should contain third modified selector');
            
            assert.strictEqual(parser.rules.length, 3, 'Should have 3 rules');
        });
    });

    describe('Complex Scenarios', () => {
        test('should handle deeply nested rules', () => {
            const parser = new CssParser(`
                color: blue;
                .level1 {
                    color: red;
                    .level2 {
                        color: blue;
                        .level3 {
                            color: green;
                        }
                    }
                };
                background-color: red;
            `);

            const level1 = parser.rules[0];
            assert(level1 instanceof StyleRule);
            assert.strictEqual(level1.selector, '.level1');

            const level2 = level1.children[0];
            assert(level2 instanceof StyleRule);
            assert.strictEqual(level2.selector, '.level2');

            const level3 = level2.children[0];
            assert(level3 instanceof StyleRule);
            assert.strictEqual(level3.selector, '.level3');
        });

        test('should handle mixed at-rules and style rules', () => {
            const parser = new CssParser(`
                @import "base.css";
                body { margin: 0; }
                @media (max-width: 768px) {
                    body { font-size: 14px; }
                }
                .container { display: flex; }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `);

            assert.strictEqual(parser.rules.length, 5);
            assert(parser.rules[0] instanceof AtRule);
            assert.strictEqual(parser.rules[0].name, 'import');
            assert(parser.rules[1] instanceof StyleRule);
            assert.strictEqual(parser.rules[1].selector, 'body');
            assert(parser.rules[2] instanceof AtRule);
            assert.strictEqual(parser.rules[2].name, 'media');
            assert(parser.rules[3] instanceof StyleRule);
            assert.strictEqual(parser.rules[3].selector, '.container');
            assert(parser.rules[4] instanceof AtRule);
            assert.strictEqual(parser.rules[4].name, 'keyframes');
        });

        test('should maintain rule order after manipulations', () => {
            const parser = new CssParser(`
                .first { color: red; }
                .second { color: blue; }
                .third { color: green; }
            `);

            // Insert in middle
            parser.insertAt(1, '.inserted { color: yellow; }');

            const selectors = parser.rules.map(rule => (rule as StyleRule).selector);
            assert.deepStrictEqual(selectors, ['.first', '.inserted', '.second', '.third']);
        });

        test('should handle mixed declarations and nested rules at top level', () => {
            const parser = new CssParser(`
                color: blue;
                .level1 {
                    color: red;
                    .level2 {
                        color: blue;
                        .level3 {
                            color: green;
                        }
                    }
                }
                background-color: red;
            `);

            const output = parser.stringify();
            console.log('Mixed content output:', output);

            // Should contain both declarations and nested rules in order
            assert(output.includes('color: blue;'));
            assert(output.includes('background-color: red;'));
            assert(output.includes('.level1 {'));

            // Check order: color should come before .level1, and background-color should come after
            const colorIndex = output.indexOf('color: blue;');
            const level1Index = output.indexOf('.level1 {');
            const backgroundIndex = output.indexOf('background-color: red;');

            assert(colorIndex < level1Index, 'color should come before .level1');
            assert(level1Index < backgroundIndex, '.level1 should come before background-color');
        });
    });
});