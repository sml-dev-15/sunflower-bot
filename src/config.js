const dotenv = require("dotenv");
dotenv.config();

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const COOLDOWN_SECONDS = 30;

if (!TOKEN) throw new Error("Missing DISCORD_BOT_TOKEN environment variable");
if (!CLIENT_ID) throw new Error("Missing CLIENT_ID environment variable");

module.exports = { TOKEN, CLIENT_ID, COOLDOWN_SECONDS };
