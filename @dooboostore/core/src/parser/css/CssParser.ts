export interface CssDeclaration {
    [property: string]: string;
}

// --- Content item types for maintaining order ---
export interface CssDeclarationItem {
    type: 'declaration';
    property: string;
    value: string;
}

export interface CssRuleItem {
    type: 'rule';
    rule: CssRule;
}

export interface CssCommentItem {
    type: 'comment';
    text: string;
}

export type CssContentItem = CssDeclarationItem | CssRuleItem | CssCommentItem;

// --- Base CSS Node Class with common functionality ---
export abstract class CssNode {
    public content: CssContentItem[]; // Maintains order of declarations and rules

    constructor(content: CssContentItem[] = []) {
        this.content = content;
    }

    // --- Computed properties for backward compatibility ---
    public get declarations(): CssDeclaration {
        const declarations: CssDeclaration = {};
        this.content.forEach(item => {
            if (item.type === 'declaration') {
                declarations[item.property] = item.value;
            }
        });
        return declarations;
    }

    public get children(): CssRule[] {
        return this.content
            .filter(item => item.type === 'rule')
            .map(item => (item as CssRuleItem).rule);
    }

    public abstract stringify(indent?: number): string;

    // --- Common Manipulation Methods for content ---
    protected _addRules(rulesToAdd: CssRule[], atIndex?: number): this {
        const ruleItems: CssRuleItem[] = rulesToAdd.map(rule => ({ type: 'rule', rule }));
        if (atIndex === undefined) {
            this.content.push(...ruleItems);
        } else {
            // Find the actual content index for the rule at the given children index
            const ruleContentIndices = this.content
                .map((item, idx) => ({ item, idx }))
                .filter(({ item }) => item.type === 'rule')
                .map(({ idx }) => idx);

            const insertIndex = atIndex < ruleContentIndices.length ? ruleContentIndices[atIndex] : this.content.length;
            this.content.splice(insertIndex, 0, ...ruleItems);
        }
        return this;
    }

    public append(ruleOrCss: CssRule | string): this {
        const rulesToAdd = CssParser._parseInputToRules(ruleOrCss);
        return this._addRules(rulesToAdd);
    }

    public prepend(ruleOrCss: CssRule | string): this {
        const rulesToAdd = CssParser._parseInputToRules(ruleOrCss);
        return this._addRules(rulesToAdd, 0);
    }

    public insertAt(index: number, ruleOrCss: CssRule | string): this {
        const rulesToAdd = CssParser._parseInputToRules(ruleOrCss);
        return this._addRules(rulesToAdd, index);
    }

    public insertBefore(target: CssRule, newRuleOrCss: CssRule | string): this {
        const contentIndex = this.content.findIndex(item =>
            item.type === 'rule' && item.rule === target
        );
        if (contentIndex > -1) {
            const rulesToAdd = CssParser._parseInputToRules(newRuleOrCss);
            const ruleItems: CssRuleItem[] = rulesToAdd.map(rule => ({ type: 'rule', rule }));
            this.content.splice(contentIndex, 0, ...ruleItems);
        }
        return this;
    }

    public insertAfter(target: CssRule, newRuleOrCss: CssRule | string): this {
        const contentIndex = this.content.findIndex(item =>
            item.type === 'rule' && item.rule === target
        );
        if (contentIndex > -1) {
            const rulesToAdd = CssParser._parseInputToRules(newRuleOrCss);
            const ruleItems: CssRuleItem[] = rulesToAdd.map(rule => ({ type: 'rule', rule }));
            this.content.splice(contentIndex + 1, 0, ...ruleItems);
        }
        return this;
    }

    public replace(target: CssRule, newRuleOrCss: CssRule | string): this {
        const contentIndex = this.content.findIndex(item =>
            item.type === 'rule' && item.rule === target
        );
        if (contentIndex > -1) {
            const rulesToReplace = CssParser._parseInputToRules(newRuleOrCss);
            const ruleItems: CssRuleItem[] = rulesToReplace.map(rule => ({ type: 'rule', rule }));
            this.content.splice(contentIndex, 1, ...ruleItems);
        }
        return this;
    }

