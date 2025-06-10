const {
  CROPS_TIMES,
  RESOURCE_RECOVERY_TIMES,
  RESOURCE_KEY_MAP,
  FRUITS_TIMES,
  emojis,
} = require("./constants");

function getEmoji(name) {
  return emojis[name] || "🌱";
}

function formatDuration(seconds) {
  if (seconds <= 0) return "✅ Ready!";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h && `${h}h`, m && `${m}m`, `${s}s`].filter(Boolean).join(" ");
}

function groupByTime(items, getSeconds, getName, emoji) {
  const readyCountMap = {}; // Group for secondsLeft <= 0
  const grouped = {}; // Group for secondsLeft > 0

  for (const item of items) {
    const name = getName(item);
    const secondsLeft = getSeconds(item);

    if (secondsLeft <= 0) {
      readyCountMap[name] = (readyCountMap[name] || 0) + 1;
    } else {
      if (!grouped[name]) grouped[name] = [];

      const match = grouped[name].find(
        (g) => Math.abs(g.time - secondsLeft) <= 60
      );
      if (match) {
        match.count += 1;
      } else {
        grouped[name].push({ time: secondsLeft, count: 1 });
      }
    }
  }

  const output = [];

  // Add ready entries (✅ Ready!)
  for (const [name, count] of Object.entries(readyCountMap)) {
    const line = `${emoji({ name })} ${name} — ✅ Ready!${
      count > 1 ? ` (${count})` : ""
    }`;
    output.push(line);
  }

  // Add entries with time remaining
  for (const [name, group] of Object.entries(grouped)) {
    for (const g of group) {
      const line = `${emoji({ name })} ${name} — ${formatDuration(g.time)}${
        g.count > 1 ? ` (${g.count})` : ""
      }`;
      output.push(line);
    }
  }

  return output;
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
    ({ name }) => getEmoji(name)
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
    ({ name }) => getEmoji(name)
  );
}

function getFruitTimersGrouped(fruitPatches = {}) {
  const now = Date.now();

  const fruitPlots = Object.values(fruitPatches)
    .map((patch) => {
      const fruit = patch.fruit;
      if (!fruit) return null;

      const fruitTime = FRUITS_TIMES[fruit.name];
      if (!fruitTime) return null;

      const plantedAt = Number(fruit.plantedAt);
      const harvestedAt = Number(fruit.harvestedAt) || 0;

      const lastPlanted = harvestedAt > plantedAt ? harvestedAt : plantedAt;

      const readyAt = lastPlanted + fruitTime.plantSeconds * 1000;
      const secondsLeft = Math.max(0, Math.floor((readyAt - now) / 1000));

      return { name: fruit.name, secondsLeft };
    })
    .filter(Boolean);

  return groupByTime(
    fruitPlots,
    (f) => f.secondsLeft,
    (f) => f.name,
    ({ name }) => getEmoji(name)
  );
}

module.exports = {
  formatDuration,
  groupByTime,
  getEmoji,
  getCropTimers,
  getStoneTimers,
  getFruitTimersGrouped,
};
