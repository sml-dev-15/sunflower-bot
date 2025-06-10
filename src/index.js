const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  SlashCommandBuilder,
  Collection,
  REST,
  Routes,
  InteractionType,
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
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
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

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "farm") return;

  const userId = interaction.user.id;
  const now = Date.now();

  if (cooldowns.has(userId)) {
    const expiration = cooldowns.get(userId);
    if (now < expiration) {
      const timeLeft = Math.ceil((expiration - now) / 1000);
      return interaction.reply({
        content: `⏳ Please wait ${timeLeft} more second(s) before using this command again.`,
        ephemeral: true,
      });
    }
  }

  cooldowns.set(userId, now + COOLDOWN_SECONDS * 1000);

  const id = interaction.options.getString("id");
  if (!id) {
    return interaction.reply({
      content: "❌ Farm ID missing.",
      ephemeral: true,
    });
  }

  try {
    const res = await fetch(
      `https://api.sunflower-land.com/community/farms/${id}`
    );

    if (!res.ok) {
      return interaction.reply({
        content: `❌ Failed to fetch farm data (status: ${res.status})`,
        ephemeral: true,
      });
    }

    const json = await res.json();

    let parsed;
    try {
      parsed = farmSchema.parse(json);
    } catch (parseErr) {
      console.error("Schema parse error:", parseErr);
      return interaction.reply({
        content:
          "⚠️ Failed to parse farm data (schema mismatch). Please check the farm ID.",
        ephemeral: true,
      });
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

    await interaction.reply({ embeds: [embed] });
  } catch (err) {
    console.error("Unexpected error:", err);
    interaction.reply({
      content: "⚠️ Failed to fetch or parse data.",
      ephemeral: true,
    });
  }
});

client.login(TOKEN);
