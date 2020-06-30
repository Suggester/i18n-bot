const fs = require("fs");
const { logs } = require("../../config");
module.exports = {
	controls: {
		name: "delete",
		permission: 1,
		usage: "delete <locale>",
		description: "Deletes a locale",
		aliases: ["rm", "rmlocale", "deletelocale", "remove", "removelocale"],
		enabled: true,
		permissions: ["VIEW_CHANNEL", "SEND_MESSAGES"]
	},
	do: async (message, client, args) => {
		if (!args[0]) return message.channel.send("Error: `Invalid parameters. Correct usage is \"delete <locale>\"`");

		const code = args[0].toLowerCase();

		if (!fs.existsSync(`i18n/${code}.json`)) return message.channel.send("Error: `Invalid locale`");

		fs.unlink(`i18n/${code}.json`, function (err) {
			if (err) return message.channel.send(`Error: \`${err.stack}\``);
			client.channels.cache.get(logs).send(`🗑️ ${message.author.tag} deleted locale \`${code}\``);
			return message.channel.send(`\`Locale "${code}" deleted successfully\``);
		});
	}
};
