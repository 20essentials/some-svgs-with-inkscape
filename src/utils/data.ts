import { baseUrl } from './functions';
export const TOTAL_SVGS = 146;
export const arraySvgs = Array.from({ length: TOTAL_SVGS }, (_, i) => ({
  url: baseUrl(`/assets/${i + 1}/${i + 1}.svg`)
})).toSorted(() => Math.random() - 0.5);



export const TITLE = `${TOTAL_SVGS} SVGs with Inkscape - Part 2`;
