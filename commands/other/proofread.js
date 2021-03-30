const { list } = require("../../strings/strings");
const fs = require("fs");
const { logs } = require("../../config");
module.exports = {
	controls: {
		name: "proofread",
		permission: 10,
		usage: "proofread",
		description: "Begins proofreader prompt",
		enabled: true,
		aliases: ["proof", "p"],
		permissions: ["VIEW_CHANNEL", "SEND_MESSAGES"]
	},
	do: async (message, bot, args) => {
		let sent = false;
		let m = message;
		if (message.channel.type !== 1) {
			try {
				await bot.addMessageReaction(m.channel.id, m.id, "📬");
				m = await bot.createDMMessage(message.author.id, "Initiating proofreading process...");
			} catch (e) {
				return bot.createMessage(m.channel.id, ":x: I was not able to DM you to start the proofreading process! Please ensure that you have DMs enabled on this server");
			}
		}
		await fs.readdir("i18n", async function(err, files) {
			if (err) return bot.createMessage(message.channel.id, `:x: An error occurred: \`${err.stack}\``);
			let allowed = [];
			for await (let filename of files.filter(f => f.endsWith(".json"))) {
				let file = require(`../../i18n/${filename}`);
				if (file.settings.proofreader && file.settings.proofreader.includes(message.author.id)) allowed.push(file.settings.code);
			}
			if (allowed.length === 0) return bot.createMessage(m.channel.id, ":x: You are not authorized to proofread any locales");
			let localeCode = allowed[0];
			if (allowed.length > 1) {
				await bot.createMessage(m.channel.id, {
					content: "Please choose a locale code to proofread from the list below:",
					embed: {
						description: allowed.map(a => `\`${a}\``).join("\n"),
						color: 0x7e6bf0
					}
				});
				let submittedCode = await m.channel.awaitMessages({ timeout: 60000, count: 1, filter: (msg) => msg.author.id === message.author.id });
				if (!submittedCode.collected.size) return bot.createMessage(m.channel.id, ":x: Locale selection timed out. If you still want to proofread, run `proofread` again");
				submittedCode.collected = submittedCode.collected.map(a => a);
				if (!allowed.includes(submittedCode.collected[0].content.toLowerCase())) return bot.createMessage(m.channel.id, ":x: You are not authorized to proofread the locale specified.");
				localeCode = submittedCode.collected[0].content.toLowerCase();
			}
			await bot.createMessage(m.channel.id, `:+1: You can proofread for locale \`${localeCode}\`. Starting the process now!`);
			await prompt(m.channel, localeCode);
		});
		async function prompt(channel, locale, forceString) {
			const translationFile = require(`../../i18n/${locale}.json`);
			// eslint-disable-next-line no-case-declarations
			let strName = forceString || null;
			if (!strName) {
				// eslint-disable-next-line no-case-declarations
				if (!translationFile.settings.proof_log) translationFile.settings.proof_log = {};
				let choices = args[0] ? Object.keys(list).filter(str => translationFile.list[str] && translationFile.list[str].toLowerCase().includes(args.join(" ").toLowerCase()) && !translationFile.settings.proof_log[str]) : Object.keys(list).filter(str => translationFile.list[str] && !translationFile.settings.proof_log[str]);
				if (args[0] && !sent) {
					await bot.createMessage(channel.id, `:information_source: You are proofreading strings that meet the search of \`${args.join(" ").toLowerCase()}\``);
					sent = true;
				}
				if (!choices.length) return bot.createMessage(channel.id, ":tada: All available strings have been proofread for this language!");
				// eslint-disable-next-line no-case-declarations
				strName = choices[Math.floor(Math.random() * choices.length)];
			}
			// eslint-disable-next-line no-case-declarations
			let str = list[strName];
			let translatedStr = translationFile.list[strName];
			console.log(str.string);
			let proofEmbed = {
				footer: {
					text: strName
				},
				description: `Please proofread the following string (translated into ${translationFile.settings.english}). Select :white_check_mark: if it is correct, and :x: if it is not. Selecting :x: will give you the opportunity to correct the string. React with :fast_forward: to skip, and :octagonal_sign: to cancel.`,
				fields: [{
					name: "English String",
					value: str.string
				}, {
					name: "English Raw Content",
					value: `\`\`\`\n${str.string}\n\`\`\``
				}, {
					name: "Translated String",
					value: translatedStr
				}, {
					name: "Translated Raw Content",
					value: `\`\`\`\n${translatedStr}\n\`\`\``
				}, {
					name: "Context",
					value: str.context
				}],
				color: 0x7e6bf0
			};
			if (str.replaced) {
				let replacedArr = [];
				Object.keys(str.replaced).forEach(r => replacedArr.push(`\`${str.replaced[r].to_replace}\`: ${str.replaced[r].description}`));
				proofEmbed.fields.push({ name: "Parameters", value: replacedArr.join("\n") });
			}
			let proofMsg = await bot.createMessage(channel.id, { embed: proofEmbed });
			await bot.addMessageReaction(channel.id, proofMsg.id, "✅");
			await bot.addMessageReaction(channel.id, proofMsg.id, "❌");
			await bot.addMessageReaction(channel.id, proofMsg.id, "⏩");
			await bot.addMessageReaction(channel.id, proofMsg.id, "🛑");
			let proofReaction = await proofMsg.awaitReactions({ count: 1, timeout: 60000*5, filter: (user) => user === message.author.id});
			let proofCollect = proofReaction.handler.collected;
			if (proofCollect.length === 0) return bot.createMessage(channel.id, ":x: Confirmation timed out");
			if (proofCollect[0].emoji.name === "✅") {
				if (!translationFile.settings.proof_log) translationFile.settings.proof_log = {};
				translationFile.settings.proof_log[strName] = message.author.id;
				fs.writeFile(`i18n/${locale}.json`, JSON.stringify(translationFile), async function (err) {
					if (err) return bot.createMessage(channel.id, { content: ":x: An error occurred, please report this to a staff member.", embed: { description: `\`\`\`\n${err.stack}\n\`\`\`` } });
					proofEmbed.description = "";
					proofEmbed.title = "Translation Confirmed!";
					proofEmbed.color = 0x3ddf6b;
					await proofMsg.edit({ embed: proofEmbed });
					if (bot.getChannel(logs)) await bot.createMessage(logs, `:white_check_mark: The \`${locale}\` translation of \`${strName}\` was confirmed ${message.author.tag} (\`${message.author.id}\`)`);
					return prompt(channel, locale);
				});
			} else if (proofCollect[0].emoji.name === "❌") {
				await bot.createMessage(channel.id, ":+1: You can now re-translate this string");
				return translate(channel, locale, strName, translationFile);
			} else if (proofCollect[0].emoji.name === "⏩") {
				await bot.createMessage(channel.id, ":+1: Skipping string");
				return prompt(channel, locale);
			} else if (proofCollect[0].emoji.name === "🛑") return bot.createMessage(channel.id, ":+1: Stopping. Thanks for your contributions!");
			else return bot.createMessage(channel.id, ":x: Invalid reaction, cancelling");

		}
		async function translate (channel, locale, strName, translationFile) {
			let str = list[strName];
			let embed = {
				footer: {
					text: strName
				},
				description: `Please re-translate the following string into ${translationFile.settings.english}. You have 5 minutes to respond, send \`clear\` to clear the translation and move on.`,
				fields: [{
					name: "English String",
					value: str.string
				}, {
					name: "Raw Content",
					value: `\`\`\`\n${str.string}\n\`\`\``
				}, {
					name: "Context",
					value: str.context
				}],
				color: 0x7e6bf0
			};
			if (str.replaced) {
				let replacedArr = [];
				Object.keys(str.replaced).forEach(r => replacedArr.push(`\`${str.replaced[r].to_replace}\`: ${str.replaced[r].description}`));
				embed.fields.push({ name: "Parameters", value: replacedArr.join("\n") });
			}
			await bot.createMessage(channel.id, { embed });
			let submittedTranslation = await channel.awaitMessages({ timeout: 60000*5, count: 1, filter: (msg) => msg.author.id === message.author.id });
			if (!submittedTranslation.collected.size) return bot.createMessage(channel.id, ":x: Translation timed out");
			submittedTranslation.collected = submittedTranslation.collected.map(a => a);
			let translation = submittedTranslation.collected[0].content;
			if (translation.toLowerCase() === "clear") {
				delete translationFile.list[strName];
				if (!translationFile.settings.translation_log) translationFile.settings.translation_log = {};
				delete translationFile.settings.translation_log[strName];
				fs.writeFile(`i18n/${locale}.json`, JSON.stringify(translationFile), async function (err) {
					if (err) return bot.createMessage(channel.id, { content: ":x: An error occurred, please report this to a staff member.", embed: { description: `\`\`\`\n${err.stack}\n\`\`\`` } });
					if (bot.getChannel(logs)) await bot.createMessage(logs, `:x: String \`${strName}\` in locale \`${locale}\` was cleared by ${message.author.tag} (\`${message.author.id}\`)`);
				});
				await bot.createMessage(channel.id, ":+1: Clearing string");
				return prompt(channel, locale);
			}
			if (str.replaced) {
				let missingParams = [];
				Object.keys(str.replaced).forEach(key => {
					let r = str.replaced[key];
					if (!translation.includes(r.to_replace)) missingParams.push(r.to_replace);
				});
				if (missingParams.length > 0) {
					await bot.createMessage(channel.id, `:x: Not all parameters were included. Make sure to include the following: \`${missingParams.join("`, `")}\`\nIf you're confused, please read the guide: https://discord.com/channels/566002482166104066/705521164562464890/742881648692953119`);
					return prompt(channel, locale, strName);
				}
			}
			let confirmEmbed = {
				title: "Confirm Translation",
				description: "Please confirm that the below information is correct by reacting with :white_check_mark:. Reacting with :x: will allow you to re-do the translation.",
				fields: [{
					name: "English String",
					value: str.string
				}, {
					name: `${translationFile.settings.english} Translation`,
					value: translation
				}],
				color: 0x7e6bf0
			};

			if (translation === str.string) confirmEmbed.fields.push({
				name: ":warning: Same Content",
				value: "Your translation is exactly the same as the original string. Make sure to read the [guide](https://discord.com/channels/566002482166104066/705521164562464890/742881648692953119)."
			});

			let confirmMsg = await bot.createMessage(channel.id, { embed: confirmEmbed });
			await bot.addMessageReaction(channel.id, confirmMsg.id, "✅");
			await bot.addMessageReaction(channel.id, confirmMsg.id, "❌");
			let reactionCollector = await confirmMsg.awaitReactions({ count: 1, timeout: 60000, filter: (user) => user === message.author.id});
			let collected = reactionCollector.handler.collected;
			if (collected.length === 0) return bot.createMessage(channel.id, ":x: Confirmation timed out");
			if (collected[0].emoji.name === "✅") {
				translationFile.list[strName] = translation;
				if (!translationFile.settings.translation_log) translationFile.settings.translation_log = {};
				translationFile.settings.translation_log[strName] = message.author.id;
				fs.writeFile(`i18n/${locale}.json`, JSON.stringify(translationFile), async function (err) {
					if (err) return bot.createMessage(channel.id, { content: ":x: An error occurred, please report this to a staff member.", embed: { description: `\`\`\`\n${err.stack}\n\`\`\`` } });
					confirmEmbed.description = "";
					confirmEmbed.title = "Translation Confirmed!";
					confirmEmbed.color = 0x3ddf6b;
					await confirmMsg.edit({ embed: confirmEmbed });
					if (bot.getChannel(logs)) await bot.createMessage(logs, { content: `🗣️ String \`${strName}\` in locale \`${locale}\` was re-translated by ${message.author.tag} (\`${message.author.id}\`)`, embed: { description: `\`\`\`\n${translation}\n\`\`\`` } });
					return prompt(channel, locale);
				});
			} else if (collected[0].emoji.name === "❌") {
				await bot.createMessage(channel.id, ":+1: You can now re-translate this string");
				return translate(channel, locale, strName, translationFile);
			} else return bot.createMessage(channel.id, ":x: Invalid reaction, cancelling");
		}
	}
};
