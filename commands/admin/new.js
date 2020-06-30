const fs = require("fs");
const { logs } = require("../../config");
module.exports = {
	controls: {
		name: "new",
		permission: 1,
		usage: "new <locale abbrev (ex. en)> <native locale name> <english locale name>",
		description: "Creates a new locale",
		aliases: ["newlocale", "create", "createlocale"],
		enabled: true,
		permissions: ["VIEW_CHANNEL", "SEND_MESSAGES"]
	},
	do: async (message, client, args) => {
		let commandArgs = args.join(" ").split(" | ");
		if (commandArgs.length < 3) return message.channel.send("Error: `Invalid parameters. Correct usage is \"new <locale abbrev (ex. en)> | <native locale name> | <english locale name>\"`");

		if (fs.existsSync(`i18n/${commandArgs[0].toLowerCase()}.json`)) return message.channel.send("Error: `Locale already exists`");

		let newTranslationFile = {
			settings: {
				code: commandArgs[0].toLowerCase(),
				native: commandArgs[1],
				english: commandArgs[2]
			},
			list: {}
		};

		fs.writeFile(`i18n/${commandArgs[0].toLowerCase()}.json`, JSON.stringify(newTranslationFile), function (err) {
			if (err) return message.channel.send(`Error: \`${err.stack}\``);
			client.channels.cache.get(logs).send(`🆕 ${message.author.tag} created new locale \`${newTranslationFile.settings.code}\``);
			return message.channel.send(`__New Locale Created__\n>>> Language Code: \`${newTranslationFile.settings.code}\`\nNative Name: \`${newTranslationFile.settings.native}\`\nEnglish Name: \`${newTranslationFile.settings.english}\``);
		});


	}
};
