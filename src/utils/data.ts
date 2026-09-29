import { assetUrl } from './functions';

export const TOTAL_SVGS = 146;

export const TITLE = `${TOTAL_SVGS} SVGs with Inkscape — Part 2`;

export const DESCRIPTION =
  'A curated gallery of vector artwork drawn with Inkscape: logos, icons and illustrations, exported straight from the source SVGs.';

export const AUTHOR = '20essentials';

export const REPO_URL = 'https://github.com/20essentials/some-svgs-with-inkscape-part-2';

export const INKSCAPE_URL = 'https://inkscape.org/';

export const CREDIT = {
  name: 'Jelle van Leest',
  href: 'https://www.jellevanleest.nl/'
};

export type Project = {
  id: number;
  label: string;
  /** The raw SVG — what the tile links to. */
  url: string;
  /** The 512px WebP the tile actually paints. The originals total ~83 MB,
   *  which no browser can get through in a 180px tile. */
  thumb: string;
};

/** Intrinsic size of every generated thumbnail; see `scripts/generate-thumbs.mjs`. */
export const THUMB_SIZE = 512;

export const projects: Project[] = Array.from(
  { length: TOTAL_SVGS },
  (_, index) => {
    const id = index + 1;
    return {
      id,
      label: `#${String(id).padStart(3, '0')}`,
      url: assetUrl(`/assets/${id}/${id}.svg`),
      thumb: assetUrl(`/assets/${id}/${id}.webp`)
    };
  }
);

export const stats = [
  { label: 'Format', value: 'SVG' },
  { label: 'Editor', value: 'Inkscape' },
  { label: 'Export', value: 'Vector' },
  { label: 'License', value: 'MIT' }
] as const;
