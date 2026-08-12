import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("the static entrypoint references site assets, languages, and footer support", async () => {
  const html = await readFile(new URL("html/index.html", root), "utf8");
  assert.match(html, /<title>Laundry Window/);
  assert.match(html, /href="styles\.css"/);
  assert.match(html, /src="i18n\.js"/);
  assert.match(html, /src="market-prices\.js"/);
  assert.match(html, /src="app\.js"/);
  assert.match(html, /Samsung WF702Y4BKWQ\/EN/);
  assert.match(html, /Built for one Samsung family/);
  assert.match(html, /src="https:\/\/cdnjs\.buymeacoffee\.com\/1\.0\.0\/button\.prod\.min\.js"/);
  assert.match(html, /data-slug="roels"/);
  assert.match(html, /data-text="Buy me a beer"/);
  assert.match(html, /Utilitarian Spot/);
});

test("only site assets live in the public web root", async () => {
  await Promise.all([
    access(new URL("html/index.html", root)),
    access(new URL("html/styles.css", root)),
    access(new URL("html/i18n.js", root)),
    access(new URL("html/app.js", root)),
    access(new URL("html/market-prices.js", root)),
  ]);
  await assert.rejects(access(new URL("index.html", root)));
});

test("the market helper chooses the cheapest complete valid schedule", async () => {
  await import(new URL("html/market-prices.js", root));
  const market = globalThis.LaundryMarketPrices;
  const start = new Date("2026-01-01T00:00:00Z").getTime();
  const points = Array.from({ length: 80 }, (_, index) => {
    const timestamp = new Date(start + index * 15 * 60000).toISOString();
    const hour = index / 4;
    return { timestamp, value: hour >= 4 && hour < 5 ? "10" : "100" };
  });

  const best = market.findCheapestSchedule(points, new Date(start), 60);
  assert.equal(best.delayHours, 5);
  assert.equal(best.start, new Date("2026-01-01T04:00:00Z").getTime());
  assert.equal(best.end, new Date("2026-01-01T05:00:00Z").getTime());
  assert.equal(best.average, 10);
  assert.equal(market.findCheapestSchedule(points.slice(0, 4), new Date(start), 60), null);
});

test("repository screenshots are present", async () => {
  await Promise.all([
    access(new URL("screenshots/laundry-window-desktop.png", root)),
    access(new URL("screenshots/laundry-window-mobile.png", root)),
  ]);
});

test("the official programme durations remain present", async () => {
  const script = await readFile(new URL("html/app.js", root), "utf8");
  const expected = {
    cotton: 133,
    synthetics: 105,
    jeans: 77,
    bedding: 100,
    dark: 78,
    daily: 66,
    drum: 104,
    baby: 142,
    sports: 72,
    hand: 30,
    wool: 38,
  };
  for (const [id, minutes] of Object.entries(expected)) {
    assert.match(script, new RegExp(`id: "${id}"[^\\n]+minutes: ${minutes}`));
  }
  assert.match(script, /index \+ 3/);
  assert.match(script, /length: 17/);
  assert.match(script, /preferredProgramId = "dark"/);
  assert.match(script, /washer-preferred-program/);
  assert.match(script, /shouldReoptimise/);
  assert.match(script, /safetyTitle/);
});

test("the interface supports remembered English and Dutch translations", async () => {
  const script = await readFile(new URL("html/i18n.js", root), "utf8");
  assert.match(script, /laundry-language/);
  assert.match(script, /Set the delay/);
  assert.match(script, /Stel de tijd in/);
  assert.match(script, /marketEnvelope/);
  assert.match(script, /exact 15-minute market intervals/);
  assert.match(script, /exact marktkwartier/);
});

test("the nginx example includes safe static defaults", async () => {
  const config = await readFile(new URL("nginx/laundry-window.conf.example", root), "utf8");
  assert.match(config, /root \/var\/www\/laundry-window\/html;/);
  assert.match(config, /autoindex off;/);
  assert.match(config, /location ~ \/\\\./);
  assert.match(config, /try_files \$uri \$uri\/ \/index\.html/);
  assert.match(config, /X-Content-Type-Options/);
  assert.match(config, /Content-Security-Policy/);
  assert.match(config, /script-src 'self' https:\/\/cdnjs\.buymeacoffee\.com/);
  assert.match(config, /style-src 'self' 'unsafe-inline' https:\/\/fonts\.googleapis\.com/);
  assert.match(config, /font-src 'self' https:\/\/fonts\.gstatic\.com/);
  assert.match(config, /connect-src https:\/\/spot\.utilitarian\.io/);
});
