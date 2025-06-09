const { z } = require("zod");

const numberLike = z.union([z.number(), z.string()]).transform((val) => {
  const num = Number(val);
  if (isNaN(num)) throw new Error("Value must be a number or numeric string");
  return num;
});

const rewardItemSchema = z
  .object({
    amount: numberLike,
    name: z.string(),
  })
  .passthrough();

const cropSchema = z
  .object({
    id: z.string(),
    plantedAt: numberLike,
    name: z.string(),
    amount: numberLike,
    reward: z
      .object({
        items: z.array(rewardItemSchema),
      })
      .optional(),
  })
  .passthrough();

const stoneSchema = z
  .object({
    amount: numberLike,
    minedAt: numberLike,
  })
  .passthrough();

const plotSchema = z
  .object({
    createdAt: numberLike.default(0),
    x: numberLike,
    y: numberLike,
    height: numberLike.default(1),
    width: numberLike.default(1),
    crop: cropSchema.optional(),
    stone: stoneSchema.optional(),
  })
  .passthrough();

const resourceCollectionSchema = z.record(plotSchema);

const farmSchema = z
  .object({
    farm: z
      .object({
        coins: numberLike,
        balance: z.union([z.string(), z.number()]).transform(String),
        crops: resourceCollectionSchema,
        iron: resourceCollectionSchema.optional(),
        gold: resourceCollectionSchema.optional(),
        stones: resourceCollectionSchema.optional(),
      })
      .passthrough(),
  })
  .passthrough();

module.exports = {
  farmSchema,
};
