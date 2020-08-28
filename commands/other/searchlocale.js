const fs = require("fs");
const { list } = require("../../strings/strings");
const { fetchUser, checkLocale } = require("../../coreFunctions");
module.exports = {
	controls: {
		name: "searchlocale",
		permission: 10,
		usage: "searchlocale [locale] [string]",
		description: "Searches the translated string list of a locale for a term",
		enabled: true,
		permissions: ["VIEW_CHANNEL", "SEND_MESSAGES"]
	},
	do: async (message, bot, args) => {
		if (!args[0]) return bot.createMessage(message.channel.id, ":x: You must specify a locale");
		if (!args[1]) return bot.createMessage(message.channel.id, ":x: You must specify a search term");

		await fs.readdir("i18n", async function(err, files) {
			if (err) return bot.createMessage(message.channel.id, `:x: An error occurred: \`${err.stack}\``);
			let foundLocaleName = files.filter(f => f.endsWith(".json")).find(f => checkLocale(f, args[0]));
			if (!foundLocaleName) return bot.createMessage(message.channel.id, ":x: Locale not found");
			let foundLocale = require(`../../i18n/${foundLocaleName}`);
			let criteria = args.splice(1).join(" ").toLowerCase();
			let found = Object.keys(foundLocale.list).filter(k => foundLocale.list[k].toLowerCase().includes(criteria));
			if (found.length === 0) return bot.createMessage(message.channel.id, `:x: No translated ${foundLocale.settings.english} strings were found including your search`);
			let toSend = `${found.length} translated strings were found including your criteria:\n${found.map(s => `\`${s}\``).join("\n")}`;
			if (toSend.length > 2000) {
				await bot.createMessage(message.channel.id, `Your search returned ${found.length} results, and the content is too long to be posted as a message. The list can be found in this file:`, {
					file: Buffer.from(toSend),
					name: "search-results.txt"
				});
			} else await bot.createMessage(message.channel.id, toSend);
		});
	}
};
