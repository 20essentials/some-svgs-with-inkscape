/**
 * Regenerates `preview/<project>.avif`, the hero shot the README opens with.
 *
 * The frame is one viewport — 100vw x 100vh at scroll 0 — so the image is
 * always exactly the first fold of the page: no scrollbar, no half-revealed
 * section peeking from the bottom.
 *
 * Chrome is driven over the DevTools protocol instead of `--screenshot`
 * because that flag exposes the *window* size, not the viewport, and captures
 * the instant the load event fires. This page does neither in time: the hero
 * animates in, three islands hydrate, and the webfont swaps after load.
 *
 *     node scripts/preview.mjs [--width 1920] [--height 1080] [--settle 5000]
 *
 * Serves `dist/` itself, so the shot tracks the build that was just deployed
 * rather than a deployed copy GitHub Pages may still be serving from cache.
 * Exits non-zero when no browser is installed or the capture comes back blank.
 */
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const TARGET = path.join(ROOT, 'preview', `${path.basename(ROOT)}.avif`);

const flag = (name, fallback) => {
  const at = process.argv.indexOf(`--${name}`);
  return at === -1 ? fallback : process.argv[at + 1];
};

const WIDTH = Number(flag('width', process.env.PREVIEW_WIDTH ?? 1920));
const HEIGHT = Number(flag('height', process.env.PREVIEW_HEIGHT ?? 1080));
/** Headless Chrome reports no prefers-color-scheme of its own, so the theme is
 *  pinned rather than inherited from whichever machine ran the deploy. */
const SCHEME = flag('scheme', process.env.PREVIEW_COLOR_SCHEME ?? 'light');
/** Budget for the entrance animations to finish after the fonts land. */
const SETTLE = Number(flag('settle', process.env.PREVIEW_SETTLE ?? 5000));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const exists = (file) => access(file).then(() => true, () => false);

const BROWSERS = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  `${process.env.LOCALAPPDATA ?? ''}\\Google\\Chrome\\Application\\chrome.exe`,
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/snap/bin/chromium'
];

const browser = (
  await Promise.all(
    BROWSERS.filter(Boolean).map(async (file) => (await exists(file) ? file : null))
  )
).find(Boolean);

if (!browser) {
  console.error('\n  no Chrome or Edge found — set CHROME_PATH to a browser binary\n');
  process.exit(1);
}

if (!(await exists(path.join(DIST, 'index.html')))) {
  console.error('\n  dist/index.html is missing — run `pnpm build` first\n');
  process.exit(1);
}

/** `base` is a deploy-time prefix the build bakes into every URL, so it is
 *  read back off the built page rather than parsed out of the config (which
 *  imports Vite plugins and cannot be loaded outside Astro). */
const base =
  (await readFile(path.join(DIST, 'index.html'), 'utf8')).match(
    /(?:href|src)="(\/[^"]*?)\/(?:static|_astro)\//
  )?.[1] ?? '';

const MIME = {
  '.avif': 'image/avif',
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.mjs': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml'
};

const server = createServer(async (request, response) => {
  let pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);

  if (base && pathname.startsWith(`${base}/`)) pathname = pathname.slice(base.length);
  if (!pathname || pathname.endsWith('/')) pathname += 'index.html';

  const file = path.join(DIST, pathname);
  if (!file.startsWith(DIST)) {
    response.writeHead(403).end();
    return;
  }

  try {
    const body = await readFile(file);
    response.writeHead(200, {
      'cache-control': 'no-store',
      'content-type': MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream'
    });
    response.end(body);
  } catch {
    response.writeHead(404, { 'content-type': 'text/plain' }).end('not found');
  }
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

const origin = `http://127.0.0.1:${server.address().port}`;
const profile = await mkdtemp(path.join(tmpdir(), 'preview-shot-'));
const chrome = spawn(
  browser,
  [
    '--headless=new',
    // 0 makes Chrome pick a free port and write it to DevToolsActivePort, so
    // concurrent deploys never collide on a fixed 9222.
    '--remote-debugging-port=0',
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--mute-audio',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--force-color-profile=srgb',
    `--window-size=${WIDTH},${HEIGHT}`,
    'about:blank'
  ],
  { stdio: 'ignore' }
);

const cleanup = async () => {
  chrome.kill();
  // The profile is still locked until the browser processes are gone.
  await Promise.race([once(chrome, 'exit').catch(() => {}), sleep(3000)]);
  await new Promise((resolve) => server.close(resolve));
  await rm(profile, { force: true, recursive: true, maxRetries: 5, retryDelay: 200 }).catch(
    () => {}
  );
};

const devtools = await (async () => {
  const portFile = path.join(profile, 'DevToolsActivePort');

  for (let attempt = 0; attempt < 100; attempt++) {
    const written = await readFile(portFile, 'utf8').catch(() => '');
    const port = Number(written.split('\n')[0]);

    if (port > 0) {
      const targets = await fetch(`http://127.0.0.1:${port}/json/list`)
        .then((response) => response.json())
        .catch(() => []);

      const page = targets.find((target) => target.type === 'page' && target.webSocketDebuggerUrl);
      if (page) return page;
    }

    await sleep(100);
  }

  throw new Error('Chrome never opened a debugging port');
})();

const socket = new WebSocket(devtools.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.onopen = resolve;
  socket.onerror = () => reject(new Error('could not attach to Chrome'));
});

let sequence = 0;
const inflight = new Map();
const events = [];

socket.onmessage = ({ data }) => {
  const message = JSON.parse(data);
  const pending = inflight.get(message.id);

  if (pending) {
    inflight.delete(message.id);
    message.error ? pending.reject(new Error(message.error.message)) : pending.resolve(message.result);
  } else {
    events.push(message.method);
  }
};

const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++sequence;
    inflight.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });

const evaluate = async (expression, awaitPromise = false) =>
  (
    await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise
    })
  ).result?.value;

try {
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: WIDTH,
    height: HEIGHT,
    deviceScaleFactor: 1,
    mobile: false
  });
  await send('Emulation.setEmulatedMedia', {
    media: 'screen',
    features: [{ name: 'prefers-color-scheme', value: SCHEME }]
  });

  await send('Page.navigate', { url: `${origin}${base}/` });

  for (let attempt = 0; attempt < 200 && !events.includes('Page.loadEventFired'); attempt++) {
    await sleep(100);
  }

  await evaluate('document.fonts.ready', true);
  await sleep(SETTLE);

  // Scroll restoration and lazy reveals both move the page; the shot is
  // defined as the top of it.
  const scrolled = await evaluate('(window.scrollTo(0, 0), window.scrollY)');
  if (scrolled !== 0) throw new Error(`could not scroll to the top (scrollY ${scrolled})`);

  const { data } = await send('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    captureBeyondViewport: false
  });

  const png = Buffer.from(data, 'base64');
  const { channels } = await sharp(png).stats();

  if (channels.every((channel) => channel.stdev < 4)) {
    throw new Error('the capture is a flat frame — the page did not paint');
  }

  const quality = 60;
  const avif = await sharp(png)
    .avif({ quality, effort: 6, chromaSubsampling: '4:4:4' })
    .toBuffer();

  await writeFile(TARGET, avif);

  console.log(
    `  preview/${path.basename(TARGET)} — ${WIDTH}x${HEIGHT} at scroll 0, ` +
      `${(avif.length / 1024).toFixed(0)} KB of AVIF (q${quality})`
  );
} finally {
  socket.close();
  await cleanup();
}
