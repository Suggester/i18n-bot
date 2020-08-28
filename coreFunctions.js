const { developer } = require("./config.json");
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
	 * @param bot - The Discord client
	 * @returns {Promise<number>}
	 */
	checkPermissions: async (member, bot) => {
		if (!member || !member.id || !bot) return 10;
		if (developer.includes(member.id)) return 0;
		let staffroles = ["566029680168271892", "637723958015426560", "743222429756948623", "566029891590422566", "704756155045511238"];
		if (member.guild && staffroles.some(r => member.roles.includes(r))) return 1;
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
	},
	/**
	 * Fetch a user
	 * @param {string} id - The Discord ID of the user
	 * @param {module:"eris".Client} bot - The bot client
	 * @returns {Collection}
	 */
	async fetchUser(id, bot) {
		if (!id) return null;
		let foundId;
		let matches = id.match(/^<@!?(\d+)>$/);
		if (!matches) foundId = id;
		else foundId = matches[1];

		function fetchUnknownUser(uid) {
			return bot.getRESTUser(uid)
				.then(user => {
					return user;
				})
				.catch(() => {
					return null;
				});
		}

		return bot.users.get(foundId)
			|| fetchUnknownUser(foundId)
			|| null;
	},
	checkLocale: function(f, input) {
		let file = require(`./i18n/${f}`);
		return [file.settings.code.toLowerCase(), file.settings.native.toLowerCase(), file.settings.english.toLowerCase()].includes(input.toLowerCase());
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
