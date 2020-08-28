// eslint-disable-next-line no-unused-vars
const config = require("../../config.json");

/* eslint-disable-next-line no-unused-vars */
const core = require("../../coreFunctions.js");

module.exports = {
	controls: {
		name: "eval",
		permission: 0,
		usage: "eval <code>",
		description: "Runs code",
		enabled: true,
		permissions: ["VIEW_CHANNEL", "SEND_MESSAGES"],
		dm_allowed: true
	},
	/* eslint-disable-next-line no-unused-vars */
	do: async (message, bot, args, Discord) => {
		const clean = (text) => {
			if (typeof (text) === "string") {
				return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
			} else {
				return text;
			}
		};
		const code = args.join(" ");
		await evalCode(code);

		async function evalCode (code) {
			try {
				let evaled = await eval(code);

				if (typeof evaled !== "string") {
					evaled = require("util").inspect(evaled);
				}

				if (args.splice(-1)[0] !== "//silent") {
					if (evaled.includes(process.env.TOKEN)) {
						return bot.createMessage(message.channel.id, ":rotating_light: `CENSORED: TOKEN` :rotating_light:");
					} else {
						return bot.createMessage(message.channel.id, `\`\`\`xl\n${clean(evaled).substring(0, 1900)}\`\`\``);
					}
				}
			} catch (err) {
				if (args.splice(-1)[0] !== "//silent") {
					if (err.toString().includes(process.env.TOKEN)) {
						return bot.createMessage(message.channel.id, ":rotating_light: `CENSORED: TOKEN` :rotating_light:");
					} else {
						return bot.createMessage(message.channel.id, `\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
					}
				}
			}
		}
	}
};
