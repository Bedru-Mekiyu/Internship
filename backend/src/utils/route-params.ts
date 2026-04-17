/**
 * Express 5 types `req.params.*` as `string | string[]` in some typings.
 * Normalize to a single string for Mongoose queries and internal helpers.
 */
export const routeParam = (value: string | string[] | undefined): string => {
  if (value === undefined) {
    return '';
  }

  return Array.isArray(value) ? String(value[0] ?? '') : String(value);
};
