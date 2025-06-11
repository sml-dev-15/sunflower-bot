# 🌻 Sunflower Land Farm Tracker Bot

A Discord bot that helps you monitor your **Sunflower Land** farm status using the `!farm` command.

---

## ⚙️ Features

- 🔍 Check crop, stone, and fruit patch **harvest readiness** by providing your Farm ID.
- 🕒 Displays remaining time until each item is ready to harvest.
- ❄️ Built-in cooldown to prevent spamming.
- 🤖 Simple command: `!farm <your-farm-id>`

---

## 🚀 Usage

Once the bot is invited to your server:

### Text Command


---

## 💡 Output Example

The bot returns an embed with the following sections:

- **Crops** – Time remaining for crops to be ready
- **Resources** – Time remaining for stone and other resources
- **Fruits** – Time remaining for each fruit patch

> Timers are static and represent the remaining time at the moment the command is used. They do not count down in real-time.

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
  TOKEN: 'your-discord-bot-token',
  CLIENT_ID: 'your-bot-client-id',
  COOLDOWN_SECONDS: 15, // Optional
};
