import { inspect } from 'util';

export type Log = (message: string) => void;

export type Hook<A> = (
  params: {
    args: A[];
    collectionName: string;
    context: unknown;
    error?: Error;
    methodName: string;
    result?: unknown;
  }
) => Promise<void>;

export interface Hooks {
  after?: Hook<unknown>[];
  before?: Hook<unknown>[];
}

export function logHook(log: Log): Hook<unknown> {
  // eslint-disable-next-line @typescript-eslint/require-await
  return async function logHookMethod(
    params: {
      collectionName: string;
      methodName: string;
      args: unknown[];
    }
  ): Promise<void> {
    const flatArgs = serializeArguments(params.args);

    const message = `${params.collectionName}.${params.methodName}(${flatArgs})`;

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
