const { list } = require("../../strings/strings");
const fs = require("fs");
const { logs } = require("../../config");
module.exports = {
	controls: {
		name: "manualtranslate",
		permission: 1,
		usage: "translate <locale> <string> <translation>",
		description: "Manually sets a translation for a specific string",
		aliases: ["mt", "mtranslate"],
		enabled: true,
		permissions: ["VIEW_CHANNEL", "SEND_MESSAGES"],
		dm_allowed: true
	},
	do: async (message, client, args, Discord) => {
		if (args.length < 3) return message.channel.send("Error: `Invalid parameters. Correct usage is \"translate <locale> <string> <translation>\"`");

		const locale = args[0].toLowerCase();
		const string = args[1].toUpperCase();
		const translation = args.splice(2).join(" ");

		if (!fs.existsSync(`i18n/${locale}.json`)) return message.channel.send("Error: `Invalid locale`");
		const translationFile = require(`../../i18n/${locale}.json`);
		if (!list[string]) return message.channel.send("Error: `Invalid String`");
		if (list[string].replaced) {
			let missingParams = [];
			Object.keys(list[string].replaced).forEach(key => {
				let r = list[string].replaced[key];
				if (!translation.includes(r.to_replace)) missingParams.push(r.to_replace);
			});
			if (missingParams.length > 0) return message.channel.send(`Error: \`Not all paramaters included. Missing ${missingParams.join(", ")}\``, {disableMentions: "all"});
		}
		translationFile.list[string] = translation;
		fs.writeFile(`i18n/${locale}.json`, JSON.stringify(translationFile), function (err) {
			if (err) return message.channel.send(`Error: \`${err.stack}\``);
			client.channels.cache.get(logs).send(`🗣️ ${message.author.tag} updated \`${string}\` in locale \`${locale}\`, set to \`${Discord.escapeMarkdown(translation)}\``);
			return message.channel.send(`\`String ${string} updated successfully\``);
		});
	}
};
