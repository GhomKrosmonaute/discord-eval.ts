
# DiscordEval.js

## Install

```
npm install discord-eval.ts
```

## Example

Here is the minimum required for your Eval command to work. **Think of securing access because a malicious Eval can be devastating for your PC !**

```ts
import discordEval from 'discord-eval.js'
import Discord from 'discord.js'

const client = new Discord.Client()

client.login("token")

client.on('message', async function(message: Discord.Message){
	if(message.content.startsWith("js")){
		let code = message.content.replace("js","").trim()
		await discordEval(code, message)
	}
})
```