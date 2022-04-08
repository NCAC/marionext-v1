export const $cssVariableRe = /^--/;
export function $isCSSVariable(prop: string): boolean {
  return $cssVariableRe.test(prop);
}
