const join = (base: string, path: string) =>
  `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;

/** Root-relative URL for the assets this site ships. Anchoring to `BASE_URL`
 *  (the configured `base`) keeps dev, `astro preview` and the deployed subpath
 *  resolving locally — building against `SITE` pointed every image at the live
 *  deployment instead. */
export function assetUrl(path: string) {
  return join(import.meta.env.BASE_URL, path);
}

/** Fully-qualified URL, for canonical links and social metadata. */
export function absoluteUrl(path: string) {
  return new URL(path.replace(/^\/+/, ''), import.meta.env.SITE).toString();
}
