const fs = require("fs");
const { list } = require("../../strings/strings");
module.exports = {
	controls: {
		name: "string",
		permission: 9,
		usage: "string <string> (locale)",
		description: "Shows string information",
		aliases: ["str", "stringinfo"],
		enabled: true,
		permissions: ["VIEW_CHANNEL", "SEND_MESSAGES"]
	},
	do: async (message, client, args) => {
		if (!args[0]) return message.channel.send("Error: `No string specified`");
		const string = args[0].toUpperCase();
		const locale = args[1] ? args[1].toLowerCase() : null;

		if (!list[string]) return message.channel.send("Error: `Invalid string`");
		const str = list[string];

		if (locale && !fs.existsSync(`i18n/${locale}.json`)) return message.channel.send("Error: `Invalid locale`");
		const translationFile = locale ? require(`../../i18n/${locale}.json`) : null;

		let replacedArr = [];
		if (str.replaced) {
			Object.keys(str.replaced).forEach(key => {
				let r = list[string].replaced[key];
				replacedArr.push(`${r.to_replace} - ${r.description}`);
			});
		}

		message.channel.send(`= ${string} =\n- English String: ${str.string}\n- Context: ${str.context}${replacedArr.length > 0 ? "\n- Parameters:\n	" + replacedArr.join("\n	"): "" }\n${locale ? `- ${translationFile.settings.native} (${translationFile.settings.english}) Translation: ${translationFile.list[string] ? translationFile.list[string] : "[ Untranslated ]"}`: ""}`, { code: "asciidoc" });
	}
};