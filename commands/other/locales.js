const fs = require("fs");
const { list } = require("../../strings/strings.js");
const { fetchUser, checkLocale } = require("../../coreFunctions");
module.exports = {
	controls: {
		name: "locales",
		permission: 10,
		usage: "locales",
		description: "Shows list of locales",
		aliases: ["list", "locale"],
		enabled: true,
		permissions: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS"],
		dm_allowed: true
	},
	do: async (message, bot, args) => {
		const totalStrings = Object.keys(list).length;
		let localeArr = [];
		let selfLocaleArr = [];
		await fs.readdir("i18n", async function(err, files) {
			if (err) return bot.createMessage(message.channel.id, `:x: An error occurred: \`${err.stack}\``);
			if (!args[0]) {
				for await (let filename of files.filter(f => f.endsWith(".json"))) {
					let file = require(`../../i18n/${filename}`);
					let totalLocaleStrings = Object.keys(file.list).filter(s => list[s]).length;
					let localeInfo = `\`[${file.settings.code}]\` **${file.settings.native} (${file.settings.english})** (${totalLocaleStrings}/${totalStrings}, ${Math.round((totalLocaleStrings / totalStrings + Number.EPSILON) * 100)}%)`;
					if ((file.settings.allowed && file.settings.allowed.includes(message.author.id)) || (file.settings.proofreader && file.settings.proofreader.includes(message.author.id))) selfLocaleArr.push(localeInfo);
					else localeArr.push(localeInfo);
				}
				let embed = {
					title: "Locale List",
					fields: [{
						name: "Your Locales",
						value: selfLocaleArr.length > 0 ? selfLocaleArr.join("\n") : "You have no registered locales"
					},
					{
						name: "Other Locales",
						value: localeArr.length > 0 ? localeArr.join("\n") : "No Locales Found"
					}],
					color: 0x7289da
				};
				return bot.createMessage(message.channel.id, {embed});
			} else {
				let foundLocaleName = files.filter(f => f.endsWith(".json")).find(f => checkLocale(f, args[0]));
				if (!foundLocaleName) return bot.createMessage(message.channel.id, ":x: Locale not found");
				let foundLocale = require(`../../i18n/${foundLocaleName}`);
				let totalLocaleStrings = Object.keys(foundLocale.list).filter(s => list[s]).length;
				if (!foundLocale.settings.proof_log) foundLocale.settings.proof_log = {};
				let totalProofLocaleStrings = Object.keys(foundLocale.settings.proof_log).filter(s => list[s]).length;
				let translators = [];
				let proofreaders = [];
				if (foundLocale.settings.allowed) for await (let t of foundLocale.settings.allowed) {
					let u = await fetchUser(t, bot);
					if (u) translators.push(u.tag);
				}
				if (foundLocale.settings.proofreader) for await (let p of foundLocale.settings.proofreader) {
					let u = await fetchUser(p, bot);
					if (u) proofreaders.push(u.tag);
				}
				let embed = {
					title: `${foundLocale.settings.native} (${foundLocale.settings.english})`,
					description: `Locale Code: ${foundLocale.settings.code}\nTranslators: ${translators.length > 0 ? translators.join(", ") : "None"}\nProofreaders: ${proofreaders.length > 0 ? proofreaders.join(", ") : "None"}`,
					fields: [
						{
							name: "Translation Completion",
							value: `${totalLocaleStrings}/${totalStrings} (${Math.round((totalLocaleStrings / totalStrings + Number.EPSILON) * 100)}%)`
						},
						{
							name: "Proofread Completion",
							value: `${totalProofLocaleStrings}/${totalStrings} (${Math.round((totalProofLocaleStrings / totalStrings + Number.EPSILON) * 100)}%)`
						}
					],
					color: 0x7e6bf0
				};
				return bot.createMessage(message.channel.id, {embed});
			}
		});
	}
};
