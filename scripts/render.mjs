/**
 * Renders the source SVG into a 512px WebP thumbnail, trying librsvg first
 * and resvg second, in separate processes so neither engine can take the
 * build down.
 *
 *     node scripts/render.mjs <source.svg> <target.webp>
 *
 * Each engine is a child process on purpose. They fail in two different ways:
 * librsvg refuses the handful of files whose single XML node blows past
 * libxml2's 10 MB buffer cap, and resvg aborts the *entire* process on a
 * zero-size geometry (83.svg is a 1.9 MB Live Path Effect that trips it).
 * Only a process boundary can contain the second kind.
 *
 * Exits non-zero if neither engine succeeds.
 */
import { unlink } from 'node:fs/promises';
import { basename } from 'node:path';

const [source, target] = process.argv.slice(2);

if (!source || !target) {
  console.error('usage: render.mjs <source.svg> <target.webp>');
  process.exit(2);
}

/** Every thumbnail is this square, so the tile can carry a fixed intrinsic
 *  size and never reflow. A transparent canvas matches the `object-fit:
 *  contain` box in the card, so letterboxed artwork looks unchanged. */
const SIZE = 512;
/** Supersamples ~2x before downscaling, which keeps small artwork crisp in the
 *  tile without the multi-megapixel intermediates a higher density implies. */
const DENSITY = 192;

const toWebp = (pipeline) =>
  pipeline
    .resize(SIZE, SIZE, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      // Without this, artwork that renders below SIZE keeps its own smaller
      // canvas and the tile's intrinsic size stops being uniform.
      withoutEnlargement: false
    })
    .webp({ quality: 78, alphaQuality: 90, effort: 4 });

const viaResvg = async () => {
  const { Resvg } = await import('@resvg/resvg-js');
  const { readFile } = await import('node:fs/promises');
  const { default: sharp } = await import('sharp');

  const svg = await readFile(source);
  const png = new Resvg(svg, {
    fitTo: { mode: 'zoom', value: SIZE / Math.max(...intrinsic(svg)) },
    background: 'rgba(0, 0, 0, 0)',
    // Nothing in this collection has a <text> node, so skipping system font
    // loading keeps output identical across machines.
    font: { loadSystemFonts: false }
  })
    .render()
    .asPng();

  await toWebp(sharp(png, { limitInputPixels: false })).toFile(target);
};

/** Longest intrinsic edge in px, so resvg can be asked to render no larger
 *  than the tile in the one dimension that binds. Units are honoured because
 *  Inkscape writes millimetres on some files (36.svg), and resvg scales the
 *  resolved pixel size, not the raw viewBox. */
const intrinsic = (svg) => {
  const head = svg.subarray(0, 4096).toString('utf8');
  const open = head.match(/<svg\b[^>]*>/)?.[0] ?? '';
  const raw = (name) =>
    Number.parseFloat(open.match(new RegExp(`\\s${name}\\s*=\\s*"([^"]*)"`))?.[1] ?? '');

  const toPx = (value, unit) => {
    if (!Number.isFinite(value) || value <= 0) return 0;
    return value * (unit === 'mm' ? 96 / 25.4 : unit === 'cm' ? 96 / 2.54 : unit === 'in' ? 96 : unit === 'pt' ? 96 / 72 : unit === 'pc' ? 16 : 1);
  };

  const match = (name) => {
    const found = open.match(new RegExp(`\\s${name}\\s*=\\s*"\\s*([\\d.]+)\\s*(mm|cm|in|pt|pc|px)?\\s*"`));
    return toPx(Number.parseFloat(found?.[1] ?? ''), found?.[2]);
  };

  const width = match('width') || raw('width');
  const height = match('height') || raw('height');
  if (width > 0 && height > 0) return [width, height];

  const viewBox = open.match(/\bviewBox\s*=\s*"([\d.\s-]+)"/)?.[1];
  if (viewBox) {
    const [, , w, h] = viewBox.trim().split(/[\s,]+/).map(Number);
    if (w > 0 && h > 0) return [w, h];
  }

  return [SIZE, SIZE];
};

const errors = [];

try {
  const { default: sharp } = await import('sharp');
  await toWebp(sharp(source, { limitInputPixels: false, density: DENSITY })).toFile(target);
  process.exit(0);
} catch (error) {
  errors.push(`librsvg: ${error.message}`);
}

try {
  await viaResvg();
  process.exit(0);
} catch (error) {
  errors.push(`resvg: ${error.message}`);
}

await unlink(target).catch(() => {});
console.error(`  ${basename(source)} — ${errors.join(' | ')}`);
process.exit(1);
