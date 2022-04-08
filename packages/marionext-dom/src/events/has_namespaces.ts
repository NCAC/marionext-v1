export function $hasNamespaces(ns1: string[], ns2?: string[]): boolean {
  return (
    !ns2 || !Array.prototype.some.call(ns2, (ns: string) => ns1.indexOf(ns) < 0)
  );
}
