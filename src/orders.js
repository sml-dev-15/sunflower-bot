function formatItems(items) {
  try {
    if (
      !items ||
      typeof items !== "object" ||
      Array.isArray(items) ||
      Object.keys(items).length === 0
    ) {
      return "No items";
    }

    return Object.entries(items)
      .map(([name, amount]) => `${amount}x ${name}`)
      .join(", ");
  } catch (err) {
    console.error("Failed to format items:", items, err);
    return "No items";
  }
}

function getOrdersByGoldCoinReward(farm) {
  const orders = farm?.delivery?.orders;
  if (!Array.isArray(orders)) return [];

  let totalCoins = 0;

  const lines = orders
    .filter((order) => order?.reward && typeof order.reward.coins === "number")
    .map((order) => {
      const from = order.from ?? "Unknown";
      const itemsFormatted = formatItems(order.items ?? {});
      const coins = order.reward.coins;
      totalCoins += coins;
      return `• ${from}: ${itemsFormatted} → +${coins} coins`;
    });

  if (lines.length === 0) return [];

  return ["🪙 Coin Rewards", ...lines, `**Total Coins:** ${totalCoins}`];
}

function getOrdersByFlowerReward(farm) {
  const orders = farm?.delivery?.orders;
  if (!Array.isArray(orders)) return [];

  let totalSFL = 0;

  const lines = orders
    .filter((order) => order?.reward && typeof order.reward.sfl === "number")
    .map((order) => {
      const from = order.from ?? "Unknown";
      const itemsFormatted = formatItems(order.items ?? {});
      const sfl = order.reward.sfl;
      totalSFL += sfl;
      return `• ${from}: ${itemsFormatted} → +${sfl} SFL`;
    });

  if (lines.length === 0) return [];

  return ["🌼 SFL Rewards", ...lines, `**Total SFL:** ${totalSFL.toFixed(2)}`];
}

module.exports = {
  getOrdersByGoldCoinReward,
  getOrdersByFlowerReward,
};
