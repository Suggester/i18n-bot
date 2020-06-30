const { logs } = require("../../config");
const fs = require("fs");
module.exports = {
	controls: {
		name: "modify",
		permission: 1,
		usage: "modify <locale> <setting> <value>",
		description: "Edits a locale",
		aliases: ["edit", "editlocale", "modifylocale"],
		enabled: true,
		permissions: ["VIEW_CHANNEL", "SEND_MESSAGES"]
	},
	do: async (message, client, args) => {
		if (args.length < 3) return message.channel.send("Error: `Invalid parameters. Correct usage is \"modify <locale> <setting> <value>\"`");

		const code = args[0].toLowerCase();
		const setting = args[1].toLowerCase();
		const value = args.splice(2).join(" ");

		if (!fs.existsSync(`i18n/${code}.json`)) return message.channel.send("Error: `Invalid locale`");

		const translationFile = require(`../../i18n/${code}.json`);
		translationFile.settings[setting] = setting === "code" ? value.toLowerCase() : value;

		fs.writeFile(`i18n/${code}.json`, JSON.stringify(translationFile), async function (err) {
			if (err) return message.channel.send(`Error: \`${err.stack}\``);
			let sent = await message.channel.send(`🛠️ Setting "${setting}" in locale "${code}" set to "${value}"`);
			client.channels.cache.get(logs).send(`${message.author.tag} set \`${setting}\` to \`${value}\` in locale \`${code}\``);
			if (setting === "code") {
				fs.rename( `i18n/${code}.json`, `i18n/${value.toLowerCase()}.json`, function (err) {
					if (err) return sent.edit(`${sent.content}\nRename Error: \`${err.stack}\``);
					sent.edit(`${sent.content}\n\`Locale code change file rename complete\``);
				});
			}
		});
	}
};
