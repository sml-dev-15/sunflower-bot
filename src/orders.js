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

  return orders
    .filter((order) => order?.reward && typeof order.reward.coins === "number")
    .map((order) => {
      const from = order.from ?? "Unknown";
      const itemsFormatted = formatItems(order.items ?? {});
      const coins = order.reward.coins;
      return `• **${from}**: ${itemsFormatted} → +${coins} coins`;
    });
}

function getOrdersByFlowerReward(farm) {
  const orders = farm?.delivery?.orders;
  if (!Array.isArray(orders)) return [];

  return orders
    .filter((order) => order?.reward && typeof order.reward.sfl === "number")
    .map((order) => {
      const from = order.from ?? "Unknown";
      const itemsFormatted = formatItems(order.items ?? {});
      const sfl = order.reward.sfl;
      return `• **${from}**: ${itemsFormatted} → +${sfl} SFL`;
    });
}

module.exports = {
  getOrdersByGoldCoinReward,
  getOrdersByFlowerReward,
};
