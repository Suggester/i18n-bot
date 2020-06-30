const { err_hook, developer } = require("./config.json");
const Discord = require("discord.js");
const { promises } = require("fs");
const { resolve } = require("path");

module.exports = {
	/**
	 * Returns permission level of inputted ID
	 *
	 * 11 - Blacklisted\
	 * 10 - Everyone
	 * 1 - Staff
	 * 0 - Developer
	 *
	 * @param member - Member object fetched from a server
	 * @param client - The Discord client
	 * @returns {Promise<number>}
	 */
	checkPermissions: async (user, client) => {
		if (!user || !user.id || !client) return 10;
		if (developer.includes(user.id)) return 0;
		let hasStaffRole = false;
		let staffroles = ["566029680168271892", "637723958015426560", "704756155045511238", "566029891590422566"];
		staffroles.forEach(roleId => {
			if (client.guilds.cache.get("566002482166104066").members.cache.get(user.id).roles.cache.has(roleId)) hasStaffRole = true;
		});
		if (hasStaffRole) return 1;
		if (client.guilds.cache.get("566002482166104066").members.cache.get(user.id).roles.cache.has("704756126855594095")) return 9;
		return 10;
	},
	permLevelToRole: (permLevel) => {
		switch (permLevel) {
		case -1:
			return "No Users";
		case 0:
			return "Bot Administrator";
		case 1:
			return "Translation Manager";
		case 10:
			return "All Users";
		default:
			return "Undefined";
		}
	},
	errorLog: (err, type, footer) => {
		if (!err) return;
		let errorText = "Error Not Set";
		if (err.stack) {
			console.error((require("chalk")).red(err.stack));
			errorText = err.stack;
		} else if (err.error) {
			console.error((require("chalk")).red(err.error));
			errorText = err.error;
		} else return;
		let embed = new Discord.MessageEmbed()
			.setAuthor(type)
			.setTitle(err.message ? err.message.substring(0, 256) : "No Message Value")
			.setDescription(`\`\`\`js\n${(errorText).length >= 1000 ? (errorText).substring(0, 1000) + " content too long..." : err.stack}\`\`\``)
			.setColor("DARK_RED")
			.setTimestamp()
			.setFooter(footer);

		let hook = new Discord.WebhookClient(err_hook.id, err_hook.token);
		hook.send(embed);
	},
	/**
	 * Fetch a user
	 * @param {string} id - The Discord ID of the user
	 * @param {module:"discord.js".Client} client - The bot client
	 * @returns {Collection}
	 */
	async fetchUser(id, client) {
		if (!id) return null;
		let foundId;
		let matches = id.match(/^<@!?(\d+)>$/);
		if (!matches) foundId = id;
		else foundId = matches[1];

		function fetchUnknownUser(uid) {
			return client.users.fetch(uid, true)
				.then(() => {
					return client.users.cache.get(uid);
				})
				.catch(() => {
					return null;
				});
		}

		return client.users.cache.get(foundId)
			|| fetchUnknownUser(foundId)
			|| null;
	}
};
/**
 * Like readdir but recursive 👀
 * @param {string} dir
 * @returns {Promise<string[]>} - Array of paths
 */
const fileLoader = async function* (dir) {
	const files = await promises.readdir(dir, { withFileTypes: true });
	for (let file of files) {
		const res = resolve(dir, file.name);
		if (file.isDirectory()) {
			yield* fileLoader(res);
		} else {
			yield res;
		}
	}
};

module.exports.fileLoader = fileLoader;
