const { checkPermissions, errorLog } = require("../coreFunctions");
const { prefix: defaultPrefix } = require("../config.json");

module.exports = async (Eris, bot, message) => {
	if (message.author.bot === true) return;

	let regexEscape = "^$.|?*+()[{".split("");
	regexEscape.push("\\");

	let regexText = `^(${defaultPrefix}|<@!?${bot.user.id}> ?${message.channel.type === 1 ? "|" : ""})([a-zA-Z0-9]+)`;

	for (let i = 0; i < regexText.length; i++) {
		if (regexEscape.includes(regexText[i])) regexText[i] = "\\" + regexText[i];
	}

	const match = message.content.match(new RegExp(regexText));
	if (!match) return;
	let args = message.content.split(" ").splice(match[1].endsWith(" ") ? 2 : 1);

	const command = bot.commands.find((c) => c.controls.name === match[2].toLowerCase() || (c.controls.aliases && c.controls.aliases.includes(match[2].toLowerCase())));
	if (!command) return;

	if (!command.controls.enabled) return bot.createMessage(message.channel.id, ":x: This command is currently disabled.");

	const permission = await checkPermissions(message.member || message.author, bot);
	if (permission > command.controls.permission) return bot.createMessage(message.channel.id, ":x: You do not have permission to use this command");
	try {
		return command.do(message, bot, args, Eris);
	} catch (err) {
		bot.createMessage(message.channel.id, ":thinking: Something went wrong");
		errorLog(err, "Command Handler", `Message Content: ${message.content}`);
	}
};
