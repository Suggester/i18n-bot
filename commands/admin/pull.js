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
	do: async (message, client) => {
		let sent = await message.channel.send("Pulling strings from main GitHub repo...");
		request("https://raw.githubusercontent.com/Suggester-Bot/Suggester/staging/utils/strings.js", (err, res) => {
			let file = res.body;
			fs.writeFile("strings/strings.js", file, async function (err) {
				if (err) return sent.edit(`Error: \`${err.stack}\``);
				await sent.edit("`String fetch successfully completed. Strings up to date. Bot rebooting to account for changes...`");
				await client.channels.cache.get(logs).send(`📥 ${message.author.tag} pulled new strings from GitHub`);
				return process.exit();
			});
		});
	}
};
