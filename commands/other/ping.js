const humanizeDuration = require("humanize-duration");
const ms = require("ms");
const pretty = require("prettysize");
module.exports = {
	controls: {
		name: "ping",
		permission: 1,
		aliases: ["hi", "about", "bot"],
		usage: "ping",
		description: "Checks bot response time",
		enabled: true,
		dm_allowed: true
	},
	do: async (message, bot) => {
		bot.createMessage(message.channel.id, `Uptime: \`${humanizeDuration(bot.uptime)}\`\nMemory: \`${pretty((process.memoryUsage().heapUsed).toFixed(2))}\``).then(sent => {
			sent.edit(`${sent.content}\nEdit Time: \`${ms(new Date().getTime() - sent.timestamp)}\``);
		});
	}
};
