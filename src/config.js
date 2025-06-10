const dotenv = require("dotenv");
dotenv.config();

const TOKEN = process.env.DISCORD_BOT_TOKEN;
if (!TOKEN) {
  throw new Error("Missing DISCORD_BOT_TOKEN environment variable");
}

const COOLDOWN_SECONDS = 30;

module.exports = { TOKEN, COOLDOWN_SECONDS };