    public remove(target: CssRule): this {
        const contentIndex = this.content.findIndex(item =>
            item.type === 'rule' && item.rule === target
        );
        if (contentIndex > -1) {
            this.content.splice(contentIndex, 1);
        }
        return this;
    }
}

// --- Style Rule Class ---
export class StyleRule extends CssNode {
    public selector: string;

    constructor(selector: string, content: CssContentItem[] = []) {
        super(content);
        this.selector = selector;
    }

    public stringify(indent = 0): string {
        const indentStr = '  '.repeat(indent);
        const innerIndentStr = '  '.repeat(indent + 1);

        if (this.content.length === 0) {
            return `${indentStr}${this.selector} {}`;
        }

        const contentLines: string[] = [];

        for (const item of this.content) {
            if (item.type === 'declaration') {
                const kebabProperty = CssParser._camelToKebab(item.property);
                contentLines.push(`${innerIndentStr}${kebabProperty}: ${item.value};`);
            } else if (item.type === 'rule') {
                contentLines.push(item.rule.stringify(indent + 1));
            } else if (item.type === 'comment') {
                contentLines.push(`${innerIndentStr}/* ${item.text} */`);
            }
        }

        const innerContent = contentLines.join('\n');
        return `${indentStr}${this.selector} {\n${innerContent}\n${indentStr}}`;
    }
}

// --- At Rule Class ---
export class AtRule extends CssNode {
    public name: string;
    public condition: string;

    constructor(name: string, condition: string, content: CssContentItem[] = []) {
        super(content);
        this.name = name;
        this.condition = condition;
    }

    public stringify(indent = 0): string {
        const indentStr = '  '.repeat(indent);
        const innerIndentStr = '  '.repeat(indent + 1);
        const prelude = `@${this.name}${this.condition ? ' ' + this.condition : ''}`;

        if (this.content.length === 0) {
            return `${indentStr}${prelude};`;
        }

        const contentLines: string[] = [];

        for (const item of this.content) {
            if (item.type === 'declaration') {
                const kebabProperty = CssParser._camelToKebab(item.property);
                contentLines.push(`${innerIndentStr}${kebabProperty}: ${item.value};`);
            } else if (item.type === 'rule') {
                contentLines.push(item.rule.stringify(indent + 1));
            } else if (item.type === 'comment') {
                contentLines.push(`${innerIndentStr}/* ${item.text} */`);
            }
        }

        const innerContent = contentLines.join('\n');
        return `${indentStr}${prelude} {\n${innerContent}\n${indentStr}}`;
    }
}

export type CssRule = StyleRule | AtRule;

// --- The main parser class ---

export class CssParser extends CssNode {
    constructor(css: string = '') {
        const content = CssParser._parseTopLevel(css);
        super(content);
    }

    // --- Accessors ---
    public get rules(): Readonly<CssRule[]> {
        return this.children;
    }

    // --- Stringify ---
    public stringify(indent = 0): string {
        if (this.content.length === 0) {
            return '';
        }

        const contentLines: string[] = [];

        for (const item of this.content) {
            if (item.type === 'declaration') {
                const kebabProperty = CssParser._camelToKebab(item.property);
                contentLines.push(`${kebabProperty}: ${item.value};`);
            } else if (item.type === 'rule') {
                contentLines.push(item.rule.stringify(indent));
            } else if (item.type === 'comment') {
                contentLines.push(`/* ${item.text} */`);
            }
        }

        return contentLines.join('\n');
    }

    // --- Static parsing method ---
    private static _parseTopLevel(css: string): CssContentItem[] {
        const cleanedCss = CssParser._cleanCss(css);

        // Parse top-level content including comments, declarations, and rules
        return CssParser._parseContent(cleanedCss);
    }

    // --- Parsing Logic ---
    private static _cleanCss(css: string): string {
        // Don't remove comments - we'll parse them as content items
        return css.trim();
    }

