
# discord-eval.ts

## Install

```
npm install discord-eval.ts
```

## Example

Here is the minimum required for your Eval command to work. **Think of securing access because a malicious Eval can be devastating for your PC!**

```ts
import discordEval from 'discord-eval.ts'
import discord from 'discord.js'

const client = new Discord.Client()

client.login("token")

client.on('message', async function(message: Discord.Message){
    // for "!run" command
    if(message.content.startsWith("!run")){
        // isolate code
        const code = message.content.replace("!run","").trim()
      
        // has muted arg ?
        const muted = code.includes("@muted")
      
        // eval the code
        await discordEval(code, message, muted)
    }
})
```

And use the command.

```js
!run
// @muted
const sum = 3 + 4
return sum
```

Enjoy!