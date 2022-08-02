interface Diff<T> {
  previous: T;
  applied: T;
  old: Partial<T>;
  new: Partial<T>;
}

export function microDiff<T>(previous: T, changeSet: Partial<T>): Diff<T> | null {
  const diff: Diff<T> = { previous, old: {}, new: {}, applied: { ...previous, ...changeSet } };

  for (const key in changeSet) {
    if (changeSet[key] !== previous[key]) {
      diff.old[key] = previous[key];
      diff.new[key] = changeSet[key];
    }
  }
  if (Object.keys(diff.old).length === 0 && Object.keys(diff.new).length === 0) {
    return null;
  }
  return diff;
}