    // --- Universal content parser that handles comments, declarations, and rules ---
    private static _parseContent(css: string): CssContentItem[] {
        const content: CssContentItem[] = [];
        let i = 0;

        while (i < css.length) {
            // Skip whitespace
            while (i < css.length && /\s/.test(css[i])) {
                i++;
            }
            if (i >= css.length) break;

            // Handle comments
            if (css[i] === '/' && i + 1 < css.length && css[i + 1] === '*') {
                const commentStart = i + 2;
                let commentEnd = css.indexOf('*/', commentStart);
                if (commentEnd === -1) {
                    commentEnd = css.length;
                    i = css.length;
                } else {
                    const commentText = css.substring(commentStart, commentEnd).trim();
                    content.push({ type: 'comment', text: commentText });
                    i = commentEnd + 2;
                }
                continue;
            }

            // Find the next significant token
            const nextBraceIndex = css.indexOf('{', i);
            const nextSemicolonIndex = css.indexOf(';', i);
            const nextCommentIndex = css.indexOf('/*', i);

            // Determine what comes first
            const nextTokens = [
                { type: 'brace', index: nextBraceIndex },
                { type: 'semicolon', index: nextSemicolonIndex },
                { type: 'comment', index: nextCommentIndex }
            ].filter(token => token.index !== -1).sort((a, b) => a.index - b.index);

            if (nextTokens.length === 0) {
                // No more tokens, parse remaining as declaration if it contains ':'
                const remaining = css.substring(i).trim();
                if (remaining && remaining.includes(':')) {
                    const parts = remaining.split(':');
                    if (parts.length >= 2) {
                        const prop = parts[0].trim();
                        const val = parts.slice(1).join(':').trim();
                        if (prop && val) {
                            content.push({ type: 'declaration', property: prop, value: val });
                        }
                    }
                }
                break;
            }

            const nextToken = nextTokens[0];

            if (nextToken.type === 'comment') {
                // Handle comment (already handled above, but just in case)
                i = nextToken.index;
                continue;
            }

            if (nextToken.type === 'brace') {
                // This is a rule (selector or at-rule)
                const prelude = css.substring(i, nextToken.index).trim();
                if (prelude) {
                    const blockEndIndex = CssParser._findMatchingBrace(css, nextToken.index);
                    if (blockEndIndex !== -1) {
                        const blockContent = css.substring(nextToken.index + 1, blockEndIndex).trim();

                        if (prelude.startsWith('@')) {
                            // At-rule
                            const name = prelude.match(/^@([^\s]+)/)?.[1] || 'unknown';
                            const condition = prelude.replace(/^@[^\s]+\s*/, '').trim();
                            const childContent = CssParser._parseContent(blockContent);
                            content.push({ type: 'rule', rule: new AtRule(name, condition, childContent) });
                        } else {
                            // Style rule
                            const childContent = CssParser._parseContent(blockContent);
                            content.push({ type: 'rule', rule: new StyleRule(prelude, childContent) });
                        }
                        i = blockEndIndex + 1;
                        continue;
                    }
                }
            }

            if (nextToken.type === 'semicolon') {
                // This could be a declaration or at-rule without block
                const statement = css.substring(i, nextToken.index).trim();
                if (statement) {
                    if (statement.startsWith('@')) {
                        // At-rule without block
                        const name = statement.match(/^@([^\s]+)/)?.[1] || 'unknown';
                        const condition = statement.replace(/^@[^\s]+\s*/, '').trim();
                        content.push({ type: 'rule', rule: new AtRule(name, condition, []) });
                    } else if (statement.includes(':')) {
                        // Declaration
                        const parts = statement.split(':');
                        if (parts.length >= 2) {
                            const prop = parts[0].trim();
                            const val = parts.slice(1).join(':').trim();
                            if (prop && val) {
                                content.push({ type: 'declaration', property: prop, value: val });
                            }
                        }
                    }
                }
                i = nextToken.index + 1;
                continue;
            }

            // Fallback: move to next character
            i++;
        }

        return content;
    }

    private static _parseBlockContent(css: string): { content: CssContentItem[] } {
        // Use the universal content parser
        return { content: CssParser._parseContent(css) };
    }

