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

const FRUITS_TIMES = {
  Tomato: { plantSeconds: 2 * 60 * 60 },
  Lemon: { plantSeconds: 4 * 60 * 60 },
  Blueberry: { plantSeconds: 6 * 60 * 60 },
  Orange: { plantSeconds: 8 * 60 * 60 },
  Apple: { plantSeconds: 12 * 60 * 60 },
  Banana: { plantSeconds: 12 * 60 * 60 },
  Celestine: { plantSeconds: 6 * 60 * 60 },
  Lunara: { plantSeconds: 12 * 60 * 60 },
  Duskberry: { plantSeconds: 24 * 60 * 60 },
};

const DAY = 24 * 60 * 60;

const emojis = {
  Tree: "🌳",
  Stone: "🪨",
  Iron: "🛠️",
  Gold: "🪙",
  Crimstone: "💎",
  Sunstone: "🏵️",
  Oil: "🛢️",
  Sunflower: "🌻",
  Potato: "🥔",
  Pumpkin: "🎃",
  Carrot: "🥕",
  Corn: "🌽",
  Wheat: "🌾",
  Cabbage: "🥬",
  Broccoli: "🥦",
  Tomato: "🍅",
  Apple: "🍎",
  Banana: "🍌",
  Orange: "🍊",
  Lemon: "🍋",
  Blueberry: "🫐",
};

module.exports = {
  CROPS_TIMES,
  RESOURCE_RECOVERY_TIMES,
  RESOURCE_KEY_MAP,
  FRUITS_TIMES,
  emojis,
};
