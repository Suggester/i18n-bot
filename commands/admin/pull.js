const request = require("request");
const fs = require("fs");
const { logs } = require("../../config");
module.exports = {
	controls: {
		name: "pull",
		permission: 1,
		usage: "pull",
		description: "Pulls strings from GitHub",
		enabled: true,
		permissions: ["VIEW_CHANNEL", "SEND_MESSAGES"]
	},
	do: async (message, bot) => {
		let sent = await bot.createMessage(message.channel.id, "Pulling strings from main GitHub repo...");
		request("https://raw.githubusercontent.com/Suggester-Bot/Suggester/staging/utils/strings.js", (err, res) => {
			let file = res.body;
			fs.writeFile("strings/strings.js", file, async function (err) {
				if (err) return sent.edit(`Error: \`${err.stack}\``);
				await sent.edit("`String fetch successfully completed. Strings up to date. Bot rebooting to account for changes...`");
				if (bot.getChannel(logs)) await bot.createMessage(logs, `📥 ${message.author.tag} (\`${message.author.id}\`) pulled new strings from GitHub`);
				return process.exit();
			});
		});
	}
};
