# Chapter 6: Completing the Framework

So far, we have built all three core elements of a framework: the reactivity system, the template engine, and the component model. In this final chapter, we will add essential routing and inter-component communication features to structure the application, and complete our framework into a usable form through optimization and the build process.

## 6.1. Designing Routers (`PathRouter`, `HashRouter`)

A SPA (Single Page Application) appears to have multiple pages but actually operates on a single HTML file. The router detects changes in the URL and renders the appropriate component on the screen.

`dom-render`'s router is designed as follows:

1.  **URL Change Detection:** Listens for the browser's `popstate` event. This event occurs when the user clicks the browser's 'back'/'forward' buttons or when `history.pushState()` is called.

2.  **Abstract Class and Implementations:** An abstract class named `Router` is created to define common interfaces such as `go`, `test`, and `getRouteData`. Then, two implementations are created based on how they handle URL formats.
    -   `HashRouter`: Routing using a hash (`#`), like `example.com/#/path`. It reads `window.location.hash` to determine the path.
    -   `PathRouter`: Routing using standard URL paths, like `example.com/path`. It reads `window.location.pathname` to determine the path and requires server configuration.

3.  **Integration with Rendering:** The router is most powerful when used with the `dr-if` directive. A special variable `$router` is exposed to the template to implement declarative routing as follows:

    ```html
    <main>
      <!-- Renders the main-page component only when the current URL is '/' -->
      <main-page dr-if="$router.test('/')"></main-page>

      <!-- Renders the user-detail component when the URL matches the '/users/{id}' pattern -->
      <user-detail dr-if="$router.test('/users/{id}')"></user-detail>
    </main>
    ```

    The `$router.test()` method internally compares the current URL with the given URL expression and returns `true` or `false`. When a `popstate` event occurs, the router changes a specific property of the reactive object (e.g., `_router_update_trigger`) to trigger re-evaluation of all `dr-if` directives that depend on the `$router` variable. This automatically renders the appropriate component based on URL changes.

### Implementation Example: Declarative Routing

The following is an example of declaratively switching pages by combining the router and the `dr-if` directive.

**`index.html`**
```html
<header>
    <!-- Clicking the button calls $router.go() to change the URL. -->
    <button dr-event-click="$router?.go({path:'/'})">Main</button>
    <button dr-event-click="$router?.go({path:'/second'})">Second</button>
    <button dr-event-click="$router?.go({path:'/detail/25?name=user'})">Detail</button>
</header>
<main>
    <!-- Determines which component to render based on the result of $router.test(). -->
    <main-page dr-if="$router?.test('/')"></main-page>
    <page-second dr-if="$router?.test('/second')"></page-second>

    <!--
      Example of extracting parameters (id) from the URL path and using query strings (name).
      Uses the dr-on-component-init hook to pass router data when the component is initialized.
    -->
    <page-detail
        url='/detail/{id:[0-9]+}'
        dr-if="$router?.test($attribute.url)"
        dr-on-component-init="$component.routerData($router.getRouteData($attribute.url))"
    ></page-detail>
</main>
```

**`index.ts`**
```typescript
import { DomRender, RunConfig } from '@dooboostore/dom-render';
import { Second } from './second/second';
import { Detail } from './detail/detail';

// ... component template import ...

// DomRender execution configuration
const config: RunConfig<Index> = {
  window: window,
  targetElements: [
    // Register components corresponding to each URL.
    DomRender.createComponent({type: Second, tagName: 'page-second', template: SecondTemplate}),
    DomRender.createComponent({type: Detail, tagName: 'page-detail', template: DetailTemplate})
  ],
  // Specify router type as 'path' or 'hash'.
  routerType: 'path'
};

// Application execution
DomRender.run({
  rootObject: new Index(),
  target:  document.querySelector('#app')!,
  config: config
});
```

In this example, the user changes the URL by clicking buttons. `DomRender` detects the URL change and updates the `$router` object. This update causes the `dr-if` directives using `$router.test()` to be re-evaluated. As a result, only the component with a `dr-if` that matches the current URL becomes `true` and is rendered on the screen.

Specifically, the `page-detail` component demonstrates how to handle dynamic paths like `/detail/{id}`. The `$router.getRouteData()` method extracts parameters like `{id}` and query strings from the URL and returns them as an object, which is then passed to the component for rendering the detail page.

## 6.2. Messenger System

There are times when data needs to be exchanged between components that are not in a parent-child relationship, but are far apart. For this, `dom-render` provides a `Messenger` system that uses the **Publish/Subscribe pattern**.

-   **`Messenger`**: A central hub that mediates all communication.
-   **`Channel`**: A communication channel for a specific topic (usually a component class or a unique key). Components can create their own channels.
-   **`publish`**: Publishes (sends) data to a specific channel. Used like `messenger.publish(TargetComponent, { message: 'Hello' })`.
-   **`subscribe`**: Subscribes to a specific channel and executes a callback function whenever data is published. Used like `messenger.createChannel(this).subscribe(data => ...)`.

This system eliminates direct coupling between components, making the application structure more flexible and extensible.

## 6.3. Optimization and Exception Handling

A framework must be stable. `dom-render` optimizes performance and handles exceptional situations through several mechanisms.

-   **`DomRenderFinalProxy`, `Shield`**: Wrapping every object with `Proxy` can sometimes be unnecessary or cause performance degradation (e.g., external library objects, huge data structures). Wrapping an object with `DomRenderProxy.final()` or `new Shield()` prevents that object from being converted to a `Proxy`, excluding it from reactivity tracking. This provides an "escape hatch" allowing developers to fine-tune performance.
-   **`proxyExcludeTyps`**: By registering specific classes (e.g., `Window`, `Map`, `Set`) in the `config` object, instances of those classes are automatically excluded from `Proxy` conversion. This is important for preventing infinite recursion errors like `Maximum call stack size exceeded`.

## 6.4. Build and Deployment

Finally, we need to convert the TypeScript source code we wrote into a single JavaScript file that browsers can understand. This process is called **Bundling**, and tools like `webpack` are used.

-   **`tsconfig.json`**: Defines the settings for the TypeScript compiler. `target: "ESNext"` ensures the use of the latest JavaScript syntax, and `module: "esnext"` defines the module system. `experimentalDecorators` and `emitDecoratorMetadata` are required to use decorator syntax.
-   **`webpack.config.js`**: Configures Webpack's behavior.
    -   `entry`: Specifies the entry point file (e.g., `index.ts`) to start bundling.
    -   `output`: Specifies the name and path of the output file.
    -   `resolve`: Configures so that extensions like `.ts` or `.js` can be omitted when `import`ing.
    -   `module.rules`: Configures `.ts` files to be converted from TypeScript to JavaScript via `ts-loader`, and `.css` or `.html` files to be loaded as text.

When a command like `npm run build` is executed, Webpack starts from the `entry` file, follows all `import`ed files, combines and converts them into a single file, and produces the final output.

--- 

**Congratulations!** With the end of this chapter, we have directly designed and explored the principles of all core elements of a modern frontend framework, from the reactivity core to the component system, routing, and the build process. The knowledge gained through this journey will be an excellent foundation for you to understand the internals of any framework more deeply and design better software architectures.
