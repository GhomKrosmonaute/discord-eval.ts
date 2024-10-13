import { evaluate, EvaluateOptions } from "./index"
import * as prettify from "ghom-prettify"

describe("evaluate", () => {
  it("devrait évaluer un code JS simple", async () => {
    const code = "2 + 2"
    const result = await evaluate(code)

    expect(result.class).toBe("Number")
    expect(result.type).toBe("number")
    expect(result.input).toBe(code)
    expect(result.output).toBe("4")
    expect(result.evaluated).toContain("2 + 2") // vérifier que le code est là
    expect(result.failed).toBe(false)
  })

  it("devrait capturer une erreur dans le code JS", async () => {
    const code = "throw new Error('Erreur test')"
    const result = await evaluate(code)

    expect(result.class).toBe("Error")
    expect(result.type).toBe("object")
    expect(result.input).toBe(code)
    expect(result.output).toContain("Error: Erreur test")
    expect(result.evaluated).toContain(`throw new Error("Erreur test")`) // vérifier que le code est là
    expect(result.failed).toBe(true)
  })

  it("devrait transpiler et évaluer un code TypeScript", async () => {
    const code = "let x: number = 42; return x"
    const result = await evaluate(code, { lang: "ts" })

    expect(result.class).toBe("Number")
    expect(result.type).toBe("number")
    expect(result.input).toBe(code)
    expect(result.output).toBe("42")
    expect(result.failed).toBe(false)
  })

  it("devrait formater le code avec Prettier", async () => {
    const code = "const a = 2 + 2;"
    const options: EvaluateOptions = {
      prettierOptions: { semi: false, printWidth: 86 },
    }
    const result = await evaluate(code, options)

    expect(result.evaluated).toContain("const a = 2 + 2") // vérifier que le code est là
  })

  it("devrait gérer les options d'inspection de util", async () => {
    const code = "{ a: 1 }"
    const options: EvaluateOptions = {
      inspectOptions: { depth: 2 },
    }
    const result = await evaluate(code, options)

    expect(result.output).toContain("{ a: 1 }") // vérifier que le code est inspecté
  })
})
