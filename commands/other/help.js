const { permLevelToRole } = require("../../coreFunctions");

const { prefix } = require("../../config.json");

module.exports = {
	controls: {
		name: "help",
		permission: 10,
		aliases: ["command", "howto", "prefix"],
		usage: "help (command name)",
		description: "Shows command information",
		enabled: true,
		dm_allowed: true
	},
	do: async (message, bot, args) => {
		if (!args[0]) return bot.createMessage(message.channel.id, { embed: {
			title: `${bot.user.username} Help`,
			color: 0x7e6bf0,
			fields: [{
				name: "General Commands",
				value: bot.commands.filter(c => c.controls.module === "other").map(c => `\`${prefix}${c.controls.usage}\`: ${c.controls.description}`).join("\n")
			},
			{
				name: "Administrative Commands",
				value: bot.commands.filter(c => c.controls.module === "admin").map(c => `\`${prefix}${c.controls.usage}\`: ${c.controls.description}`).join("\n")
			}]
		}});

		let commandName = args[0].toLowerCase();
		const command = bot.commands.find((c) => c.controls.name.toLowerCase() === commandName || c.controls.aliases && c.controls.aliases.includes(commandName));
		if (!command) return bot.createMessage(message.channel.id, ":x: That is not a valid command");
		let commandInfo = command.controls;

		return bot.createMessage(message.channel.id, {
			embed: {
				title: `${prefix}${commandInfo.name}`,
				description: commandInfo.description,
				color: 0x7e6bf0,
				fields: [{
					name: "Usage",
					value: commandInfo.usage
				}, {
					name: "Permission Level",
					value: permLevelToRole(commandInfo.permission)
				}, {
					name: "Alias(es)",
					value: commandInfo.aliases ? commandInfo.aliases.map(a => `\`${prefix}${a}\``).join(", ") : "None"
				}]
			}
		});
	}
};
