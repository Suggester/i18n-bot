const { logs } = require("../../config");
const fs = require("fs");
const { checkLocale } = require("../../coreFunctions");
module.exports = {
	controls: {
		name: "modify",
		permission: 1,
		usage: "modify [locale] [setting] [value]",
		description: "Edits a locale",
		aliases: ["edit", "editlocale", "modifylocale"],
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
			if (!args[1]) return bot.createMessage(message.channel.id, ":x: You must specify a setting");
			if (!args[2]) return bot.createMessage(message.channel.id, ":x: You must specify a new value");
			let setting = args[1].toLowerCase();
			let value = args.splice(2).join(" ");
			foundLocale.settings[setting] = (value === "null" ? null : value);
			console.log(foundLocale, foundLocale.settings, setting)
			fs.writeFile(`i18n/${foundLocale.settings.code}.json`, JSON.stringify(foundLocale), async function (saveErr) {
				if (saveErr) return bot.createMessage(message.channel.id, `:x: An error occurred: \`${saveErr.stack}\``);
				if (bot.getChannel(logs)) await bot.createMessage(logs, `🛠️ Setting \`${setting}\` was set to \`${value}\` in locale \`${foundLocale.settings.code}\` by ${message.author.tag} (\`${message.author.id}\`)`);
				let sent = await bot.createMessage(message.channel.id, `:white_check_mark: Setting \`${setting}\` set to \`${value}\``);
				if (setting === "code") {
					fs.rename( `i18n/${foundLocale.settings.code}.json`, `i18n/${value.toLowerCase()}.json`, function (err) {
						if (err) return sent.edit(`${sent.content}\nRename Error: \`${err.stack}\``);
						sent.edit(`${sent.content}\n\`Locale code change file rename complete\``);
					});
				}
			});
		});
	}
};
