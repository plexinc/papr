import { inspect } from 'util';

export type Log = (message: string) => void;

export type Hook<A> = (
  collectionName: string,
  methodName: string,
  args: A[],
  context: unknown,
  error?: Error,
  result?: unknown,
) => Promise<void>;

export interface Hooks {
  after?: Hook<unknown>[];
  before?: Hook<unknown>[];
}

export function logHook(log: Log): Hook<unknown> {
  // eslint-disable-next-line @typescript-eslint/require-await
  return async function logHookMethod(
    collectionName: string,
    methodName: string,
    args: unknown[]
  ): Promise<void> {
    const flatArgs = serializeArguments(args);

    const message = `${collectionName}.${methodName}(${flatArgs})`;

    log(message);
  };
}

export function serializeArguments(args: unknown[], colors = true): string {
  return args
    .filter((arg) => !!arg)
    .map((arg) =>
      inspect(arg, {
        breakLength: Infinity,
        colors,
        compact: true,
        depth: 5,
      })
    )
    .join(', ');
}
