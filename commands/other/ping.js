const humanizeDuration = require("humanize-duration");
const ms = require("ms");
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
	do: async (message, client) => {
		message.channel.send(`Uptime: \`${humanizeDuration(client.uptime)}\`\nClient Ping: \`${Math.round(client.ws.ping)} ms\``).then(sent => {
			sent.edit(`${sent.content}\nEdit Time: \`${ms(new Date().getTime() - sent.createdTimestamp)}\``);
		});
	}
};
