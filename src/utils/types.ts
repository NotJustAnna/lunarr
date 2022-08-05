export type Awaitable<T = any> = T | PromiseLike<T> | Promise<T>;

export type Simplify<T> = T extends infer S ? { [K in keyof S]: S[K] } : never;
export type NoneOf<T> = Simplify<{ [K in keyof T]?: never }>;
export type OneOf<T> = { [K in keyof T]: Simplify<Pick<T, K> & NoneOf<Omit<T, K>>> }[keyof T];

export type Aggregate<T extends object> = T extends infer S ? { [K in keyof S]: Array<S[K]> } : object;
