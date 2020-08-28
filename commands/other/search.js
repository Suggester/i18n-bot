const { list } = require("../../strings/strings");
module.exports = {
	controls: {
		name: "search",
		permission: 10,
		usage: "search [string]",
		description: "Searches the master string list for a term",
		enabled: true,
		permissions: ["VIEW_CHANNEL", "SEND_MESSAGES"]
	},
	do: async (message, bot, args) => {
		if (!args[0]) return bot.createMessage(message.channel.id, ":x: You must specify a search term");
		let criteria = args.join(" ").toLowerCase();
		let found = Object.keys(list).filter(k => list[k].string.toLowerCase().includes(criteria));
		if (found.length === 0) return bot.createMessage(message.channel.id, ":x: No strings were found including your search");
		let toSend = `${found.length} strings were found including your criteria:\n${found.map(s => `\`${s}\``).join("\n")}`;
		if (toSend.length > 2000) {
			await bot.createMessage(message.channel.id, `Your search returned ${found.length} results, and the content is too long to be posted as a message. The list can be found in this file:`, {
				file: Buffer.from(toSend),
				name: "search-results.txt"
			} );
		} else await bot.createMessage(message.channel.id, toSend);
	}
};
