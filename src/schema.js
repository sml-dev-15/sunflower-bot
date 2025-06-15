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

const fruitSchema = z
  .object({
    name: z.string(),
    plantedAt: numberLike,
    amount: numberLike,
    harvestedAt: numberLike,
    harvestsLeft: numberLike,
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

const fruitPatchSchema = z
  .object({
    createdAt: numberLike,
    x: numberLike,
    y: numberLike,
    height: numberLike.default(2),
    width: numberLike.default(2),
    fruit: fruitSchema.optional(),
  })
  .passthrough();

const resourceCollectionSchema = z.record(plotSchema).default({});
const fruitPatchesSchema = z.record(fruitPatchSchema).default({});

const flowerSchema = z
  .object({
    plantedAt: numberLike,
    amount: numberLike,
    name: z.string(),
  })
  .passthrough();

const flowerBedSchema = z
  .object({
    height: numberLike.default(1),
    width: numberLike.default(3),
    x: numberLike,
    y: numberLike,
    createdAt: numberLike,
    flower: flowerSchema.optional(),
  })
  .passthrough();

const flowersSchema = z
  .object({
    discovered: z.record(z.unknown()).optional().default({}),
    flowerBeds: z.record(flowerBedSchema).optional().default({}),
  })
  .passthrough();

const deliveryRewardSchema = z
  .object({
    coins: numberLike.optional(),
    sfl: numberLike.optional(),
  })
  .passthrough();

const deliveryOrderSchema = z
  .object({
    createdAt: numberLike,
    id: z.string(),
    from: z.string(),
    items: z.record(z.string(), numberLike),
    readyAt: numberLike,
    reward: deliveryRewardSchema,
    completedAt: numberLike.optional(),
  })
  .passthrough();

const deliverySchema = z
  .object({
    orders: z.array(deliveryOrderSchema),
    fulfilledCount: numberLike,
    milestone: z.object({
      goal: numberLike,
      total: numberLike,
    }),
    doubleDelivery: z.string(),
    dailySFL: z.object({
      day: numberLike,
      amount: numberLike,
    }),
  })
  .passthrough();

const farmSchema = z
  .object({
    farm: z
      .object({
        coins: numberLike,
        balance: z.union([z.string(), z.number()]).transform(String),
        crops: resourceCollectionSchema,
        iron: resourceCollectionSchema.optional().default({}),
        gold: resourceCollectionSchema.optional().default({}),
        stones: resourceCollectionSchema.optional().default({}),
        fruitPatches: fruitPatchesSchema.optional().default({}),
        flowers: flowersSchema.optional().default({}),
        delivery: deliverySchema.optional(),
      })
      .passthrough(),
  })
  .passthrough();

module.exports = {
  farmSchema,
};
