require("dotenv").config();

const Discord = require("discord.js");
const { errorLog, fileLoader } = require("./coreFunctions.js");
const { basename } = require("path");

const client = new Discord.Client({
	ws: { intents: Discord.Intents.NON_PRIVILEGED },
	disableMentions: "everyone",
	presence: { activity: { name: "for >help", type: "WATCHING" }, status: "online" }
});

client.commands = new Discord.Collection();
client.locales = new Discord.Collection();
(async () => {
	let eventFiles = await fileLoader("events");
	for await (let file of eventFiles) {
		if (!file.endsWith(".js")) continue;

		let event = require(file);
		let eventName = basename(file).split(".")[0];

		client.on(eventName, (...args) => {
			try {
				event(Discord, client, ...args);
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

		client.commands.set(commandName, command);
		console.log("[Command] Loaded", commandName);
	}
})();

client.login(process.env.TOKEN)
	.catch(console.error);

client.on("error", (err) => {
	errorLog(err, "error", "something happened and idk what");
});
client.on("warn", (warning) => {
	console.warn(warning);
});
process.on("unhandledRejection", (err) => { // this catches unhandledPromiserejectionWarning and other unhandled rejections
	errorLog(err, "unhandledRejection", "oof something is broken x.x");
});
