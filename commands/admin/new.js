const fs = require("fs");
const { logs } = require("../../config");
module.exports = {
	controls: {
		name: "new",
		permission: 1,
		usage: "new [locale abbrev (ex. en)] | [native locale name] | [english locale name]",
		description: "Creates a new locale",
		aliases: ["newlocale", "create", "createlocale"],
		enabled: true,
		permissions: ["VIEW_CHANNEL", "SEND_MESSAGES"]
	},
	do: async (message, bot, args) => {
		let commandArgs = args.join(" ").split(" | ");
		if (!commandArgs[0]) return bot.createMessage(message.channel.id, ":x: You must specify the locale abbreviation! Make sure you're putting ` | ` between each argument.");
		if (!commandArgs[1]) return bot.createMessage(message.channel.id, ":x: You must specify the native locale name! Make sure you're putting ` | ` between each argument.");
		if (!commandArgs[2]) return bot.createMessage(message.channel.id, ":x: You must specify the English locale name! Make sure you're putting ` | ` between each argument.");

		if (fs.existsSync(`i18n/${commandArgs[0].toLowerCase()}.json`)) return bot.createMessage(message.channel.id, ":x: A locale with this code already exists.");

		let newTranslationFile = {
			settings: {
				code: commandArgs[0].toLowerCase(),
				native: commandArgs[1],
				english: commandArgs[2],
				allowed: [],
				proofreader: [],
				translation_log: [],
				proof_log: []
			},
			list: {}
		};

		fs.writeFile(`i18n/${commandArgs[0].toLowerCase()}.json`, JSON.stringify(newTranslationFile), async function (err) {
			if (err) return bot.createMessage(message.channel.id, `:x: An error occurred: \`${err.stack}\``);
			if (bot.getChannel(logs)) await bot.createMessage(logs, `:new: Locale \`${newTranslationFile.settings.code}\` (\`${newTranslationFile.settings.native}\`, \`${newTranslationFile.settings.english}\`) was created by ${message.author.tag} (\`${message.author.id}\`)`);
			return bot.createMessage(message.channel.id, `__New Locale Created__\n>>> Language Code: \`${newTranslationFile.settings.code}\`\nNative Name: \`${newTranslationFile.settings.native}\`\nEnglish Name: \`${newTranslationFile.settings.english}\``);
		});
	}
};
