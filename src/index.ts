import Discord from "discord.js"

const prettify = require("ghom-prettify")
const codeInBlock = /^```(?:js)?\s(.+[^\\])```$/is

export default async function (
  code: string,
  message: Discord.Message,
  muted: boolean = false
): Promise<void> {
  if (!code || message.system || message.author.bot) return

  /**
   * @type {?module:"discord.js".Message}
   */
  let editable = null

  code = code.trim()
  if (codeInBlock.test(code)) {
    code = code.replace(codeInBlock, "$1")
  }

  if (code.includes("resolve") && !code.includes("new Promise")) {
    code = `return await new Promise(resolve => {${code})`
  }

  if (code.includes("await")) {
    code = `async () => {${code}}`

    if (!muted) {
      let embed = new Discord.MessageEmbed()
        .setTitle("DiscordEval")
        .setDescription(`Running...`)

      editable = await message.channel.send(embed)
    }
  } else {
    code = `() => {${code}}`
  }

  let out = null
  try {
    out = await eval(code)()
  } catch (err) {
    out = err
  }

  if (muted) return

  let classe = "void"
  if (out !== undefined && out !== null) {
    classe = out.constructor.name
  }

  let formatted = code
  try {
    formatted = await prettify(code, "js")
  } catch (err) {}

  let embed = new Discord.MessageEmbed()
    .setTitle(`DiscordEval`)
    .setDescription(
      `**Classe** : \`\`${classe}\`\`\n` + `**Type** : \`${typeof out}\``
    )
    .addField(
      `Code ↓`,
      `\`\`\`js\n${formatted.length > 0 ? formatted : "void"}`.slice(0, 800) +
        `\n\`\`\``
    )

  if (editable) {
    await editable.edit(embed)
  } else {
    await message.channel.send(embed)
  }

  if (code.includes("return") || `${out}`.includes("Error")) {
    embed = new Discord.MessageEmbed()
    embed.setTitle(`Return ↓`)
    embed.setDescription(
      `\`\`\`js\n${`${out}`.length > 0 ? `${out}` : "void"}`.slice(0, 1800) +
        `\n\`\`\``
    )
    await message.channel.send(embed)
  }
}
