## Using Proxies to track changes on any object
This is an attempt to create a library that will allow changes on objects to be tracked via the use of [Proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy).

A proxify Class and Function exists that wraps an Object in a Proxy and attaches custom observers if needs be.
In the case of the react project here, I used the observers to ``setState`` when any property changed or was added; Almost like subscribing in redux.

```
const o: any = {
  a: "Hello",
  b: "World",
  c: {
    d: "This",
    e: "Is",
    f: [
      "Tracking",
      "All",
      "Your",
      [
        "Changes",
        "!",
        {
          g: "😊"
        }
      ]
    ]
  }
};

const p = proxify(o, [() => {
  setChanges(p.getChanges());
}]);
```
