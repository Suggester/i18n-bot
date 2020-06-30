const { checkPermissions, errorLog } = require("../coreFunctions");
const { prefix: defaultPrefix, emoji } = require("../config.json");

module.exports = async (Discord, client, message) => {
	if (message.author.bot === true) return;

	const publicPrefixes = [defaultPrefix, `<@${client.user.id}>`, `<@!${client.user.id}>`];

	const prefixes = publicPrefixes.map(p => p.toLowerCase());
	const lcContent = message.content.toLowerCase();

	const prefix = prefixes.find(p => lcContent.startsWith(p));

	if (!lcContent.startsWith(prefix)) return;

	const [commandName, ...args] = message.content.slice(prefix.length).trim().split(" ");

	const command = client.commands.find((c) => c.controls.name.toLowerCase() === commandName || c.controls.aliases && c.controls.aliases.includes(commandName));
	if (!command) return;

	if (message.channel.type === "dm") return message.channel.send("Commands are currently unusable in DMs, please use them in a chat channel")

	if (command.controls.enabled === false) return message.channel.send("This command is currently disabled.");

	const permission = await checkPermissions(message.author, client);
	if (permission > command.controls.permission) {
		 if (permission === 10) message.channel.send(`<:${emoji.x}> This bot is locked to approved translators.`);
		 return;
	}

	try {
		return command.do(message, client, args, Discord);
	} catch (err) {
		message.channel.send("Error: `Something went wrong`");
		errorLog(err, "Command Handler", `Message Content: ${message.content}`);
	}
};
