import { MODEL_PRICES } from './prices.ts';

import type { ModelPrice, TokenUsage } from './types.ts';

function readBareModelName(model: string): string {
  return model.toLowerCase().split('/').at(-1) ?? '';
}

function findDearestPrice(prices: ModelPrice[]): ModelPrice {
  return prices.reduce((dearest, price) =>
    price.outputDollarsPerMillionTokens > dearest.outputDollarsPerMillionTokens ? price : dearest
  );
}

export const DEAREST_MODEL_PRICE = findDearestPrice(MODEL_PRICES);

export function findModelPrice(model: string): ModelPrice {
  const bareModelName = readBareModelName(model);
  const matches = MODEL_PRICES.filter((price) => bareModelName.startsWith(price.modelPrefix));
  const longestMatch = matches.sort(
    (first, second) => second.modelPrefix.length - first.modelPrefix.length
  )[0];
  return longestMatch ?? DEAREST_MODEL_PRICE;
}

export function estimateCostInMicrodollars(price: ModelPrice, usage: TokenUsage): number {
  const inputCost = usage.inputTokens * price.inputDollarsPerMillionTokens;
  const outputCost = usage.outputTokens * price.outputDollarsPerMillionTokens;
  return Math.ceil(inputCost + outputCost);
}
