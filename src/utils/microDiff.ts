interface Diff<T> {
  previous: T;
  applied: T;
  old: Partial<T>;
  new: Partial<T>;
}

export function microDiff<T>(previous: T, changeSet: Partial<T>): Diff<T> | null {
  const diff: Diff<T> = { previous, old: {}, new: {}, applied: { ...previous, ...changeSet } };

  for (const key in changeSet) {
    const newValue = changeSet[key], oldValue = previous[key];
    if (newValue !== oldValue && !falsePositive(newValue, oldValue)) {
      diff.old[key] = oldValue;
      diff.new[key] = newValue;
    }
  }
  if (Object.keys(diff.old).length === 0 && Object.keys(diff.new).length === 0) {
    return null;
  }
  return diff;
}

function falsePositive(left: any, right: any): boolean {
  // Thanks, JS! I hate you too.
  return (left === undefined || left === null) && (right === undefined || right === null);
}
