import { deepStrictEqual, strictEqual } from 'assert/strict';

import type { Mock } from 'node:test';

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function expectToBeCalledOnceWith<TFunction extends Function>(
  fn: Mock<TFunction>,
  args: Mock<TFunction>['mock']['calls'][number]['arguments']
): void {
  strictEqual(fn.mock.callCount(), 1);
  deepStrictEqual(fn.mock.calls[0].arguments, args);
}
