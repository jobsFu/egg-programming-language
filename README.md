# egg programming language

```javascript
egg.run(`
    do(
        define(foo, fun(
            n,
            if(<(n, 3), 1, +(foo(-(n, 1)), foo(-(n, 2))))
        )),
        print(foo(7))
    )
`);
```
