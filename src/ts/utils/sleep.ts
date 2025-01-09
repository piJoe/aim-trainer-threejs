export function sleep(ms: number): Promise<void> {
  return new Promise((res) => {
    window.setTimeout(() => {
      res();
    }, ms);
  });
}
