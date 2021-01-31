const { list } = require("../../strings/strings");
const fs = require("fs");
const { logs } = require("../../config");
module.exports = {
	controls: {
		name: "start",
		permission: 10,
		usage: "start",
		description: "Begins translation prompt",
		enabled: true,
		permissions: ["VIEW_CHANNEL", "SEND_MESSAGES"]
	},
	do: async (message, bot, args) => {
		let sent = false;
		let m = message;
		if (message.channel.type !== 1) {
			try {
				await bot.addMessageReaction(m.channel.id, m.id, "📬");
				m = await bot.createDMMessage(message.author.id, "Initiating translation process...");
			} catch (e) {
				return bot.createMessage(m.channel.id, ":x: I was not able to DM you to start the translation process! Please ensure that you have DMs enabled on this server");
			}
		}
		await fs.readdir("i18n", async function(err, files) {
			if (err) return bot.createMessage(message.channel.id, `:x: An error occurred: \`${err.stack}\``);
			let allowed = [];
			for await (let filename of files.filter(f => f.endsWith(".json"))) {
				let file = require(`../../i18n/${filename}`);
				if (file.settings.allowed && file.settings.allowed.includes(message.author.id)) allowed.push(file.settings.code);
			}
			if (allowed.length === 0) return bot.createMessage(m.channel.id, ":x: You are not authorized to translate any locales");
			let localeCode = allowed[0];
			if (allowed.length > 1) {
				await bot.createMessage(m.channel.id, {
					content: "Please choose a locale code to translate from the list below:",
					embed: {
						description: allowed.map(a => `\`${a}\``).join("\n"),
						color: 0x7e6bf0
					}
				});
				let submittedCode = await m.channel.awaitMessages({ timeout: 60000, count: 1, filter: (msg) => msg.author.id === message.author.id });
				if (!submittedCode.collected.size) return bot.createMessage(m.channel.id, ":x: Locale selection timed out. If you still want to translate, run `start` again");
				submittedCode.collected = submittedCode.collected.map(a => a);
				if (!allowed.includes(submittedCode.collected[0].content.toLowerCase())) return bot.createMessage(m.channel.id, ":x: You are not authorized to translate the locale specified.");
				localeCode = submittedCode.collected[0].content.toLowerCase();
			}
			await bot.createMessage(m.channel.id, `:+1: You can translate for locale \`${localeCode}\`. Starting the process now!`);
			await prompt(m.channel, localeCode);
		});
		let skipped = [];
		async function prompt(channel, locale, forceString) {
			const translationFile = require(`../../i18n/${locale}.json`);
			// eslint-disable-next-line no-case-declarations
			let strName = forceString || null;
			if (!strName) {
				// eslint-disable-next-line no-case-declarations
				let choices = args[0] ? Object.keys(list).filter(str => !translationFile.list[str] && !skipped.includes(str) && list[str].string.toLowerCase().includes(args.join(" ").toLowerCase())) : Object.keys(list).filter(str => !translationFile.list[str] && !skipped.includes(str));
				if (args[0] && !sent) {
					await bot.createMessage(channel.id, `:information_source: You are translating strings that meet the search of \`${args.join(" ").toLowerCase()}\``);
					sent = true;
				}
				if (!choices.length) return bot.createMessage(channel.id, ":tada: All strings have been translated for this language! If you skipped any strings please restart translation as skipped strings are no longer available to translate during the current translation session.");
				// eslint-disable-next-line no-case-declarations
				strName = choices[Math.floor(Math.random() * choices.length)];
			}
			// eslint-disable-next-line no-case-declarations
			let str = list[strName];
			let embed = {
				footer: {
					text: strName
				},
				description: `Please translate the following string into ${translationFile.settings.english}. You have 5 minutes to respond, send \`cancel\` to cancel or \`skip\` to skip.`,
				fields: [{
					name: "English String",
					value: str.string || "This string has no content, please post in #translator-chat to bring the issue to the team's attention"
				}, {
					name: "Raw Content",
					value: `\`\`\`\n${str.string}\n\`\`\``
				}, {
					name: "Context",
					value: str.context || "This string has no context, please post in #translator-chat to bring the issue to the team's attention"
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
			if (translation.toLowerCase() === "cancel") return bot.createMessage(channel.id, ":+1: Translation cancelled. Thanks for your contributions!");
			if (translation.toLowerCase() === "skip") {
				await bot.createMessage(channel.id, ":+1: Skipping string");
				skipped.push(strName);
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
			console.log(collected);
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
					if (bot.getChannel(logs)) await bot.createMessage(logs, { content: `🗣️ String \`${strName}\` in locale \`${locale}\` was translated by ${message.author.tag} (\`${message.author.id}\`)`, embed: { description: `\`\`\`\n${translation}\n\`\`\`` } });
					return prompt(channel, locale);
				});
			} else if (collected[0].emoji.name === "❌") {
				await bot.createMessage(channel.id, ":+1: You can now re-translate this string");
				return prompt(channel, locale, strName);
			} else return bot.createMessage(channel.id, ":x: Invalid reaction, cancelling");
		}
	}
};
