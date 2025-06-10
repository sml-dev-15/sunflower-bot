const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");
const { farmSchema } = require("./schema");
const { getCropTimers, getStoneTimers } = require("./timers");
const { TOKEN, COOLDOWN_SECONDS } = require("./config");

const cooldowns = new Map();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user?.tag}`);
});

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("!farm")) return;

  const userId = message.author.id;
  const now = Date.now();

  if (cooldowns.has(userId)) {
    const expiration = cooldowns.get(userId);
    if (now < expiration) {
      const timeLeft = Math.ceil((expiration - now) / 1000);
      return message.reply(
        `⏳ Please wait ${timeLeft} more second(s) before using this command again.`
      );
    }
  }

  cooldowns.set(userId, now + COOLDOWN_SECONDS * 1000);

  const [, id] = message.content.split(" ");
  if (!id) return message.reply("❌ Please provide a farm ID.");

  try {
    const res = await fetch(
      `https://api.sunflower-land.com/community/farms/${id}`
    );

    if (!res.ok) {
      return message.reply(
        `❌ Failed to fetch farm data (status: ${res.status})`
      );
    }

    const json = await res.json();

    let parsed;
    try {
      parsed = farmSchema.parse(json);
    } catch (parseErr) {
      console.error("Schema parse error:", parseErr);
      return message.reply(
        "⚠️ Failed to parse farm data (schema mismatch). Please check the farm ID."
      );
    }

    const crops = getCropTimers(parsed.farm).join("\n") || "None";
    const resources = getStoneTimers(parsed.farm).join("\n") || "None";

    const embed = new EmbedBuilder()
      .setTitle(`🌾 Farm Status: ${id}`)
      .addFields(
        { name: "Crops", value: crops, inline: false },
        { name: "Resources", value: resources, inline: false }
      )
      .setColor(0x00cc66);

    message.reply({ embeds: [embed] });
  } catch (err) {
    console.error("Unexpected error:", err);
    message.reply("⚠️ Failed to fetch or parse data.");
  }
});

client.login(TOKEN);
