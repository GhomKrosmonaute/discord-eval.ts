import * as util from "util"
import * as prettier from "prettier"
import typescript from "typescript"

// import React from "react"
// import ReactDOMServer from "react-dom/server"

const codeInBlock = /^```((?:js|ts)x?|typescript|javascript)?\s(.+[^\\])```$/is

export interface Evaluated {
  class: string
  type: string
  input: string
  output: string
  duration: number
  evaluated: string
  failed: boolean
}

export interface EvaluateOptions {
  /**
   * The context object to pass to the evaluated code.
   */
  ctx?: any

  /**
   * The name of the context object in the evaluated code.
   */
  ctxName?: string

  /**
   * The language of the code to evaluate.
   */
  lang?: "ts" | "js" | "typescript" | "javascript" // | "jsx" | "tsx"

  /**
   * The options to pass to Prettier for formatting the output.
   */
  prettierOptions?: prettier.Options

  /**
   * The options to pass to `util.inspect` for formatting the objects output.
   */
  inspectOptions?: util.InspectOptions

  /**
   * The options to pass to the TypeScript compiler.
   */
  compilerOptions?: typescript.CompilerOptions
}

export async function evaluate(
  code: string,
  options?: EvaluateOptions,
): Promise<Evaluated> {
  const input = code
  const result = codeInBlock.exec(code)
  const lang = options?.lang || result?.[1] || "js"

  const startedAt = Date.now()

  let duration = 0
  let failed = false
  let out: any

  code = result ? result[2] : code.trim()

  code = /^(?:return|throw|let|const|var)|\n|\b=\b/.test(code)
    ? code
    : `return ${code}`
  code = `${
    code.includes("await") ? "async" : ""
  } (${options?.ctxName ?? "ctx"}${"" /*lang.endsWith("x") ? "" : ", React, ReactDOMServer"*/}) => {${code}}`.trim()

  if (
    lang === "ts" ||
    lang === "typescript" // ||
    // lang === "tsx" ||
    // lang === "jsx"
  ) {
    const { outputText, diagnostics } = typescript.transpileModule(code, {
      compilerOptions: {
        // jsx: lang.endsWith("x") ? typescript.JsxEmit.React : undefined,
        ...options?.compilerOptions,
        noEmit: true,
        declaration: false,
      },
    })

    code = outputText

    if (diagnostics && diagnostics.length > 0) {
      const message = diagnostics
        .map((diagnostic) => {
          const { line, character } =
            diagnostic.file?.getLineAndCharacterOfPosition(
              diagnostic.start!,
            ) || { line: 0, character: 0 }
          return `${diagnostic.messageText} (${line + 1},${character + 1})`
        })
        .join("\n")

      out = new Error(`TypeScript compilation errors:\n${message}`)
      failed = true
    }
  }

  if (!failed) {
    try {
      out = await eval(code)(options?.ctx /*, React, ReactDOMServer*/)
    } catch (err) {
      out = err
      failed = true
    }
  }

  duration = Date.now() - startedAt

  const type = typeof out
  let _class = "void"
  if (out !== undefined && out !== null) {
    _class = out.constructor.name
  }

  if (type === "object" && out !== null) {
    out = util.inspect(out, options?.inspectOptions)
  }

  let formatted = code
  try {
    const prettify = await import("ghom-prettify")
    formatted = await prettify.format(code, {
      lang: "js",
      semi: false,
      printWidth: 86,
      ...options?.prettierOptions,
    })
  } catch {}

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
