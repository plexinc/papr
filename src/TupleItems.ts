type LastRequiredPosition<Items extends readonly unknown[]> = Items extends readonly [
  ...infer Rest,
  infer Last,
]
  ? Last extends NonNullable<Last>
    ? [...Rest, Last]['length']
    : LastRequiredPosition<Rest>
  : 0;

type TupleSplit<
  Items extends readonly unknown[],
  Position extends number,
  Result extends unknown[] = [],
> = Result['length'] extends Position
  ? Result
  : Items extends readonly [infer First, ...infer Rest]
    ? TupleSplit<readonly [...Rest], Position, [...Result, NonNullable<First>]>
    : Result;

export type TupleItems<
  Type extends readonly unknown[],
  Range extends number = LastRequiredPosition<Type>,
> = { [Value in Range]: TupleSplit<Type, Value> }[Range];
