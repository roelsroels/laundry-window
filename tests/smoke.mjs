import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("the static entrypoint references site assets, languages, and footer support", async () => {
  const html = await readFile(new URL("html/index.html", root), "utf8");
  assert.match(html, /<title>Laundry Window/);
  assert.match(html, /href="styles\.css"/);
  assert.match(html, /src="i18n\.js"/);
  assert.match(html, /src="machines\.js"/);
  assert.match(html, /src="market-prices\.js"/);
  assert.match(html, /src="app\.js"/);
  assert.match(html, /Samsung WF702Y4BKWQ\/EN/);
  assert.match(html, /Bosch WAE284A7NL\/12/);
  assert.match(html, /id="machine-profile"/);
  assert.match(html, /Ten model profiles/);
  assert.match(html, /src="https:\/\/cdnjs\.buymeacoffee\.com\/1\.0\.0\/button\.prod\.min\.js"/);
  assert.match(html, /data-slug="roels"/);
  assert.match(html, /data-text="Buy me a beer"/);
  assert.match(html, /EnergyZero/);
  assert.match(html, /data-suggest-day="0"/);
  assert.match(html, /data-suggest-day="1"/);
  assert.match(html, /<option value="0" data-i18n="noMargin" selected>/);
  assert.doesNotMatch(html, /<option value="15"[^>]*selected/);
  assert.match(html, /https:\/\/github\.com\/roelsroels\/laundry-window/);
  assert.match(html, /🇬🇧/);
  assert.doesNotMatch(html, /🇺🇸/);
});

test("only site assets live in the public web root", async () => {
  await Promise.all([
    access(new URL("html/index.html", root)),
    access(new URL("html/styles.css", root)),
    access(new URL("html/i18n.js", root)),
    access(new URL("html/machines.js", root)),
    access(new URL("html/app.js", root)),
    access(new URL("html/market-prices.js", root)),
  ]);
  await assert.rejects(access(new URL("index.html", root)));
});

