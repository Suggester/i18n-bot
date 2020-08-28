const fs = require("fs");
const { checkLocale } = require("../../coreFunctions");
const { logs } = require("../../config");
module.exports = {
	controls: {
		name: "delete",
		permission: 1,
		usage: "delete [locale]",
		description: "Deletes a locale",
		aliases: ["rm", "rmlocale", "deletelocale", "remove", "removelocale"],
		enabled: true,
		permissions: ["VIEW_CHANNEL", "SEND_MESSAGES"]
	},
	do: async (message, bot, args) => {
		await fs.readdir("i18n", async function(err, files) {
			if (err) return bot.createMessage(message.channel.id, `:x: An error occurred: \`${err.stack}\``);
			if (!args[0]) return bot.createMessage(message.channel.id, ":x: You must specify a locale");
			let foundLocaleName = files.filter(f => f.endsWith(".json")).find(f => checkLocale(f, args[0]));
			if (!foundLocaleName) return bot.createMessage(message.channel.id, ":x: Locale not found");
			let foundLocale = require(`../../i18n/${foundLocaleName}`);
			fs.unlink(`i18n/${foundLocale.settings.code}.json`, async function (err) {
				if (err) return bot.createMessage(message.channel.id, `:x: An error occurred: \`${err.stack}\``);
				if (bot.getChannel(logs)) await bot.createMessage(logs, `:wastebasket: Locale \`${foundLocale.settings.code}\` (\`${foundLocale.settings.native}\`, \`${foundLocale.settings.english}\`) was deleted by ${message.author.tag} (\`${message.author.id}\`)`);
				return bot.createMessage(message.channel.id, `:white_check_mark: Deleted locale \`${foundLocale.settings.code}\``);
			});
		});
	}
};
