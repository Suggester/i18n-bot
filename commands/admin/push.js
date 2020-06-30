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
	do: async (message, client) => {
		let sent = await message.channel.send("Pushing i18n folder to GitHub...");
		exec(`cd i18n && git add . && git commit -m "Push new translation changes (${message.author.username})" && git push origin master`).then(async result => {
			await client.channels.cache.get(logs).send(`📤 ${message.author.tag} pushed translated strings to GitHub`);
			return sent.edit(result.stdout.substr(0, 1900), { code: "xl" });
		}).catch(err => sent.edit(`Error: \`${err.stderr}\``));
	}
};
