const { permLevelToRole } = require("../../coreFunctions");

const { prefix } = require("../../config.json");

module.exports = {
	controls: {
		name: "help",
		permission: 9,
		aliases: ["command", "howto", "prefix"],
		usage: "help (command name)",
		description: "Shows command information",
		enabled: true,
		dm_allowed: true
	},
	do: async (message, client, args) => {
		if (!args[0]) return message.channel.send(`= ${client.user.username} Command List =\n\n[ Translators ]${client.commands.filter(c => c.controls.permission === 9).map(c => `\n- ${prefix}${c.controls.usage} - ${c.controls.description}`)}\n\n[ Translation Managers ]${client.commands.filter(c => c.controls.permission === 1).map(c => `\n- ${prefix}${c.controls.usage} - ${c.controls.description}`)}\n\n[ Admin Commands ]${client.commands.filter(c => c.controls.permission === 0).map(c => `\n- ${prefix}${c.controls.usage} - ${c.controls.description}`)}`, { code: "asciidoc"});

		let commandName = args[0].toLowerCase();

		const command = client.commands.find((c) => c.controls.name.toLowerCase() === commandName || c.controls.aliases && c.controls.aliases.includes(commandName));

		if (!command) return;

		let commandInfo = command.controls;

		return message.channel.send(`= Command: ${commandName} =\n${commandInfo.description}\n\n- Permission Level: ${permLevelToRole(commandInfo.permission)}\n- Usage: ${prefix}${commandInfo.usage}\n${commandInfo.aliases ? (commandInfo.aliases.length > 1 ? "- Aliases: " : "- Alias: ") + commandInfo.aliases.join(", ") : ""}`, { code: "asciidoc" });

	}
};
