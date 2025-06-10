const {
  CROPS_TIMES,
  RESOURCE_RECOVERY_TIMES,
  RESOURCE_KEY_MAP,
  FRUITS_TIMES,
  FLOWERS_TIMES,
} = require("./constants");

function formatDuration(seconds) {
  if (seconds <= 0) return "✅ Ready!";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h && `${h}h`, m && `${m}m`, `${s}s`].filter(Boolean).join(" ");
}

function groupByTime(items, getSeconds, getName, emoji) {
  const groups = items.reduce((acc, item) => {
    const name = getName(item);
    const secondsLeft = getSeconds(item);

    if (!acc[name]) acc[name] = [];

    const match = acc[name].find((g) => Math.abs(g.time - secondsLeft) <= 60);
    if (match) {
      match.count += 1;
    } else {
      acc[name].push({ time: secondsLeft, count: 1 });
    }

    return acc;
  }, {});

  return Object.entries(groups).flatMap(([name, group]) =>
    group.map(
      (g) =>
        `${emoji({ name })} ${name} — ${formatDuration(g.time)}${
          g.count > 1 ? ` (${g.count})` : ""
        }`
    )
  );
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

function getFruitTimersGrouped(fruitPatches = {}) {
  const now = Math.floor(Date.now() / 1000);
  const fruitPlots = Object.values(fruitPatches)
    .map((patch) => {
      const fruit = patch.fruit;
      if (!fruit) return null;

      const fruitTime = FRUITS_TIMES[fruit.name];
      if (!fruitTime) return null;

      const plantedAt = Number(fruit.plantedAt);
      const readyAt = plantedAt + fruitTime.plantSeconds;
      const secondsLeft = readyAt - now;

      return { name: fruit.name, secondsLeft };
    })
    .filter(Boolean);

  return groupByTime(
    fruitPlots,
    (f) => f.secondsLeft,
    (f) => f.name,
    () => "🍉"
  );
}

function getFlowerTimersGrouped(flowers = {}) {
  const now = Math.floor(Date.now() / 1000);
  const flowerBeds = Object.values(flowers.flowerBeds || {});

  const flowerPlots = flowerBeds
    .map((bed) => {
      const flower = bed.flower;
      if (!flower) return null;

      const flowerTime = FLOWERS_TIMES[flower.name];
      if (!flowerTime) return null;

      const plantedAt = Number(flower.plantedAt);
      const readyAt = plantedAt + flowerTime.plantSeconds;
      const secondsLeft = readyAt - now;

      return { name: flower.name, secondsLeft };
    })
    .filter(Boolean);

  return groupByTime(
    flowerPlots,
    (f) => f.secondsLeft,
    (f) => f.name,
    () => "🌸"
  );
}

module.exports = {
  formatDuration,
  groupByTime,
  getCropTimers,
  getStoneTimers,
  getFruitTimersGrouped,
  getFlowerTimersGrouped,
};
