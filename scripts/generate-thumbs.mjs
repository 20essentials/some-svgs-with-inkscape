/**
 * Generates the gallery's WebP thumbnails from the source SVGs.
 *
 * The collection ships 146 hand-drawn SVGs totalling ~83 MB; 39.svg alone is
 * 36 MB. A browser cannot paint that in a 180px tile, so the grid points at
 * the thumbnails this script writes and keeps the original `.svg` as the
 * download target.
 *
 * Output lands beside its source — `public/assets/<id>/<id>.webp` — and a file
 * that cannot be rendered fails the build rather than shipping a broken tile.
 *
 *     node scripts/generate-thumbs.mjs [--force]
 */
import { spawn } from 'node:child_process';
import { readdir, stat } from 'node:fs/promises';
import { availableParallelism } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = path.join(ROOT, 'public', 'assets');
const RENDER = path.join(ROOT, 'scripts', 'render.mjs');

const force = process.argv.includes('--force');
/** Each render is its own process, so this is bounded by memory, not cores. */
const CONCURRENCY = Math.max(1, Math.min(4, availableParallelism() - 1));

const statOrNull = (file) => stat(file).then(
  (info) => info,
  () => null
);

const render = (source, target) =>
  new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [RENDER, source, target], {
      stdio: ['ignore', 'inherit', 'inherit']
    });
    child.on('error', reject);
    child.on('close', (code) =>
      code === 0 ? resolve(stat(target)) : reject(new Error(`exit ${code}`))
    );
  });

const candidates = (
  await Promise.all(
    (await readdir(ASSETS, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => {
        const source = path.join(ASSETS, entry.name, `${entry.name}.svg`);
        return { id: entry.name, source, target: source.replace(/\.svg$/, '.webp') };
      })
      .map(async (job) => ({
        ...job,
        sourceStat: await statOrNull(job.source),
        targetStat: await statOrNull(job.target)
      }))
  )
).filter((job) => job.sourceStat);

// A thumbnail older than the SVG it came from is stale. The originals are the
// input, so they win the comparison.
const stale = candidates.filter(
  ({ sourceStat, targetStat }) =>
    force || !targetStat || targetStat.mtimeMs < sourceStat.mtimeMs
);

// Biggest first: the 36 MB file dominates the wall clock, so start it early
// and let the cheap ones fill in around it.
stale.sort((a, b) => b.sourceStat.size - a.sourceStat.size);

let done = 0;
let bytes = 0;
let sourceBytes = 0;
const failures = [];
const queue = [...stale];

await Promise.all(
  Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
    for (let job = queue.pop(); job; job = queue.pop()) {
      try {
        const written = await render(job.source, job.target);
        bytes += written.size;
        sourceBytes += job.sourceStat.size;
      } catch {
        failures.push(job.id);
      }
      done += 1;
      process.stdout.write(`\r  ${done}/${stale.length} rendered…   `);
    }
  })
);

if (done) process.stdout.write('\n');

const cached = candidates.length - stale.length;
const summary = `${candidates.length} assets — ${stale.length} rendered, ${cached} cached`;

if (bytes > 0) {
  console.log(
    `${summary}: ${(sourceBytes / 1024 / 1024).toFixed(1)} MB of SVG became ` +
      `${(bytes / 1024 / 1024).toFixed(1)} MB of WebP ` +
      `(${(sourceBytes / bytes).toFixed(0)}x lighter)`
  );
} else {
  console.log(summary);
}

if (failures.length) {
  console.error(`\n  could not render: ${failures.join(', ')}`);
  process.exit(1);
}
