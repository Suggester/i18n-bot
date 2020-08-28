const exec = (require("util").promisify((require("child_process").exec)));
const { logs } = require("../../config");
module.exports = {
	controls: {
		name: "push",
		permission: 1,
		usage: "push",
		description: "Pushes translations to GitHub",
		enabled: true,
		permissions: ["VIEW_CHANNEL", "SEND_MESSAGES"]
	},
	do: async (message, bot) => {
		let sent = await bot.createMessage(message.channel.id, "Pushing i18n folder to GitHub...");
		exec(`cd i18n && git add . && git commit -m "Push new translation changes (${message.author.username})" && git push origin master`).then(async result => {
			if (bot.getChannel(logs)) await bot.createMessage(logs, `:outbox_tray: ${message.author.tag} (\`${message.author.id}\`) pushed translations to GitHub`);
			return sent.edit(`\`\`\`xl\n${result.stdout.substr(0, 1900)}\n\`\`\``);
		}).catch(err => sent.edit(`Error: \`${err.stderr}\``));
	}
};
