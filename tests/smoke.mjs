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
  assert.match(html, /Bosch WAE284A7NL\/12/);
  assert.match(html, /id="machine-profile"/);
  assert.match(html, /Two model profiles/);
  assert.match(html, /src="https:\/\/cdnjs\.buymeacoffee\.com\/1\.0\.0\/button\.prod\.min\.js"/);
  assert.match(html, /data-slug="roels"/);
  assert.match(html, /data-text="Buy me a beer"/);
  assert.match(html, /EnergyZero/);
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
  const energyZeroPoints = market.energyZeroPricePoints({ base: [{ start: "2026-01-01T00:00:00Z", end: "2026-01-01T00:15:00Z", price: { value: "0.14509" } }] });
  assert.deepEqual(energyZeroPoints, [{ timestamp: "2026-01-01T00:00:00Z", value: 145.09 }]);
  assert.match(market.priceUrl(new Date(2026, 0, 2)), /date=02-01-2026/);
  assert.match(market.priceUrl(new Date(2026, 0, 2)), /interval=INTERVAL_QUARTER/);
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
  assert.equal(todayBest.delayHours, 0);
  assert.equal(todayBest.start, localPlanning.getTime());
  assert.equal(todayBest.end, localPlanning.getTime() + 78 * 60000);
  assert.equal(new Date(todayBest.start).getDate(), 1);
  assert.equal(new Date(tomorrowBest.start).getDate(), 2);
  assert.equal(market.hasPricesForDay(dayPoints, localPlanning, 1), true);
  assert.equal(market.latestSafeStart(new Date(2026, 0, 1, 15, 45), 78, 15), new Date(2026, 0, 1, 14, 12).getTime());

  const boschPointsStart = new Date(2026, 0, 1, 10, 0).getTime();
  const boschPoints = Array.from({ length: 120 }, (_, index) => ({
    timestamp: new Date(boschPointsStart + index * 15 * 60000).toISOString(),
    value: index >= 10 && index < 20 ? 5 : 50
  }));
  const boschBest = market.findCheapestSchedule(boschPoints, new Date(boschPointsStart), 150, 0, { min: 1, max: 24 });
  assert.equal(boschBest.delayHours, 5);
  assert.equal(boschBest.start, boschPointsStart + 150 * 60000);
  assert.equal(market.findCheapestSchedule(boschPoints, new Date(boschPointsStart), 150, 0, { min: 1, max: 2 }).delayHours, 0);

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

test("the Samsung and Bosch programme profiles remain present", async () => {
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
  const boschExpected = {
    "cotton-20": 150,
    "cotton-30": 150,
    "cotton-40": 150,
    "cotton-60": 165,
    "cotton-90": 165,
    "easy-care-40": 105,
    "quick-mix-40": 75,
    "delicates-30": 45,
    "wool-30": 45,
    "super-quick-15": 15,
  };
  for (const [id, minutes] of Object.entries(boschExpected)) {
    assert.match(script, new RegExp(`id: "${id}"[^\\n]+minutes: ${minutes}`));
  }
  assert.match(script, /timerRange: \{ min: 3, max: 19 \}/);
  assert.match(script, /timerRange: \{ min: 1, max: 24 \}/);
  assert.match(script, /defaultProgram: "dark"/);
  assert.match(script, /defaultProgram: "cotton-40"/);
  assert.match(script, /washer-machine-profile/);
  assert.match(script, /washer-preferred-programs/);
  assert.match(script, /washer-program-overrides-v2/);
  assert.match(script, /shouldReoptimise/);
  assert.match(script, /safetyTitle/);
  assert.match(script, /marketPrices\.timelineCoverage/);
  assert.match(script, /marketPrices\.latestSafeStart/);
  assert.match(script, /delayHours === 0/);
  assert.match(script, /instructionNow/);
  assert.match(script, /--outside-before/);
  assert.match(script, /--inside-until/);
});

test("the interface supports remembered English and Dutch translations", async () => {
  const script = await readFile(new URL("html/i18n.js", root), "utf8");
  assert.match(script, /laundry-language/);
  assert.match(script, /Set the time/);
  assert.match(script, /Stel de tijd in/);
  assert.match(script, /Bosch WAE284A7NL\/12/);
  assert.match(script, /Klaar in/);
  assert.match(script, /Ready in/);
  assert.match(script, /marketWindow/);
  assert.match(script, /exact 15-minute market intervals/);
  assert.match(script, /exacte marktkwartieren/);
  assert.match(script, /raw wholesale market price/);
  assert.match(script, /kale beursprijs/);
  assert.match(script, /normally published around 15:00/);
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
  assert.match(config, /connect-src https:\/\/public\.api\.energyzero\.nl/);
});
