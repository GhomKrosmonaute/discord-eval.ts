import discord from "discord.js"
import { evaluate as _, EvaluateOptions } from "ghom-eval"
import { code } from "./utils.js"

export interface FormatOptions {
  ctx?: Record<string, any>
  verbose?: boolean
  muted?: boolean
  lang?: EvaluateOptions["lang"]
}

export async function evaluate(
  input: string,
  options?: FormatOptions,
  embedPresets: {
    success: discord.EmbedBuilder
    error: discord.EmbedBuilder
  } = {
    success: new discord.EmbedBuilder().setColor("#00FF00"),
    error: new discord.EmbedBuilder().setColor("#FF0000"),
  },
): Promise<discord.EmbedBuilder> {
  const evaluated = await _(input, {
    lang: options?.lang,
    ctx: options?.ctx,
    ctxName: options?.ctx
      ? `{ ${Object.keys(options.ctx).join(", ")} }`
      : undefined,
  })

  if (options?.muted) {
    return embedPresets.success.setDescription(
      `Successfully evaluated in ${evaluated.duration}ms`,
    )
  } else {
    const embed = embedPresets[evaluated.failed ? "error" : "success"]
      .setTitle(`Result ${evaluated.failed ? "(failed)" : ""}`)
      .setDescription(
        await code.stringify({
          content: evaluated.output.slice(0, 2000).replace(/```/g, "\\`\\`\\`"),
          lang: "js",
        }),
      )

    if (options?.verbose)
      embed.addFields({
        name: "Information",
        value: await code.stringify({
          content: `type: ${evaluated.type}\nclass: ${evaluated.class}\nduration: ${evaluated.duration}ms`,
          lang: "yaml",
        }),
        inline: true,
      })

    return embed
  }
}
