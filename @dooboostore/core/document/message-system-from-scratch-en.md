# Creating My Own Message System: A Journey Inspired by RxJS

## Introduction: Why Another Message System?

Hello, fellow developers.

This article is about a small, cute(?) message system I built myself. Many of you might wonder, "With great libraries like RxJS already out there, why bother reinventing the wheel?" That's a fair question. I, too, initially just used the seemingly monolithic RxJS.

But one day, a thought struck me:

> "What's really happening inside the heart of this tool I use every day?"

This small curiosity was the beginning of this project. This book goes beyond simply listing API usage and aims to share my experiences and realizations, such as:

1.  **In-depth Learning:** The best way to understand something is to build it yourself. We'll delve into the essence of reactive programming by implementing core RxJS concepts like `Observable` and `Subject` from scratch.
2.  **Lightweight and Optimized:** RxJS is powerful, but sometimes it can feel too heavy for a project. We'll explore the balance between 'need' and 'functionality' by creating a lightweight system that contains only the features we absolutely need.
3.  **Control and Flexibility:** A self-made system has the powerful advantage of giving you control over every line of code. I'll share the joy of tracking down bugs and extending the system in desired directions.

I hope that you, the reader, will not just be a 'subscriber' passively receiving knowledge, but a 'developer' who builds this system with me from the ground up. So, shall we begin our journey together?

---

## Chapter 1: The Beginning of Everything, `Observable`

Our journey starts with the `Observable`. In a nutshell, an `Observable` is **'a box containing values that will arrive in the future.'** This box does nothing until someone subscribes to it, saying, "Send me the values now!" That's why we describe it as 'lazy'.

-   Think of a **newspaper subscription**. The publisher creates a new newspaper every day (data generation), but they don't deliver it to you until you subscribe. The `Observable` is the publisher, and you are the `Observer`.

If you look at our system's `Observable.ts`, you'll see that its constructor takes a `producerFunction`.

```typescript
// Partial Observable.ts
export class Observable<T, E = any> {
  private _producerFunction: ((subscriber: Subscriber<T, E>) => ...);

  constructor(producerFunction?: ...) {
    this._producerFunction = producerFunction;
  }

  subscribe(...) {
    // ... executes the producerFunction at the time of subscription ...
  }
}
```

This is the key. The `producerFunction` is executed only when `subscribe` is called, and that's when the data starts to flow. This is called a **'Cold Observable.'** Each subscriber gets their own data stream, created anew from the beginning.

### `Observer` and `Subscription`

-   **`Observer`:** An object that processes the values sent by an `Observable`. It reacts to three signals:
    -   `next(value)`: When a new value arrives.
    -   `error(err)`: When an error occurs.
    -   `complete()`: When all values have been successfully sent.
-   **`Subscription`:** The connection between an `Observable` and an `Observer`. Its most important role is to provide the `unsubscribe()` method to break this connection. If you don't unsubscribe, you can end up with unwanted memory leaks. (I'll re-emphasize this importance later.)

---

## Chapter 2: The Hot Heart, `Subject`

If an `Observable` is 'Cold,' providing an individual data stream to each subscriber, a **`Subject` is 'Hot,' sharing the same data stream with multiple subscribers.**

-   Think of a **radio broadcast**. When the DJ plays music (data generation), all listeners hear the same music being broadcast at that moment. A listener who tunes in late cannot hear the previous songs. The `Subject` is this radio station.

A `Subject` is both an `Observable` and an `Observer`.

1.  As an `Observable`: Multiple `Observers` can `subscribe()` to it.
2.  As an `Observer`: You can inject values into the `Subject` from the outside by calling its `next()`, `error()`, and `complete()` methods.

This characteristic makes the `Subject` perfect for acting as an **Event Bus**, gathering events from various parts of an application and broadcasting them to one central place.

### The Three Special `Subject` Brothers

Our system has three special types of `Subject`:

1.  **`BehaviorSubject`**: "I'll always tell you the latest news!"
    -   It must have an initial value upon creation.
    -   When a new subscriber joins, it immediately sends them the most recently emitted value.
    -   It's very useful for managing and sharing 'current state.' (e.g., currently logged-in user information).

2.  **`ReplaySubject`**: "I'll catch you up on the news you missed!"
    -   It stores a specified number of the most recent values in a buffer.
    -   When a new subscriber joins, it sends all the buffered values to them in order.
    -   Useful when the last N pieces of data are important, like in a chat history or user action log.

3.  **`AsyncSubject`**: "I'll just give you the final result!"
    -   It only emits the **very last value** just before `complete()` is called.
    -   If `complete()` is never called, it emits no values.
    -   Suitable for asynchronous operations where only the final result is needed after everything is done.

---

## Chapter 3: Sculpting the Data Stream, `Operators`

One of the most powerful features of RxJS is its 'operators.' Operators are pure functions that process and combine the stream of data emitted by an `Observable` in any way we want. We can chain these operators together using the `Observable.pipe()` method.

-   Imagine the **water purification process**. Muddy water passes through a `pipe`, where the first `filter` removes large impurities, and a second `filter` (`map`) adds minerals.

We have also implemented some key operators in our system:

-   `map<T, R>((value: T) => R)`: Transforms an incoming value (T) into a new value (R). (e.g., extracting just the `userName` from a `user` object).
-   `filter<T>((value: T) => boolean)`: Allows only values that satisfy a specific condition (predicate) to pass through.
-   `debounceTime(duration)`: Emits the last value only after a specified period of silence. (e.g., for search box autocomplete functionality).
-   `distinctUntilChanged()`: Ignores any value that is the same as the one immediately preceding it.

Through these operators, we can express complex asynchronous logic in a declarative and readable way.

---

## Chapter 4: Lessons Learned While Building

I learned a lot beyond the technical aspects while building this system.

1.  **The Painful Importance of `unsubscribe`**
    In the initial version, I neglected the `unsubscribe` logic. As a result, I experienced memory leaks where subscriptions survived even after components were destroyed, continuing to run in the background. I learned the first principle of reactive programming the hard way: **"A subscription must be unsubscribed."**

2.  **Clearly Understanding the Difference Between Cold and Hot**
    I came to a clear understanding of the difference between 'Cold' and 'Hot', which I had only known in theory, by implementing them myself. I was able to establish a principle: use `Observable` for things that require a new execution for each call, like HTTP requests, and use `Subject` for sharing a single stream among multiple places, like UI events or state sharing.

3.  **The Greatness of Pure Functions**
    While creating operators, I realized how pure functions like `map` and `filter` reduce code complexity and increase predictability. The characteristic of pure functions—that the same input always produces the same output—made debugging asynchronous code much easier.

## Conclusion

Thank you for joining me on this journey of creating a small message system. I hope this article has sparked a little curiosity in you about the inner workings of reactive programming and, furthermore, leads you to the joy of building your own tools.

The code may not be perfect. But through this code, I have grown, and I am happy to be able to share this experience. Now it's your turn. Feel free to look at the code, modify it, and add new operators.

Because the best way to learn in this world is to 'build it yourself.'
