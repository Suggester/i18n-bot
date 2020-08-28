const { logs, roles } = require("../../config");
const { fetchUser, checkLocale } = require("../../coreFunctions");
const fs = require("fs");
module.exports = {
	controls: {
		name: "proofreader",
		permission: 1,
		usage: "proofreader [user] [locale]",
		description: "Toggles a user's permission to proofread a language",
		enabled: true,
		permissions: ["VIEW_CHANNEL", "SEND_MESSAGES"]
	},
	do: async (message, bot, args) => {
		const user = await fetchUser(args[0], bot);
		if (!user) return bot.createMessage(message.channel.id, ":x: That is an invalid user!");
		if (user.bot) return bot.createMessage(message.channel.id, ":x: The whole point of a translation program is to have humans add quality translations. If we wanted robots, we'd just use Google Translate. Humans only, please :grinning:");
		await fs.readdir("i18n", async function(err, files) {
			if (err) return bot.createMessage(message.channel.id, `:x: An error occurred: \`${err.stack}\``);
			if (!args[1]) return bot.createMessage(message.channel.id, ":x: You must specify a locale");
			let foundLocaleName = files.filter(f => f.endsWith(".json")).find(f => checkLocale(f, args[1]));
			if (!foundLocaleName) return bot.createMessage(message.channel.id, ":x: Locale not found");
			let foundLocale = require(`../../i18n/${foundLocaleName}`);
			if (!foundLocale.settings.proofreader) foundLocale.settings.proofreader = [];
			if (foundLocale.settings.proofreader.includes(user.id)) foundLocale.settings.proofreader.splice(foundLocale.settings.proofreader.findIndex(r => r === user.id), 1);
			else foundLocale.settings.proofreader.push(user.id);
			fs.writeFile(`i18n/${foundLocale.settings.code}.json`, JSON.stringify(foundLocale), async function (saveErr) {
				if (saveErr) return bot.createMessage(message.channel.id, `:x: An error occurred: \`${saveErr.stack}\``);
				if (bot.getChannel(logs)) await bot.createMessage(logs, `:key: ${user.tag} (\`${user.id}\`) ${foundLocale.settings.proofreader.includes(user.id) ? "was given permission to" : "permission revoked to"} proofread locale \`${foundLocale.settings.code}\` by ${message.author.tag} (\`${message.author.id}\`)`);
				if (foundLocale.settings.proofreader.includes(user.id) && message.channel.guild.members.get(user.id) && !message.channel.guild.members.get(user.id).roles.includes(roles.proofreader)) await bot.addGuildMemberRole(message.channel.guild.id, user.id, roles.proofreader, "Added as a proofreader");
				else if (!foundLocale.settings.proofreader.includes(user.id)) {
					let hasPermission = [];
					for await (let name of files.filter(f => f.endsWith(".json"))) {
						hasPermission.push((require(`../../i18n/${name}`)).settings.proofreader && (require(`../../i18n/${name}`)).settings.proofreader.includes(user.id));
					}
					if (!hasPermission.includes(true) && message.channel.guild.members.get(user.id) && message.channel.guild.members.get(user.id).roles.includes(roles.proofreader)) await bot.removeGuildMemberRole(message.channel.guild.id, user.id, roles.proofreader, "Removed from proofreader");
				}
				return bot.createMessage(message.channel.id, `:white_check_mark: ${user.tag} ${foundLocale.settings.proofreader.includes(user.id) ? "can now" : "can no longer"} proofread locale ${foundLocale.settings.english}`);
			});
		});
	}
};
