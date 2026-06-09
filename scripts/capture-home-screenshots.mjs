import { chromium } from "playwright";
import { mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "../.review-screenshots");
const baseUrl = "http://127.0.0.1:8765/index.html";

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const viewports = [
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "tablet-1024", width: 1024, height: 900 },
  { name: "mobile-390", width: 390, height: 844 },
];

for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);

  const acceptCookies = page.locator("#accept-all-cookies");
  if (await acceptCookies.count()) {
    await acceptCookies.click();
    await page.waitForTimeout(300);
  }

  await page.screenshot({
    path: path.join(outDir, `${vp.name}-hero.png`),
    fullPage: false,
  });

  await page.screenshot({
    path: path.join(outDir, `${vp.name}-full.png`),
    fullPage: true,
  });

  const sections = ["#hero", "#pillars", "#third-voice", "#app-downloads"];
  for (const sel of sections) {
    const el = page.locator(sel);
    if (await el.count()) {
      try {
        await el.scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
        await el.screenshot({
          path: path.join(outDir, `${vp.name}-${sel.slice(1)}.png`),
        });
      } catch {
        /* section may be hidden */
      }
    }
  }

  await page.close();
}

await browser.close();
console.log(`Screenshots saved to ${outDir}`);
