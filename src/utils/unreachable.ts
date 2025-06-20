export function assertUnreachable(x: never): never {
  throw new Error(`Not expected to reach here. Received type: ${typeof x}`);
}
