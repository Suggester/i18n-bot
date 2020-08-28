const fs = require("fs");
const { list } = require("../../strings/strings");
const { fetchUser, checkLocale } = require("../../coreFunctions");
module.exports = {
	controls: {
		name: "string",
		permission: 10,
		usage: "string [string] (locale)",
		description: "Shows string information",
		aliases: ["str", "stringinfo"],
		enabled: true,
		permissions: ["VIEW_CHANNEL", "SEND_MESSAGES"]
	},
	do: async (message, bot, args) => {
		if (!args[0]) return bot.createMessage(message.channel.id, ":x: You must specify a string name");
		const string = args[0].toUpperCase();
		const locale = args[1] ? args[1].toLowerCase() : null;

		if (!list[string]) return bot.createMessage(message.channel.id, ":x: This string name does not correspond to any strings currently in the database");
		const str = list[string];

		await fs.readdir("i18n", async function (err, files) {
			if (err) return bot.createMessage(message.channel.id, `:x: An error occurred: \`${err.stack}\``);
			let localeGot;
			if (locale) {
				let foundLocaleName = files.filter(f => f.endsWith(".json")).find(f => checkLocale(f, args[1]));
				if (!foundLocaleName) return bot.createMessage(message.channel.id, ":x: That is an invalid locale");
				let foundLocale = require(`../../i18n/${foundLocaleName}`);
				localeGot = foundLocale;
			}
			let embed = {
				title: `String: ${string}`,
				description: str.string,
				fields: [
					{
						name: "Raw Content",
						value: `\`\`\`\n${str.string}\n\`\`\``
					},
					{
						name: "Context",
						value: str.context || "No context. Please contact a developer."
					}
				],
				color: 0x7e6bf0
			};
			let replacedValue = [];
			if (str.replaced) Object.keys(str.replaced).forEach(r => replacedValue.push(`\`${str.replaced[r].to_replace}\`: ${str.replaced[r].description}`));
			if (replacedValue.length > 0) embed.fields.push({
				name: "Parameters",
				value: replacedValue.join("\n")
			});
			if (locale) embed.fields.push({
				name: `${localeGot.settings.native} (${localeGot.settings.english}) Translation`,
				value: localeGot.list[string] || "This string has not been translated"
			});
			if (locale && localeGot.settings.translation_log && localeGot.settings.translation_log[string]) {
				embed.fields.push({
					name: "Translated by",
					value: (await fetchUser(localeGot.settings.translation_log[string], bot)).tag
				});
				embed.fields.push({
					name: "Proofread by",
					value: localeGot.settings.proof_log && localeGot.settings.proof_log[string] ? (await fetchUser(localeGot.settings.translation_log[string], bot)).tag : "Not proofread"
				});
			}
			return bot.createMessage(message.channel.id, { embed });
		});
	}
};
