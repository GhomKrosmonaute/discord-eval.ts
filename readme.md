
# ghom-eval

## Install

```
npm install ghom-eval
```

## Example

**Think of securing access because a malicious Eval can be devastating for your PC!**

```ts
import evaluate from "ghom-eval" // or with CommonJS

evaluate("4 + 5")
```

### Returning

```json
{
  "class": "Number",
  "type": "number",
  "duration": 0,
  "failed": false,
  "input": "4 + 5",
  "output": "9",
  "evaluated": ";() => {\n  return 4 + 5\n}\n"
}
```

## Options

`evaluate` method has 3 parameters.

- code `string` *Evaluated code*
- context `any` *Context value to inject in code* (default: `undefined`) 
- contextName `string` *The access name of context* (default: `"context"`)

Enjoy!