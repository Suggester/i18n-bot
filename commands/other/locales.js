const fs = require("fs");
const { list } = require("../../strings/strings.js");
module.exports = {
	controls: {
		name: "locales",
		permission: 9,
		usage: "locales",
		description: "Shows list of locales",
		aliases: ["list"],
		enabled: true,
		permissions: ["VIEW_CHANNEL", "SEND_MESSAGES"],
		dm_allowed: true
	},
	do: async (message) => {
		const totalStrings = Object.keys(list).length;
		let localeArr = [];
		await fs.readdir("i18n", async function(err, files) {
			if (err) return message.channel.send(`Error: \`${err.stack}\``);
			for await (let filename of files.filter(f => f.endsWith(".json"))) {
				let file = require(`../../i18n/${filename}`);
				let totalLocaleStrings = Object.keys(file.list).filter(s => list[s]).length;
				localeArr.push(`- [${file.settings.code}] ${file.settings.native} (${file.settings.english}) (${totalLocaleStrings}/${totalStrings}, ${Math.round((totalLocaleStrings/totalStrings + Number.EPSILON) * 100)}%)`);
			}
			return message.channel.send(`= Current Locales =\n${localeArr.join("\n")}`, {code: "asciidoc"});
		});
	}
};
