require("dotenv").config();

const Eris = require("eris");
require("pluris")(Eris, { endpoints: false });
const bot = new Eris(process.env.TOKEN, {
	intents: [
		"guilds",
		"guildMessages",
		"directMessages",
		"directMessageReactions"
	],
	allowedMentions: {
		everyone: false,
		users: true,
		roles: true
	},
	restMode: true
});
const { errorLog, fileLoader } = require("./coreFunctions.js");
const { basename, dirname } = require("path");

bot.commands = new Eris.Collection({});
(async () => {
	let eventFiles = await fileLoader("events");
	for await (let file of eventFiles) {
		if (!file.endsWith(".js")) continue;

		let event = require(file);
		let eventName = basename(file).split(".")[0];

		bot.on(eventName, (...args) => {
			try {
				event(Eris, bot, ...args);
			}
			catch (err) {
				errorLog(err, "Event Handler", `Event: ${eventName}`);
			}
		});
		console.log("[Event] Loaded", eventName);
	}

	let commandFiles = await fileLoader("commands");
	for await (let file of commandFiles) {
		if (!file.endsWith(".js")) return;

		let command = require(file);
		let commandName = basename(file).split(".")[0];
		let dirArray = dirname(file).split("/");
		command.controls.module = dirArray[dirArray.length-1];

		bot.commands.set(commandName, command);
		console.log("[Command] Loaded", commandName);
	}
})();

bot.connect().catch(console.error);

bot.on("error", (err) => {
	errorLog(err, "error", "something happened and idk what");
});
bot.on("warn", (warning) => {
	console.warn(warning);
});
process.on("unhandledRejection", (err) => { // this catches unhandledPromiserejectionWarning and other unhandled rejections
	errorLog(err, "unhandledRejection", "oof something is broken x.x");
});

Object.defineProperties(Eris.User.prototype, {
	tag: {
		get() {
			return `${this.username}#${this.discriminator}`;
		}
	}
});