test("the market helper chooses the earliest complete schedule inside the low-price band", async () => {
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
  assert.equal(market.isPastTodayWindow(lowToday, new Date(2026, 0, 1, 22, 1), 0), true);
  assert.equal(market.isPastTodayWindow(lowToday, new Date(2026, 0, 1, 13, 0), 0), false);
  assert.equal(market.isPastTodayWindow(lowToday, new Date(2026, 0, 1, 22, 1), 1), false);
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

  const startDelay = market.scheduleForTimer(new Date(boschPointsStart), 75, 2, { mode: "start" });
  assert.equal(startDelay.start, boschPointsStart + 2 * 3600000);
  assert.equal(startDelay.end, boschPointsStart + (2 * 60 + 75) * 60000);
  const endDelay = market.scheduleForTimer(new Date(boschPointsStart), 75, 2, { mode: "end" });
  assert.equal(endDelay.start, boschPointsStart + 45 * 60000);
  assert.equal(endDelay.end, boschPointsStart + 2 * 3600000);
  assert.deepEqual(market.timerChoices({ min: 0.5, max: 2, step: 0.5 }), [0.5, 1, 1.5, 2]);
  assert.deepEqual(market.timerChoices({ min: 0.5, max: 3, choices: [0.5, 1, 1.5, 2, 3] }, true), [0, 0.5, 1, 1.5, 2, 3]);

  const fullFitPlanning = new Date("2026-01-01T00:00:00Z");
  const fullFitStart = fullFitPlanning.getTime();
  const fullFitPoints = Array.from({ length: 96 }, (_, index) => {
    const timestamp = fullFitStart + index * 15 * 60000;
    const decimalHour = index / 4;
    return { timestamp: new Date(timestamp).toISOString(), value: decimalHour >= 13.75 && decimalHour < 15 ? 1 : 20 };
  });
  const preferredWindow = { start: fullFitStart + 12.5 * 3600000, end: fullFitStart + 14.75 * 3600000, marginMinutes: 0 };
  const rawCheapest = market.findCheapestSchedule(fullFitPoints, fullFitPlanning, 75, 0, { min: 1, max: 24 });
  const fullFitCheapest = market.findCheapestSchedule(fullFitPoints, fullFitPlanning, 75, 0, { min: 1, max: 24 }, preferredWindow);
  assert.equal(rawCheapest.delayHours, 15, "the raw cheapest cycle may extend beyond the low-price band");
  assert.equal(fullFitCheapest.delayHours, 14, "a complete selectable fit must beat a cheaper partial fit");
  assert.equal(fullFitCheapest.start, fullFitStart + 12.75 * 3600000);
  assert.equal(fullFitCheapest.end, fullFitStart + 14 * 3600000);

  const reportedPlanning = new Date(2026, 7, 13, 20, 58);
  const reportedWindow = {
    start: new Date(2026, 7, 14, 13, 0).getTime(),
    end: new Date(2026, 7, 14, 14, 45).getTime(),
    marginMinutes: 0
  };
  const reportedWait = market.findWaitSchedule(reportedPlanning, 75, { min: 1, max: 24, step: 1, mode: "end" }, reportedWindow);
  assert.equal(reportedWait.delayHours, 17);
  assert.equal(reportedWait.activationTime, new Date(2026, 7, 13, 21, 15).getTime());
  assert.equal(reportedWait.start, new Date(2026, 7, 14, 13, 0).getTime());
  assert.equal(reportedWait.end, new Date(2026, 7, 14, 14, 15).getTime());

  const reportedMarketWindow = {
    start: new Date(2026, 7, 14, 12, 45).getTime(),
    end: new Date(2026, 7, 14, 14, 45).getTime(),
    marginMinutes: 0
  };
  const reportedMarketWait = market.findWaitSchedule(reportedPlanning, 75, { min: 1, max: 24, step: 1, mode: "end" }, reportedMarketWindow);
  assert.equal(reportedMarketWait.delayHours, 17);
  assert.equal(reportedMarketWait.activationTime, new Date(2026, 7, 13, 21, 0).getTime());
  assert.equal(reportedMarketWait.start, new Date(2026, 7, 14, 12, 45).getTime());
  assert.equal(reportedMarketWait.end, new Date(2026, 7, 14, 14, 0).getTime());

  const cheaperWait = { delayHours: 16, activationTime: new Date(2026, 7, 13, 22, 45).getTime(), start: new Date(2026, 7, 14, 13, 27).getTime(), end: new Date(2026, 7, 14, 14, 45).getTime(), average: 18.5 };
  const currentCompleteEndTimer = { delayHours: 16, start: new Date(2026, 7, 14, 12, 53).getTime(), end: new Date(2026, 7, 14, 14, 11).getTime(), average: 18.7 };
  const practicalEndTimer = market.choosePracticalSchedule(currentCompleteEndTimer, cheaperWait, new Date(2026, 7, 13, 22, 11), reportedMarketWindow);
  assert.equal(practicalEndTimer.start, currentCompleteEndTimer.start, "an earlier complete end-timer schedule beats a later wait-to-set schedule");
  assert.equal(practicalEndTimer.activationTime, new Date(2026, 7, 13, 22, 11).getTime());

  const currentPartialStartTimer = { delayHours: 2, start: new Date(2026, 7, 14, 12, 15).getTime(), end: new Date(2026, 7, 14, 13, 15).getTime(), average: 12 };
  const completeWaitStartTimer = { delayHours: 2, activationTime: new Date(2026, 7, 14, 10, 45).getTime(), start: new Date(2026, 7, 14, 12, 45).getTime(), end: new Date(2026, 7, 14, 13, 45).getTime(), average: 15 };
  assert.equal(market.choosePracticalSchedule(currentPartialStartTimer, completeWaitStartTimer, new Date(2026, 7, 14, 10, 15), reportedMarketWindow).activationTime, completeWaitStartTimer.activationTime, "waiting remains valid when no current start-delay setting fits completely");
  const currentCompleteStartTimer = { delayHours: 3, start: new Date(2026, 7, 14, 13, 15).getTime(), end: new Date(2026, 7, 14, 14, 15).getTime(), average: 16 };
  assert.equal(market.choosePracticalSchedule(currentCompleteStartTimer, completeWaitStartTimer, new Date(2026, 7, 14, 10, 15), reportedMarketWindow).start, completeWaitStartTimer.start, "an earlier start-delay schedule beats a later complete setting available now");

  const screenshotPlanning = new Date(2026, 7, 22, 10, 18);
  const screenshotDayStart = new Date(2026, 7, 22, 0, 0).getTime();
  const screenshotWindow = {
    start: new Date(2026, 7, 22, 11, 30).getTime(),
    end: new Date(2026, 7, 22, 17, 30).getTime(),
    marginMinutes: 0
  };
  const screenshotPoints = Array.from({ length: 96 }, (_, index) => {
    const timestamp = screenshotDayStart + index * 15 * 60000;
    const hour = new Date(timestamp).getHours() + new Date(timestamp).getMinutes() / 60;
    return { timestamp: new Date(timestamp).toISOString(), value: hour >= 13 && hour < 16 ? 1 : 20 };
  });
  const samsungTimer = { min: 3, max: 19, step: 1, mode: "end" };
  const screenshotCurrent = market.findCheapestSchedule(screenshotPoints, screenshotPlanning, 133, 0, samsungTimer, screenshotWindow);
  const screenshotWait = market.findCheapestWaitSchedule(screenshotPoints, screenshotPlanning, 133, samsungTimer, screenshotWindow);
  const screenshotChoice = market.choosePracticalSchedule(screenshotCurrent, screenshotWait, screenshotPlanning, screenshotWindow);
  assert.equal(screenshotCurrent.start, new Date(2026, 7, 22, 12, 5).getTime(), "current timer choices use the earliest complete start, not the lowest later price");
  assert.equal(screenshotWait.activationTime, new Date(2026, 7, 22, 10, 43).getTime());
  assert.equal(screenshotChoice.start, screenshotWindow.start, "waiting 25 minutes aligns the Samsung wash with the start of the cheap window");
  assert.equal(screenshotChoice.end, new Date(2026, 7, 22, 13, 43).getTime());
  assert.equal(screenshotChoice.delayHours, 3);

  const startTimerWait = market.findWaitSchedule(
    new Date(2026, 7, 13, 10, 10),
    30,
    { min: 2, max: 2, step: 1, mode: "start" },
    { start: new Date(2026, 7, 13, 12, 30).getTime(), end: new Date(2026, 7, 13, 13, 30).getTime(), marginMinutes: 0 }
  );
  assert.equal(startTimerWait.activationTime, new Date(2026, 7, 13, 10, 30).getTime());
  assert.equal(startTimerWait.start, new Date(2026, 7, 13, 12, 30).getTime());

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

test("ten isolated washing-machine profiles are present", async () => {
  globalThis.window = globalThis;
  await import(new URL("html/machines.js", root));
  const machines = globalThis.LaundryMachines;
  assert.equal(machines.length, 10);
  assert.deepEqual(machines.map((machine) => machine.id), [
    "samsung-wf-y4bk-b4bk",
    "bosch-wae284a7nl-12",
    "hisense-wf3s8043bw3-blx",
    "aeg-lf628600",
    "samsung-ww11dg5b25ab",
    "haier-hw80-bp14929a-s",
    "inventum-vwm8010w-vwm8030b",
    "beko-bm3wft31041w",
    "bosch-wan2827dnl",
    "siemens-wg44j2a9nl"
  ]);
  assert.equal(machines.find((machine) => machine.id === "aeg-lf628600").timerRange.mode, "start");
  assert.equal(machines.find((machine) => machine.id === "inventum-vwm8010w-vwm8030b").timerRange.mode, "start");
  assert.equal(machines.find((machine) => machine.id === "haier-hw80-bp14929a-s").timerRange.step, 0.5);
  assert.equal(machines.find((machine) => machine.id === "aeg-lf628600").programs.find((item) => item.id === "20-min-3kg").minutes, 20);
  assert.equal(machines.find((machine) => machine.id === "hisense-wf3s8043bw3-blx").programs.find((item) => item.id === "power-wash-49").minutes, 49);
  assert.equal(machines.find((machine) => machine.id === "samsung-ww11dg5b25ab").programs.find((item) => item.id === "super-speed-39").minutes, 39);
  assert.equal(machines.find((machine) => machine.id === "beko-bm3wft31041w").programs.find((item) => item.id === "xpress-30").minutes, 28);

  const script = await readFile(new URL("html/machines.js", root), "utf8");
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
  const originalSamsung = machines.find((machine) => machine.id === "samsung-wf-y4bk-b4bk");
  for (const [id, minutes] of Object.entries(expected)) assert.equal(originalSamsung.programs.find((item) => item.id === id).minutes, minutes);
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
  const originalBosch = machines.find((machine) => machine.id === "bosch-wae284a7nl-12");
  for (const [id, minutes] of Object.entries(boschExpected)) assert.equal(originalBosch.programs.find((item) => item.id === id).minutes, minutes);
  assert.match(script, /timerRange: \{ min: 3, max: 19, step: 1, mode: "end" \}/);
  assert.match(script, /timerRange: \{ min: 0\.5, max: 20, mode: "start"/);
  assert.match(script, /defaultProgram: "dark"/);
  assert.match(script, /defaultProgram: "cotton-40"/);
  const app = await readFile(new URL("html/app.js", root), "utf8");
  assert.match(app, /washer-machine-profile/);
  assert.match(app, /washer-preferred-programs/);
  assert.match(app, /washer-program-overrides-v2/);
  assert.match(app, /shouldReoptimise/);
  assert.match(app, /safetyTitle/);
  assert.match(app, /marketPrices\.timelineCoverage/);
  assert.match(app, /marketPrices\.latestSafeStart/);
  assert.match(app, /marketPrices\.scheduleForTimer/);
  assert.match(app, /marketPrices\.findWaitSchedule/);
  assert.match(app, /marketPrices\.findCheapestWaitSchedule/);
  assert.match(app, /marketPrices\.choosePracticalSchedule/);
  assert.match(app, /marketPrices\.isPastTodayWindow/);
  assert.match(app, /delayHours === 0/);
  assert.match(app, /instructionNow/);
  assert.match(app, /--outside-before/);
  assert.match(app, /--inside-until/);
});

test("the interface supports remembered English and Dutch translations", async () => {
  const script = await readFile(new URL("html/i18n.js", root), "utf8");
  assert.match(script, /laundry-language/);
  assert.match(script, /Set the time/);
  assert.match(script, /Stel de tijd in/);
  assert.match(script, /marketWindow/);
  assert.match(script, /exact 15-minute market intervals/);
  assert.match(script, /exacte marktkwartieren/);
  assert.match(script, /raw wholesale market price/);
  assert.match(script, /kale beursprijs/);
  assert.match(script, /normally published around 15:00/);
  assert.match(script, /No cheap window left today/);
  assert.match(script, /Geen goedkoop venster meer vandaag/);
  assert.match(script, /Find the earliest cheap start/);
  assert.match(script, /Vind de vroegste goedkope start/);
  assert.match(script, /Set it now · earliest complete fit/);
  assert.match(script, /Stel nu in · vroegste volledige fit/);
  assert.match(script, /Wait until \{time\} for the earliest cheap start/);
  assert.match(script, /Wacht tot \{time\} voor de vroegste goedkope start/);
  assert.match(script, /Ten model profiles/);
  assert.match(script, /Tien modelprofielen/);
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