    private static _parseRules(css: string): CssRule[] {
        const rules: CssRule[] = [];
        let currentIndex = 0;
        css = css.trim();

        const recursiveAtRules = ['media', 'supports', 'container', 'scope', 'layer'];

        while (currentIndex < css.length) {
            while (currentIndex < css.length && /\s/.test(css[currentIndex])) {
                currentIndex++;
            }
            if (currentIndex >= css.length) {
                break;
            }

            const nextBraceIndex = css.indexOf('{', currentIndex);
            const nextSemicolonIndex = css.indexOf(';', currentIndex);

            if (nextBraceIndex !== -1 && (nextBraceIndex < nextSemicolonIndex || nextSemicolonIndex === -1)) {
                const prelude = css.substring(currentIndex, nextBraceIndex).trim();
                if (!prelude) {
                    currentIndex = nextBraceIndex + 1;
                    continue;
                }

                const blockEndIndex = CssParser._findMatchingBrace(css, nextBraceIndex);
                if (blockEndIndex === -1) {
                    console.error("Malformed CSS: No matching brace for selector -> ", prelude);
                    return rules;
                }

                const blockContent = css.substring(nextBraceIndex + 1, blockEndIndex).trim();

                if (prelude.startsWith('@')) {
                    const name = prelude.match(/^@([^\s]+)/)?.[1] || 'unknown';
                    const condition = prelude.replace(/^@[^\s]+\s*/, '').trim();
                    const content = CssParser._parseContent(blockContent);
                    rules.push(new AtRule(name, condition, content));
                } else {
                    const content = CssParser._parseContent(blockContent);
                    rules.push(new StyleRule(prelude, content));
                }
                currentIndex = blockEndIndex + 1;

            } else if (nextSemicolonIndex !== -1) {
                const statement = css.substring(currentIndex, nextSemicolonIndex).trim();
                if (statement.startsWith('@')) {
                    const name = statement.match(/^@([^\s]+)/)?.[1] || 'unknown';
                    const condition = statement.replace(/^@[^\s]+\s*/, '').trim();
                    rules.push(new AtRule(name, condition, []));
                }
                currentIndex = nextSemicolonIndex + 1;
            } else {
                break;
            }
        }
        return rules;
    }

    private static _findMatchingBrace(str: string, startIndex: number): number {
        let depth = 1;
        for (let i = startIndex + 1; i < str.length; i++) {
            if (str[i] === '{') {
                depth++;
            } else if (str[i] === '}') {
                depth--;
                if (depth === 0) {
                    return i;
                }
            }
        }
        return -1;
    }

    private static _parseDeclarations(declarationString: string): CssDeclaration {
        const declarations: CssDeclaration = {};
        const declarationPairs = declarationString.split(';');

        for (const pair of declarationPairs) {
            if (pair.trim() === '') {
                continue;
            }
            const parts = pair.split(':');
            if (parts.length >= 2) {
                const property = parts[0].trim();
                const value = parts.slice(1).join(':').trim();
                if (property && value) {
                    declarations[property] = value;
                }
            }
        }
        return declarations;
    }

    public static _declarationsToCSS(declarations: CssDeclaration, indent: number): string {
        const indentStr = '  '.repeat(indent);
        return Object.entries(declarations)
            .map(([prop, value]) => `${indentStr}${CssParser._camelToKebab(prop)}: ${value};`)
            .join('\n');
    }

    public static _camelToKebab(camelCase: string): string {
        return camelCase.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
    }

    // Helper to parse string input to CssRule[]
    public static _parseInputToRules(ruleOrCss: CssRule | string): CssRule[] {
        if (typeof ruleOrCss === 'string') {
            const parsed = new CssParser(ruleOrCss).rules;
            if (parsed.length === 0) {
                console.warn('Provided CSS string resulted in no rules.');
            }
            return [...parsed];
        } else {
            return [ruleOrCss];
        }
    }
}

// --- Type Guards ---

export function isRule(obj: any): obj is CssRule {
    return obj instanceof StyleRule || obj instanceof AtRule;
}

export function isStyleRule(rule: any): rule is StyleRule {
    return rule instanceof StyleRule;
}

export function isAtRule(rule: any): rule is AtRule {
    return rule instanceof AtRule;
}

export function isCssDeclarationItem(item: any): item is CssDeclarationItem {
    return item && typeof item === 'object' && item.type === 'declaration' &&
        typeof item.property === 'string' && typeof item.value === 'string';
}

export function isCssRuleItem(item: any): item is CssRuleItem {
    return item && typeof item === 'object' && item.type === 'rule' && isRule(item.rule);
}

export function isCssCommentItem(item: any): item is CssCommentItem {
    return item && typeof item === 'object' && item.type === 'comment' && typeof item.text === 'string';
}