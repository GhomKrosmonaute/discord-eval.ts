
# ghom-eval

## Install

```
npm install ghom-eval
```

## Example

**Think of securing access because a malicious Eval can be devastating for your PC!**

```ts
import evaluate from "ghom-eval" // or with CommonJS

console.log("4 + 5")
```

```js
Returning = {
  class: 'Number',
  type: 'number',
  duration: 0,
  failed: false,
  input: '4 + 5',
  output: '9',
  evaluated: ';() => {\n  return 4 + 5\n}\n',
}
```

Enjoy!