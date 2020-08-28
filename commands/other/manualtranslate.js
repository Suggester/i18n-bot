const fs = require("fs");
const { logs } = require("../../config");
const { list } = require("../../strings/strings");
const { checkLocale, checkPermissions } = require("../../coreFunctions");
module.exports = {
	controls: {
		name: "manualtranslate",
		permission: 10,
		usage: "mt [locale] [string] [translation]",
		description: "Manually sets a translation for a specific string",
		aliases: ["mt", "mtranslate", "translate"],
		enabled: true,
		permissions: ["VIEW_CHANNEL", "SEND_MESSAGES"],
		dm_allowed: true
	},
	do: async (message, bot, args) => {
		if (!args[0]) return bot.createMessage(message.channel.id, ":x: You must specify a locale!");
		if (!args[1]) return bot.createMessage(message.channel.id, ":x: You must specify a string name.");
		if (!args[2]) return bot.createMessage(message.channel.id, ":x: You must specify a translation.");

		await fs.readdir("i18n", async function(err, files) {
			if (err) return bot.createMessage(message.channel.id, `:x: An error occurred: \`${err.stack}\``);
			let foundLocaleName = files.filter(f => f.endsWith(".json")).find(f => checkLocale(f, args[0]));
			if (!foundLocaleName) return bot.createMessage(message.channel.id, ":x: Locale not found");
			let foundLocale = require(`../../i18n/${foundLocaleName}`);
			const permission = await checkPermissions(message.member, bot);
			if (!foundLocale.settings.allowed.includes(message.author.id) && permission > 1) return bot.createMessage(message.channel.id, ":x: You are not authorized to translate this locale");
			let strName = args[1].toUpperCase();
			let str = list[strName];
			if (!str) return bot.createMessage(message.channel.id, `:x: No string with that name was found`);
			let translation = args.splice(2).join(" ");
			if (str.replaced) {
				let missingParams = [];
				Object.keys(str.replaced).forEach(key => {
					let r = str.replaced[key];
					if (!translation.includes(r.to_replace)) missingParams.push(r.to_replace);
				});
				if (missingParams.length > 0) return bot.createMessage(message.channel.id, `:x: Not all parameters were included. Make sure to include the following: \`${missingParams.join("`, `")}\`\nIf you're confused, please read the guide: https://discord.com/channels/566002482166104066/705521164562464890/742881648692953119`);
			}
			foundLocale.list[strName] = translation;
			if (!foundLocale.settings.translation_log) foundLocale.settings.translation_log = {};
			foundLocale.settings.translation_log[strName] = message.author.id;
			fs.writeFile(`i18n/${foundLocale.settings.code}.json`, JSON.stringify(foundLocale), async function (err) {
				if (err) return bot.createMessage(message.channel.id, { content: ":x: An error occurred, please report this to a staff member.", embed: { description: `\`\`\`\n${err.stack}\n\`\`\`` } });
				if (bot.getChannel(logs)) await bot.createMessage(logs, { content: `🗣️ String \`${strName}\` in locale \`${foundLocale.settings.code}\` was translated by ${message.author.tag} (\`${message.author.id}\`)`, embed: { description: `\`\`\`\n${translation}\n\`\`\`` } });
				return bot.addMessageReaction(message.channel.id, message.id, "✅");
			});
		});
	}
};
