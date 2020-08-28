const fs = require("fs");
const { fetchUser } = require("../../coreFunctions");
module.exports = {
	controls: {
		name: "tlist",
		permission: 1,
		description: "Shows list of translators",
		enabled: true,
		permissions: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"],
		dm_allowed: true
	},
	do: async (message, bot) => {
		let localeArr = [];
		await fs.readdir("i18n", async function(err, files) {
			if (err) return bot.createMessage(message.channel.id, `:x: An error occurred: \`${err.stack}\``);
			for await (let filename of files.filter(f => f.endsWith(".json"))) {
				let file = require(`../../i18n/${filename}`);
				let translators = [];
				let proofreaders = [];
				if (file.settings.allowed) for await (let t of file.settings.allowed) {
					let u = await fetchUser(t, bot);
					if (u) translators.push(u.tag);
				}
				if (file.settings.proofreader) for await (let p of file.settings.proofreader) {
					let u = await fetchUser(p, bot);
					if (u) proofreaders.push(u.tag);
				}
				if (translators.length > 0 || proofreaders.length > 0) localeArr.push({
					name: file.settings.english,
					value: `**Translators:** ${translators.length > 0 ? translators.join(", ") : "None"}\n**Proofreaders:** ${proofreaders.length > 0 ? proofreaders.join(", ") : "None"}`
				});
			}
			let embed = {
				title: "Translator List",
				fields: localeArr,
				color: 0x7289da
			};
			return bot.createMessage(message.channel.id, {embed});
		});
	}
};
