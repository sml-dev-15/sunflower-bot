const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const { farmSchema } = require("./schema");
const fetch = require("node-fetch");
const dotenv = require("dotenv");

dotenv.config();

const TOKEN = process.env.DISCORD_BOT_TOKEN;

if (!TOKEN) {
  throw new Error("Missing DISCORD_BOT_TOKEN environment variable");
}

const CROPS_TIMES = {
  Sunflower: { harvestSeconds: 1 * 60 },
  Potato: { harvestSeconds: 5 * 60 },
  Rhubarb: { harvestSeconds: 10 * 60 },
  Pumpkin: { harvestSeconds: 30 * 60 },
  Zucchini: { harvestSeconds: 30 * 60 },
  Carrot: { harvestSeconds: 60 * 60 },
  Yam: { harvestSeconds: 60 * 60 },
  Cabbage: { harvestSeconds: 2 * 60 * 60 },
  Broccoli: { harvestSeconds: 2 * 60 * 60 },
  Soybean: { harvestSeconds: 3 * 60 * 60 },
  Beetroot: { harvestSeconds: 4 * 60 * 60 },
  Pepper: { harvestSeconds: 4 * 60 * 60 },
  Cauliflower: { harvestSeconds: 8 * 60 * 60 },
  Parsnip: { harvestSeconds: 12 * 60 * 60 },
  Eggplant: { harvestSeconds: 16 * 60 * 60 },
  Corn: { harvestSeconds: 20 * 60 * 60 },
  Onion: { harvestSeconds: 20 * 60 * 60 },
  Radish: { harvestSeconds: 24 * 60 * 60 },
  Wheat: { harvestSeconds: 24 * 60 * 60 },
  Turnip: { harvestSeconds: 24 * 60 * 60 },
  Kale: { harvestSeconds: 36 * 60 * 60 },
  Artichoke: { harvestSeconds: 36 * 60 * 60 },
  Barley: { harvestSeconds: 48 * 60 * 60 },
};

const RESOURCE_RECOVERY_TIMES = {
  Stone: 4 * 60 * 60,
  Iron: 8 * 60 * 60,
  Gold: 24 * 60 * 60,
};

const RESOURCE_KEY_MAP = {
  stones: "Stone",
  iron: "Iron",
  gold: "Gold",
};

function formatDuration(seconds) {
  if (seconds <= 0) return "✅ Ready!";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h ? `${h}h ` : ""}${m ? `${m}m ` : ""}${s}s`;
}

function groupByTime(items, getSeconds, getName, emoji) {
  const groups = {};

  for (const item of items) {
    const name = getName(item);
    const secondsLeft = getSeconds(item);

    if (!groups[name]) groups[name] = [];

    const match = groups[name].find(
      (g) => Math.abs(g.time - secondsLeft) <= 60
    );

    if (match) {
      match.count += 1;
    } else {
      groups[name].push({ time: secondsLeft, count: 1 });
    }
  }

  const result = [];

  for (const [name, group] of Object.entries(groups)) {
    for (const g of group) {
      const emojiIcon = emoji({ name });
      const timeStr = formatDuration(g.time);
      result.push(
        `${emojiIcon} ${name} — ${timeStr}${g.count > 1 ? ` (${g.count})` : ""}`
      );
    }
  }

  return result;
}

function getCropTimers(farm) {
  const now = Date.now();
  const cropPlots = Object.values(farm.crops)
    .map((plot) => {
      const crop = plot.crop;
      if (!crop) return null;
      const plantedAt = Number(crop.plantedAt);
      const growTime = CROPS_TIMES[crop.name]?.harvestSeconds ?? 0;
      const readyAt = plantedAt + growTime * 1000;
      const secondsLeft = Math.floor((readyAt - now) / 1000);
      return {
        name: crop.name,
        secondsLeft,
      };
    })
    .filter(Boolean);

  return groupByTime(
    cropPlots,
    (c) => c.secondsLeft,
    (c) => c.name,
    () => "🌱"
  );
}

function getStoneTimers(farm) {
  const now = Date.now();
  const plots = [];

  ["stones", "iron", "gold"].forEach((type) => {
    const entries = farm[type];
    if (!entries) return;

    const recoveryKey = RESOURCE_KEY_MAP[type];
    const recoveryTime = RESOURCE_RECOVERY_TIMES[recoveryKey];

    for (const plot of Object.values(entries)) {
      const minedAt = Number(plot.stone?.minedAt ?? 0);
      const readyAt = minedAt + recoveryTime * 1000;
      const secondsLeft = Math.floor((readyAt - now) / 1000);
      plots.push({ name: recoveryKey, secondsLeft });
    }
  });

  return groupByTime(
    plots,
    (p) => p.secondsLeft,
    (p) => p.name,
    (p) =>
      p.name === "Stone"
        ? "🪨"
        : p.name === "Iron"
        ? "🛠️"
        : p.name === "Gold"
        ? "🪙"
        : "⛏️"
  );
}

const cooldowns = new Map();
const COOLDOWN_SECONDS = 30;

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
    console.log("API response:", json);

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
