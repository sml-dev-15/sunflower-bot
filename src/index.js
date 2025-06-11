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
const { TOKEN, CLIENT_ID, COOLDOWN_SECONDS = 15 } = require("./config");

const cooldowns = new Map();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const commands = [
  new SlashCommandBuilder()
    .setName("farm")
    .setDescription("Check the status of a Sunflower Land farm")
    .addStringOption((option) =>
      option.setName("id").setDescription("Your farm ID").setRequired(true)
    )
    .toJSON(),
];

const rest = new REST({ version: "10" }).setToken(TOKEN);

// Register slash command globally
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

async function fetchFarmData(id) {
  const response = await fetch(
    `https://api.sunflower-land.com/community/farms/${id}`
  );
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const data = await response.json();
  return farmSchema.parse(data);
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

function isOnCooldown(userId) {
  const now = Date.now();
  const expiry = cooldowns.get(userId);
  return expiry && now < expiry;
}

function setCooldown(userId) {
  cooldowns.set(userId, Date.now() + COOLDOWN_SECONDS * 1000);
}

// Slash command handler
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

  await handleFarmCommand({
    id,
    replyFn: (content) =>
      typeof content === "string"
        ? interaction.reply({ content, ephemeral: true })
        : interaction.reply(content),
  });
});

// Message command handler
client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.content.startsWith("!farm")) return;

  const userId = message.author.id;
  if (isOnCooldown(userId)) {
    const timeLeft = Math.ceil((cooldowns.get(userId) - Date.now()) / 1000);
    return message.reply(
      `⏳ Please wait ${timeLeft} more second(s) before using this command again.`
    );
  }

  setCooldown(userId);
  const [, id] = message.content.split(" ");

  await handleFarmCommand({
    id,
    replyFn: (content) => message.reply(content),
  });
});

client.login(TOKEN);
