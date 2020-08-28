module.exports = {
	controls: {
		name: "reboot",
		permission: 0,
		aliases: ["refresh", "shutdown", "restart"],
		usage: "reboot",
		description: "Reboots the bot by exiting the process",
		enabled: true,
		permissions: ["VIEW_CHANNEL", "SEND_MESSAGES"],
		dm_allowed: true
	},
	do: async (message, bot) => {
		await bot.createMessage(message.channel.id, "Shutting down...");
		return process.exit(0);
	}
};
