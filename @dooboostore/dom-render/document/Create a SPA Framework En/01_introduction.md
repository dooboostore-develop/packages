# Introduction: Why Are We Building Another Framework?

In a world where numerous JavaScript frameworks exist, the question "Why build another one?" is natural. This book is not about releasing a new framework to the world. Quite the opposite. We aim to learn the essence of software architecture by dissecting the internals of a framework and building one ourselves.

## The Core Philosophy of `dom-render`

`dom-render` is built on the following simple yet powerful philosophies:

1.  **HTML-centric:** Logic does not dominate the template; instead, the template (HTML) declaratively requests the necessary logic. A developer should be able to understand everything within the HTML structure.
2.  **Pure Reactivity:** Without a Virtual DOM or complex compilation processes, changes in state are directly and efficiently reflected in the DOM through pure JavaScript `Proxy` objects. We minimize "magical" code and adhere to the fundamental principles of JavaScript.

## The Goal of This Book

This book is not a user manual for `dom-render`. It is a guide that takes you on the journey of creating a framework. Starting from an empty file, we will fill in the code by answering the following questions ourselves:

- What exactly is reactivity, and how is it implemented with `Proxy`?
- How can we efficiently find and update only the dynamic parts of a template?
- What structure should a reusable bundle of code, a 'component', have?
- How are advanced features like page transitions (Routing) or inter-component communication (Messaging) designed?

Through this process, you, the reader, will not just learn a single framework, but will also develop the ability to design software architecture, define problems, and implement solutions in code.

## A Preview of the Final Product

By the time we reach the final chapter of this book, we will have completed the core of `dom-render`, a small but powerful framework equipped with `Proxy`-based reactivity, control flow through directives, a component system, routing, and even scoped styles. Now, let's begin the enjoyable journey of framework creation.
