export interface $DomStaticCamelCase {
  camelCase(str: string): string;
}

const dashAlphaRe = /-([a-z])/g;
export function $camelCase(str: string) {
  return str.replace(dashAlphaRe, (match: string, letter: string) =>
    letter.toUpperCase()
  );
}

export const $DomStaticCamelCaseMixin: $DomStaticCamelCase = {
  camelCase: $camelCase
};
