import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import { setTimeout as wait } from 'node:timers/promises';

const require = createRequire(import.meta.url);
const { chromium } = require('/home/hatch/workspace/makefun/tools/node_modules/playwright-core');
const chromePath = '/home/hatch/workspace/makefun/tools/cft/chrome-linux64/chrome';
const server = spawn(process.execPath, ['serve.ts'], { stdio: ['ignore', 'pipe', 'inherit'] });
let browser;

try {
  let ready = false;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch('http://127.0.0.1:8080/');
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {}
    await wait(100);
  }
  if (!ready) throw new Error('The local app server did not start.');
  browser = await chromium.launch({ executablePath: chromePath, headless: true, args: ['--no-sandbox'] });
  await mkdir('screenshots', { recursive: true });

  for (const [scene, filename] of [
    ['checklist', '1-checklist.jpg'],
    ['guide', '2-guide.jpg'],
    ['roadmap', '3-roadmap.jpg'],
    ['filters', '4-filters.jpg']
  ]) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.goto(`http://127.0.0.1:8080/?shot=${scene}`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.__shotReady === true);
    await page.screenshot({ path: `screenshots/${filename}`, type: 'jpeg', quality: 82, fullPage: false });
    if (pageErrors.length) throw new Error(`${scene} has page errors: ${pageErrors.join('; ')}`);
    console.log(`${filename}: ${await page.title()} — ${await page.locator('body').innerText().then(text => text.length)} visible text characters`);
    await page.close();
  }
} finally {
  if (browser) await browser.close();
  if (!server.killed) server.kill('SIGTERM');
}
