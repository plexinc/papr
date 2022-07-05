import { inspect } from 'util';
import { HookMethodsNames } from './model';

export type Log = (message: string) => void;

export type Hook<TArgs, TContext = Record<string, unknown>> = (params: {
  args: TArgs[];
  collectionName: string;
  context: TContext;
  error?: Error;
  methodName: HookMethodsNames;
  result?: unknown;
}) => Promise<void>;

export interface Hooks {
  after?: Hook<unknown>[];
  before?: Hook<unknown>[];
}

/**
 * @module intro
 * @description
 *
 * All the methods of the `Model` which call native MongoDB driver methods have hooks support.
 * The only exception is the custom `upsert` method.
 *
 * ## `Hook<TArgs>`
 *
 * ```
 * export type Hook<TArgs, TContext = Record<string, unknown>> = (params: {
 *   args: TArgs[];
 *   collectionName: string;
 *   context: TContext;
 *   error?: Error;
 *   methodName: HookMethodsNames;
 *   result?: unknown;
 * }) => Promise<void>;
 * ```
 *
 * The `context` parameter is an object which allows the `before` and `after` hooks to share
 * custom data between each other for a given operation (e.g. tracing ID, etc.).
 *
 * The `result` parameter is only populated in the `after` hooks, and only for operations
 * which have a return value.
 */

/**
 * Papr provides a basic logging hook creator, which returns a hook method, which in turn will print
 * the methods called on a collection with all its arguments.
 *
 * This hook creator method takes in a single argument consisting of a basic logger function
 * which accepts one string argument, similar to `console.log`.
 *
 * @name logHook
 *
 * @param log {Log}
 *
 * @returns {Hook<TArgs>}
 *
 * @example
 * import Papr, { logHook } from 'papr';
 *
 * const papr = new Papr({
 *   hooks: {
 *     before: [logHook(console.log)]
 *   }
 * });
 */
export function logHook<TArgs>(log: Log): Hook<TArgs> {
  // eslint-disable-next-line @typescript-eslint/require-await
  return async function logHookMethod(params: {
    args: TArgs[];
    collectionName: string;
    methodName: HookMethodsNames;
  }): Promise<void> {
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
