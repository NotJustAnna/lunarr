export interface Duration {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

export function toMilliseconds({ days, hours, milliseconds, minutes, seconds }: Duration): number {
  return (
    (days || 0) * 24 * 60 * 60 * 1000 +
    (hours || 0) * 60 * 60 * 1000 +
    (minutes || 0) * 60 * 1000 +
    (seconds || 0) * 1000 +
    (milliseconds || 0)
  );
}

export function fromMilliseconds(number: number): Duration {
  const days = Math.floor(number / (24 * 60 * 60 * 1000));
  const hours = Math.floor(number / (60 * 60 * 1000)) % 24;
  const minutes = Math.floor(number / (60 * 1000)) % 60;
  const seconds = Math.floor(number / 1000) % 60;
  const milliseconds = number % 1000;
  return { days, hours, minutes, seconds, milliseconds };
}
