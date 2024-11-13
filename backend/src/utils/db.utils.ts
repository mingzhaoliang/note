import { Prisma } from "@prisma/client";

export function transformUndefined<T extends object>(conditions: T): T {
  return Object.fromEntries(
    Object.entries(conditions).map(([key, value]) => [
      key,
      value === undefined ? Prisma.skip : value,
    ])
  ) as T;
}
