"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.farmSchema = void 0;
const zod_1 = require("zod");
const numberLike = zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).transform((val) => {
    const num = Number(val);
    if (isNaN(num))
        throw new Error("Value must be a number or numeric string");
    return num;
});
const rewardItemSchema = zod_1.z
    .object({
    amount: numberLike,
    name: zod_1.z.string(),
})
    .passthrough();
const cropSchema = zod_1.z
    .object({
    id: zod_1.z.string(),
    plantedAt: numberLike,
    name: zod_1.z.string(),
    amount: numberLike,
    reward: zod_1.z
        .object({
        items: zod_1.z.array(rewardItemSchema),
    })
        .optional(),
})
    .passthrough();
const stoneSchema = zod_1.z
    .object({
    amount: numberLike,
    minedAt: numberLike,
})
    .passthrough();
const plotSchema = zod_1.z
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
const resourceCollectionSchema = zod_1.z.record(plotSchema);
exports.farmSchema = zod_1.z
    .object({
    farm: zod_1.z
        .object({
        coins: numberLike,
        balance: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).transform(String),
        crops: resourceCollectionSchema,
        iron: resourceCollectionSchema.optional(),
        gold: resourceCollectionSchema.optional(),
        stones: resourceCollectionSchema.optional(),
    })
        .passthrough(),
})
    .passthrough();
