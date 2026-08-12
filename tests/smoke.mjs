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
  assert.match(html, /data-suggest-day="0"/);
  assert.match(html, /data-suggest-day="1"/);
  assert.match(html, /https:\/\/github\.com\/roelsroels\/laundry-window/);
  assert.match(html, /🇬🇧/);
  assert.doesNotMatch(html, /🇺🇸/);
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

  const localPlanning = new Date(2026, 0, 1, 13, 39);
  const localStart = new Date(2026, 0, 1, 0, 0).getTime();
  const dayPoints = Array.from({ length: 192 }, (_, index) => {
    const time = new Date(localStart + index * 15 * 60000);
    const day = time.getDate() === localPlanning.getDate() ? 0 : 1;
    const decimalHour = time.getHours() + time.getMinutes() / 60;
    let value = 100;
    if (day === 0 && decimalHour >= 12 && decimalHour < 15.75) value = decimalHour >= 14 && decimalHour < 14.25 ? -8 : 2;
    if (day === 1 && decimalHour >= 3 && decimalHour < 5) value = 10;
    return { timestamp: time.toISOString(), value };
  });
  const lowToday = market.findLowPriceWindow(dayPoints, localPlanning, 0);
  assert.equal(lowToday.start, new Date(2026, 0, 1, 12, 0).getTime());
  assert.equal(lowToday.end, new Date(2026, 0, 1, 15, 45).getTime());
  const todayBest = market.findCheapestSchedule(dayPoints, localPlanning, 78, 0);
  const tomorrowBest = market.findCheapestSchedule(dayPoints, localPlanning, 78, 1);
  assert.equal(new Date(todayBest.start).getDate(), 1);
  assert.equal(new Date(tomorrowBest.start).getDate(), 2);
  assert.equal(market.hasPricesForDay(dayPoints, localPlanning, 1), true);

  const schedule = { start, end: start + 60 * 60000 };
  assert.deepEqual(market.timelineCoverage(schedule, start, schedule.end, 60), { beforePercent: 0, afterPercent: 0 });
  assert.deepEqual(market.timelineCoverage(schedule, start, schedule.end - 15 * 60000, 60), { beforePercent: 0, afterPercent: 25 });
  assert.deepEqual(market.timelineCoverage(schedule, start + 15 * 60000, schedule.end, 60), { beforePercent: 25, afterPercent: 0 });
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
  assert.match(script, /marketPrices\.timelineCoverage/);
  assert.match(script, /--outside-before/);
  assert.match(script, /--inside-until/);
});

test("the interface supports remembered English and Dutch translations", async () => {
  const script = await readFile(new URL("html/i18n.js", root), "utf8");
  assert.match(script, /laundry-language/);
  assert.match(script, /Set the delay/);
  assert.match(script, /Stel de tijd in/);
  assert.match(script, /marketWindow/);
  assert.match(script, /exact 15-minute market intervals/);
  assert.match(script, /exacte marktkwartieren/);
  assert.match(script, /raw wholesale market price/);
  assert.match(script, /kale beursprijs/);
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
