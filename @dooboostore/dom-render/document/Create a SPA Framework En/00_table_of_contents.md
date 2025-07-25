# 📖 Designing and Implementing a SPA Framework: A Journey with dom-render

## [Introduction: Why Are We Building Another Framework?](./01_introduction.md)

---

### [Chapter 1: The Beginning of Everything - What is Reactivity?](./02_chapter1.md)
- 1.1. Comparison of Reactivity Models in Modern Frameworks
- 1.2. In-depth Exploration of JavaScript `Proxy`
- 1.3. The Concept of Dependency Tracking

### [Chapter 2: Creating the Simplest Template Engine](./03_chapter2.md)
- 2.1. First Steps in Template Parsing
- 2.2. Conceptual Design of `RawSet`
- 2.3. Implementing a One-time Rendering Function

### [Chapter 3: Injecting Reactivity - The Birth of `DomRenderProxy`](./04_chapter3.md)
- 3.1. Combining Chapters 1 and 2
- 3.2. Applying Recursive Proxies
- 3.3. Completing `DomRender.run`

### [Chapter 4: Implementing Control Flow - The Directive System](./05_chapter4.md)
- 4.1. Designing the Operator Pattern
- 4.2. Implementing `dr-if`
- 4.3. Implementing `dr-for-of`

### [Chapter 5: Breathing Life and Soul into It - The Component System](./06_chapter5.md)
- 5.1. Designing `DomRender.createComponent`
- 5.2. Implementing Lifecycle Hooks
- 5.3. Scope Isolation and Data Flow
- 5.4. Implementing Scoped Styles

### [Chapter 6: Completing the Framework](./07_chapter6.md)
- 6.1. Designing Routers (`PathRouter`, `HashRouter`)
- 6.2. The `Messenger` System
- 6.3. Optimization and Exception Handling
- 6.4. Build and Deployment

### [Appendix: Going Further](./08_appendix.md)
- A. Pros and Cons of the `dom-render` Architecture
- B. Ideas for Performance Improvement
- C. A Growth Roadmap as a Framework Developer
