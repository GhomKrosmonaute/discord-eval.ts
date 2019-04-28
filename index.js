const {RichEmbed} = require("discord.js")

module.exports = async function(code,message,add){
	if(
		!code ||
		message.system || 
		message.author.bot || 
		message.channel.type === 'dm'
	) return false;
	message.mentions.members.forEach(m=>{
		let regex = new RegExp(`${m}`,'g')
		code = code.replace(regex,`get("${m.id}",message)`)
	})
	message.mentions.roles.forEach(r=>{
		let regex = new RegExp(`${r}`,'g')
		code = code.replace(regex,`get("${r.id}",message)`)
	})
	message.mentions.channels.forEach(c=>{
		let regex = new RegExp(`${c}`,'g')
		code = code.replace(regex,`get("${c.id}",message)`)
	})
	let match = code.match(/(@.+?#\d{4})/g)
	if(Array.isArray(match)){
		match.forEach(o=>{
			let member = message.guild.members.find(m=>{
				return (
					m.user.discriminator === o.slice(o.indexOf("#")) &&
					o.includes(m.user.username)
				)
			})
			if(member){
				code = code.replace(o,`get("${member.id}",message)`)
			}
		})
	}
	let editable = false
	if(code.includes("await")){
		code = `wait(async function(){\n\t${code.replace(/\n/g,"\n\t")}\n})`
		let embed = new RichEmbed()
			.setTitle('DiscordEval')
			.setDescription(`Code en cours d'execution...`)
		editable = await message.channel.send(embed)
	}else{
		code = `exec(function(){\n\t${code.replace(/\n/g,"\n\t")}\n})`
	}
	let retour = null
	try{
		retour = await eval(code)
	}catch(err){
		retour = err
	}
	let classe = "void"
	if(
		retour!==undefined &&
		retour!==null
	){
		classe = retour.constructor.name;
	}
	let embed = new RichEmbed()
		.setTitle(`DiscordEval`)
		.setDescription(
			`**Classe** : \`\`${classe}\`\`\n`+
			`**Type** : \`${typeof(retour)}\``
		)
		.addField(`Commande ↓`,`\`\`\`js\n${
			message.content
		}`.slice(0,800)+`\n\`\`\``)
		.addField(`Code ↓`,`\`\`\`js\n${
			code.length>0?code:"void"
		}`.slice(0,800)+`\n\`\`\``)
	if(editable){
		await editable.edit(embed)
	}else{
		editable = await message.channel.send(embed)
	}
	if(code.includes("return")||`${retour}`.includes("Error")){
		embed = new RichEmbed()
		embed.setTitle(`Return ↓`)
		embed.setDescription(`\`\`\`js\n${
			`${retour}`.length>0?`${retour}`:"void"
		}`.slice(0,1800)+`\n\`\`\``)
		editable = await message.channel.send(embed)
	}
	return editable
}

function exec(callback){
	try{
		return callback()
	}catch(error){
		return error
	}
}
async function wait(callback){
	try{
		return await callback()
	}catch(error){
		return error
	}
}
function get(nameOrID,message){
	nameOrID = nameOrID.toLowerCase()
	let getter = false
	if(!getter || nameOrID.includes("@&")){
		nameOrID = nameOrID.replace("@&","")
		getter = message.guild.roles.get(nameOrID) || 
		message.guild.roles.find(e=>{
			return e.name.toLowerCase().includes(nameOrID)
		}) || false
	}
	if(!getter || nameOrID.includes("@")){
		nameOrID = nameOrID.replace("@","")
		getter = message.guild.members.get(nameOrID) || 
		message.guild.members.find(m=>{
			return m.displayName.toLowerCase().includes(nameOrID) || 
			m.user.username.toLowerCase().includes(nameOrID) || 
			m.user.discriminator.includes(nameOrID)
		}) || false
	}
	if(!getter || nameOrID.includes("#")){
		nameOrID = nameOrID.replace("#","")
		getter = message.guild.channels.get(nameOrID) || 
		message.guild.channels.find(e=>{
			return e.name.toLowerCase().includes(nameOrID)
		}) || false
	}
	return getter || 'type data is not defined'
}