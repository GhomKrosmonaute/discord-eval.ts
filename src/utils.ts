import prettier from "prettier"
import prettify from "ghom-prettify"

export interface Code {
  lang?: string
  content: string
}

export const code = {
  pattern: /^```(\S+)?\s(.+[^\\])```$/is,
  /**
   * extract the code from code block and return code
   */
  parse(raw: string): Code | undefined {
    const match = this.pattern.exec(raw)
    if (!match) return
    return {
      lang: match[1],
      content: match[2],
    }
  },
  /**
   * inject the code in the code block and return code block
   */
  async stringify({
    lang,
    content,
    format,
  }: Code & { format?: true | prettier.Options }): Promise<string> {
    return (
      "```" +
      (lang ?? "") +
      "\n" +
      (format
        ? await prettify.format(
            content,
            format === true ? { lang: lang as any } : format,
          )
        : content) +
      "\n```"
    )
  },
  /**
   * format the code using prettier and return it
   */
  format: prettify.format,
}
