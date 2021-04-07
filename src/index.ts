import * as prettify from "ghom-prettify"

const codeInBlock = /^```(?:js|javascript)?\s(.+[^\\])```$/is

interface Evaluated {
  class: string
  type: string
  input: string
  output: string
  duration: number
  evaluated: string
  failed: boolean
}

export default async function evaluate(code: string): Promise<Evaluated> {
  const input = code
  code = codeInBlock.test(code) ? code.replace(codeInBlock, "$1") : code.trim()
  code = /\n|return/.test(code) ? code : `return ${code}`
  code = `${code.includes("await") ? "async" : ""} () => {${code}}`.trim()

  let duration = 0
  let failed = false

  let out: any
  try {
    const startedAt = Date.now()
    out = await eval(code)()
    duration = Date.now() - startedAt
  } catch (err) {
    out = err
    failed = true
  }

  const type = typeof out
  let _class = "void"
  if (out !== undefined && out !== null) {
    _class = out.constructor.name
  }

  let formatted = code
  try {
    formatted = prettify.format(code, "js", {
      semi: false,
      printWidth: 86,
    })
  } catch (err) {}

  return {
    class: _class,
    type,
    duration,
    failed,
    input,
    output: `${out}`.length > 0 ? `${out}` : "void",
    evaluated: formatted,
  }
}

module.exports = evaluate
