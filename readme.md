
# discord-eval.ts

## Install

```
npm install discord-eval.ts
```

## Example

Here is the minimum required for your Eval command to work. **Think of securing access because a malicious Eval can be devastating for your PC!**

```ts
import { evaluate } from 'discord-eval.ts'
import discord from 'discord.js'

const client = new discord.Client()

client.login("token")

client.on('message', async function(message: Discord.Message){
    // for "!run" command
    if(message.content.startsWith("!run")){
        // isolated code (accepts the markdown code block too)
        const code = message.content.replace("!run","").trim()
      
        // eval the code
        const embed = await evaluate(code, {
          // the muted option will prevent the bot from sending the result
          muted: code.includes("@muted"),
          // the verbose option will send the code with a lot of information
          verbose: code.includes("@verbose"),
        })
      
        // send the result
        await message.channel.send(embed)
    }
})
```

And use the command.

```js
!run
// @verbose
const sum = 3 + 4
return sum
```

Enjoy!