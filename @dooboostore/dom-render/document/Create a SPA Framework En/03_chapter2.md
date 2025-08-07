# Chapter 2: Creating the Simplest Template Engine

If the reactivity system is the 'brain' that detects data, the template engine is the 'hand' that renders changes to the screen. In this chapter, we will implement step-by-step the process of analyzing an HTML template to separate dynamic and static parts, combining them with data, and transforming them into actual DOM.

## 2.1. First Steps in Template Parsing

Our template engine has a special syntax. For example, `${this.name}$` inserts text, and `#{this.htmlContent}#` inserts HTML. The first thing to do is to find these expressions in the given HTML string.

Regular Expressions are a powerful tool for this task. `dom-render` uses a regular expression similar to the following within the `RawSet.expressionGroups` method:

```javascript
// Regular expression to find expressions of the form `${...}$` or `#{...}#`
const expressionRegex = /[$#]\{([\s\S.]*?)\[$#]/g;

const template = '<div><p>Hello, ${this.user.name}$</p> <div class="content">#{this.post.content}#</div> </div>';

// Use String.prototype.matchAll() or a custom utility to find all matches.
const matches = Array.from(template.matchAll(expressionRegex));

// Result:
// matches[0] -> ["${this.user.name}$", "this.user.name"]
// matches[1] -> ["#{this.post.content}#", "this.post.content"]
```

Through this process, we can determine which parts of the template need to be dynamically changed and on which data they depend.

## 2.2. Conceptual Design of `RawSet`

Managing the entire template as one large block is inefficient. Re-parsing and re-rendering the entire template every time `this.user.name` changes is wasteful. We want to precisely replace only the parts that need to be changed.

This is where the core concept of **`RawSet`** emerges. A `RawSet` is the **minimum unit that manages a single dynamic expression**. Each `RawSet` must remember its position within the DOM. `dom-render` uses comment nodes or `meta` tags for this purpose.

```html
<!-- Original template -->
<p>Hello, ${this.user.name}$</p>

<!-- DOM structure after parsing (conceptual) -->
<p>
  Hello,
  <!-- RawSet-UUID-12345-start -->
  <!-- The value of this.user.name goes here -->
  <!-- RawSet-UUID-12345-end -->
</p>
```

This way, when `this.user.name` changes, we don't need to search the entire DOM; we just replace the content between the start and end points corresponding to `RawSet-UUID-12345`.

The `RawSet` class holds the following information:

-   `uuid`: A unique ID identifying each `RawSet`.
-   `type`: Distinguishes whether it's a text node (`TEXT`), an attribute (`TARGET_ATTR`), or a custom element (`TARGET_ELEMENT`).
-   `point`: References to the start (`start`) and end (`end`) nodes within the DOM.
-   `dataSet`: Information such as the original template fragment (`fragment`) and configuration (`config`) needed for rendering.

The `RawSet.checkPointCreates` method traverses the given DOM node, finds dynamic parts, and creates and returns `RawSet` objects with the above structure.

## 2.3. Implementing a One-time Rendering Function

Now, let's temporarily forget about reactivity and create a function that renders a template only once with given data. This process is similar to the core logic of the `RawSet.render` method.

1.  **Call `checkPointCreates`:** After converting the template string into a DOM node, call `RawSet.checkPointCreates` to get an array of `RawSet`s.

2.  **Iterate `RawSet`s:** Iterate through each `RawSet` and perform the following:
    a.  Extract the expression (e.g., `${this.user.name}$`) from the template fragment (e.g., `${this.user.name}$`) held by the `RawSet`.
    b.  Use a utility like `ScriptUtils.evalReturn` to calculate the actual value based on the given data object (`obj`) and expression. (Simply using `eval` is a security risk, so it's better to use `new Function()` to limit the scope in practice.)
    c.  Create a new text node or DOM element with the calculated value.
    d.  Clear all existing content between `RawSet`'s `point.start` and `point.end`, and insert the newly created node.

Repeating this process for all `RawSet`s transforms the template into a fully rendered DOM.

```javascript
// Conceptual one-time rendering function
function initialRender(templateString, data) {
  const targetElement = document.createElement('div');
  targetElement.innerHTML = templateString;

  const rawSets = RawSet.checkPointCreates(targetElement, data, config);

  for (const rawSet of rawSets) {
    // rawSet.render internally evaluates expressions and replaces the DOM.
    rawSet.render(data, config);
  }

  return targetElement;
}
```

So far, we have analyzed templates, defined dynamic units as `RawSet`s, and implemented a method to create DOM based on them. In the next chapter, we will combine the reactivity system created in Chapter 1 with the template engine created in Chapter 2 to build the heart of a truly reactive framework that automatically updates the DOM when data changes.
