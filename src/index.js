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
const { TOKEN, CLIENT_ID, COOLDOWN_SECONDS } = require("./config");

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

(async () => {
  try {
    console.log("⏳ Registering slash command...");
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log("✅ Slash command registered.");
  } catch (error) {
    console.error("❌ Failed to register command:", error);
  }
})();

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user?.tag}`);
});

// Shared fetch + embed logic
async function handleFarmCommand({ id, replyFn }) {
  if (!id) {
    return replyFn("❌ Farm ID missing.");
  }

  try {
    const res = await fetch(
      `https://api.sunflower-land.com/community/farms/${id}`
    );

    if (!res.ok) {
      return replyFn(`❌ Failed to fetch farm data (status: ${res.status})`);
    }

    const json = await res.json();

    let parsed;
    try {
      parsed = farmSchema.parse(json);
    } catch (parseErr) {
      console.error("Schema parse error:", parseErr);
      return replyFn(
        "⚠️ Failed to parse farm data (schema mismatch). Please check the farm ID."
      );
    }

    const crops = getCropTimers(parsed.farm).join("\n") || "None";
    const resources = getStoneTimers(parsed.farm).join("\n") || "None";
    const fruits =
      getFruitTimersGrouped(parsed.farm.fruitPatches).join("\n") || "None";

    const embed = new EmbedBuilder()
      .setTitle(`🌾 Farm Status: ${id}`)
      .addFields(
        { name: "Crops", value: crops, inline: false },
        { name: "Resources", value: resources, inline: false },
        { name: "Fruits", value: fruits, inline: false }
      )
      .setColor(0x00cc66);

    return replyFn({ embeds: [embed] });
  } catch (err) {
    console.error("Unexpected error:", err);
    return replyFn("⚠️ Failed to fetch or parse data.");
  }
}

// Slash command
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "farm") return;

  const userId = interaction.user.id;
  const now = Date.now();

  if (cooldowns.has(userId) && now < cooldowns.get(userId)) {
    const timeLeft = Math.ceil((cooldowns.get(userId) - now) / 1000);
    return interaction.reply({
      content: `⏳ Please wait ${timeLeft} more second(s) before using this command again.`,
      ephemeral: true,
    });
  }

  cooldowns.set(userId, now + COOLDOWN_SECONDS * 1000);

  const id = interaction.options.getString("id");
  await handleFarmCommand({
    id,
    replyFn: (content) =>
      typeof content === "string"
        ? interaction.reply({ content, ephemeral: true })
        : interaction.reply(content),
  });
});

// Message command
client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.content.startsWith("!farm")) return;

  const userId = message.author.id;
  const now = Date.now();

  if (cooldowns.has(userId) && now < cooldowns.get(userId)) {
    const timeLeft = Math.ceil((cooldowns.get(userId) - now) / 1000);
    return message.reply(
      `⏳ Please wait ${timeLeft} more second(s) before using this command again.`
    );
  }

  cooldowns.set(userId, now + COOLDOWN_SECONDS * 1000);

  const [, id] = message.content.split(" ");
  await handleFarmCommand({
    id,
    replyFn: (content) => message.reply(content),
  });
});

client.login(TOKEN);
