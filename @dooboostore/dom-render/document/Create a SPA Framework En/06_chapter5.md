# Chapter 5: Breathing Life and Soul into It - The Component System

As applications become more complex, code reusability and management become crucial. A Component is a unit that divides the UI into independent and reusable pieces, and it is one of the most important concepts in modern frameworks. In this chapter, we will learn how to build `dom-render`'s component system by encapsulating logic (JavaScript classes) and views (HTML templates).

## 5.1. Designing `DomRender.createComponent`

A component is essentially a rule about **"which class to instantiate and which template to render when a certain tag name is used."** `DomRender.createComponent` is a factory function that defines this rule.

It's worth noting that `dom-render` does not directly use the browser's built-in Web Component standards (Custom Elements, Shadow DOM, etc.), but instead implements its own component mechanism. This is to ensure that the framework has full control over the rendering process and scope management, and to guarantee consistent behavior that is less dependent on specific browser environments.

```javascript
// DomRender.ts
public static createComponent(param: CreateComponentParam) {
  // CreateComponentParam: { type: class, tagName: 'custom-tag', template: '...', styles: '...' }
  const component = RawSet.createComponentTargetElement({
    name: param.tagName, // e.g., 'profile-card'
    objFactory: (element, obj, rawSet, constructorParam) => {
      // This function is called when a <profile-card> tag is encountered.
      // It instantiates and returns the class corresponding to param.type.
      return new param.type(...constructorParam);
    },
    template: param.template, // Internal HTML template for this component
    styles: param.styles,     // Styles to be applied only to this component
    noStrip: param.noStrip
  });
  return component;
}
```

The "rule" object created in this way is added to the `config.targetElements` array of `DomRender.run`. During the rendering process, the `DrTargetElement` Operator checks if the HTML tag name matches a name registered in `config.targetElements`. If it matches, it executes the component's `callBack` (which internally calls `objFactory`) to instantiate and render the component.

## 5.2. Implementing Lifecycle Hooks

Components have a lifecycle: they are created, added to the DOM, their data changes, and eventually they are removed from the DOM. A framework must provide **Lifecycle Hooks** to allow users to execute defined code at specific points in this lifecycle.

`dom-render` implements this through interfaces.

-   **`OnCreateRender`**: Called immediately after the component instance is created and initial data is set. It's suitable for initialization logic as it's called before actual insertion into the DOM.
-   **`OnInitRender`**: Called after the component and all its child elements have finished rendering. Logic that needs direct access to DOM elements (e.g., getting a `canvas` context) should be placed here.
-   **`OnDestroyRender`**: Called when the component is removed from the DOM. It performs clean-up logic such as releasing event listeners or clearing timers.

The implementation is simple: at each stage of processing a component, the `DrTargetElement` Operator checks if the component instance has a method for a specific lifecycle interface (e.g., `onCreateRender`), and if so, calls it.

```typescript
// DrTargetElement.ts의 개념적 로직
// ... After component instance creation ...
const instance = objFactory(...);

// Call OnCreateRender hook
if (isOnCreateRender(instance)) {
  instance.onCreateRender(...);
}

// ... After rendering is complete ...
// Call OnInitRender hook
if (isOnInitRender(instance)) {
  instance.onInitRender(...);
}
```

## 5.3. 스코프 격리와 데이터 흐름

컴포넌트는 독립적인 스코프(Scope)를 가져야 합니다. 컴포넌트 내부의 `this`는 외부가 아닌 컴포넌트 인스턴스 자신을 가리켜야 합니다. `dr-this` 지시어는 이 스코프 변경을 담당합니다.

`DrThis` Operator는 `dr-this` 속성에 지정된 객체(예: `this.__domrender_components.some_uuid`)를 새로운 렌더링 컨텍스트로 설정하고, 그 자식 노드들을 해당 컨텍스트에서 렌더링합니다.

데이터 흐름(Props)은 어떻게 구현할까요? `dom-render`는 `dr-on-create:callback`이나 `dr-detect` 같은 속성을 통해 이를 해결합니다. 부모 스코프에서 자식 컴포넌트의 속성을 설정하는 스크립트를 실행하는 방식입니다.

```html
<!-- Parent template -->
<profile-card dr-detect="$component.age = @this@.age"></profile-card>
```

In the code above, `$component` refers to the instance of the `profile-card` component, and `@this@` refers to the parent's context. When rendering the component, the `DrTargetElement` Operator evaluates this `dr-detect` script to assign the parent's `age` to the child's `age`. If the parent's `age` is reactive data, this change automatically propagates to the child.

## 5.4. Implementing Scoped Styles

To prevent a component's styles from affecting other components, styles should only be applied within that component. This is called **Scoped Styles**.

`dom-render` generates a unique UUID when rendering a component and uses it to isolate styles.

1.  **CSS Parsing:** The CSS string passed to `DomRender.createComponent` is converted into an AST (Abstract Syntax Tree) using the `css-parse` library.

2.  **Selector Transformation:** The CSS AST is traversed, and all selectors (e.g., `.title`, `p`) are transformed. For example, `.title` is changed into a complex form like `#component-uuid-start ~ .title:not(#component-uuid-start ~ #component-uuid-end ~ *)`. This selector means "a `.title` element that is after the `#component-uuid-start` element and is not a descendant of the `#component-uuid-end` element, which marks the end of that component."

3.  **CSS Regeneration and Insertion:** The transformed AST is converted back into a CSS string using `css-stringify`, and a `<style>` tag containing this content is inserted at the top of the component's template.

Through this process, each component gains its own unique style scope, fundamentally preventing style conflicts.

Now, our framework can create reusable, encapsulated components with their own lifecycle and styles. In the final chapter, we will implement advanced features that complete the framework, such as routing and state management, and cover how to build the entire project.
