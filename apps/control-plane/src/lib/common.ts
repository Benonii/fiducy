export function groupBy<Item>(items: Item[], toGroupKey: (item: Item) => string) {
  const groups = new Map<string, Item[]>();
  for (const item of items) {
    const groupKey = toGroupKey(item);
    const group = groups.get(groupKey);
    if (group) group.push(item);
    else groups.set(groupKey, [item]);
  }
  return groups;
}
