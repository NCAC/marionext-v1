const $queryEncodeSpaceRe = /%20/g;
export function $queryEncode(prop: string, value: string): string {
  return `&${encodeURIComponent(prop)}=${encodeURIComponent(value).replace(
    $queryEncodeSpaceRe,
    "+"
  )}`;
}
