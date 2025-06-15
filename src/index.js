const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  SlashCommandBuilder,
  REST,
  Routes,
} = require("discord.js");
const fetch = require("node-fetch");
const { farmSchema } = require("./schema");
const {
  getCropTimers,
  getStoneTimers,
  getFruitTimersGrouped,
} = require("./timers");
const {
  getOrdersByGoldCoinReward,
  getOrdersByFlowerReward,
} = require("./orders");

const { TOKEN, CLIENT_ID, COOLDOWN_SECONDS = 15 } = require("./config");

const cooldowns = new Map();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Slash Command Registration
const commands = [
  new SlashCommandBuilder()
    .setName("farm")
    .setDescription("Farm-related commands")
    .addSubcommand((sub) =>
      sub
        .setName("status")
        .setDescription("Check the status of a Sunflower Land farm")
        .addStringOption((opt) =>
          opt.setName("id").setDescription("Your farm ID").setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("task")
        .setDescription("View task orders for a Sunflower Land farm")
        .addStringOption((opt) =>
          opt.setName("id").setDescription("Your farm ID").setRequired(true)
        )
    )
    .toJSON(),
];

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    console.log("⏳ Registering slash command globally...");
    await rest.put(Routes.applicationCommands(CLIENT_ID), {
      body: commands,
    });
    console.log("✅ Slash command registered globally.");
  } catch (error) {
    console.error("❌ Failed to register command:", error);
  }
})();

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user?.tag}`);
});

function isOnCooldown(userId) {
  const now = Date.now();
  const expiry = cooldowns.get(userId);
  return expiry && now < expiry;
}

function setCooldown(userId) {
  cooldowns.set(userId, Date.now() + COOLDOWN_SECONDS * 1000);
}

async function fetchFarmData(id) {
  const res = await fetch(
    `https://api.sunflower-land.com/community/farms/${id}`
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return farmSchema.parse(json);
}

async function handleFarmCommand({ id, replyFn }) {
  if (!id) return replyFn("❌ Farm ID missing.");

  try {
    const farmData = await fetchFarmData(id);

    const crops = getCropTimers(farmData.farm).join("\n") || "None";
    const resources = getStoneTimers(farmData.farm).join("\n") || "None";
    const fruits =
      getFruitTimersGrouped(farmData.farm.fruitPatches).join("\n") || "None";

    const embed = new EmbedBuilder()
      .setTitle(`🌾 Farm Id: ${id}`)
      .addFields(
        { name: "Crops", value: crops, inline: false },
        { name: "Resources", value: resources, inline: false },
        { name: "Fruits", value: fruits, inline: false }
      )
      .setColor(0x00cc66);

    return replyFn({ embeds: [embed] });
  } catch (error) {
    if (error.name === "ZodError") {
      console.error("Schema validation error:", error);
      return replyFn(
        "⚠️ Failed to parse farm data. The data format may have changed."
      );
    }
    console.error("Error fetching or parsing farm data:", error);
    return replyFn(`❌ Error: ${error.message}`);
  }
}

async function handleTaskCommand({ id, replyFn }) {
  if (!id) return replyFn("❌ Farm ID missing.");

  try {
    const farmData = await fetchFarmData(id);
    const goldCoinOrders = getOrdersByGoldCoinReward(farmData.farm);
    const flowerOrders = getOrdersByFlowerReward(farmData.farm);

    const goldText = goldCoinOrders.join("\n") || "None";
    const flowerText = flowerOrders.join("\n") || "None";

    const embed = new EmbedBuilder()
      .setTitle(`📦 Tasks for Farm ${id}`)
      .addFields(
        { name: "🪙 Coin Rewards", value: goldText, inline: false },
        { name: "🌼 SFL Rewards", value: flowerText, inline: false }
      )
      .setColor(0xffc107);

    return replyFn({ embeds: [embed] });
  } catch (error) {
    if (error.name === "ZodError") {
      console.error("Schema validation error:", error);
      return replyFn(
        "⚠️ Failed to parse farm data. The data format may have changed."
      );
    }
    console.error("Error fetching or parsing task data:", error);
    return replyFn(`❌ Error: ${error.message}`);
  }
}

// Slash Command Handler
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand() || interaction.commandName !== "farm")
    return;

  const userId = interaction.user.id;
  if (isOnCooldown(userId)) {
    const timeLeft = Math.ceil((cooldowns.get(userId) - Date.now()) / 1000);
    return interaction.reply({
      content: `⏳ Please wait ${timeLeft} more second(s) before using this command again.`,
      ephemeral: true,
    });
  }

  setCooldown(userId);

  const id = interaction.options.getString("id");
  const sub = interaction.options.getSubcommand();

  if (sub === "status") {
    await handleFarmCommand({
      id,
      replyFn: (content) =>
        typeof content === "string"
          ? interaction.reply({ content, ephemeral: true })
          : interaction.reply(content),
    });
  } else if (sub === "task") {
    await handleTaskCommand({
      id,
      replyFn: (content) =>
        typeof content === "string"
          ? interaction.reply({ content, ephemeral: true })
          : interaction.reply(content),
    });
  }
});

// Message Command Handler (!farm or !farm task)
client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.content.startsWith("!farm")) return;

  const userId = message.author.id;
  if (isOnCooldown(userId)) {
    const timeLeft = Math.ceil((cooldowns.get(userId) - Date.now()) / 1000);
    return message.reply(
      `⏳ Please wait ${timeLeft} more second(s) before using this command again.`
    );
  }

  const args = message.content.trim().split(" ");
  const [command, sub, maybeId] = args;

  // case: !farm task <id>
  if (sub === "task" && maybeId) {
    setCooldown(userId);
    return await handleTaskCommand({
      id: maybeId,
      replyFn: (content) => message.reply(content),
    });
  }

  // case: !farm <id>
  if (sub && !isNaN(sub)) {
    setCooldown(userId);
    return await handleFarmCommand({
      id: sub,
      replyFn: (content) => message.reply(content),
    });
  }

  // Invalid command format
  return message.reply(
    "❌ Please use `!farm <FARM_ID>` or `!farm task <FARM_ID>`."
  );
});

client.login(TOKEN);
