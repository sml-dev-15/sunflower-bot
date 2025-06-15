# 🌻 Sunflower Land Farm Tracker Bot

A Discord bot that helps you monitor your **Sunflower Land** farm status using a simple command.

---

## ⚙️ Features

- 🔍 Check crop, stone, and fruit patch **harvest readiness** by providing your Farm ID.
- 💼 View **active delivery tasks** and their associated rewards.
- 🕒 Displays remaining time until each item is ready to harvest.
- ❄️ Built-in cooldown to prevent spamming.
- 🤖 Two ways to interact:
  - `/farm <your-farm-id>` and `/farm task <your-farm-id>` (slash commands)
  - `!farm <your-farm-id>` and `!farm task <your-farm-id>` (text message commands)

---

## 🚀 Usage

Once the bot is invited to your server:

### Slash Command

Use slash commands to check farm data:

- `/farm <your-farm-id>` – Check harvest timers.
- `/farm task <your-farm-id>` – View current delivery tasks and their rewards.

> Slash commands are available across **all servers**.  
> May take up to 1 hour to appear globally.

### Text Command

Use message commands as an alternative:

- `!farm <your-farm-id>`
- `!farm task <your-farm-id>`

> Works immediately after the bot is online.

---

## 💡 Output Example

### `/farm <id>`

Returns an embed with:

- **Crops** – Time remaining for crops to be ready
- **Resources** – Time remaining for stone and other resources
- **Fruits** – Time remaining for each fruit patch

> Timers are static and represent the remaining time at the moment the command is used. They do not count down in real-time.

### `/farm task <id>`

Returns a list of current delivery tasks grouped by reward type:
🪙 Coin Rewards
• corale: 1x Barred Knifejaw → +478 coins
🌼 SFL Rewards
• grubnuk: 1x Radish Cake → +0.6 SFL

---

## 🛠 Tech Stack

- [Discord.js v14](https://discord.js.org/)
- [node-fetch](https://www.npmjs.com/package/node-fetch)
- [Zod](https://zod.dev/) for schema validation

---

## 📦 Setup

1. Clone the repository
2. Run `npm install`
3. Create a `config.js` file and set the following:

```js
module.exports = {
  TOKEN: "your-discord-bot-token",
  CLIENT_ID: "your-bot-client-id",
  COOLDOWN_SECONDS: 15, // Optional
};
```
